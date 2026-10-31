import { assetPath } from './paths';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));

export function gamePage(story: any) {
  const url = story?.steam?.url || story?.game?.url;
  if (!url) return null;
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  const domain = story?.steam?.url ? 'steampowered.com' : hostname;
  return { url, domain, label: story?.steam?.url ? 'Steam' : story.game.name };
}

export function brandButton(story: any, token = '') {
  const page = gamePage(story);
  if (!page) return '';
  const logo = page.domain === 'steampowered.com'
    ? assetPath('steam-logo.ico')
    : token ? `https://img.logo.dev/${encodeURIComponent(page.domain)}?token=${encodeURIComponent(token)}&size=64&format=png` : '';
  return `<a class="brand-button" href="${esc(page.url)}" target="_blank" rel="noopener" aria-label="${esc(page.label)} game page">${logo ? `<img src="${logo}" alt="${esc(page.label)}" loading="lazy">` : `<span>${esc(page.label)}</span>`}</a>`;
}
