import { createHash } from 'node:crypto';
import { proposeAction, reviewAction, fingerprint } from './approvals.js';

// Registro em memória, sem efeitos externos. Reiniciar o processo apaga as propostas.
export function createApprovalRegistry({ maxItems = 200 } = {}) {
  if (!Number.isSafeInteger(maxItems) || maxItems < 1) throw Error('Limite inválido');
  const items = new Map();
  const audit = [];
  let previous = 'GENESIS';
  function log(event, action) {
    const entry = { sequence: audit.length + 1, event, id: action.id, fingerprint: fingerprint(action), at: new Date().toISOString(), previous };
    entry.hash = createHash('sha256').update(JSON.stringify(entry)).digest('hex');
    previous = entry.hash;
    audit.push(Object.freeze(entry));
  }
  return Object.freeze({
    propose(input) {
      if (items.size >= maxItems) throw Error('Limite de propostas atingido');
      const action = Object.freeze(proposeAction(input));
      items.set(action.id, action);
      log('proposed', action);
      return { ...action };
    },
    review(id, decision, note = '', expectedFingerprint) {
      const current = items.get(id);
      if (!current) throw Error('Proposta não encontrada');
      if (typeof expectedFingerprint !== 'string' || expectedFingerprint !== fingerprint(current)) throw Error('Proposta alterada ou impressão digital ausente');
      const updated = Object.freeze(reviewAction(current, decision, note));
      items.set(id, updated);
      log(decision, updated);
      return { ...updated };
    },
    list() { return [...items.values()].map(item => ({ ...item })); },
    audit() { return audit.map(entry => ({ ...entry })); },
    verify() {
      let prev = 'GENESIS';
      return audit.every((entry, index) => {
        const { hash, ...data } = entry;
        const valid = entry.sequence === index + 1 && entry.previous === prev && createHash('sha256').update(JSON.stringify(data)).digest('hex') === hash;
        prev = hash;
        return valid;
      });
    }
  });
}
