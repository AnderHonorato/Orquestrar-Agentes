// Estimativa monetária somente com preços fornecidos explicitamente pelo operador.
// Preços são por milhão de tokens; não há tabela de tarifas presumidas.
export function estimateCost(usage, rates) {
  if (!usage || usage.incomplete || !rates || typeof rates !== 'object' || Array.isArray(rates)) {
    return { amount: null, currency: null, complete: false, reason: 'usage_or_rates_missing' };
  }
  const currency = rates.currency;
  const input = rates.inputPerMillion;
  const output = rates.outputPerMillion;
  if (!['USD', 'BRL', 'EUR'].includes(currency) ||
      !Number.isFinite(input) || input < 0 || !Number.isFinite(output) || output < 0) {
    return { amount: null, currency: null, complete: false, reason: 'invalid_rates' };
  }
  if (!Number.isSafeInteger(usage.reportedInputTokens) || usage.reportedInputTokens < 0 ||
      !Number.isSafeInteger(usage.reportedOutputTokens) || usage.reportedOutputTokens < 0) {
    return { amount: null, currency, complete: false, reason: 'invalid_usage' };
  }
  const amount = (usage.reportedInputTokens * input + usage.reportedOutputTokens * output) / 1_000_000;
  if (!Number.isFinite(amount)) return { amount: null, currency, complete: false, reason: 'overflow' };
  return { amount, currency, complete: true, reason: null, source: 'operator_rates', billed: false };
}
