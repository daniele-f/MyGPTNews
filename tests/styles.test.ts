import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('defines a semantic shared color palette', () => {
  assert.match(styles, /:root\{[^}]*--color-primary:#e75a32[^}]*--color-secondary:#91d8ee[^}]*--color-background:#07171e[^}]*--color-surface:#0a1d25[^}]*--color-text:#edf0ec[^}]*--color-border:#31505b[^}]*--color-focus:#f0b85b[^}]*\}/i);
  assert.doesNotMatch(styles.slice(styles.indexOf('}') + 1), /#[0-9a-f]{3,8}\b/i);
});

test('centers the rail chevron and keeps it hidden for the selected story', () => {
  assert.match(styles, /\.rail-chevron\{[^}]*align-self:center[^}]*transform:translate\(8px,2px\)/);
  assert.match(styles, /\.rail-story:hover \.rail-chevron,\.rail-story:focus-visible \.rail-chevron\{[^}]*transform:translate\(-4px,2px\)/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\] \.rail-chevron\{opacity:0[^}]*transform:translate\(8px,2px\)/);
});

test('uses independent desktop scroll panes below the persistent header', () => {
  assert.match(styles, /html:has\(\.editorial-home\),body:has\(\.editorial-home\)\{height:100dvh;overflow:hidden\}/);
  assert.match(styles, /body:has\(\.editorial-home\) #app\{height:100%;display:flex;flex-direction:column\}/);
  assert.match(styles, /\.editorial-home\{flex:1;min-height:0;padding:0\}/);
  assert.match(styles, /\.editorial-layout\{height:100%;min-height:0\}/);
  assert.match(styles, /\.story-stage\{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:22px 32px 34px\}/);
  assert.match(styles, /\.story-rail\{position:static;height:auto;min-height:0;overflow:hidden;padding:0 0 0 24px;align-self:auto\}/);
  assert.match(styles, /\.rail-stories\{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;align-content:start;padding-right:16px\}/);
  assert.match(styles, /\.rail-story\[aria-pressed=true\]\{width:calc\(100% \+ 10px\)/);
  assert.match(styles, /\.rail-status\{margin-right:12px\}/);
});

test('keeps rail stories at their natural height inside the scroll pane', () => {
  assert.match(styles, /\.rail-stories\{[^}]*align-content:start/);
});

test('insets rail content without moving its scrollbar from the page edge', () => {
  assert.match(styles, /\.rail-stories\{[^}]*padding-right:16px/);
  assert.doesNotMatch(styles, /\.story-rail\{padding-right:16px\}/);
  assert.match(styles, /\.story-stage\{padding-left:32px\}/);
  assert.match(styles, /\.stage-story\{width:100%;margin-inline:auto\}/);
});

test('uses the sticky rail border as the stage divider', () => {
  assert.match(styles, /\.story-rail\{border-left:1px solid var\(--color-border\)\}/);
  assert.doesNotMatch(styles, /\.story-rail::before/);
});

test('uses the header border instead of a fixed overlay divider', () => {
  assert.doesNotMatch(styles, /\.site-header::after/);
});

test('retains desktop content animation and enables full-story slides only on mobile', () => {
  assert.match(styles, /\.story-stage\.is-moving-next \.stage-story > :not\(\.stage-story-navigation\)\{animation:stage-reveal-next/);
  assert.match(styles, /\.story-stage\.is-moving-previous \.stage-story > :not\(\.stage-story-navigation\)\{animation:stage-reveal-previous/);
  const mobileSlide = styles.slice(styles.indexOf('/* Mobile: make story changes read as horizontal panel navigation'));
  assert.match(mobileSlide, /@media\(max-width:800px\) and \(prefers-reduced-motion:no-preference\)/);
  assert.match(mobileSlide, /\.story-stage\.is-moving-next \.stage-story\{animation:mobile-story-from-right/);
  assert.match(mobileSlide, /\.story-stage\.is-moving-previous \.stage-story\{animation:mobile-story-from-left/);
  assert.match(mobileSlide, /@media\(max-width:800px\) and \(prefers-reduced-motion:reduce\)/);
});

test('styles the desktop story scrollbar like the rail and hides it when idle', () => {
  assert.match(styles, /@media\(min-width:801px\)\{\.story-stage\{scrollbar-color:var\(--brand-primary\) var\(--color-surface\);scrollbar-width:thin\}/);
  assert.match(styles, /\.story-stage\.is-scrollbar-idle\{scrollbar-color:transparent transparent\}/);
});

test('uses a more compact headline scale on story stage and article pages', () => {
  assert.match(styles, /\.stage-copy h2\{[^}]*clamp\(2rem,4\.5vw,4rem\)/);
  assert.match(styles, /\.article-detail h1\{[^}]*clamp\(2\.2rem,5\.5vw,4\.5rem\)/);
  assert.match(styles, /\.stage-copy h2\{font-size:clamp\(1\.9rem,9vw,3\.4rem\)/);
  assert.match(styles, /\.article-detail h1\{font-size:clamp\(2rem,10vw,3\.4rem\)/);
});
