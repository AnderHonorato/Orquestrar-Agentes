import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateRunCosts } from '../server/run-costs.js';

const run = { status: 'completed', usage: { incomplete: false },
  results: [{ agent: 'Revisor', provider: 'openai', model: 'modelo-a',
    usage: { inputTokens: 1000000, outputTokens: 500000 } }],
  leader: { provider: 'anthropic', model: 'modelo-b',
    usage: { inputTokens: 200000, outputTokens: 100000 } } };
const book = { [JSON.stringify(['openai', 'modelo-a'])]: { currency: 'USD', inputPerMillion: 1, outputPerMillion: 2 },
  [JSON.stringify(['anthropic', 'modelo-b'])]: { currency: 'USD', inputPerMillion: 3, outputPerMillion: 4 } };

test('soma custos por modelo sem presumir tarifas', () => {
  const result = estimateRunCosts(run, book);
  assert.equal(result.complete, true);
  assert.equal(result.amount, 3);
  assert.equal(result.billed, false);
  assert.equal(result.items.length, 2);
});
test('falha fechado quando falta tarifa', () => {
  const result = estimateRunCosts(run, {});
  assert.equal(result.complete, false);
  assert.equal(result.amount, null);
});
test('não soma moedas diferentes', () => {
  const other = structuredClone(book);
  other[JSON.stringify(['anthropic', 'modelo-b'])].currency = 'BRL';
  assert.equal(estimateRunCosts(run, other).reason, 'mixed_currencies');
});
test('não afirma total completo em execução parcial', () => {
  const result = estimateRunCosts({ ...run, status: 'partial' }, book);
  assert.equal(result.complete, false);
  assert.equal(result.amount, null);
});
test('não calcula consumo sem telemetria', () => {
  const result = estimateRunCosts({ ...run, leader: { ...run.leader, usage: null } }, book);
  assert.equal(result.complete, false);
  assert.equal(result.amount, null);
});

test('subtotal conhecido não vira total quando uma tarifa falta', () => {
  const partialBook = { [JSON.stringify(['openai', 'modelo-a'])]: book[JSON.stringify(['openai', 'modelo-a'])] };
  const result = estimateRunCosts(run, partialBook);
  assert.equal(result.complete, false);
  assert.equal(result.amount, null);
  assert.equal(result.knownSubtotal, 2);
  assert.equal(result.knownItems, 1);
  assert.equal(result.totalItems, 2);
  assert.equal(result.billed, false);
});
test('subtotal não soma moedas diferentes', () => {
  const mixed = structuredClone(book);
  mixed[JSON.stringify(['anthropic', 'modelo-b'])].currency = 'EUR';
  const result = estimateRunCosts(run, mixed);
  assert.equal(result.knownSubtotal, null);
  assert.equal(result.amount, null);
  assert.equal(result.reason, 'mixed_currencies');
});
test('sem tarifas não existe subtotal conhecido', () => {
  const result = estimateRunCosts(run, {});
  assert.equal(result.knownSubtotal, null);
  assert.equal(result.knownItems, 0);
  assert.equal(result.totalItems, 2);
});
