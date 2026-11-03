import { createHash } from 'node:crypto';
import { proposeAction, reviewAction, fingerprint } from './approvals.js';

// Registro em memória, sem efeitos externos. Reiniciar o processo apaga as propostas.
export function createApprovalRegistry({ maxItems = 200, snapshot = null } = {}) {
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
  if (snapshot !== null) {
    if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.items) || !Array.isArray(snapshot.audit))
      throw Error('Snapshot de aprovações inválido');
    if (snapshot.items.length > maxItems || snapshot.audit.length > maxItems * 2)
      throw Error('Snapshot excede limites');
    const ids = new Set();
    for (const item of snapshot.items) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || ids.has(item.id) ||
          !['pending', 'approved', 'rejected'].includes(item.status) || item.executed !== false ||
          typeof item.createdAt !== 'string' || typeof item.target !== 'string' ||
          typeof item.title !== 'string' || typeof item.description !== 'string' ||
          typeof item.type !== 'string') throw Error('Proposta persistida inválida');
      ids.add(item.id);
      items.set(item.id, Object.freeze({ ...item }));
    }
    const eventsById = new Map();
    for (const entry of snapshot.audit) {
      if (!entry || !ids.has(entry.id) || !['proposed', 'approved', 'rejected'].includes(entry.event))
        throw Error('Evento persistido inválido');
      const history = eventsById.get(entry.id) || [];
      history.push(entry);
      eventsById.set(entry.id, history);
      audit.push(Object.freeze({ ...entry }));
    }
    let chain = 'GENESIS';
    for (let i = 0; i < audit.length; i++) {
      const { hash, ...data } = audit[i];
      if (audit[i].sequence !== i + 1 || audit[i].previous !== chain ||
          createHash('sha256').update(JSON.stringify(data)).digest('hex') !== hash)
        throw Error('Cadeia de auditoria inválida');
      chain = hash;
    }
    for (const item of items.values()) {
      const events = eventsById.get(item.id) || [];
      if (events.length !== (item.status === 'pending' ? 1 : 2) ||
          events[0]?.event !== 'proposed' ||
          events[0]?.fingerprint !== fingerprint(item) ||
          (events.length === 2 && (events[1].event !== item.status ||
           events[1].fingerprint !== fingerprint(item))))
        throw Error('Auditoria inconsistente com propostas');
    }
    previous = chain;
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
    snapshot() { return { version: 1, items: [...items.values()].map(item => ({ ...item })), audit: audit.map(entry => ({ ...entry })) }; },
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
