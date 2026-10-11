import assert from 'node:assert/strict';
import test from 'node:test';
import { quoteView, selectionTarget } from '../src/js/hourly-quotes-view';

const entries = [
  { id: '2026-10-11T12', slot: '2026-10-11T12', publishedAt: '2026-10-11T10:17:00.000Z', message: 'Noon.', quote: { text: 'Newest', author: 'Author', sourceTitle: 'Source', sourceUrl: 'https://example.test/newest' } },
  { id: '2026-10-11T09', slot: '2026-10-11T09', publishedAt: '2026-10-11T07:17:00.000Z', message: 'Morning.', quote: { text: 'Earlier today', author: 'Author', sourceTitle: 'Source', sourceUrl: 'https://example.test/earlier' } },
  { id: '2026-10-10T23', slot: '2026-10-10T23', publishedAt: '2026-10-10T21:17:00.000Z', message: 'Yesterday.', quote: { text: 'Older', author: 'Author', sourceTitle: 'Source', sourceUrl: 'https://example.test/older' } }
];

test('selects a shareable entry and limits its timeline to the selected Brussels day', () => {
  const view = quoteView(entries, '2026-10-11T09');
  assert.equal(view.selected.id, '2026-10-11T09');
  assert.deepEqual(view.timeline.map((entry) => entry.id), ['2026-10-11T12', '2026-10-11T09']);
  assert.equal(view.selectedUrl, '?entry=2026-10-11T09');
});

test('uses the latest entry when no valid shareable entry is selected', () => {
  const view = quoteView(entries, 'missing');
  assert.equal(view.selected.id, '2026-10-11T12');
  assert.equal(view.newer, undefined);
  assert.equal(view.older?.id, '2026-10-11T09');
});

test('selecting a different date chooses an entry from that day', () => {
  assert.equal(selectionTarget(entries, '2026-10-10', '12')?.id, '2026-10-10T23');
  assert.equal(selectionTarget(entries, '2026-10-11', '09')?.id, '2026-10-11T09');
});
