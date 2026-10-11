import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function copyPublishedData(root = process.cwd(), outputDirectory = 'public') {
  const destination = join(root, outputDirectory, 'data');
  await mkdir(destination, { recursive: true });
  await cp(join(root, 'data'), destination, { recursive: true, force: true });
}

if (process.argv[1]?.endsWith('copy-published-data')) await copyPublishedData(process.cwd(), process.argv[2] || 'public');
