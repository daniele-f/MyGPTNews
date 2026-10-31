import assert from 'node:assert/strict';
import test from 'node:test';
import { developmentFixtures } from '../src/js/dev-fixtures';

test('creates four development days for rail and stage scroll testing', () => {
  const { archive, editions } = developmentFixtures('2026-10-31');
  const days = archive.editions.map((edition: any) => edition.date);
  const stories = archive.editions.map((edition: any) => editions.get(edition.id).stories);

  assert.deepEqual(days, ['2026-10-31', '2026-10-30', '2026-10-29', '2026-10-28']);
  assert.deepEqual(stories.map((day: any[]) => day.length), [20, 20, 2, 2]);
  assert.ok(stories[0][0].summary.length > 1000);
  assert.ok(stories[1][0].summary.length < 200);
  assert.ok(stories[2][0].summary.length > 1000);
  assert.ok(stories[3][0].summary.length < 200);
});
