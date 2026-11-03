// Limite determinístico de chamadas por execução; não é estimativa de custo monetário.
// Especialistas e líder usam no máximo uma chamada cada, sem tentativas automáticas.
export function validateCallBudget(input, agentCount) {
  const budget = input?.maxModelCalls ?? 9;
  if (!Number.isSafeInteger(budget) || budget < 1 || budget > 9) {
    throw new Error('maxModelCalls deve ser inteiro entre 1 e 9');
  }
  if (!Number.isSafeInteger(agentCount) || agentCount < 1 || agentCount > 8) {
    throw new Error('Quantidade de agentes inválida');
  }
  const required = agentCount + 1;
  if (required > budget) {
    throw new Error('Orçamento insuficiente: ' + required + ' chamadas necessárias (incluindo líder), limite ' + budget);
  }
  return Object.freeze({ limit: budget, planned: required, includesLeader: true });
}
