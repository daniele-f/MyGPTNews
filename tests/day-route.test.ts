import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDayRoute } from '../src/js/day-route';

const editions = [
  { id: 'latest', date: '2026-11-01' },
  { id: 'selected', date: '2026-10-30' },
  { id: 'older', date: '2026-10-28' }
];

test('selects an available day from the date query', () => {
  assert.equal(resolveDayRoute('?date=2026-10-30', editions), '2026-10-30');
  assert.equal(resolveDayRoute('', editions), '2026-11-01');
});

test('rejects an unavailable date query', () => {
  assert.equal(resolveDayRoute('?date=2026-10-29', editions), null);
  assert.equal(resolveDayRoute('?date=', editions), null);
});

test('lets a permanent article route take precedence over a date query', () => {
  assert.equal(resolveDayRoute('?edition=older&article=story-one&date=2026-11-01', editions), '2026-10-28');
});
