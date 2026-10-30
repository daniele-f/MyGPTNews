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

test('accepts an edition with a Brussels calendar day', async () => {
  const edition = {
    id: '2026-10-30T18:00:00Z', date: '2026-10-30', publishedAt: '2026-10-30T18:00:00Z', updatedAt: '2026-10-30T18:00:00Z',
    stories: [{ id: 'story-one', headline: 'A headline', summary: 'A concise summary.', categories: ['Updates'], sourceUrl: 'https://example.test/story', publishedAt: '2026-10-30T17:00:00Z', featured: true }]
  };
  assert.deepEqual(validateEdition(edition, edition.id).errors, []);
});

test('rejects multiple edition files for one Brussels day', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-duplicate-day-'));
  const editions = join(root, 'data', 'editions');
  await (await import('node:fs/promises')).mkdir(editions, { recursive: true });
  const one = { id:'2026-10-30T09:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T09:00:00Z', updatedAt:'2026-10-30T09:00:00Z', stories:[{ id:'one', headline:'One', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/one', publishedAt:'2026-10-30T09:00:00Z', featured:true }] };
  const two = { ...one, id:'2026-10-30T12:00:00Z', publishedAt:'2026-10-30T12:00:00Z', updatedAt:'2026-10-30T12:00:00Z', stories:[{ ...one.stories[0], id:'two', headline:'Two', sourceUrl:'https://example.test/two' }] };
  await writeFile(join(editions, '2026-10-30T09-00-00Z.json'), JSON.stringify(one));
  await writeFile(join(editions, '2026-10-30T12-00-00Z.json'), JSON.stringify(two));
  await assert.rejects(() => prepareEditions(root), /Duplicate edition date/);
});

test('accepts new and updated stories only when they carry an update timestamp', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T20:00:00Z', stories:[
    { id:'new-story', headline:'New story', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/new', publishedAt:'2026-10-30T18:00:00Z', featured:true, changeType:'new', updatedAt:'2026-10-30T20:00:00Z' },
    { id:'updated-story', headline:'Updated story', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/updated', publishedAt:'2026-10-30T18:00:00Z', featured:false, changeType:'updated', updatedAt:'2026-10-30T20:00:00Z' }
  ]};
  assert.deepEqual(validateEdition(edition, edition.id).errors, []);
});

test('rejects update markers without their timestamp', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T20:00:00Z', stories:[
    { id:'new-story', headline:'New story', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/new', publishedAt:'2026-10-30T18:00:00Z', featured:true, changeType:'new' }
  ]};
  assert.match(validateEdition(edition, edition.id).errors.join(' '), /updatedAt/);
});

test('creates a missing editions directory for a fresh empty archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-empty-'));
  await (await import('node:fs/promises')).mkdir(join(root, 'data'), { recursive: true });
  const indexes = await prepareEditions(root);
  assert.deepEqual(indexes['archive.json'].editions, []);
});
