import assert from 'node:assert/strict';
import test from 'node:test';

test('Vite uses the repository Pages base path', async () => {
  const config = await import('../vite.config.js');
  assert.equal(config.default.base, '/MyGPTNews/');
});
