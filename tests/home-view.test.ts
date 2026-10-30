import assert from 'node:assert/strict';
import test from 'node:test';
import { homeView, stageView } from '../src/js/home-view';

const stories = [
  { id:'featured', headline:'Featured launch', summary:'The featured briefing.', categories:['Releases'], publishedAt:'2026-10-30T09:49:00Z', featured:true, sourceUrl:'https://example.test/featured' },
  { id:'other', headline:'Another release', summary:'The rail briefing.', categories:['Updates'], publishedAt:'2026-10-30T09:49:00Z', featured:false, sourceUrl:'https://example.test/other' }
];

test('renders one header archive link and left chevrons before rail thumbnails', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.equal((html.match(/>Browse archive</g) || []).length, 1);
  assert.match(html, /class="story-rail"/);
  assert.match(html, /data-story-id="other"[\s\S]*?<span class="rail-chevron"[^>]*>‹<\/span>[\s\S]*?<img/);
});

test('renders a selected story with its permanent read link', () => {
  const html = stageView(stories[1], '2026-10-30T09:49:00Z');
  assert.match(html, /Another release/);
  assert.match(html, /href="\/article\/\?edition=2026-10-30T09%3A49%3A00Z&amp;article=other"/);
  assert.match(html, />Read full story</);
});

test('uses the first remaining story when no featured story is supplied', () => {
  const html = homeView([stories[1]], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /data-story-id="other"[^>]*aria-pressed="true"/);
});

test('keeps the header and filters when no story matches', () => {
  const html = homeView([], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z', '<form class="filters">Filter controls</form>');
  assert.match(html, />Browse archive</);
  assert.match(html, /Filter controls/);
  assert.match(html, /No stories match these filters/);
});
