import { assetPath } from './paths';
import { articleUrl } from './routes';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const storyLink = (editionId: string, storyId: string) => esc(articleUrl(editionId, storyId));
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', timeZone:'Europe/Brussels' });

export function stageView(story: any, editionId: string) {
  const image = esc(story.imageUrl || assetPath('fallback-news.svg'));
  const link = storyLink(editionId, story.id);
  return `<article class="stage-story" id="article-${esc(story.id)}" tabindex="-1"><img class="stage-image" src="${image}" alt="" onerror="this.src='${assetPath('fallback-news.svg')}'"><div class="stage-copy"><p class="eyebrow">${story.categories.map(esc).join(' · ')} <span>${esc(date(story.publishedAt))}</span></p><h2>${esc(story.headline)}</h2><p class="stage-summary">${esc(story.summary)}</p><div class="stage-links"><a class="button" href="${link}">Read full story</a>${story.steam?.url ? `<a href="${esc(story.steam.url)}" target="_blank" rel="noopener">Steam</a>` : ''}<a href="${esc(story.sourceUrl)}" target="_blank" rel="noopener">Original source</a></div></div></article>`;
}

export function homeView(stories: any[], editionId: string, publishedAt: string, filtersHtml = '') {
  const active = stories.find(story => story.featured) || stories[0];
  const headerDate = new Date(publishedAt).toLocaleString('en-GB', { timeZone:'Europe/Brussels', dateStyle:'medium', timeStyle:'short' });
  if (!active) return `<header class="site-header"><a class="wordmark" href="${assetPath('')}">MY GPT NEWS</a><p class="header-date">${esc(headerDate)}</p><nav aria-label="Site navigation"><a class="active" href="${assetPath('')}">Home</a><a href="${assetPath('archive/')}">Browse archive</a><a href="${assetPath('search/')}">Search</a></nav></header><main class="editorial-home">${filtersHtml}<p class="empty-results">No stories match these filters.</p></main>`;
  return `<header class="site-header"><a class="wordmark" href="${assetPath('')}">MY GPT NEWS</a><p class="header-date">${esc(headerDate)}</p><nav aria-label="Site navigation"><a class="active" href="${assetPath('')}">Home</a><a href="${assetPath('archive/')}">Browse archive</a><a href="${assetPath('search/')}">Search</a></nav></header><main class="editorial-home">${filtersHtml}<div class="editorial-layout"><section class="story-stage" data-story-stage aria-live="polite">${stageView(active, editionId)}</section><aside class="story-rail" aria-label="Latest stories"><h2>Latest stories</h2><div class="rail-stories">${stories.map(story => `<button class="rail-story" type="button" data-story-id="${esc(story.id)}" aria-pressed="${story.id === active.id}"><span class="rail-chevron" aria-hidden="true">‹</span><img src="${esc(story.imageUrl || assetPath('fallback-news.svg'))}" alt="" loading="lazy" onerror="this.src='${assetPath('fallback-news.svg')}'"><span><strong>${esc(story.headline)}</strong><small>${esc(date(story.publishedAt))}</small></span></button>`).join('')}</div></aside></div></main>`;
}
