import { createApprovalRegistry } from './approval-registry.js';
import { createApprovalStorage } from './approval-storage.js';

// A mutação só passa a ser visível após o snapshot ser gravado.
// Uma fila por processo impede perda de atualização dentro da instância.
export async function createPersistentApprovalService({
  storage = createApprovalStorage(), maxItems = 200
} = {}) {
  if (!storage || typeof storage.load !== 'function' || typeof storage.save !== 'function') {
    throw Error('Armazenamento de aprovações inválido');
  }
  // Snapshot corrompido interrompe a inicialização; não é substituído por registro vazio.
  const existing = await storage.load();
  let current = createApprovalRegistry({ maxItems, snapshot: existing });
  let queue = Promise.resolve();

  function update(mutate) {
    const pending = queue.then(async () => {
      const draft = createApprovalRegistry({ maxItems, snapshot: current.snapshot() });
      const value = mutate(draft);
      try {
        await storage.save(draft.snapshot());
      } catch {
        // Nunca confirmar uma ação que não foi persistida.
        const error = new Error('Não foi possível salvar a aprovação. Nenhuma alteração foi confirmada.');
        error.statusCode = 503;
        throw error;
      }
      current = draft;
      return value;
    });
    // Uma falha isolada não paralisa operações futuras.
    queue = pending.then(() => {}, () => {});
    return pending;
  }

  return Object.freeze({
    propose(input) { return update(registry => registry.propose(input)); },
    review(id, decision, note = '', expectedFingerprint) {
      return update(registry => registry.review(id, decision, note, expectedFingerprint));
    },
    list() { return current.list(); },
    audit() { return current.audit(); },
    verify() { return current.verify(); },
    snapshot() { return current.snapshot(); }
  });
}
