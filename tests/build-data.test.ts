import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { copyPublishedData } from '../scripts/copy-published-data';

test('copies generated data into the deployable public directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mygptnews-build-'));
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'archive.json'), '{"editions":[]}');
  await copyPublishedData(root);
  assert.equal(await readFile(join(root, 'public', 'data', 'archive.json'), 'utf8'), '{"editions":[]}');
});
