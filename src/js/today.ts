import '../styles.css';
import { loadJson } from './data';
import { articleRoute } from './routes';
import { dailyDates, dailyStories } from './daily-feed';
import { calendarMonthView, homeView, stageView } from './home-view';
import { markRead } from './state';
import { resolveDayRoute } from './day-route';
import { storyNavigationTarget, type StoryDirection } from './story-navigation';

const app = document.querySelector('#app') as HTMLElement;
const currentBrusselsDay = () => new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Brussels', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());

try {
  const archive: any = await loadJson('data/archive.json');
  if (!archive.editions.length) throw Error('No gaming editions have been published yet.');
  const route = articleRoute();
  const selectedDate = resolveDayRoute(location.search, archive.editions);
  if (!selectedDate) throw Error('That edition is unavailable.');
  const dayMetas = archive.editions.filter((edition: any) => edition.date === selectedDate);
  const meta = route ? archive.editions.find((edition: any) => edition.id === route.edition) : dayMetas[0];
  if (!meta) throw Error('That edition is unavailable.');
  const editions = new Map<string, any>(await Promise.all(dayMetas.map(async (dayMeta: any): Promise<[string, any]> => [dayMeta.id, await loadJson(dayMeta.path)])));
  const stories = dailyStories(dayMetas, editions, selectedDate);
  const availableDates = dailyDates(archive.editions);
  const today = currentBrusselsDay();
  app.innerHTML = homeView(stories, meta.id, meta.updatedAt, availableDates, selectedDate, today);

  let selectedIndex = stories.findIndex((story: any) => story.featured);
  if (selectedIndex < 0) selectedIndex = 0;
  const activate = (index: number, direction: StoryDirection | 'direct' = 'direct', focusDirection?: StoryDirection) => {
    const story = stories[index];
    if (!story) return;
    markRead(story.id);
    const stage = app.querySelector('[data-story-stage]') as HTMLElement;
    if (!stage) return;
    selectedIndex = index;
    stage.innerHTML = stageView(story, meta.id, selectedIndex, stories.length);
    stage.classList.remove('is-changing', 'is-moving-previous', 'is-moving-next');
    void stage.offsetWidth;
    if (direction !== 'direct') stage.classList.add(`is-moving-${direction}`);
    app.querySelectorAll('.rail-story').forEach((button: any) => button.setAttribute('aria-pressed', String(Number(button.dataset.storyIndex) === selectedIndex)));
    if (focusDirection) stage.querySelector<HTMLButtonElement>(`[data-stage-${focusDirection}]`)?.focus();
  };
  app.querySelectorAll('.rail-story').forEach((button: any) => button.addEventListener('click', () => {
    const index = Number(button.dataset.storyIndex);
    activate(index, index < selectedIndex ? 'previous' : index > selectedIndex ? 'next' : 'direct');
  }));
  const stageContainer = app.querySelector('[data-story-stage]') as HTMLElement | null;
  stageContainer?.addEventListener('click', event => {
    const control = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-stage-previous], [data-stage-next]');
    if (!control) return;
    const direction: StoryDirection = control.hasAttribute('data-stage-previous') ? 'previous' : 'next';
    const target = storyNavigationTarget(selectedIndex, stories.length, direction);
    if (target) activate(target.index, direction, target.focus);
  });
  const trigger = app.querySelector('.day-picker-trigger') as HTMLButtonElement;
  const picker = app.querySelector('[data-calendar]') as HTMLElement;
  const closePicker = () => { picker.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
  const openPicker = () => { picker.hidden = false; trigger.setAttribute('aria-expanded', 'true'); };
  trigger.addEventListener('click', () => picker.hidden ? openPicker() : closePicker());
  picker.addEventListener('click', (event) => {
    const control = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!control) return;
    const selected = control.dataset.date;
    if (selected) {
      const url = new URL(location.href);
      url.search = `?date=${encodeURIComponent(selected)}`;
      location.assign(url);
      return;
    }
    if (control.hasAttribute('data-calendar-today')) {
      const url = new URL(location.href);
      url.search = `?date=${encodeURIComponent(today)}`;
      location.assign(url);
      return;
    }
    const direction = control.dataset.calendarMonth;
    if (!direction) return;
    const [year, month] = picker.dataset.month!.split('-').map(Number);
    const view = new Date(Date.UTC(year, month - 1 + (direction === 'next' ? 1 : -1), 1));
    const nextMonth = `${view.getUTCFullYear()}-${String(view.getUTCMonth() + 1).padStart(2, '0')}`;
    picker.dataset.month = nextMonth;
    picker.innerHTML = calendarMonthView(availableDates, selectedDate, nextMonth, today);
    picker.querySelector<HTMLButtonElement>(`[data-calendar-month="${direction}"]`)?.focus();
  });
  document.addEventListener('click', event => { if (!picker.hidden && !event.composedPath().includes(picker) && !event.composedPath().includes(trigger)) closePicker(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !picker.hidden) { closePicker(); trigger.focus(); } });
  if (route) {
    const story = stories.find((item: any) => item.id === route.article && item.editionId === route.edition);
    if (story) {
      markRead(story.id);
      activate(stories.indexOf(story));
      requestAnimationFrame(() => (document.querySelector(`#article-${CSS.escape(story.id)}`) as HTMLElement | null)?.focus());
    }
  }
} catch (error: any) {
  app.innerHTML = `<main class="state"><h1>My GPT News</h1><p>${error.message}</p><a href="./">News archive</a></main>`;
}
