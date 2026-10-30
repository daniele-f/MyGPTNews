import assert from 'node:assert/strict';
import test from 'node:test';
import { articleView } from '../src/js/article-view';

test('renders a detail view with historical price and source link', () => {
  const html = articleView({ id:'detail', headline:'Detail story', summary:'All available briefing detail.', categories:['Deals & Events'], sourceUrl:'https://example.test/story', publishedAt:'2026-10-30T09:49:00Z', price:{ amount:0, currency:'USD', checkedAt:'2026-10-30T09:49:00Z' } }, '2026-10-30T09:49:00Z');
  assert.match(html, /Detail story/);
  assert.match(html, /Historical price: USD 0/);
  assert.match(html, /Original source/);
});
