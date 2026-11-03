import { readFile, mkdir, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

// Armazenamento local de snapshots; não habilitar em filesystem efêmero.
export function createApprovalStorage(directory = process.env.DATA_DIR || '.data') {
  const folder = path.resolve(directory);
  const filename = path.join(folder, 'approvals.json');
  let queue = Promise.resolve();
  return Object.freeze({
    async load() {
      try {
        const data = JSON.parse(await readFile(filename, 'utf8'));
        if (!data || data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.audit))
          throw Error('Snapshot de aprovações inválido');
        return data;
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error; // Falhar fechado: nunca sobrescrever snapshot corrompido.
      }
    },
    save(snapshot) {
      const job = queue.then(async () => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.items) || !Array.isArray(snapshot.audit))
          throw Error('Snapshot inválido');
        await mkdir(folder, { recursive: true, mode: 0o700 });
        const temp = path.join(folder, '.approvals-' + randomUUID() + '.tmp');
        try {
          await writeFile(temp, JSON.stringify(snapshot), { mode: 0o600, flag: 'wx' });
          await rename(temp, filename);
        } catch (error) {
          const { unlink } = await import('node:fs/promises');
          await unlink(temp).catch(() => {});
          throw error;
        }
      });
      queue = job.catch(() => {});
      return job;
    }
  });
}
