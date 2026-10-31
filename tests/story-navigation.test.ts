import assert from 'node:assert/strict';
import test from 'node:test';
import { storyNavigationTarget } from '../src/js/story-navigation';

test('keeps keyboard focus on an available stage direction after moving', () => {
  assert.deepEqual(storyNavigationTarget(0, 3, 'next'), { index: 1, focus: 'next' });
  assert.deepEqual(storyNavigationTarget(1, 3, 'next'), { index: 2, focus: 'previous' });
  assert.deepEqual(storyNavigationTarget(1, 3, 'previous'), { index: 0, focus: 'next' });
});

test('does not navigate beyond the first or last story', () => {
  assert.equal(storyNavigationTarget(0, 3, 'previous'), null);
  assert.equal(storyNavigationTarget(2, 3, 'next'), null);
});
