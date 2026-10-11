import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { publishQuote } from '../scripts/lib/hourly-quotes';

const quote = {
  text: 'The only way to do great work is to love what you do.',
  author: 'Steve Jobs',
  sourceTitle: 'Stanford commencement address',
  sourceUrl: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says'
};

test('publishes a timestamped quote while preserving history', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-quotes-'));
  await mkdir(join(root, 'data'), { recursive: true });
  const now = new Date('2026-10-11T08:17:23.000Z');

  const result = await publishQuote(root, now, () => quote, () => 'A small thought for this hour.');
  const history = JSON.parse(await readFile(join(root, 'data', 'hourly-quotes.json'), 'utf8'));

  assert.equal(result.published, true);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].publishedAt, now.toISOString());
  assert.equal(history.entries[0].message, 'A small thought for this hour.');
  assert.deepEqual(history.entries[0].quote, quote);
  assert.equal(history.entries[0].slot, '2026-10-11T10');
});

test('does not publish a second entry when a workflow retries in the same Brussels hour', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-quotes-'));
  await mkdir(join(root, 'data'), { recursive: true });
  const first = new Date('2026-10-11T08:17:23.000Z');
  await publishQuote(root, first, () => quote, () => 'First message.');

  const result = await publishQuote(root, new Date('2026-10-11T08:58:00.000Z'), () => quote, () => 'Retry message.');
  const history = JSON.parse(await readFile(join(root, 'data', 'hourly-quotes.json'), 'utf8'));

  assert.equal(result.published, false);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].message, 'First message.');
});

test('rejects corrupted quote history instead of overwriting it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-quotes-'));
  await mkdir(join(root, 'data'), { recursive: true });
  await (await import('node:fs/promises')).writeFile(join(root, 'data', 'hourly-quotes.json'), '{"entries":"broken"}');

  await assert.rejects(() => publishQuote(root, new Date('2026-10-11T08:17:23.000Z'), () => quote, () => 'Message.'), /history/i);
});
