import '../styles.css';
import { loadJson } from './data';
import { articleRoute } from './routes';
import { dailyDates, dailyStories } from './daily-feed';
import { calendarMonthView, homeView, stageView } from './home-view';
import { dismissSwipeHint, markRead, rememberSelectedStory, selectedStoryForDay, swipeHintDismissed } from './state';
import { resolveDayRoute } from './day-route';
import { bindStorySwipe, initialStoryIndex, isEditableTarget, storyDirectionForKey, storyNavigationTarget, storyStageScrollAmountForKey, type StoryDirection } from './story-navigation';
import { developmentFixtures } from './dev-fixtures';

const app = document.querySelector('#app') as HTMLElement;
const currentBrusselsDay = () => new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Brussels', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());

try {
  const today = currentBrusselsDay();
  const fixtures = import.meta.env.DEV ? developmentFixtures(today) : null;
  const archive: any = fixtures ? fixtures.archive : await loadJson('data/archive.json');
  if (!archive.editions.length) throw Error('No gaming editions have been published yet.');
  const route = articleRoute();
  const selectedDate = resolveDayRoute(location.search, archive.editions);
  if (!selectedDate) throw Error('That edition is unavailable.');
  const dayMetas = archive.editions.filter((edition: any) => edition.date === selectedDate);
  const meta = route ? archive.editions.find((edition: any) => edition.id === route.edition) : dayMetas[0];
  if (!meta) throw Error('That edition is unavailable.');
  const editions = fixtures?.editions || new Map<string, any>(await Promise.all(dayMetas.map(async (dayMeta: any): Promise<[string, any]> => [dayMeta.id, await loadJson(dayMeta.path)])));
  const stories = dailyStories(dayMetas, editions, selectedDate);
  const availableDates = dailyDates(archive.editions);
  const routeStory = route && stories.find((story: any) => story.id === route.article && story.editionId === route.edition);
  let selectedIndex = initialStoryIndex(stories, routeStory?.id || selectedStoryForDay(selectedDate));
  app.innerHTML = homeView(stories, meta.id, meta.updatedAt, availableDates, selectedDate, today, selectedIndex);
  const mobile = window.matchMedia('(max-width: 800px)');
  const swipeHint = app.querySelector<HTMLElement>('[data-swipe-hint]');
  if (swipeHint) {
    swipeHint.hidden = swipeHintDismissed();
    swipeHint.querySelector('[data-dismiss-swipe-hint]')?.addEventListener('click', () => {
      if (swipeHint.classList.contains('is-dismissing')) return;
      dismissSwipeHint();
      swipeHint.classList.add('is-dismissing');
      // Reduced motion yields no animations; canceled animations also finish dismissal.
      void Promise.all(swipeHint.getAnimations().map(animation => animation.finished))
        .catch(() => {})
        .then(() => { swipeHint.hidden = true; });
    });
  }
  const progress = app.querySelector<HTMLElement>('[data-story-progress]');
  let progressHideTimer: number | undefined;
  const revealProgress = () => {
    if (!progress || !mobile.matches) return;
    progress.classList.add('is-visible');
    window.clearTimeout(progressHideTimer);
    progressHideTimer = window.setTimeout(() => progress.classList.remove('is-visible'), 2500);
  };
  const updateProgress = (index: number) => {
    if (!progress) return;
    progress.querySelectorAll<HTMLButtonElement>('[data-progress-index]').forEach(button => {
      const active = Number(button.dataset.progressIndex) === index;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const active = progress.querySelector<HTMLElement>('.is-active');
    if (active) {
      const top = active.offsetTop - progress.offsetTop;
      if (top < progress.scrollTop) progress.scrollTop = top;
      else if (top + active.offsetHeight > progress.scrollTop + progress.clientHeight) {
        progress.scrollTop = top + active.offsetHeight - progress.clientHeight;
      }
    }
    revealProgress();
  };
  progress?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-progress-index]');
    if (!button) return;
    const index = Number(button.dataset.progressIndex);
    activate(index, index < selectedIndex ? 'previous' : index > selectedIndex ? 'next' : 'direct');
  });
  revealProgress();
  mobile.addEventListener('change', () => { if (mobile.matches) revealProgress(); else progress?.classList.remove('is-visible'); });
  const activate = (index: number, direction: StoryDirection | 'direct' = 'direct', focusDirection?: StoryDirection) => {
    const story = stories[index];
    if (!story) return;
    markRead(story.id);
    rememberSelectedStory(selectedDate, story.id);
    const stage = app.querySelector('[data-story-stage]') as HTMLElement;
    if (!stage) return;
    selectedIndex = index;
    updateProgress(index);
    stage.innerHTML = stageView(story, meta.id, selectedIndex, stories.length);
    stage.classList.remove('is-changing', 'is-moving-previous', 'is-moving-next');
    void stage.offsetWidth;
    if (direction !== 'direct') stage.classList.add(`is-moving-${direction}`);
    app.querySelectorAll('.rail-story').forEach((button: any) => button.setAttribute('aria-pressed', String(Number(button.dataset.storyIndex) === selectedIndex)));
    // Scroll only the desktop rail, never the page or the story stage.
    if (!mobile.matches) {
      const rail = app.querySelector<HTMLElement>('.rail-stories');
      const selected = rail?.querySelector<HTMLElement>('.rail-story[aria-pressed="true"]');
      if (rail && selected) {
        const railRect = rail.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();
        if (selectedRect.top < railRect.top) rail.scrollBy({ top: selectedRect.top - railRect.top, behavior: 'auto' });
        else if (selectedRect.bottom > railRect.bottom) rail.scrollBy({ top: selectedRect.bottom - railRect.bottom, behavior: 'auto' });
      }
    }
    if (focusDirection) stage.querySelector<HTMLButtonElement>(`[data-stage-${focusDirection}]`)?.focus();
  };
  const activateRailStory = (button: HTMLElement) => {
    const index = Number(button.dataset.storyIndex);
    activate(index, index < selectedIndex ? 'previous' : index > selectedIndex ? 'next' : 'direct');
    if (mobile.matches) app.querySelector('[data-story-stage]')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  };
  app.querySelectorAll<HTMLElement>('.rail-story').forEach(button => {
    button.addEventListener('click', event => {
      if ((event.target as HTMLElement).closest('a')) return;
      activateRailStory(button);
    });
    button.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activateRailStory(button);
    });
  });
  const stageContainer = app.querySelector('[data-story-stage]') as HTMLElement | null;
  if (stageContainer) {
    let scrollbarHideTimer: number | undefined;
    const revealScrollbar = () => {
      stageContainer.classList.remove('is-scrollbar-idle');
      window.clearTimeout(scrollbarHideTimer);
      scrollbarHideTimer = window.setTimeout(() => stageContainer.classList.add('is-scrollbar-idle'), 2000);
    };
    ['scroll', 'pointermove', 'keydown', 'focusin'].forEach(event => stageContainer.addEventListener(event, revealScrollbar));
    revealScrollbar();
  }
  if (stageContainer) bindStorySwipe(stageContainer, direction => {
    const target = storyNavigationTarget(selectedIndex, stories.length, direction);
    if (target) activate(target.index, direction);
  }, mobile);
  stageContainer?.addEventListener('click', event => {
    const control = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-stage-previous], [data-stage-next]');
    if (!control) return;
    const direction: StoryDirection = control.hasAttribute('data-stage-previous') ? 'previous' : 'next';
    const target = storyNavigationTarget(selectedIndex, stories.length, direction);
    if (target) activate(target.index, direction, target.focus);
  });
  document.addEventListener('keydown', event => {
    const scrollAmount = storyStageScrollAmountForKey(event.key);
    if (scrollAmount && !mobile.matches) {
      event.preventDefault();
      stageContainer?.scrollBy({ top: scrollAmount });
      return;
    }
    const direction = storyDirectionForKey(event.key);
    if (!direction || mobile.matches || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;
    const target = storyNavigationTarget(selectedIndex, stories.length, direction);
    if (!target) return;
    event.preventDefault();
    activate(target.index, direction, target.focus);
  });
  const trigger = app.querySelector('.day-picker-trigger') as HTMLButtonElement;
  const picker = app.querySelector('[data-calendar]') as HTMLElement;
  const closePicker = () => { picker.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
  const openPicker = () => { picker.hidden = false; trigger.setAttribute('aria-expanded', 'true'); };
  const changeMonth = (direction: StoryDirection, focusControl = false) => {
    const [year, month] = picker.dataset.month!.split('-').map(Number);
    const view = new Date(Date.UTC(year, month - 1 + (direction === 'next' ? 1 : -1), 1));
    const nextMonth = `${view.getUTCFullYear()}-${String(view.getUTCMonth() + 1).padStart(2, '0')}`;
    picker.dataset.month = nextMonth;
    picker.innerHTML = calendarMonthView(availableDates, selectedDate, nextMonth, today);
    if (focusControl) picker.querySelector<HTMLButtonElement>(`[data-calendar-month="${direction}"]`)?.focus();
  };
  bindStorySwipe(picker, direction => {
    if (!picker.hidden) changeMonth(direction);
  }, mobile);
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
    const direction = control.dataset.calendarMonth as StoryDirection | undefined;
    if (!direction) return;
    changeMonth(direction, true);
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
  app.innerHTML = `<main class="state"><h1>News Game+</h1><p>${error.message}</p><a href="./">News archive</a></main>`;
}
