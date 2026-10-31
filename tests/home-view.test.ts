import assert from 'node:assert/strict';
import test from 'node:test';
import { homeView, stageView } from '../src/js/home-view';

const stories = [
  { id:'featured', headline:'Featured launch', summary:'The featured briefing.', categories:['Releases'], publishedAt:'2026-10-30T09:49:00Z', featured:true, sourceUrl:'https://example.test/featured' },
  { id:'other', headline:'Another release', summary:'The rail briefing.', categories:['Updates'], publishedAt:'2026-10-30T09:49:00Z', featured:false, sourceUrl:'https://example.test/other' }
];

test('renders day controls and left chevrons before rail thumbnails', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /class="day-timeline"/);
  assert.match(html, /class="story-rail"/);
  assert.match(html, /data-story-id="other"[\s\S]*?<span class="rail-chevron"[^>]*>‹<\/span>[\s\S]*?<img/);
});

test('submits the header search field to the search page', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /<form class="header-search" action="\/search\/" method="get">/);
  assert.match(html, /<input[^>]*name="q"[^>]*placeholder="Search"/);
  assert.doesNotMatch(html, />Search<\/a>/);
});

test('uses the title as home and keeps day navigation and search in the header', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /<a class="wordmark" href="\/">MY GPT NEWS<\/a>/);
  assert.doesNotMatch(html, /<a class="active" href="\/">Home<\/a>/);
  assert.match(html, /class="day-picker-trigger"[^>]*>30 Oct 2026<\/button>/);
  assert.doesNotMatch(html, /Browse archive/);
  assert.doesNotMatch(html, /filter-button|filter-rail|story-filters/);
  assert.match(html, /class="header-search"/);
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

test('keeps the header and rail when no stories are available', () => {
  const html = homeView([], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /class="day-picker-trigger"/);
  assert.match(html, /No stories published today/);
  assert.match(html, /class="story-rail"/);
});

test('renders the publication date and time at the bottom of the main story', () => {
  const html = stageView(stories[0], '2026-10-30T09:49:00Z');
  assert.match(html, /class="stage-published"/);
  assert.match(html, /Published/);
});

test('shows category tags without publication state in the rail', () => {
  const edited = { ...stories[1], updatedAt:'2026-10-30T12:00:00Z' };
  const html = homeView([stories[0], edited], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z');
  assert.match(html, /class="rail-categories">Releases<\/span>/);
  assert.match(html, /class="rail-categories">Updates<\/span>/);
  assert.doesNotMatch(html, /class="rail-story"[\s\S]*?<small>/);
  assert.match(stageView(stories[0], '2026-10-30T09:49:00Z'), /<p class="eyebrow">Releases<\/p>/);
});

test('accentuates the game name within the main headline', () => {
  const story = { ...stories[0], game:{ name:'Featured', id:'featured' } };
  assert.match(stageView(story, '2026-10-30T09:49:00Z'), /<span class="game-title">Featured<\/span> launch/);
  assert.match(homeView([story], '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z'), /<strong><span class="game-title">Featured<\/span> launch<\/strong>/);
});

test('renders day navigation and a calendar limited to available dates', () => {
  const html = homeView(stories, '2026-10-30T09:49:00Z', '2026-10-30T09:49:00Z', ['2026-11-01', '2026-10-30', '2026-10-28'], '2026-10-30');
  assert.match(html, /aria-label="Previous available day"[^>]*href="\/?\?date=2026-10-28"/);
  assert.match(html, /aria-label="Next available day"[^>]*href="\/?\?date=2026-11-01"/);
  assert.match(html, /class="day-picker-trigger"[^>]*aria-expanded="false"/);
  assert.match(html, /class="calendar-day is-available is-selected"[^>]*data-date="2026-10-30"/);
  assert.match(html, /class="calendar-day"[^>]*disabled[^>]*>29<\/button>/);
  assert.match(html, /data-calendar-label aria-live="polite"/);
  assert.match(html, /<h2>Stories for this day<\/h2>/);
  assert.doesNotMatch(html, /class="rail-story"[\s\S]*?<small>/);
});
