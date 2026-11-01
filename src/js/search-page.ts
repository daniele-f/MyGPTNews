import '../styles.css';
import { loadJson } from './data';
import { card } from './render';
import { searchStories } from './search';

const app = document.querySelector('#app') as HTMLElement;
const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));

try {
  const index: any = await loadJson('data/search-index.json');
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  app.innerHTML = `<header class="site-header search-header"><a class="wordmark" href="../">MY GPT NEWS</a><a class="search-back" href="../">← Today’s news</a></header><main class="search-page"><section class="search-intro"><h1>Find an article</h1><form class="search-form" role="search"><label for="q">Search the archives</label><div><input id="q" name="q" type="search" value="${esc(initialQuery)}" placeholder="Game, studio, or topic" autocomplete="off"><button type="submit">Search</button></div></form></section><section class="search-results" aria-live="polite"><p id="count" class="search-count"></p><div id="results"></div></section></main>`;
  const query = document.querySelector('#q') as HTMLInputElement;
  const results = document.querySelector('#results') as HTMLElement;
  const count = document.querySelector('#count') as HTMLElement;
  const form = document.querySelector('.search-form') as HTMLFormElement;
  const draw = () => {
    const stories = searchStories(index.stories, query.value);
    count.textContent = `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} found`;
    results.innerHTML = stories.length ? `<div class="grid search-result-grid">${stories.map((story: any) => card(story)).join('')}</div>` : '<p class="search-empty">No stories found. Try another game, studio, or topic.</p>';
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(location.href);
    query.value ? url.searchParams.set('q', query.value) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
    draw();
  });
  query.addEventListener('input', draw);
  draw();
} catch (error: any) {
  app.innerHTML = `<main class="search-page state"><h1>Search unavailable</h1><p>${esc(error.message)}</p><a href="../">Return to today’s news</a></main>`;
}
