import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createApprovalStorage } from '../server/approval-storage.js';
import { createPersistentApprovalService } from '../server/approval-service.js';
import { fingerprint } from '../server/approvals.js';

const proposal = {
  type: 'deploy',
  title: 'Publicar ambiente de teste',
  description: 'Revisar a implantação antes de publicar',
  target: 'homologacao'
};
async function temporaryStore(run) {
  const dir = await mkdtemp(path.join(tmpdir(), 'organic-service-'));
  try { await run(createApprovalStorage(dir), dir); }
  finally { await rm(dir, { recursive: true, force: true }); }
}

test('persiste proposta e revisão entre reinicializações', async () => {
  await temporaryStore(async storage => {
    const first = await createPersistentApprovalService({ storage });
    const proposed = await first.propose(proposal);
    assert.equal(first.verify(), true);
    const reopened = await createPersistentApprovalService({ storage });
    assert.equal(reopened.list()[0].status, 'pending');
    assert.equal(reopened.list()[0].id, proposed.id);
    const approved = await reopened.review(proposed.id, 'approved', 'Revisado', fingerprint(proposed));
    assert.equal(approved.executed, false);
    const afterRestart = await createPersistentApprovalService({ storage });
    assert.equal(afterRestart.list()[0].status, 'approved');
    assert.equal(afterRestart.audit().length, 2);
    assert.equal(afterRestart.verify(), true);
  });
});

test('operações simultâneas são serializadas sem perder propostas', async () => {
  await temporaryStore(async storage => {
    const service = await createPersistentApprovalService({ storage });
    const items = await Promise.all(Array.from({ length: 12 }, (_, index) =>
      service.propose({ ...proposal, title: 'Publicação ' + index })
    ));
    assert.equal(new Set(items.map(item => item.id)).size, 12);
    const loaded = await createPersistentApprovalService({ storage });
    assert.equal(loaded.list().length, 12);
    assert.equal(loaded.audit().length, 12);
    assert.equal(loaded.verify(), true);
  });
});

test('falha de disco rejeita mutação sem modificar estado confirmado', async () => {
  let snapshot = null;
  let shouldFail = false;
  const storage = {
    async load() { return snapshot === null ? null : structuredClone(snapshot); },
    async save(data) {
      if (shouldFail) throw Error('Disco indisponível');
      snapshot = structuredClone(data);
    }
  };
  const service = await createPersistentApprovalService({ storage });
  const action = await service.propose(proposal);
  shouldFail = true;
  await assert.rejects(service.review(action.id, 'approved', '', fingerprint(action)), /Nenhuma alteração/);
  assert.equal(service.list()[0].status, 'pending');
  assert.equal(service.audit().length, 1);
  shouldFail = false;
  const approved = await service.review(action.id, 'approved', '', fingerprint(action));
  assert.equal(approved.status, 'approved');
  assert.equal((await createPersistentApprovalService({ storage })).list()[0].status, 'approved');
});

test('snapshot adulterado ou corrompido impede a inicialização e não é sobrescrito', async () => {
  await temporaryStore(async (storage, dir) => {
    const service = await createPersistentApprovalService({ storage });
    await service.propose(proposal);
    const file = path.join(dir, 'approvals.json');
    const original = await readFile(file, 'utf8');
    const tampered = JSON.parse(original);
    tampered.items[0].target = 'destino/adulterado';
    await writeFile(file, JSON.stringify(tampered));
    await assert.rejects(createPersistentApprovalService({ storage }), /Auditoria inconsistente/);
    assert.equal(await readFile(file, 'utf8'), JSON.stringify(tampered));
  });
});

test('duplicatas e limites continuam bloqueados após a persistência', async () => {
  await temporaryStore(async storage => {
    const service = await createPersistentApprovalService({ storage, maxItems: 1 });
    await service.propose(proposal);
    await assert.rejects(service.propose(proposal), /Limite/);
    const reopened = await createPersistentApprovalService({ storage, maxItems: 1 });
    assert.equal(reopened.list().length, 1);
  });
});
