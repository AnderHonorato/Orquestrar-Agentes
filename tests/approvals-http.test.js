import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
// Importação dinâmica impede a inicialização automática na porta padrão durante os testes.

const token = 'integration-test-token-strong-123';
const proposal = { type: 'git_write', title: 'Atualizar branch de testes', description: 'Revisar alteração antes de escrever no Git', target: 'AnderHonorato/Orquestrar-Agentes' };

test('API de aprovações: autenticação, origem, revisão e auditoria', async () => {
  const previousMode = process.env.NODE_ENV;
  const previousDataDir = process.env.DATA_DIR;
  const directory = await mkdtemp(path.join(tmpdir(), 'organic-http-'));
  process.env.DATA_DIR = directory;
  process.env.NODE_ENV = 'test';
  const { server } = await import('../server/index.js');
  const previous = process.env.STUDIO_ACCESS_TOKEN;
  process.env.STUDIO_ACCESS_TOKEN = token;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = async (path, method = 'GET', body, headers = {}) => {
    const response = await fetch(base + path, {
      method, headers: { 'content-type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    assert.equal((await request('/api/approvals')).status, 401);
    const auth = { 'x-studio-token': token };
    assert.equal((await request('/api/approvals', 'POST', proposal, { ...auth, origin: 'https://evil.example' })).status, 403);
    const created = await request('/api/approvals', 'POST', proposal, auth);
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'pending');
    assert.equal(created.body.executed, false);
    const id = created.body.id;
    const route = '/api/approvals/' + id + '/review';
    assert.equal((await request(route, 'POST', { decision: 'approved', fingerprint: 'invalid' }, auth)).status, 400);
    const approved = await request(route, 'POST', { decision: 'approved', fingerprint: created.body.fingerprint, note: 'Revisado' }, auth);
    assert.equal(approved.status, 200);
    assert.equal(approved.body.status, 'approved');
    assert.equal(approved.body.executed, false);
    assert.equal((await request(route, 'POST', { decision: 'approved', fingerprint: created.body.fingerprint }, auth)).status, 400);
    const listing = await request('/api/approvals', 'GET', undefined, auth);
    assert.equal(listing.status, 200);
    assert.ok(listing.body.items.some(item => item.id === id && item.status === 'approved'));
    const audit = await request('/api/approvals/audit', 'GET', undefined, auth);
    assert.equal(audit.status, 200);
    assert.equal(audit.body.valid, true);
    assert.ok(audit.body.events.some(event => event.id === id && event.event === 'approved'));
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previous === undefined) delete process.env.STUDIO_ACCESS_TOKEN;
    else process.env.STUDIO_ACCESS_TOKEN = previous;
    if (previousDataDir === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previousDataDir;
    await rm(directory, { recursive: true, force: true });
  }
});
