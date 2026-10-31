import { assetPath } from './paths';
import { articleUrl } from './routes';
import { brandButton } from './game-link';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const storyLink = (editionId: string, storyId: string) => esc(articleUrl(editionId, storyId));
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', timeZone:'Europe/Brussels' });
const dateTime = (value: string) => new Date(value).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Brussels' });
const railTimestamp = (story: any) => story.updatedAt ? `Edited ${dateTime(story.updatedAt)}` : `Published ${dateTime(story.publishedAt)}`;
const headline = (story: any) => { const value=String(story.headline||''), game=story.game?.name; if(!game) return esc(value); const index=value.toLocaleLowerCase().indexOf(String(game).toLocaleLowerCase()); return index<0?esc(value):`${esc(value.slice(0,index))}<span class="game-title">${esc(value.slice(index,index+String(game).length))}</span>${esc(value.slice(index+String(game).length))}`; };
const logoToken = import.meta.env?.VITE_LOGO_DEV_TOKEN || '';
const header = (headerDate: string) => `<header class="site-header"><a class="wordmark" href="${assetPath('')}">MY GPT NEWS</a><p class="header-date">${esc(headerDate)}</p><nav aria-label="Site navigation"><a href="${assetPath('archive/')}">Browse archive</a></nav><form class="header-search" action="${assetPath('search/')}" method="get"><label><span>Search the archive</span><input name="q" type="search" placeholder="Search" autocomplete="off"></label><button type="submit" aria-label="Search">⌕</button></form></header>`;
const railView = (stories: any[], editionId: string) => `<aside class="story-rail" aria-label="Latest stories"><h2>Latest stories</h2>${stories.length ? `<div class="rail-stories">${stories.map(story => `<button class="rail-story" type="button" data-story-id="${esc(story.id)}" data-edition-id="${esc(story.editionId || editionId)}" aria-pressed="${story.id === (stories.find(item => item.featured) || stories[0]).id}"><span class="rail-chevron" aria-hidden="true">‹</span><img src="${esc(story.imageUrl || assetPath('fallback-news.svg'))}" alt="" loading="lazy" onerror="this.src='${assetPath('fallback-news.svg')}'"><span><strong>${headline(story)}</strong><span class="rail-categories">${story.categories.map(esc).join(' · ')}</span><small>${esc(railTimestamp(story))}</small></span></button>`).join('')}</div>` : ''}</aside>`;

export function stageView(story: any, editionId: string) {
  const image = esc(story.imageUrl || assetPath('fallback-news.svg'));
  const link = storyLink(story.editionId || editionId, story.id);
  return `<article class="stage-story" id="article-${esc(story.id)}" tabindex="-1"><img class="stage-image" src="${image}" alt="" onerror="this.src='${assetPath('fallback-news.svg')}'"><div class="stage-copy"><p class="eyebrow">${story.categories.map(esc).join(' · ')}</p><h2>${headline(story)}</h2><p class="stage-summary">${esc(story.summary)}</p><div class="stage-links"><a class="button" href="${link}">Read full story</a>${brandButton(story, logoToken)}<a href="${esc(story.sourceUrl)}" target="_blank" rel="noopener">Original source</a></div><p class="stage-published">Published ${esc(dateTime(story.publishedAt))}</p></div></article>`;
}

export function homeView(stories: any[], editionId: string, publishedAt: string) {
  const active = stories.find(story => story.featured) || stories[0];
  const headerDate = date(publishedAt);
  if (!active) return `${header(headerDate)}<main class="editorial-home"><div class="editorial-layout"><section class="story-stage"><p class="empty-results">No stories published today.</p></section>${railView(stories, editionId)}</div></main>`;
  return `${header(headerDate)}<main class="editorial-home"><div class="editorial-layout"><section class="story-stage" data-story-stage aria-live="polite">${stageView(active, editionId)}</section>${railView(stories, editionId)}</div></main>`;
}
