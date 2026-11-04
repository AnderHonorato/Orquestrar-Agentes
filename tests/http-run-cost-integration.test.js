import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Integração HTTP real do servidor com respostas de IA simuladas; nenhuma API paga.
test('execução autenticada retorna custo por agente e histórico sem divulgar tabela', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'orquestrar-cost-http-'));
  const previous = Object.fromEntries(['NODE_ENV', 'DATA_DIR', 'STUDIO_ACCESS_TOKEN', 'STUDIO_PRICE_BOOK_JSON', 'OLLAMA_BASE_URL'].map(k => [k, process.env[k]]));
  const token = 'token-de-teste-com-mais-de-16-caracteres';
  const book = { [JSON.stringify(['ollama', 'modelo-local'])]: { currency: 'BRL', inputPerMillion: 2, outputPerMillion: 4 } };
  Object.assign(process.env, { NODE_ENV: 'test', DATA_DIR: dir, STUDIO_ACCESS_TOKEN: token, STUDIO_PRICE_BOOK_JSON: JSON.stringify(book), OLLAMA_BASE_URL: 'http://127.0.0.1:11434/v1' });
  const originalFetch = globalThis.fetch;
  let server;
  let calls = 0;
  try {
    ({ server } = await import('../server/index.js'));
    globalThis.fetch = async (url, options) => {
      if (String(url).includes(':11434/')) {
        calls++;
        const body = JSON.parse(options.body);
        assert.equal(body.model, 'modelo-local');
        return { ok: true, json: async () => ({ choices: [{ message: { content: 'Resposta simulada' } }], usage: { prompt_tokens: 100, completion_tokens: 50 } }) };
      }
      return originalFetch(url, options);
    };
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const response = await originalFetch(base + '/api/runs', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-studio-token': token },
      body: JSON.stringify({ goal: 'Verificar estimativa', provider: 'ollama', model: 'modelo-local', agents: [{ name: 'Revisor', role: 'Revisar' }] })
    });
    assert.equal(response.status, 200, await response.clone().text());
    const entry = await response.json();
    assert.equal(calls, 2);
    assert.equal(entry.status, 'completed');
    assert.equal(entry.costEstimate.complete, true);
    assert.equal(entry.costEstimate.currency, 'BRL');
    assert.equal(entry.costEstimate.items.length, 2);
    assert.ok(Math.abs(entry.costEstimate.amount - 0.0008) < 1e-12);
    assert.equal(entry.costEstimate.billed, false);
    assert.equal(Object.hasOwn(entry, 'priceBook'), false);
    const history = await originalFetch(base + '/api/history', { headers: { 'x-studio-token': token } });
    assert.equal(history.status, 200);
    const saved = await history.json();
    assert.equal(saved.items[0].costEstimate.amount, entry.costEstimate.amount);
    assert.equal(Object.hasOwn(saved.items[0], 'priceBook'), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (server?.listening) await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(dir, { recursive: true, force: true });
  }
});
