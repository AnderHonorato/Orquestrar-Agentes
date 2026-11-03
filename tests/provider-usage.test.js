import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUsage } from '../server/engine.js';

test('Anthropic informa tokens de entrada e saída', () => {
  assert.deepEqual(normalizeUsage('anthropic', { input_tokens: 12, output_tokens: 8 }), { inputTokens: 12, outputTokens: 8, totalTokens: null, source: 'provider', estimated: false });
});
test('Gemini preserva contagem total', () => {
  assert.deepEqual(normalizeUsage('gemini', { promptTokenCount: 9, candidatesTokenCount: 4, totalTokenCount: 15 }), { inputTokens: 9, outputTokens: 4, totalTokens: 15, source: 'provider', estimated: false });
});
test('OpenAI e compatíveis normalizam uso', () => {
  assert.equal(normalizeUsage('openai', { prompt_tokens: 3, completion_tokens: 5 }).outputTokens, 5);
  assert.equal(normalizeUsage('ollama', { prompt_tokens: 3, completion_tokens: 5 }).inputTokens, 3);
});
test('Ausência e dados inválidos não geram contagem fictícia', () => {
  assert.equal(normalizeUsage('openai', null), null);
  assert.equal(normalizeUsage('openai', { prompt_tokens: -3, completion_tokens: '4' }), null);
  assert.equal(normalizeUsage('openai', { prompt_tokens: 0 }).inputTokens, 0);
});
