// Limite de saída solicitado ao provedor; não garante consumo nem custo faturado.
export function validateOutputBudget(value) {
  if (value === undefined) return 1400;
  if (!Number.isSafeInteger(value) || value < 1 || value > 8192) {
    throw new Error('maxOutputTokens deve ser inteiro entre 1 e 8192');
  }
  return value;
}
