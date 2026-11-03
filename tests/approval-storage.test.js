import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApprovalStorage } from '../server/approval-storage.js';

test('snapshot: gravação atômica, leitura e fila sequencial', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'organic-approvals-'));
  try {
    const storage = createApprovalStorage(dir);
    assert.equal(await storage.load(), null);
    await Promise.all([
      storage.save({version:1,items:[{id:'primeiro'}],audit:[]}),
      storage.save({version:1,items:[{id:'segundo'}],audit:[]})
    ]);
    assert.equal((await storage.load()).items[0].id, 'segundo');
    await assert.rejects(storage.save({version:2,items:[],audit:[]}));
    assert.equal((await storage.load()).items[0].id, 'segundo');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('snapshot corrompido não é tratado como registro vazio', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'organic-corrupt-'));
  try {
    await writeFile(path.join(dir,'approvals.json'), '{invalido');
    await assert.rejects(createApprovalStorage(dir).load());
  } finally { await rm(dir,{recursive:true,force:true}); }
});
