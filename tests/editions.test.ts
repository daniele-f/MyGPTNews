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

test('rejects an invalid non-Steam game page URL', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T18:00:00Z', stories:[
    { id:'game-page', headline:'Game page', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/news', publishedAt:'2026-10-30T18:00:00Z', featured:true, game:{ name:'Game', id:'game', url:'not-a-url' } }
  ]};
  assert.match(validateEdition(edition, edition.id).errors.join(' '), /game page URL/);
});

test('rejects a Steam story that has no verified image URL', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T18:00:00Z', stories:[
    { id:'steam-story', headline:'Steam game update', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/news', publishedAt:'2026-10-30T18:00:00Z', featured:true, steam:{ url:'https://store.steampowered.com/app/123/' } }
  ]};
  assert.match(validateEdition(edition, edition.id).errors.join(' '), /Steam story needs an image URL/);
});

test('rejects a game headline name that does not occur in its headline', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T18:00:00Z', stories:[
    { id:'game-story', headline:'The game gets an update', summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/news', publishedAt:'2026-10-30T18:00:00Z', featured:true, game:{ name:'Canonical Game', headlineName:'Different Game', id:'canonical-game' } }
  ]};
  assert.match(validateEdition(edition, edition.id).errors.join(' '), /headline name.*headline/i);
});

test('reports an invalid headline name without throwing for a malformed headline', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T18:00:00Z', stories:[
    { id:'game-story', headline:42, summary:'A concise summary.', categories:['Updates'], sourceUrl:'https://example.test/news', publishedAt:'2026-10-30T18:00:00Z', featured:true, game:{ name:'Canonical Game', headlineName:'Game', id:'canonical-game' } }
  ]};
  assert.doesNotThrow(() => validateEdition(edition, edition.id));
  assert.match(validateEdition(edition, edition.id).errors.join(' '), /headline name.*headline/i);
});

test('creates a missing editions directory for a fresh empty archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-empty-'));
  await (await import('node:fs/promises')).mkdir(join(root, 'data'), { recursive: true });
  const indexes = await prepareEditions(root);
  assert.deepEqual(indexes['archive.json'].editions, []);
});

test('validates named Steam app links and requires a story image', () => {
  const edition = { id:'2026-10-30T18:00:00Z', date:'2026-10-30', publishedAt:'2026-10-30T18:00:00Z', updatedAt:'2026-10-30T18:00:00Z', stories: [{
    ...story('roundup', 'https://example.test/roundup'), categories:['Releases'], publishedAt:'2026-10-30T18:00:00Z',
    steamPages:[
      { name:'First', url:'https://store.steampowered.com/app/123/' },
      { name:'Second', url:'https://store.steampowered.com/app/456/Second/' },
    ],
  }] };
  assert.deepEqual(validateEdition(edition).errors, []);
  const roundup = edition.stories[0];
  const errorsFor = (changes: object) => validateEdition({ ...edition, stories:[{ ...roundup, ...changes }] }).errors.join(' ');
  assert.match(errorsFor({ imageUrl:undefined }), /Steam story needs an image URL/);
  assert.match(errorsFor({ steamPages:[{ name:'First', url:'https://example.test/app/123/' }] }), /invalid Steam page/);
  assert.match(errorsFor({ steamPages:[{ name:'', url:roundup.steamPages[0].url }] }), /invalid Steam page/);
  assert.match(errorsFor({ steamPages:[roundup.steamPages[0], { name:'Duplicate', url:'https://store.steampowered.com/app/123/Duplicate/' }] }), /duplicate Steam app/i);
});
