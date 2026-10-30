import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEditionFilename, validateEdition } from './editions';
import { normalizeUrl } from './url';

export function buildIndexes(editions: any[]) {
  const ordered = [...editions].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const stories = ordered.flatMap((edition) => edition.stories.map((story: any) => ({ ...story, editionId: edition.id, editionDate: edition.date }))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const games: Record<string, any[]> = {};
  for (const story of stories) if (story.game) (games[story.game.id] ??= []).push({ id: story.id, editionId: story.editionId, name: story.game.name });
  return {
    'archive.json': { generatedAt: ordered[0]?.updatedAt || null, editions: ordered.map((edition) => ({ id: edition.id, date: edition.date, publishedAt: edition.publishedAt, updatedAt: edition.updatedAt, path: `data/editions/${edition.id.replace(/:/g, '-')}.json`, storyCount: edition.stories.length })) },
    'search-index.json': { generatedAt: ordered[0]?.updatedAt || null, stories },
    'games-index.json': { generatedAt: ordered[0]?.updatedAt || null, games }
  };
}

export async function prepareEditions(rootDir: string) {
  const dataDir = join(rootDir, 'data'); const editionsDir = join(dataDir, 'editions'); await mkdir(editionsDir, { recursive: true });
  const allFiles = await readdir(editionsDir); const invalidFiles = allFiles.filter((file) => file.endsWith('.json') && !parseEditionFilename(file));
  if (invalidFiles.length) throw new Error(`Edition validation failed:\nInvalid edition filename: ${invalidFiles.join(', ')}.`);
  const files = allFiles.filter((file) => parseEditionFilename(file));
  const editions = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(editionsDir, file), 'utf8'))));
  const errors: string[] = []; const editionIds = new Set<string>(); const storyIds = new Set<string>(); const urls = new Set<string>();
  for (let index = 0; index < editions.length; index++) {
    const edition = editions[index]; const id = parseEditionFilename(files[index])!; errors.push(...validateEdition(edition, id).errors);
    if (editionIds.has(edition.id)) errors.push(`Duplicate edition id: ${edition.id}.`); editionIds.add(edition.id);
    for (const story of edition.stories || []) { if (storyIds.has(story.id)) errors.push(`Duplicate story id across editions: ${story.id}.`); storyIds.add(story.id); try { const url = normalizeUrl(story.sourceUrl); if (urls.has(url)) errors.push(`Duplicate normalized source URL across editions: ${url}.`); urls.add(url); } catch {} }
  }
  for (const edition of editions) for (const story of edition.stories || []) for (const id of story.relatedArticleIds || []) if (!storyIds.has(id)) errors.push(`Story ${story.id} references unknown article: ${id}.`);
  if (errors.length) throw new Error(`Edition validation failed:\n${errors.join('\n')}`);
  const indexes = buildIndexes(editions); const staging = join(dataDir, '.generated-staging'); await rm(staging, { recursive: true, force: true }); await mkdir(staging, { recursive: true });
  await Promise.all(Object.entries(indexes).map(([name, value]) => writeFile(join(staging, name), `${JSON.stringify(value, null, 2)}\n`)));
  for (const [name, value] of Object.entries(indexes)) await writeFile(join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`); await rm(staging, { recursive: true, force: true }); return indexes;
}
