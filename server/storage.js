import { readFile, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, '.data'));
const filename = path.join(dataDir, 'history.json');
let writeQueue = Promise.resolve();
export async function readHistory() {
  try {
    const value = JSON.parse(await readFile(filename, 'utf8'));
    return Array.isArray(value) ? value.slice(0, 100) : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}
export async function appendHistory(entry) {
  const operation = writeQueue.then(async () => {
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    const all = [entry, ...(await readHistory())].slice(0, 100);
    const temp = path.join(dataDir, '.history-' + randomUUID() + '.tmp');
    await writeFile(temp, JSON.stringify(all), { mode: 0o600 });
    await rename(temp, filename);
    return entry;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}