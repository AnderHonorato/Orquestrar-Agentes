// Estimativa conservadora de tokens de entrada; não representa faturamento real.
// O orçamento considera a duplicação do objetivo entre especialistas e líder.
export function estimateInputTokens(goal, agents) {
  if (typeof goal !== 'string' || !Array.isArray(agents)) throw new TypeError('Entrada inválida');
  const bytes = Buffer.byteLength(goal, 'utf8');
  const goalTokens = Math.ceil(bytes / 3);
  const roles = agents.reduce((sum, agent) => sum + Math.ceil(Buffer.byteLength(agent.name + agent.role, 'utf8') / 3), 0);
  const specialistTokens = agents.length * (goalTokens + 120) + roles;
  // Líder recebe objetivo e respostas de especialistas (até 20.000 caracteres no orquestrador).
  const leaderTokens = goalTokens + Math.ceil(20000 / 3) + 150;
  return Object.freeze({ estimatedInputTokens: specialistTokens + leaderTokens, specialistTokens, leaderTokens, approximate: true });
}
export function validateEstimatedTokenBudget(input, agents) {
  const estimate = estimateInputTokens(input.goal, agents);
  const limit = input.maxEstimatedInputTokens;
  if (limit === undefined) return estimate;
  if (!Number.isSafeInteger(limit) || limit < 100 || limit > 1000000) {
    throw new Error('maxEstimatedInputTokens deve ser inteiro entre 100 e 1000000');
  }
  if (estimate.estimatedInputTokens > limit) {
    throw new Error('Orçamento estimado de entrada excedido: ' + estimate.estimatedInputTokens + ' > ' + limit);
  }
  return estimate;
}
