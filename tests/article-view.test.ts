import assert from 'node:assert/strict';
import test from 'node:test';
import { articleView } from '../src/js/article-view';

test('renders a detail view with historical price and source link', () => {
  const html = articleView({ id:'detail', headline:'Detail story', summary:'All available briefing detail.', categories:['Deals & Events'], sourceUrl:'https://example.test/story', publishedAt:'2026-10-30T09:49:00Z', price:{ amount:0, currency:'USD', checkedAt:'2026-10-30T09:49:00Z' } }, '2026-10-30T09:49:00Z');
  assert.match(html, /Detail story/);
  assert.match(html, /Historical price: USD 0/);
  assert.match(html, /Original source/);
});

test('lists each Steam page by game name alongside the story permalink', () => {
  const html = articleView({
    id:'roundup', headline:'Two releases', summary:'Release roundup.', categories:['Releases'],
    sourceUrl:'https://example.test/story', publishedAt:'2026-10-30T09:49:00Z',
    steamPages:[
      { name:'First Game', url:'https://store.steampowered.com/app/123/' },
      { name:'Second Game', url:'https://store.steampowered.com/app/456/' },
    ],
  }, 'edition');
  const links = html.match(/<section[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(links, /<h2>Links<\/h2>/);
  assert.match(links, /href="https:\/\/store\.steampowered\.com\/app\/123\/"[^>]*>.*Steam page .*First Game<\/a>/);
  assert.match(links, /href="https:\/\/store\.steampowered\.com\/app\/456\/"[^>]*>.*Steam page .*Second Game<\/a>/);
  assert.match(links, /href="\/article\/\?edition=edition&amp;article=roundup"[^>]*>.*Story link<\/a>/);
});
