import assert from 'node:assert/strict'; import test from 'node:test'; import { card } from '../src/js/render'; import { searchStories } from '../src/js/search';
const records = [{ id:'a',editionDate:'2026-09-26',headline:'Orbital News',summary:'',subjects:['Orbital'],developer:'Northstar',publisher:'Northstar',categories:['Update'],platforms:['PC'],tags:[],sourceName:'Northstar Studio' }];
test('finds a game without case sensitivity',()=>assert.deepEqual(searchStories(records,'ORBITAL',{}).map(x=>x.id),['a']));
test('returns all records for empty query',()=>assert.equal(searchStories(records,'',{}).length,1));

test('renders search cards with game links, title accents, and a Steam icon', () => {
  const html = card({
    id: 'example', editionId: 'edition', headline: 'Example receives an update', summary: 'Summary.',
    game: { id: 'example', name: 'Example' }, categories: ['Update'], publishedAt: '2026-11-01T10:00:00Z',
    steam: { url: 'https://store.steampowered.com/app/123/' }, sourceUrl: 'https://example.com/news',
  });
  assert.match(html, /<span class="game-title">Example<\/span> receives an update/);
  assert.match(html, /href="\/search\/\?q=Example"[^>]*>Example<\/a>/);
  assert.match(html, /src="\/steam-logo\.ico"/);
  assert.doesNotMatch(html, /class="eyebrow">Update/);
});
