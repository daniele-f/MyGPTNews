import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function copyPublishedData(root = process.cwd()) {
  const destination = join(root, 'public', 'data');
  await mkdir(destination, { recursive: true });
  await cp(join(root, 'data'), destination, { recursive: true, force: true });
}

if (process.argv[1]?.endsWith('copy-published-data')) await copyPublishedData();
