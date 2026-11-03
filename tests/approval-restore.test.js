import test from 'node:test';
import assert from 'node:assert/strict';
import { createApprovalRegistry } from '../server/approval-registry.js';

const proposal = { type: 'git_write', title: 'Alterar projeto', description: 'Atualizar arquivos de teste', target: 'repo/teste' };
test('restaura propostas e cadeia de auditoria', () => {
  const source = createApprovalRegistry();
  const first = source.propose(proposal);
  source.review(first.id, 'approved', 'Revisado', source.snapshot().audit[0].fingerprint);
  const restored = createApprovalRegistry({ snapshot: source.snapshot() });
  assert.equal(restored.verify(), true);
  assert.deepEqual(restored.snapshot(), source.snapshot());
  assert.equal(restored.list()[0].status, 'approved');
});
test('rejeita alteração em proposta persistida', () => {
  const source = createApprovalRegistry();
  source.propose(proposal);
  const snapshot = source.snapshot();
  snapshot.items[0].target = 'destino/adulterado';
  assert.throws(() => createApprovalRegistry({ snapshot }), /Auditoria inconsistente/);
});
test('rejeita adulteração e remoção de eventos', () => {
  const source = createApprovalRegistry();
  source.propose(proposal);
  const modified = source.snapshot();
  modified.audit[0].event = 'approved';
  assert.throws(() => createApprovalRegistry({ snapshot: modified }), /Cadeia de auditoria/);
  const removed = source.snapshot();
  removed.audit = [];
  assert.throws(() => createApprovalRegistry({ snapshot: removed }), /Auditoria inconsistente/);
});
test('rejeita duplicatas e snapshots acima do limite', () => {
  const source = createApprovalRegistry();
  source.propose(proposal);
  const duplicated = source.snapshot();
  duplicated.items.push({ ...duplicated.items[0] });
  assert.throws(() => createApprovalRegistry({ snapshot: duplicated }), /Proposta persistida inválida/);
  assert.throws(() => createApprovalRegistry({ maxItems: 0 }), /Limite inválido/);
  assert.throws(() => createApprovalRegistry({ maxItems: 1, snapshot: duplicated }), /Snapshot excede limites/);
});
