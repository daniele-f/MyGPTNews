import { assetPath } from './paths';
import { brandButton } from './game-link';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric', timeZone:'Europe/Brussels' });
const logoToken = import.meta.env?.VITE_LOGO_DEV_TOKEN || '';

export function articleView(story: any, editionId: string) {
  const image = esc(story.imageUrl || assetPath('fallback-news.svg'));
  const price = story.price ? `<p class="price">Historical price: ${esc(story.price.currency || '')} ${esc(story.price.amount)}, checked ${esc(date(story.price.checkedAt))}</p>` : '';
  return `<header class="site-header"><a class="wordmark" href="${assetPath('')}">MY GPT NEWS</a><nav aria-label="Site navigation"><a href="${assetPath('')}">Home</a><a href="${assetPath('archive/')}">Browse archive</a><a href="${assetPath('search/')}">Search</a></nav></header><main class="article-page"><article class="article-detail" id="article-${esc(story.id)}"><p class="eyebrow">${story.categories.map(esc).join(' · ')} <span>${esc(date(story.publishedAt))}</span></p><h1>${esc(story.headline)}</h1><img src="${image}" alt=""><p class="article-summary">${esc(story.summary)}</p>${story.game ? `<p class="game">${esc(story.game.name)}</p>` : ''}${price}<div class="stage-links">${brandButton(story, logoToken)}<a class="button" href="${esc(story.sourceUrl)}" target="_blank" rel="noopener">Original source</a></div></article></main>`;
}
