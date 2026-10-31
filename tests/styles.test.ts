import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('centers the rail chevron and keeps it hidden for the selected story', () => {
  assert.match(styles, /\.rail-chevron\{[^}]*align-self:center[^}]*transform:translate\(8px,2px\)/);
  assert.match(styles, /\.rail-story:hover \.rail-chevron,\.rail-story:focus-visible \.rail-chevron\{[^}]*transform:translate\(-4px,2px\)/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\] \.rail-chevron\{opacity:0[^}]*transform:translate\(8px,2px\)/);
});

test('keeps the desktop rail sticky below the header before it reaches the viewport top', () => {
  assert.match(styles, /\.editorial-home\{padding:0 0 42px 32px\}/);
  assert.match(styles, /\.story-rail\{position:sticky;top:0;height:100vh/);
  assert.match(styles, /\.rail-stories\{min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding-right:0\}/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\]\{width:calc\(100% \+ 10px\)/);
  assert.match(styles, /\.rail-status\{margin-right:12px\}/);
});

test('insets rail content and centers the stage content block', () => {
  assert.match(styles, /\.story-rail\{padding-right:16px\}/);
  assert.match(styles, /\.story-stage\{padding-left:32px\}/);
  assert.match(styles, /\.stage-story\{width:100%;margin-inline:auto\}/);
});

test('uses the sticky rail border as the stage divider', () => {
  assert.match(styles, /\.story-rail\{border-left:1px solid #31505b\}/);
  assert.doesNotMatch(styles, /\.story-rail::before/);
});

test('reserves a header-height sticky range when the story stage is short', () => {
  assert.match(styles, /\.editorial-layout\{min-height:calc\(100vh \+ 83px\)\}/);
});

test('keeps stage navigation outside the story-swap animation', () => {
  assert.match(styles, /\.story-stage\.is-moving-next \.stage-story > :not\(\.stage-story-navigation\)\{animation:stage-reveal-next/);
  assert.match(styles, /\.story-stage\.is-moving-previous \.stage-story > :not\(\.stage-story-navigation\)\{animation:stage-reveal-previous/);
  assert.doesNotMatch(styles, /\.story-stage\.is-moving-next \.stage-story\{animation/);
});
