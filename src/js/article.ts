import '../styles.css';
import { loadJson } from './data';
import { articleRoute } from './routes';
import { markRead } from './state';
import { articleView } from './article-view';

const app = document.querySelector('#app') as HTMLElement;
try {
  const route = articleRoute();
  if (!route) throw Error('That article is unavailable.');
  const archive: any = await loadJson('data/archive.json');
  const editionMeta = archive.editions.find((edition: any) => edition.id === route.edition);
  if (!editionMeta) throw Error('That edition is unavailable.');
  const edition: any = await loadJson(editionMeta.path);
  const story = edition.stories.find((item: any) => item.id === route.article);
  if (!story) throw Error('That article is unavailable.');
  markRead(story.id);
  app.innerHTML = articleView(story, editionMeta.id);
} catch (error: any) {
  app.innerHTML = `<main class="state"><h1>My GPT News</h1><p>${error.message}</p><a href="../">Home</a></main>`;
}
