import { assetPath } from './paths';
import { articleUrl } from './routes';
import { brandButton } from './game-link';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const storyLink = (editionId: string, storyId: string) => esc(articleUrl(editionId, storyId));
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', timeZone:'Europe/Brussels' });
const dateTime = (value: string) => new Date(value).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Brussels' });
const headline = (story: any) => { const value=String(story.headline||''), game=story.game?.name; if(!game) return esc(value); const index=value.toLocaleLowerCase().indexOf(String(game).toLocaleLowerCase()); return index<0?esc(value):`${esc(value.slice(0,index))}<span class="game-title">${esc(value.slice(index,index+String(game).length))}</span>${esc(value.slice(index+String(game).length))}`; };
const logoToken = import.meta.env?.VITE_LOGO_DEV_TOKEN || '';
const dayUrl = (value: string) => `${assetPath('')}?date=${encodeURIComponent(value)}`;
const dateParts = (value: string) => value.split('-').map(Number) as [number, number, number];
const dayKey = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export function dayNavigationView(availableDates: string[], selectedDate: string) {
  const dates = [...availableDates].sort((a, b) => a.localeCompare(b));
  const selectedIndex = dates.indexOf(selectedDate);
  const previous = selectedIndex > 0 ? dates[selectedIndex - 1] : null;
  const next = selectedIndex >= 0 && selectedIndex < dates.length - 1 ? dates[selectedIndex + 1] : null;
  return `<nav class="day-timeline" aria-label="Available news days"><a class="day-step${previous ? '' : ' is-disabled'}" aria-label="Previous available day"${previous ? ` href="${dayUrl(previous)}"` : ' aria-disabled="true"'}>‹</a><button class="day-picker-trigger" type="button" aria-expanded="false" aria-haspopup="dialog" aria-controls="day-picker">${esc(date(selectedDate))}</button><a class="day-step${next ? '' : ' is-disabled'}" aria-label="Next available day"${next ? ` href="${dayUrl(next)}"` : ' aria-disabled="true"'}>›</a><section class="day-picker" id="day-picker" role="dialog" aria-label="Choose an available news day" hidden data-calendar data-month="${selectedDate.slice(0, 7)}">${calendarMonthView(dates, selectedDate, selectedDate.slice(0, 7))}</section></nav>`;
}

export function calendarMonthView(availableDates: string[], selectedDate: string, monthValue: string) {
  const dates = new Set(availableDates);
  const [year, month] = monthValue.split('-').map(Number) as [number, number];
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingDays = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const calendarDays = Array.from({ length: leadingDays + daysInMonth }, (_, index) => {
    if (index < leadingDays) return '<span class="calendar-day-placeholder" aria-hidden="true"></span>';
    const day = index - leadingDays + 1;
    const value = dayKey(year, month, day);
    const available = dates.has(value);
    const selected = value === selectedDate;
    return `<button class="calendar-day${available ? ' is-available' : ''}${selected ? ' is-selected' : ''}" type="button" data-date="${value}"${available ? '' : ' disabled'}${selected ? ' aria-current="date"' : ''}>${day}</button>`;
  }).join('');
  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return `<div class="calendar-heading"><button type="button" data-calendar-month="previous" aria-label="Previous month">‹</button><strong data-calendar-label aria-live="polite">${esc(monthLabel)}</strong><button type="button" data-calendar-month="next" aria-label="Next month">›</button></div><div class="calendar-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="calendar-grid">${calendarDays}</div>`;
}

const header = (headerDate: string, availableDates: string[], selectedDate: string) => `<header class="site-header"><a class="wordmark" href="${assetPath('')}">MY GPT NEWS</a>${dayNavigationView(availableDates, selectedDate)}<form class="header-search" action="${assetPath('search/')}" method="get"><label><span>Search the archive</span><input name="q" type="search" placeholder="Search" autocomplete="off"></label><button type="submit" aria-label="Search">⌕</button></form></header>`;
const statusPill = (story: any) => story.changeType === 'new' ? '<span class="rail-status rail-status-new">New</span>' : story.changeType === 'updated' ? '<span class="rail-status rail-status-updated">Updated</span>' : '';
const railView = (stories: any[], editionId: string) => `<aside class="story-rail" aria-label="Stories for this day"><h2>Stories for this day</h2>${stories.length ? `<div class="rail-stories">${stories.map((story, index) => `<button class="rail-story" type="button" data-story-index="${index}" data-story-id="${esc(story.id)}" data-edition-id="${esc(story.editionId || editionId)}" aria-pressed="${story.id === (stories.find(item => item.featured) || stories[0]).id}"><span class="rail-chevron" aria-hidden="true">‹</span><img src="${esc(story.imageUrl || assetPath('fallback-news.svg'))}" alt="" loading="lazy" onerror="this.src='${assetPath('fallback-news.svg')}'"><span class="rail-story-copy"><strong>${headline(story)}</strong><span class="rail-story-footer"><span class="rail-categories">${story.categories.map(esc).join(' · ')}</span>${statusPill(story)}</span></span></button>`).join('')}</div>` : ''}</aside>`;

const storyNavigationView = (index: number, total: number) => `<nav class="stage-story-navigation" aria-label="Story navigation"><button type="button" data-stage-previous aria-label="Previous story"${index === 0 ? ' disabled' : ''}>‹</button><button type="button" data-stage-next aria-label="Next story"${index === total - 1 ? ' disabled' : ''}>›</button></nav>`;

export function stageView(story: any, editionId: string, storyIndex = 0, storyCount = 1) {
  const image = esc(story.imageUrl || assetPath('fallback-news.svg'));
  const link = storyLink(story.editionId || editionId, story.id);
  const timestamp = story.updatedAt ? `Updated ${dateTime(story.updatedAt)}` : `Published ${dateTime(story.publishedAt)}`;
  const boundary = storyIndex === 0 ? ' is-first' : storyIndex === storyCount - 1 ? ' is-last' : '';
  return `<article class="stage-story${boundary}" id="article-${esc(story.id)}" tabindex="-1">${storyNavigationView(storyIndex, storyCount)}<img class="stage-image" src="${image}" alt="" onerror="this.src='${assetPath('fallback-news.svg')}'"><div class="stage-copy"><p class="eyebrow">${story.categories.map(esc).join(' · ')}</p><h2>${headline(story)}</h2><p class="stage-summary">${esc(story.summary)}</p><div class="stage-links"><a class="button" href="${link}">Read full story</a>${brandButton(story, logoToken)}<a href="${esc(story.sourceUrl)}" target="_blank" rel="noopener">Original source</a></div><p class="stage-published">${esc(timestamp)}</p></div></article>`;
}

export function homeView(stories: any[], editionId: string, publishedAt: string, availableDates = [publishedAt.slice(0, 10)], selectedDate = publishedAt.slice(0, 10)) {
  const active = stories.find(story => story.featured) || stories[0];
  const activeIndex = stories.indexOf(active);
  const headerDate = date(`${selectedDate}T12:00:00Z`);
  if (!active) return `${header(headerDate, availableDates, selectedDate)}<main class="editorial-home"><div class="editorial-layout"><section class="story-stage"><p class="empty-results">No stories published today.</p></section>${railView(stories, editionId)}</div></main>`;
  return `${header(headerDate, availableDates, selectedDate)}<main class="editorial-home"><div class="editorial-layout"><section class="story-stage" data-story-stage aria-live="polite">${stageView(active, editionId, activeIndex, stories.length)}</section>${railView(stories, editionId)}</div></main>`;
}
