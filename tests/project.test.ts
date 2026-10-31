import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import test from 'node:test';

test('Vite uses the repository Pages base path', async () => {
  const config = await import('../vite.config');
  assert.equal(config.default.base, '/MyGPTNews/');
});

test('removes hourly quote publishing and routes', async () => {
  const [config, packageJson, workflow] = await Promise.all([
    readFile('vite.config.ts', 'utf8'),
    readFile('package.json', 'utf8'),
    readFile('.github/workflows/deploy-pages.yml', 'utf8')
  ]);
  assert.doesNotMatch(config, /hourlyQuotes|hourly-quotes/);
  assert.doesNotMatch(packageJson, /publish-hourly-quote/);
  assert.doesNotMatch(workflow, /schedule:|hourly quote|publish-hourly-quote|contents: write/i);
  await assert.rejects(access('hourly-quotes/index.html', constants.F_OK));
});

test('removes the standalone archive route', async () => {
  const config = await readFile('vite.config.ts', 'utf8');
  const [article, search, today] = await Promise.all([
    readFile('src/js/article-view.ts', 'utf8'),
    readFile('src/js/search-page.ts', 'utf8'),
    readFile('src/js/today.ts', 'utf8')
  ]);
  assert.doesNotMatch(config, /archive:\s*resolve\(/);
  assert.doesNotMatch(`${article}${search}${today}`, /archive\//);
  await assert.rejects(access('archive/index.html', constants.F_OK));
  await assert.rejects(access('src/js/archive.ts', constants.F_OK));
});
