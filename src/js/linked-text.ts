const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));

export function linkifyText(value: unknown) {
  const text = String(value ?? '');
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
    try {
      const parsed = new URL(url);
      if (!parsed.hostname || !['http:', 'https:'].includes(parsed.protocol)) throw Error('Invalid web URL');
      const escaped = escapeHtml(url);
      html += `<a class="inline-url" href="${escaped}" target="_blank" rel="noopener noreferrer">${escaped}</a>${escapeHtml(match[0].slice(url.length))}`;
    } catch {
      html += escapeHtml(match[0]);
    }
    cursor = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(cursor));
}
