import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateCost } from '../server/cost-estimate.js';

const usage = { reportedInputTokens: 2_000_000, reportedOutputTokens: 500_000, incomplete: false };
test('estima com preços explícitos sem alegar faturamento', () => {
  assert.deepEqual(estimateCost(usage, { currency: 'USD', inputPerMillion: 2, outputPerMillion: 8 }),
    { amount: 8, currency: 'USD', complete: true, reason: null, source: 'operator_rates', billed: false });
});
test('ausência de preço ou consumo incompleto nunca vira custo zero', () => {
  assert.equal(estimateCost(usage, null).amount, null);
  assert.equal(estimateCost({ ...usage, incomplete: true }, { currency: 'USD', inputPerMillion: 1, outputPerMillion: 1 }).amount, null);
});
test('rejeita preços inválidos e métricas não inteiras', () => {
  assert.equal(estimateCost(usage, { currency: 'USD', inputPerMillion: -1, outputPerMillion: 1 }).complete, false);
  assert.equal(estimateCost({ ...usage, reportedInputTokens: 1.5 }, { currency: 'BRL', inputPerMillion: 1, outputPerMillion: 1 }).complete, false);
});
test('preços zero explícitos são aceitos, sem confundir com preço ausente', () => {
  assert.equal(estimateCost(usage, { currency: 'EUR', inputPerMillion: 0, outputPerMillion: 0 }).amount, 0);
});
