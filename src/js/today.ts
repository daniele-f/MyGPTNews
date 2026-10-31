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
  app.innerHTML = homeView(stories, meta.id, meta.updatedAt);

  const activate = (story: any) => {
    markRead(story.id);
    const stage = app.querySelector('[data-story-stage]') as HTMLElement;
    stage.innerHTML = stageView(story, meta.id);
    stage.classList.remove('is-changing');
    void stage.offsetWidth;
    stage.classList.add('is-changing');
    app.querySelectorAll('.rail-story').forEach((button: any) => button.setAttribute('aria-pressed', String(button.dataset.storyId === story.id)));
  };
  app.querySelectorAll('.rail-story').forEach((button: any) => button.addEventListener('click', () => activate(stories.find((story: any) => story.id === button.dataset.storyId && story.editionId === button.dataset.editionId))));
  if (route) {
    const story = stories.find((item: any) => item.id === route.article && item.editionId === route.edition);
    if (story) {
      markRead(story.id);
      activate(story);
      requestAnimationFrame(() => (document.querySelector(`#article-${CSS.escape(story.id)}`) as HTMLElement | null)?.focus());
    }
  }
} catch (error: any) {
  app.innerHTML = `<main class="state"><h1>My GPT News</h1><p>${error.message}</p><a href="archive/">Browse archive</a></main>`;
}
