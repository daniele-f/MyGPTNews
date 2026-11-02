const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));

const webLink = (url: string, label = url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname || !['http:', 'https:'].includes(parsed.protocol)) throw Error('Invalid web URL');
    return `<a class="inline-url" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  } catch {
    return null;
  }
};

const linkifyUrls = (text: string) => {
  const brackets: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let html = '';
  let cursor = 0;
  for (const match of text.matchAll(/https?:\/\/[^\s<>"'“”‘’]+/gi)) {
    html += escapeHtml(text.slice(cursor, match.index));
    let url = match[0];
    // Strip prose punctuation while retaining balanced brackets inside URLs.
    while (url) {
      const last = url.at(-1)!;
      const opening = brackets[last];
      if (/[.,!?;:]/.test(last) || (opening && url.split(last).length > url.split(opening).length)) url = url.slice(0, -1);
      else break;
    }
    html += (webLink(url) || escapeHtml(url)) + escapeHtml(match[0].slice(url.length));
    cursor = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(cursor));
};

export function linkifyText(value: unknown) {
  const text = String(value ?? '');
  let html = '';
  let cursor = 0;
  for (const match of text.matchAll(/\[([^\]\r\n]+)\]\((https?:\/\/[^\s<>'"()]+)\)/gi)) {
    html += linkifyUrls(text.slice(cursor, match.index));
    html += webLink(match[2], match[1]) || escapeHtml(match[0]);
    cursor = match.index + match[0].length;
  }
  return html + linkifyUrls(text.slice(cursor));
}
