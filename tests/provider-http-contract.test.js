import test from 'node:test';
import assert from 'node:assert/strict';
import { complete } from '../server/engine.js';

async function withMock(provider, payload, verify) {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env[provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'];
  const keyName = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
  process.env[keyName] = 'test-key-only';
  let called = false;
  globalThis.fetch = async (url, options) => {
    called = true;
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    assert.ok(options.signal);
    const body = JSON.parse(options.body);
    verify(String(url), options.headers, body);
    return { ok: true, json: async () => payload };
  };
  try {
    const result = await complete({ provider, model: 'test-model', system: 'Sistema', prompt: 'Objetivo', maxOutputTokens: 91, includeUsage: true });
    assert.equal(called, true);
    return result;
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env[keyName];
    else process.env[keyName] = originalKey;
  }
}

// Cada teste manipula o fetch global: execução sequencial para evitar colisões.
test('Anthropic: payload, autenticação, limite e uso real', { concurrency: false }, async () => {
  const result = await withMock('anthropic', {
    content: [{ type: 'text', text: 'Plano Claude' }], usage: { input_tokens: 11, output_tokens: 7 }
  }, (url, headers, body) => {
    assert.match(url, /\/v1\/messages$/);
    assert.equal(headers['x-api-key'], 'test-key-only');
    assert.equal(headers['anthropic-version'], '2023-06-01');
    assert.equal(body.max_tokens, 91);
    assert.equal(body.system, 'Sistema');
    assert.equal(body.messages[0].content, 'Objetivo');
  });
  assert.equal(result.text, 'Plano Claude');
  assert.equal(result.usage.inputTokens, 11);
  assert.equal(result.usage.outputTokens, 7);
});

test('Gemini: endpoint, systemInstruction e usageMetadata', { concurrency: false }, async () => {
  const result = await withMock('gemini', {
    candidates: [{ content: { parts: [{ text: 'Plano Gemini' }] } }],
    usageMetadata: { promptTokenCount: 17, candidatesTokenCount: 5, totalTokenCount: 22 }
  }, (url, headers, body) => {
    assert.match(url, /test-model:generateContent$/);
    assert.equal(headers['x-goog-api-key'], 'test-key-only');
    assert.equal(body.generationConfig.maxOutputTokens, 91);
    assert.equal(body.systemInstruction.parts[0].text, 'Sistema');
    assert.equal(body.contents[0].parts[0].text, 'Objetivo');
  });
  assert.equal(result.text, 'Plano Gemini');
  assert.equal(result.usage.totalTokens, 22);
});

test('OpenAI: chat completions e contagem de tokens', { concurrency: false }, async () => {
  const result = await withMock('openai', {
    choices: [{ message: { content: 'Plano GPT' } }],
    usage: { prompt_tokens: 13, completion_tokens: 9, total_tokens: 22 }
  }, (url, headers, body) => {
    assert.match(url, /\/v1\/chat\/completions$/);
    assert.equal(headers.authorization, 'Bearer test-key-only');
    assert.equal(body.max_tokens, 91);
    assert.deepEqual(body.messages.map(x => x.role), ['system', 'user']);
  });
  assert.equal(result.text, 'Plano GPT');
  assert.equal(result.usage.outputTokens, 9);
});

test('Sem usage, o resultado não inventa consumo', { concurrency: false }, async () => {
  const result = await withMock('openai', {
    choices: [{ message: { content: 'Sem métricas' } }]
  }, () => {});
  assert.equal(result.usage, null);
});
