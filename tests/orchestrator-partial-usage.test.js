import test from 'node:test';
import assert from 'node:assert/strict';
import { orchestrate } from '../server/orchestrator.js';

test('falha de especialista marca uso incompleto mesmo com líder reportando tokens', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.messages[0].content.includes('Especialidade: Falhar')) {
      return { ok: false, status: 503, json: async () => ({ error: { message: 'indisponível' } }) };
    }
    return { ok: true, json: async () => ({
      choices: [{ message: { content: 'Resposta válida' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 }
    }) };
  };
  try {
    const result = await orchestrate({
      goal: 'Validar telemetria de execução parcial',
      provider: 'ollama',
      agents: [
        { name: 'Disponível', role: 'Responder' },
        { name: 'Indisponível', role: 'Falhar' }
      ]
    });
    assert.equal(result.status, 'partial');
    assert.equal(result.failures.length, 1);
    assert.equal(result.usage.reportedInputTokens, 20);
    assert.equal(result.usage.reportedOutputTokens, 10);
    assert.equal(result.usage.incomplete, true);
    assert.equal(result.usage.currencyCost, null);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
