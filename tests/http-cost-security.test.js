import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

// Smoke HTTP sem credenciais externas: não deve expor tarifas nem permitir execuções anônimas.
test('health público e runs protegido, sem vazamento de configuração financeira', async () => {
  const { server } = await import('../server/index.js');
  if (server.listening) throw new Error('Servidor já iniciado durante teste');
  server.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const health = await fetch(base + '/api/health');
    assert.equal(health.status, 200);
    const healthBody = await health.json();
    assert.equal(healthBody.ok, true);
    assert.equal(Object.hasOwn(healthBody, 'priceBook'), false);
    const providers = await fetch(base + '/api/providers');
    assert.equal(providers.status, 200);
    const providerBody = await providers.json();
    assert.equal(Object.hasOwn(providerBody, 'priceBook'), false);
    const run = await fetch(base + '/api/runs', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal: 'Teste de segurança' })
    });
    assert.equal(run.status, 401);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
