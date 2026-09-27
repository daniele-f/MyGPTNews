import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateEdition } from './editions.js';
import { normalizeUrl } from './url.js';

export function buildIndexes(editions) {
  const ordered = [...editions].sort((a, b) => b.date.localeCompare(a.date));
  const records = ordered.flatMap((edition) => [...edition.stories]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt))
    .map((story) => ({ ...story, editionDate: edition.date })));
  const games = {};
  for (const story of records) for (const game of story.subjects) (games[game] ??= []).push({ id: story.id, editionDate: story.editionDate });
  const generatedAt = ordered[0]?.updatedAt || null;
  return {
    'archive.json': { generatedAt, editions: ordered.map((edition) => ({ date: edition.date, path: `data/editions/${edition.date}.json`, storyCount: edition.stories.length, updatedAt: edition.updatedAt })) },
    'search-index.json': { generatedAt, stories: records },
    'games-index.json': { generatedAt, games },
    'processed-urls.json': { generatedAt, urls: records.map((story) => ({ id: story.id, url: normalizeUrl(story.sourceUrl) })) }
  };
}

export async function prepareEditions(rootDir) {
  const dataDir = join(rootDir, 'data'); const editionsDir = join(dataDir, 'editions');
  const files = (await readdir(editionsDir)).filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file));
  const editions = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(editionsDir, file), 'utf8'))));
  const errors = editions.flatMap((edition) => validateEdition(edition).errors);
  const seen = new Set(); for (const story of editions.flatMap((edition) => edition.stories)) { const url = normalizeUrl(story.sourceUrl); if (seen.has(url)) errors.push(`Duplicate normalized source URL across editions: ${url}.`); seen.add(url); }
  if (errors.length) throw new Error(`Edition validation failed:\n${errors.join('\n')}`);
  const indexes = buildIndexes(editions); const staging = join(dataDir, '.generated-staging');
  await rm(staging, { recursive: true, force: true }); await mkdir(staging, { recursive: true });
  await Promise.all(Object.entries(indexes).map(([name, value]) => writeFile(join(staging, name), `${JSON.stringify(value, null, 2)}\n`)));
  for (const name of Object.keys(indexes)) await rename(join(staging, name), join(dataDir, name));
  await rm(staging, { recursive: true, force: true });
  return indexes;
}
