import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('reserves left rail space for the selected-item shift', async () => {
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(css, /\.rail-stories\{[^}]*padding-left:14px/);
});

test('uses the editorial search treatment without local-state filters', async () => {
  const searchPage = await readFile('src/js/search-page.ts', 'utf8');
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(searchPage, /class="search-page"/);
  assert.match(searchPage, /class="search-results"/);
  assert.doesNotMatch(searchPage, /Favorites only|Unread only|favorites\(|readArticles\(/);
  assert.match(css, /\.search-page\{/);
  assert.match(css, /\.search-results\{/);
});
