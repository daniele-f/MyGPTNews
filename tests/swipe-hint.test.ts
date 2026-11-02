import assert from 'node:assert/strict';
import test from 'node:test';
import * as state from '../src/js/state';

test('remembers the swipe hint acknowledgement across page loads', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const stored = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value)
  } });
  try {
    assert.equal(typeof state.swipeHintDismissed, 'function');
    assert.equal(state.swipeHintDismissed(), false);
    state.dismissSwipeHint();
    assert.equal(state.swipeHintDismissed(), true);
    const modulePath = '../src/js/state?swipe-hint-reload';
    const reloaded = await import(modulePath);
    assert.equal(reloaded.swipeHintDismissed(), true);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete (globalThis as any).localStorage;
  }
});

test('unavailable browser storage does not break the swipe hint', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => { throw Error('blocked'); },
    setItem: () => { throw Error('blocked'); }
  } });
  try {
    assert.equal(typeof state.swipeHintDismissed, 'function');
    assert.equal(state.swipeHintDismissed(), false);
    assert.doesNotThrow(() => state.dismissSwipeHint());
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete (globalThis as any).localStorage;
  }
});
