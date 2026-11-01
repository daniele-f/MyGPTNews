import assert from 'node:assert/strict';
import test from 'node:test';
import { initialStoryIndex, storyNavigationTarget } from '../src/js/story-navigation';
import { selectedStoryForDay, storedStoryForDay } from '../src/js/state';

test('keeps keyboard focus on an available stage direction after moving', () => {
  assert.deepEqual(storyNavigationTarget(0, 3, 'next'), { index: 1, focus: 'next' });
  assert.deepEqual(storyNavigationTarget(1, 3, 'next'), { index: 2, focus: 'previous' });
  assert.deepEqual(storyNavigationTarget(1, 3, 'previous'), { index: 0, focus: 'next' });
});

test('does not navigate beyond the first or last story', () => {
  assert.equal(storyNavigationTarget(0, 3, 'previous'), null);
  assert.equal(storyNavigationTarget(2, 3, 'next'), null);
});

test('restores a saved story only for the same news day', () => {
  assert.equal(storedStoryForDay('{"date":"2026-11-01","storyId":"selected"}', '2026-11-01'), 'selected');
  assert.equal(storedStoryForDay('{"date":"2026-10-31","storyId":"older"}', '2026-11-01'), null);
  assert.equal(storedStoryForDay('not json', '2026-11-01'), null);
});

test('falls back when browser storage is unavailable', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable:true, value:{ getItem: () => { throw Error('blocked'); } } });
  try {
    assert.equal(selectedStoryForDay('2026-11-01'), null);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete (globalThis as any).localStorage;
  }
});

test('prefers an available saved story, then the featured story', () => {
  const stories = [{ id:'first' }, { id:'featured', featured:true }, { id:'saved' }];
  assert.equal(initialStoryIndex(stories, 'saved'), 2);
  assert.equal(initialStoryIndex(stories, 'missing'), 1);
  assert.equal(initialStoryIndex([{ id:'first' }, { id:'second' }], null), 0);
});
