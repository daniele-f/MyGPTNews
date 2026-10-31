import '../styles.css';
import { loadJson } from './data';
import { articleRoute } from './routes';
import { dailyStories } from './daily-feed';
import { homeView, stageView } from './home-view';
import { markRead } from './state';

const app = document.querySelector('#app') as HTMLElement;

try {
  const archive: any = await loadJson('data/archive.json');
  if (!archive.editions.length) throw Error('No gaming editions have been published yet.');
  const route = articleRoute();
  const meta = route ? archive.editions.find((edition: any) => edition.id === route.edition) : archive.editions[0];
  if (!meta) throw Error('That edition is unavailable.');
  const dayMetas = archive.editions.filter((edition: any) => edition.date === meta.date);
  const editions = new Map<string, any>(await Promise.all(dayMetas.map(async (dayMeta: any): Promise<[string, any]> => [dayMeta.id, await loadJson(dayMeta.path)])));
  const stories = dailyStories(dayMetas, editions, meta.date);
  const params = new URLSearchParams(location.search);
  const categories = new Set(params.getAll('category'));
  const filtered = stories.filter((story: any) => !categories.size || story.categories.some((category: string) => categories.has(category)));
  const filterCategories = ['Releases', 'Announcements', 'Updates', 'Industry News', 'Deals & Events'];
  const filters = `<form class="filters editorial-filters"><div class="filter-heading"><strong>Filter stories</strong><button type="button" class="filter-clear">Clear</button></div><fieldset>${filterCategories.map(category => `<label><input type="checkbox" name="category" value="${category}" ${categories.has(category) ? 'checked' : ''}><span>${category}</span><small>${stories.filter((story: any) => story.categories.includes(category)).length}</small></label>`).join('')}</fieldset><p class="filter-summary">${categories.size ? `Showing ${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}` : 'Showing all stories'}</p></form>`;
  app.innerHTML = homeView(filtered, meta.id, meta.updatedAt, filters);

  const filterRail = app.querySelector('#story-filters') as HTMLElement;
  const filterButton = app.querySelector('.filter-button') as HTMLButtonElement;
  const storyRail = app.querySelector('.story-rail') as HTMLElement;
  const setFilterOpen = (open: boolean) => {
    filterRail.hidden = !open;
    storyRail.hidden = open;
    filterButton.setAttribute('aria-expanded', String(open));
    const next = new URLSearchParams(location.search);
    if (open) next.set('filters', 'open');
    else next.delete('filters');
    history.replaceState(null, '', `${location.pathname}${next.size ? `?${next}` : ''}${location.hash}`);
  };
  if (params.get('filters') === 'open') setFilterOpen(true);
  filterButton.addEventListener('click', () => setFilterOpen(filterRail.hidden === true));
  app.querySelector('.filter-clear')?.addEventListener('click', () => {
    const next = new URLSearchParams(location.search);
    next.delete('category');
    location.search = next.toString();
  });
  app.querySelectorAll('.editorial-filters input[name="category"]').forEach((input: any) => input.addEventListener('change', () => {
    const next = new URLSearchParams(location.search);
    next.delete('category');
    next.set('filters', 'open');
    app.querySelectorAll('.editorial-filters input[name="category"]:checked').forEach((checked: any) => next.append('category', checked.value));
    location.search = next.toString();
  }));

  const activate = (story: any) => {
    markRead(story.id);
    const stage = app.querySelector('[data-story-stage]') as HTMLElement;
    stage.innerHTML = stageView(story, meta.id);
    stage.classList.remove('is-changing');
    void stage.offsetWidth;
    stage.classList.add('is-changing');
    app.querySelectorAll('.rail-story').forEach((button: any) => button.setAttribute('aria-pressed', String(button.dataset.storyId === story.id)));
  };
  app.querySelectorAll('.rail-story').forEach((button: any) => button.addEventListener('click', () => activate(filtered.find((story: any) => story.id === button.dataset.storyId && story.editionId === button.dataset.editionId))));
  if (route) {
    const story = stories.find((item: any) => item.id === route.article && item.editionId === route.edition);
    if (story && filtered.includes(story)) {
      markRead(story.id);
      activate(story);
      requestAnimationFrame(() => (document.querySelector(`#article-${CSS.escape(story.id)}`) as HTMLElement | null)?.focus());
    }
  }
} catch (error: any) {
  app.innerHTML = `<main class="state"><h1>My GPT News</h1><p>${error.message}</p><a href="archive/">Browse archive</a></main>`;
}
