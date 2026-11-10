import { discordIcon, emailIcon, redditIcon, whatsappIcon } from './button-icons';

export function storyShareDetails(path: string, title: string, baseUrl: string) {
  const url = new URL(path, baseUrl).href;
  const subject = encodeURIComponent(title.replace(/[\r\n]+/g, ' '));
  const redditParams = new URLSearchParams({ type: 'LINK', url, title });
  return {
    title,
    url,
    reddit: `https://www.reddit.com/submit?${redditParams}`,
    email: `mailto:?subject=${subject}&body=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  };
}

export function bindStoryShare(app: HTMLElement) {
  const dialog = document.createElement('dialog');
  dialog.className = 'share-dialog';
  dialog.setAttribute('aria-labelledby', 'share-dialog-title');
  dialog.innerHTML = `
    <h2 id="share-dialog-title">Share story</h2>
    <label for="share-story-url">Story URL</label>
    <div class="share-url-row">
      <input id="share-story-url" type="url" readonly>
      <button class="button share-copy" type="button" data-copy-story autofocus>Copy</button>
    </div>
    <div class="share-actions">
      <a class="button button-secondary" data-share-email>${emailIcon}Email</a>
      <a class="button button-secondary" data-share-whatsapp target="_blank" rel="noopener noreferrer">${whatsappIcon}WhatsApp</a>
      <button class="button button-secondary" type="button" data-share-discord>${discordIcon}Discord</button>
      <a class="button button-secondary" data-share-reddit target="_blank" rel="noopener noreferrer">${redditIcon}Reddit</a>
      <button class="button" type="button" data-native-share hidden>More options</button>
    </div>
    <p class="share-status" role="status"></p>
    <p data-discord-fallback hidden><a class="button button-secondary" href="https://discord.com/channels/@me" target="_blank" rel="noopener noreferrer">Open Discord</a></p>
    <form method="dialog"><button class="button button-secondary">Close</button></form>`;
  app.append(dialog);

  const input = dialog.querySelector<HTMLInputElement>('#share-story-url')!;
  const copy = dialog.querySelector<HTMLButtonElement>('[data-copy-story]')!;
  const email = dialog.querySelector<HTMLAnchorElement>('[data-share-email]')!;
  const whatsapp = dialog.querySelector<HTMLAnchorElement>('[data-share-whatsapp]')!;
  const discord = dialog.querySelector<HTMLButtonElement>('[data-share-discord]')!;
  const discordFallback = dialog.querySelector<HTMLElement>('[data-discord-fallback]')!;
  const discordLink = discordFallback.querySelector('a')!;
  const reddit = dialog.querySelector<HTMLAnchorElement>('[data-share-reddit]')!;
  const nativeShare = dialog.querySelector<HTMLButtonElement>('[data-native-share]')!;
  const status = dialog.querySelector<HTMLElement>('[role=status]')!;
  let current: ReturnType<typeof storyShareDetails> | undefined;
  let opener: HTMLButtonElement | undefined;

  app.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-share-path]');
    if (!button || !button.dataset.sharePath || dialog.open) return;

    current = storyShareDetails(button.dataset.sharePath, button.dataset.shareTitle || '', document.baseURI);
    opener = button;
    input.value = current.url;
    email.href = current.email;
    whatsapp.href = current.whatsapp;
    reddit.href = current.reddit;
    nativeShare.hidden = typeof navigator.share !== 'function' || navigator.canShare?.({ title: current.title, url: current.url }) === false;
    status.textContent = '';
    discordFallback.hidden = true;
    dialog.showModal();
  });

  async function copyStory(openDiscord = false) {
    const story = current;
    if (!story) return;
    try {
      await navigator.clipboard.writeText(story.url);
    } catch {
      if (!dialog.open || current !== story) return;
      input.focus();
      input.select();
      status.textContent = openDiscord ? 'Copy the selected URL, then open Discord.' : 'Copy the selected URL.';
      if (openDiscord) discordFallback.hidden = false;
      return;
    }

    if (!dialog.open || current !== story) return;
    status.textContent = 'Link copied.';
    if (!openDiscord) return;

    const tab = window.open('about:blank', '_blank');
    discordFallback.hidden = Boolean(tab);
    if (tab) {
      tab.opener = null;
      tab.location.replace(discordLink.href);
      status.textContent = 'Link copied. Paste it in Discord.';
    } else {
      status.textContent = 'Link copied. Open Discord to paste it.';
    }
  }

  copy.addEventListener('click', () => void copyStory());
  discord.addEventListener('click', () => void copyStory(true));

  nativeShare.addEventListener('click', async () => {
    const story = current;
    if (!story) return;
    try {
      await navigator.share({ title: story.title, url: story.url });
      if (dialog.open && current === story) dialog.close();
    } catch (error) {
      if (dialog.open && current === story && (error as Error)?.name !== 'AbortError') {
        status.textContent = 'Device sharing is unavailable. Choose another option.';
      }
    }
  });

  dialog.addEventListener('close', () => {
    if (!dialog.open && opener?.isConnected) opener.focus();
  });
  return dialog;
}
