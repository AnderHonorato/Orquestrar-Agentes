import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOutputBudget } from '../server/output-budget.js';
import { validateRun } from '../server/orchestrator.js';
import { complete } from '../server/engine.js';

test('limite padrão e extremos válidos', () => {
  assert.equal(validateOutputBudget(), 1400);
  assert.equal(validateOutputBudget(1), 1);
  assert.equal(validateOutputBudget(8192), 8192);
});
test('rejeita valores inválidos antes de chamadas', () => {
  for (const maxOutputTokens of [0, 8193, -1, 1.2, '200', null, NaN]) {
    assert.throws(() => validateRun({goal:'Teste', agents:[{name:'A',role:'Revisar'}], maxOutputTokens}), /maxOutputTokens/);
  }
});
test('API compatível recebe max_tokens sem chamada real', async () => {
  const previous = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    return {ok:true,json:async()=>({choices:[{message:{content:'ok'}}]})};
  };
  try {
    const result = await complete({provider:'ollama',model:'llama3.2',system:'s',prompt:'p',maxOutputTokens:64});
    assert.equal(result,'ok');
    assert.equal(calls[0].max_tokens,64);
  } finally { globalThis.fetch = previous; }
});
