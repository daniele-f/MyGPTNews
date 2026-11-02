import assert from 'node:assert/strict';
import test from 'node:test';
import * as navigation from '../src/js/story-navigation';
import type { StoryDirection } from '../src/js/story-navigation';

const finger = (clientX: number, clientY: number, identifier = 1) => ({ clientX, clientY, identifier });

function setup(mobile = { matches: true }) {
  const stage = new EventTarget();
  const directions: StoryDirection[] = [];
  assert.equal(typeof navigation.bindStorySwipe, 'function', 'stage swipe navigation is available');
  navigation.bindStorySwipe(stage as HTMLElement, direction => directions.push(direction), mobile);
  const touch = (type: string, touches: ReturnType<typeof finger>[], changedTouches = touches) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { touches, changedTouches });
    stage.dispatchEvent(event);
    return event;
  };
  const swipe = (endX: number, endY = 100) => {
    touch('touchstart', [finger(150, 100)]);
    const move = touch('touchmove', [finger(endX, endY)]);
    const end = touch('touchend', [], [finger(endX, endY)]);
    return { move, end };
  };
  return { directions, touch, swipe };
}

test('horizontal mobile swipes navigate once in the matching direction and suppress link activation', () => {
  const { swipe, directions } = setup();
  const left = swipe(50);
  assert.deepEqual(directions, ['next']);
  assert.equal(left.move.defaultPrevented, true);
  assert.equal(left.end.defaultPrevented, true);
  swipe(250);
  assert.deepEqual(directions, ['next', 'previous']);
});

test('taps and short drags do not navigate or suppress clicks', () => {
  const { swipe, directions } = setup();
  const tap = swipe(150);
  const drag = swipe(120);
  assert.deepEqual(directions, []);
  assert.equal(tap.end.defaultPrevented, false);
  assert.equal(drag.end.defaultPrevented, false);
});

test('vertical and diagonal gestures keep native page scrolling', () => {
  const { swipe, directions } = setup();
  for (const [x, y] of [[140, 220], [70, 200]]) {
    const { move, end } = swipe(x, y);
    assert.equal(move.defaultPrevented, false);
    assert.equal(end.defaultPrevented, false);
  }
  assert.deepEqual(directions, []);
});

test('a vertical scroll cannot turn into story navigation later in the gesture', () => {
  const { touch, directions } = setup();
  touch('touchstart', [finger(150, 100)]);
  touch('touchmove', [finger(145, 130)]);
  touch('touchend', [], [finger(20, 140)]);
  assert.deepEqual(directions, []);
});

test('pinch gestures and canceled touches never navigate', () => {
  const { touch, directions } = setup();
  touch('touchstart', [finger(150, 100)]);
  touch('touchstart', [finger(150, 100), finger(170, 100, 2)]);
  touch('touchend', [], [finger(20, 100)]);
  touch('touchstart', [finger(150, 100)]);
  touch('touchcancel', []);
  touch('touchend', [], [finger(20, 100)]);
  assert.deepEqual(directions, []);
});

test('swipes are disabled on desktop and follow viewport changes', () => {
  const mobile = { matches: false };
  const { swipe, directions } = setup(mobile);
  const desktop = swipe(20);
  assert.equal(desktop.move.defaultPrevented, false);
  assert.deepEqual(directions, []);
  mobile.matches = true;
  swipe(20);
  assert.deepEqual(directions, ['next']);
});
