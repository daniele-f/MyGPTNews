import { externalLinkIcon } from './button-icons';
import { linkifyText } from './linked-text';
import { assetPath } from './paths';
import { brandButton } from './game-link';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric', timeZone:'Europe/Brussels' });
const logoToken = import.meta.env?.VITE_LOGO_DEV_TOKEN || '';
const steamPreview = Boolean(import.meta.env?.DEV);

export function articleView(story: any, editionId: string) {
  const image = esc(story.imageUrl || assetPath('fallback-news.svg'));
  const price = story.price ? `<p class="price">Historical price: ${esc(story.price.currency || '')} ${esc(story.price.amount)}, checked ${esc(date(story.price.checkedAt))}</p>` : '';
  return `<header class="site-header"><a class="wordmark" href="${assetPath('')}" aria-label="News Game+ home"><img class="brand-logo" src="${assetPath('ng-plus.svg')}" alt="" aria-hidden="true"><span class="brand-separator" aria-hidden="true"></span><img class="brand-wordmark" src="${assetPath('news-game-wordmark.svg')}" alt="" aria-hidden="true"></a><nav aria-label="Site navigation"><a href="${assetPath('')}">News archive</a><a href="${assetPath('search/')}">Search</a></nav></header><main class="article-page"><article class="article-detail" id="article-${esc(story.id)}"><p class="eyebrow">${story.categories.map(esc).join(' · ')} <span>${esc(date(story.publishedAt))}</span></p><h1>${esc(story.headline)}</h1><img src="${image}" alt=""><p class="article-summary">${linkifyText(story.summary)}</p>${story.game ? `<p class="game">${esc(story.game.name)}</p>` : ''}${price}<div class="stage-links"><a class="button" href="${esc(story.sourceUrl)}" target="_blank" rel="noopener" aria-label="Original source (opens in a new tab)">${externalLinkIcon}Original source</a>${brandButton(story, logoToken, steamPreview)}</div></article></main>`;
}
