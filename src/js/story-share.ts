import { emailIcon, redditIcon, whatsappIcon } from './button-icons';

export function storyShareDetails(path: string, title: string, baseUrl: string) {
  const url = new URL(path, baseUrl).href;
  const subject = encodeURIComponent(title.replace(/[\r\n]+/g, ' '));
  const emailBody = [
    'Hello,',
    'I thought you might find this story from News Game+ interesting.',
    [title, url].join('\r\n'),
  ].join('\r\n\r\n');
  const redditParams = new URLSearchParams({ type: 'LINK', url, title });
  return {
    title,
    url,
    reddit: `https://www.reddit.com/submit?${redditParams}`,
    email: `mailto:?subject=${subject}&body=${encodeURIComponent(emailBody)}`,
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
      <a class="button button-secondary" data-share-reddit target="_blank" rel="noopener noreferrer">${redditIcon}Reddit</a>
      <button class="button" type="button" data-native-share hidden>More options</button>
    </div>
    <p class="share-status" role="status"></p>
    <form method="dialog"><button class="button">Close</button></form>`;
  app.append(dialog);

  const input = dialog.querySelector<HTMLInputElement>('#share-story-url')!;
  const copy = dialog.querySelector<HTMLButtonElement>('[data-copy-story]')!;
  const email = dialog.querySelector<HTMLAnchorElement>('[data-share-email]')!;
  const whatsapp = dialog.querySelector<HTMLAnchorElement>('[data-share-whatsapp]')!;
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
    dialog.showModal();
  });

  copy.addEventListener('click', async () => {
    const story = current;
    if (!story) return;
    try {
      await navigator.clipboard.writeText(story.url);
      if (dialog.open && current === story) status.textContent = 'Link copied.';
    } catch {
      if (!dialog.open || current !== story) return;
      input.focus();
      input.select();
      status.textContent = 'Copy the selected URL.';
    }
  });

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

  const isBackdrop = (event: MouseEvent) => {
    if (event.target !== dialog) return false;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    return event.clientX < left || event.clientX >= right || event.clientY < top || event.clientY >= bottom;
  };

  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = isBackdrop(event); });
  dialog.addEventListener('click', event => {
    if (pressedBackdrop && isBackdrop(event)) dialog.close();
    pressedBackdrop = false;
  });

  dialog.addEventListener('close', () => {
    if (!dialog.open && opener?.isConnected) opener.focus();
  });
  return dialog;
}
