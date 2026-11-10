import { externalLinkIcon, shareIcon } from './button-icons';
import { gamePage } from './game-link';
import { assetPath } from './paths';
import { articleUrl } from './routes';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character] as string));
const externalLink = (url: string, label: string, icon = '') =>
  `<a class="button" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(label)} (opens in a new tab)">${icon}${esc(label)}</a>`;

export function storyLinksView(story: {
  id: string;
  sourceUrl: string;
  headline: string;
  steamPages?: { name: string; url: string }[];
  steam?: { url?: string };
  game?: { name: string; url?: string };
}, editionId: string, heading: 'h2' | 'h3' = 'h3') {
  const steamPages = story.steamPages ?? (story.steam?.url ? [{ url: story.steam.url, name: story.game?.name }] : []);
  const steamIcon = `<img class="steam-page-icon" src="${assetPath('steam-logo.ico')}" alt="" loading="lazy">`;
  const officialPage = steamPages.length === 0 ? gamePage(story) : null;
  const gameLinks = steamPages.map(({ name, url }) => {
    const label = steamPages.length > 1 ? `Steam page · ${name}` : 'Steam page';
    return externalLink(url, label, steamIcon);
  }).join('');
  const permalink = esc(articleUrl(editionId, story.id));
  return `<section class="story-links" aria-label="Links">
    <${heading}>Links</${heading}>
    <div class="stage-links">${externalLink(story.sourceUrl, 'Original source', externalLinkIcon)}${gameLinks}${officialPage ? externalLink(officialPage.url, 'Official game page', externalLinkIcon) : ''}<button class="button button-secondary" type="button" aria-haspopup="dialog" data-share-path="${permalink}" data-share-title="${esc(story.headline)}">${shareIcon}Share</button></div>
  </section>`;
}
