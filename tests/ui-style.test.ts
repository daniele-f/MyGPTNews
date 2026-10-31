import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('reserves left rail space for the selected-item shift', async () => {
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(css, /\.rail-stories\{[^}]*padding-left:14px/);
});
