import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { copyPublishedData, shouldCopyPublishedData } from '../scripts/copy-published-data';

test('copies generated data into the deployable public directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-build-'));
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'archive.json'), '{"editions":[]}');
  await copyPublishedData(root);
  assert.equal(await readFile(join(root, 'public', 'data', 'archive.json'), 'utf8'), '{"editions":[]}');
});

test('copies generated data into the final deployment directory after a build', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-build-'));
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'search-index.json'), '{"stories":[{"id":"test"}]}');
  await copyPublishedData(root, 'dist');
  assert.equal(await readFile(join(root, 'dist', 'data', 'search-index.json'), 'utf8'), '{"stories":[{"id":"test"}]}');
});

test('recognizes the TypeScript CLI filename used by npm build', () => {
  assert.equal(shouldCopyPublishedData('C:/work/scripts/copy-published-data.ts'), true);
});
