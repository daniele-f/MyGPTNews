import assert from 'node:assert/strict';
import test from 'node:test';
import { dailyStories } from '../src/js/daily-feed';

test('combines legacy editions from one Brussels day and retains each edition id', () => {
  const stories = dailyStories(
    [{ id:'later', date:'2026-10-30', publishedAt:'2026-10-30T12:00:00Z' }, { id:'first', date:'2026-10-30', publishedAt:'2026-10-30T09:00:00Z' }],
    new Map([['later', { stories:[{ id:'added', publishedAt:'2026-10-30T12:00:00Z', changeType:'new' }] }], ['first', { stories:[{ id:'baseline', publishedAt:'2026-10-30T09:00:00Z' }] }]]),
    '2026-10-30'
  );
  assert.deepEqual(stories.map(story => [story.id, story.editionId]), [['added','later'], ['baseline','first']]);
});
