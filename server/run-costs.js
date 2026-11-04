import { estimateCost } from './cost-estimate.js';

// Tarifas explícitas por provedor/modelo. Nunca presume preços atuais.
export function estimateRunCosts(run, priceBook) {
  if (!run || !Array.isArray(run.results) || !run.leader || !priceBook ||
      typeof priceBook !== 'object' || Array.isArray(priceBook)) {
    return { amount: null, currency: null, complete: false, reason: 'missing_data', items: [] };
  }
  const entries = [...run.results.map(item => ({ ...item, agent: item.agent || 'Especialista' })),
    { ...run.leader, agent: 'Líder' }];
  const items = entries.map(entry => {
    const key = JSON.stringify([entry.provider, entry.model]);
    const rates = Object.hasOwn(priceBook, key) ? priceBook[key] : null;
    const usage = entry.usage && {
      reportedInputTokens: entry.usage.inputTokens,
      reportedOutputTokens: entry.usage.outputTokens,
      incomplete: entry.usage.inputTokens == null || entry.usage.outputTokens == null
    };
    return { agent: entry.agent, provider: entry.provider, model: entry.model,
      ...estimateCost(usage, rates) };
  });
  const currencies = new Set(items.filter(item => item.complete).map(item => item.currency));
  // Subtotal informativo: nunca confundir consumo conhecido com total da execução.
  const knownItems = items.filter(item => item.complete);
  const knownSubtotal = currencies.size === 1 && knownItems.length > 0
    ? knownItems.reduce((sum, item) => sum + item.amount, 0) : null;
  const complete = run.status === 'completed' && !run.usage?.incomplete &&
    items.every(item => item.complete) && currencies.size === 1;
  return {
    amount: complete ? items.reduce((sum, item) => sum + item.amount, 0) : null,
    currency: currencies.size === 1 ? [...currencies][0] : null,
    complete,
    reason: complete ? null : currencies.size > 1 ? 'mixed_currencies' : 'missing_or_partial_usage_or_rates',
    billed: false,
    knownSubtotal,
    knownItems: knownItems.length,
    totalItems: items.length,
    items
  };
}
