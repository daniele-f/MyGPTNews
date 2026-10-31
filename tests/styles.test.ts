import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('centers the rail chevron and keeps it hidden for the selected story', () => {
  assert.match(styles, /\.rail-chevron\{[^}]*align-self:center[^}]*transform:translate\(8px,2px\)/);
  assert.match(styles, /\.rail-story:hover \.rail-chevron,\.rail-story:focus-visible \.rail-chevron\{[^}]*transform:translate\(-4px,2px\)/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\] \.rail-chevron\{opacity:0[^}]*transform:translate\(8px,2px\)/);
});

test('keeps the desktop rail fixed to the viewport edge and its scroll self-contained', () => {
  assert.match(styles, /\.editorial-home\{padding:0 0 42px 32px\}/);
  assert.match(styles, /\.story-rail\{position:sticky;top:83px;height:calc\(100vh - 83px\)/);
  assert.match(styles, /\.rail-stories\{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-right:0\}/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\]\{width:calc\(100% \+ 10px\)/);
  assert.match(styles, /\.rail-status\{margin-right:12px\}/);
});
