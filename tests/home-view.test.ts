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

test('submits the header search field to the search page', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /<form class="header-search" action="\/search\/" method="get">/);
  assert.match(html, /<input[^>]*name="q"[^>]*placeholder="Search"/);
  assert.doesNotMatch(html, />Search<\/a>/);
});

test('uses the title as home and puts the filter button after archive and search', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /<a class="wordmark" href="\/">MY GPT NEWS<\/a>/);
  assert.doesNotMatch(html, /<a class="active" href="\/">Home<\/a>/);
  assert.match(html, /<a href="\/archive\/">Browse archive<\/a><\/nav><form class="header-search"[\s\S]*?<button class="filter-button" type="button" aria-expanded="false" aria-controls="story-filters">Filter stories<\/button>/);
  assert.match(html, /class="header-date">30 Oct 2026<\/p>/);
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

test('keeps the latest stories and filter views inside one rail slot', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z', '<form class="filters">Filter controls</form>');
  assert.match(html, /<aside class="story-rail-slot"[\s\S]*?<section class="story-rail"[\s\S]*?<section class="filter-rail"/);
});

test('renders update labels only in the rail', () => {
  const story = { ...stories[1], changeType:'updated', updatedAt:'2026-10-30T12:00:00Z' };
  const html = homeView([story], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, />Updated</);
  assert.match(html, /class="change-tag"/);
  assert.doesNotMatch(stageView(story, '2026-10-30T09:49:00Z'), /change-tag|>Updated</);
});

test('renders the publication date and time at the bottom of the main story', () => {
  const html = stageView(stories[0], '2026-10-30T09:49:00Z');
  assert.match(html, /class="stage-published"/);
  assert.match(html, /Published/);
});

test('accentuates the game name within the main headline', () => {
  const story = { ...stories[0], game:{ name:'Featured', id:'featured' } };
  assert.match(stageView(story, '2026-10-30T09:49:00Z'), /<span class="game-title">Featured<\/span> launch/);
  assert.match(homeView([story], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z'), /<strong><span class="game-title">Featured<\/span> launch<\/strong>/);
});
