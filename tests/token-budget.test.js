import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateInputTokens, validateEstimatedTokenBudget } from '../server/token-budget.js';
import { validateRun } from '../server/orchestrator.js';
const agents = [{ name: 'Revisor', role: 'Revisar código' }];
const base = { goal: 'Revisar projeto', agents };
test('estimativa de tokens é positiva e determinística', () => {
  const a = estimateInputTokens(base.goal, agents);
  assert.equal(a.estimatedInputTokens, estimateInputTokens(base.goal, agents).estimatedInputTokens);
  assert.ok(a.estimatedInputTokens > a.specialistTokens);
  assert.equal(a.approximate, true);
});
test('teto insuficiente impede validação da execução', () => {
  assert.throws(() => validateRun({ ...base, maxEstimatedInputTokens: 100 }), /Orçamento estimado/);
});
test('teto suficiente permite execução', () => {
  const maxEstimatedInputTokens = estimateInputTokens(base.goal, agents).estimatedInputTokens;
  assert.equal(validateRun({ ...base, maxEstimatedInputTokens }).length, 1);
});
test('teto inválido é rejeitado sem coerção', () => {
  for (const maxEstimatedInputTokens of ['10000', -1, 0, 3.14, 1000001, null]) {
    assert.throws(() => validateEstimatedTokenBudget({ ...base, maxEstimatedInputTokens }, agents), /maxEstimatedInputTokens/);
  }
});
test('UTF-8 e mais especialistas aumentam a estimativa', () => {
  assert.ok(estimateInputTokens('ação 🔒', agents).estimatedInputTokens > estimateInputTokens('a', agents).estimatedInputTokens);
  assert.ok(estimateInputTokens('a', [...agents, ...agents]).estimatedInputTokens > estimateInputTokens('a', agents).estimatedInputTokens);
});
