import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateEdition } from '../scripts/lib/editions';
import { prepareEditions } from '../scripts/lib/indexes';

const story = (id, sourceUrl) => ({
  id, editionDate: '2026-09-25', headline: id, summary: 'A sample summary.', subjects: ['Sample'],
  developer: 'Sample', publisher: 'Sample', categories: ['Update'], platforms: ['PC'], tags: ['Sample'],
  sourceName: 'Sample', sourceUrl, imageUrl: 'https://images.example.test/sample.jpg',
  publishedAt: '2026-09-25T06:00:00+02:00', discoveredAt: '2026-09-25T06:05:00+02:00', featured: false, relatedStoryIds: []
});

test('rejects duplicate normalized source URLs', () => {
  const edition = { date: '2026-09-25', updatedAt: '2026-09-25T07:00:00+02:00', stories: [
    story('one', 'https://example.test/story?utm_source=a'), story('two', 'https://example.test/story')
  ] };
  assert.match(validateEdition(edition).errors.join(' '), /duplicate/i);
});

test('does not replace generated indexes when an input edition is invalid', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-'));
  const data = join(root, 'data');
  await (await import('node:fs/promises')).mkdir(join(data, 'editions'), { recursive: true });
  await writeFile(join(data, 'archive.json'), '{"existing":true}');
  await writeFile(join(data, 'editions', '2026-99-99.json'), '{"date":"invalid","stories":[]}');
  await assert.rejects(() => prepareEditions(root));
  assert.equal(await readFile(join(data, 'archive.json'), 'utf8'), '{"existing":true}');
});
