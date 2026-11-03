import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRun } from '../server/orchestrator.js';

const base = { goal: 'Revisar arquitetura', provider: 'openai', agents: [
  { name: 'Arquiteto', role: 'Revisar arquitetura' },
  { name: 'Segurança', role: 'Revisar ameaças' }
] };

test('orçamento insuficiente bloqueia antes de chamar provedores', () => {
  assert.throws(() => validateRun({ ...base, maxModelCalls: 2 }), /Orçamento insuficiente/);
});

test('orçamento exato inclui a chamada do líder', () => {
  assert.equal(validateRun({ ...base, maxModelCalls: 3 }).length, 2);
});

test('orçamento não aceita coerção de strings nem valores excessivos', () => {
  for (const maxModelCalls of ['3', 0, 3.5, 10, -1]) {
    assert.throws(() => validateRun({ ...base, maxModelCalls }), /maxModelCalls/);
  }
});

test('orçamento padrão admite oito especialistas e um líder', () => {
  const agents = Array.from({ length: 8 }, (_, i) => ({ name: 'Agente ' + i, role: 'Analisar requisito ' + i }));
  assert.equal(validateRun({ ...base, agents }).length, 8);
});
