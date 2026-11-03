import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCallBudget } from '../server/call-budget.js';

test('orçamento padrão cobre até oito especialistas e líder', () => {
  assert.deepEqual(validateCallBudget({}, 8), {limit:9, planned:9, includesLeader:true});
});
test('rejeita orçamento insuficiente antes de iniciar APIs', () => {
  assert.throws(() => validateCallBudget({maxModelCalls:2}, 2), /insuficiente/);
});
test('não aceita valores fracionários, strings, negativos ou limites excessivos', () => {
  for (const value of [0, 1.5, '9', -1, 10, NaN, Infinity]) {
    assert.throws(() => validateCallBudget({maxModelCalls:value}, 1));
  }
});
test('orçamento explícito mínimo cobre um especialista e líder', () => {
  assert.equal(validateCallBudget({maxModelCalls:2},1).planned,2);
});
