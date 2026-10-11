import '../styles.css';
import { loadJson } from './data';
import { quoteView, selectionTarget, type HourlyQuoteEntry } from './hourly-quotes-view';
export { quoteView, selectionTarget, type HourlyQuoteEntry } from './hourly-quotes-view';

const dateTime = (value: string) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
const entryLink = (entry?: HourlyQuoteEntry) => entry ? `?entry=${encodeURIComponent(entry.id)}` : '';
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));

async function renderPage() {
  const app = document.querySelector('#app') as HTMLElement;
  try {
    const history = await loadJson('data/hourly-quotes.json');
    if (!history.entries?.length) throw new Error('No hourly quotes have been published yet.');
    const params = new URLSearchParams(location.search); const view = quoteView(history.entries, params.get('entry')); const selected = view.selected; const times = view.timeline.map((entry) => entry.slot.slice(11));
    app.innerHTML = `<header><div><p class="brand">MY GPT NEWS</p><h1>Hourly Quotes</h1><p>Published moments, shown in Europe/Brussels time.</p></div><nav><a class="button" href="../">Today</a><a href="../archive/">Archive</a><a href="../search/">Search</a></nav></header><section class="quote-controls" aria-label="Browse quotes"><label>Date <select id="quote-date">${view.dates.map((date) => `<option value="${date}" ${date === selected.slot.slice(0, 10) ? 'selected' : ''}>${date}</option>`).join('')}</select></label><label>Time <select id="quote-time">${times.map((time) => `<option value="${time}" ${time === selected.slot.slice(11) ? 'selected' : ''}>${time}</option>`).join('')}</select></label><a class="button" href="?entry=${encodeURIComponent(history.entries[0].id)}">Latest</a></section><article class="quote-card" id="${escapeHtml(selected.id)}"><p class="eyebrow">Published ${dateTime(selected.publishedAt)}</p><blockquote>“${escapeHtml(selected.quote.text)}”</blockquote><p>— ${escapeHtml(selected.quote.author)}, <a href="${escapeHtml(selected.quote.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(selected.quote.sourceTitle)}</a></p><p>${escapeHtml(selected.message)}</p><p><a href="${view.selectedUrl}">Share this entry</a></p></article><nav class="quote-paging"><a class="button ${view.newer ? '' : 'disabled'}" ${view.newer ? `href="${entryLink(view.newer)}"` : 'aria-disabled="true"'}>Newer</a><a class="button ${view.older ? '' : 'disabled'}" ${view.older ? `href="${entryLink(view.older)}"` : 'aria-disabled="true"'}>Older</a></nav><section><h2>${selected.slot.slice(0, 10)} timeline</h2><div class="quote-timeline">${view.timeline.map((entry) => `<a class="timeline-entry ${entry.id === selected.id ? 'selected' : ''}" href="${entryLink(entry)}"><time>${dateTime(entry.publishedAt)}</time><span>${escapeHtml(entry.quote.author)} — ${escapeHtml(entry.message)}</span></a>`).join('')}</div></section>`;
    const selectDate = () => { const date = (document.querySelector('#quote-date') as HTMLSelectElement).value; const target = selectionTarget(history.entries, date, ''); if (target) location.href = `?entry=${encodeURIComponent(target.id)}`; };
    const selectTime = () => { const date = (document.querySelector('#quote-date') as HTMLSelectElement).value; const time = (document.querySelector('#quote-time') as HTMLSelectElement).value; const target = selectionTarget(history.entries, date, time); if (target) location.href = `?entry=${encodeURIComponent(target.id)}`; };
    document.querySelector('#quote-date')?.addEventListener('change', selectDate); document.querySelector('#quote-time')?.addEventListener('change', selectTime);
  } catch (error: any) { app.innerHTML = `<h1>Hourly Quotes</h1><p>${escapeHtml(error.message)}</p><a href="../">Return to today</a>`; }
}

if (typeof document !== 'undefined') void renderPage();
