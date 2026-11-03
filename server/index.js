import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from './engine.js';
import { orchestrate, defaultAgents, validateRun } from './orchestrator.js';
import { isAuthorized, isSameOrigin, publicAccessStatus } from './security.js';
import { appendHistory, readHistory } from './storage.js';
import { createApprovalRegistry } from './approval-registry.js';
import { fingerprint } from './approvals.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/catalog.js': ['catalog.js', 'text/javascript; charset=utf-8'],
  '/icon.svg': ['icon.svg', 'image/svg+xml'],
  '/manifest.webmanifest': ['manifest.webmanifest', 'application/manifest+json']
};
let activeRuns = 0;
const recentRuns = [];
const approvals = createApprovalRegistry();
const send = (res, status, payload) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
  res.end(JSON.stringify(payload));
};
async function readBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 64000) throw Object.assign(new Error('Limite de 64 KB excedido'), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('JSON inválido'); }
}
export const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { ok: true, mode: publicAccessStatus(), version: '0.2.0' });
    if (req.method === 'GET' && pathname === '/api/providers') return send(res, 200, { providers: catalog(), agents: defaultAgents, mode: publicAccessStatus() });
    if (pathname.startsWith('/api/')) {
      if (!isAuthorized(req.headers)) return send(res, 401, { error: 'Acesso protegido. Configure STUDIO_ACCESS_TOKEN no servidor e informe o código em Modelos.' });
      if (pathname === '/api/approvals' && req.method === 'GET') return send(res, 200, { items: approvals.list().map(item => ({ ...item, fingerprint: fingerprint(item) })) });
      if (pathname === '/api/approvals/audit' && req.method === 'GET') return send(res, 200, { valid: approvals.verify(), events: approvals.audit() });
      if (pathname === '/api/approvals' && req.method === 'POST') {
        if (!isSameOrigin(req.headers)) return send(res, 403, { error: 'Origem não permitida' });
        const action = approvals.propose(await readBody(req));
        return send(res, 201, { ...action, fingerprint: fingerprint(action) });
      }
      const reviewMatch = /^\/api\/approvals\/([a-f0-9-]{36})\/review$/.exec(pathname);
      if (reviewMatch && req.method === 'POST') {
        if (!isSameOrigin(req.headers)) return send(res, 403, { error: 'Origem não permitida' });
        const input = await readBody(req);
        const action = approvals.review(reviewMatch[1], input.decision, input.note ?? '', input.fingerprint);
        return send(res, 200, { ...action, fingerprint: fingerprint(action) });
      }
      if (req.method === 'GET' && pathname === '/api/history') return send(res, 200, { items: await readHistory() });
      if (req.method === 'POST' && pathname === '/api/runs') {
        if (!isSameOrigin(req.headers)) return send(res, 403, { error: 'Origem não permitida' });
        if (activeRuns >= 2) return send(res, 429, { error: 'Aguarde a conclusão das execuções atuais' });
        const now = Date.now();
        while (recentRuns.length && now - recentRuns[0] > 60000) recentRuns.shift();
        if (recentRuns.length >= 4) return send(res, 429, { error: 'Limite temporário: até quatro solicitações por minuto' });
        const input = await readBody(req);
        validateRun(input);
        recentRuns.push(now);
        activeRuns++;
        try {
          const result = await orchestrate(input);
          const entry = { id: randomUUID(), createdAt: new Date().toISOString(), goal: input.goal, provider: input.provider || 'openai', ...result };
          await appendHistory(entry);
          return send(res, 200, entry);
        } finally { activeRuns--; }
      }
      return send(res, 404, { error: 'Endpoint não encontrado' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Método não permitido' });
    const asset = assets[pathname];
    if (!asset) return send(res, 404, { error: 'Página não encontrada' });
    const contents = await readFile(path.join(root, 'web', asset[0]));
    res.writeHead(200, {
      'content-type': asset[1], 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer',
      'cache-control': 'no-cache',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    });
    return res.end(req.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    return send(res, error.statusCode || 400, { error: String(error.message || 'Erro de servidor').slice(0, 220) });
  }
});
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 4173);
  server.listen(port, process.env.HOST || '0.0.0.0', () => console.log('Orquestrar disponível na porta ' + port));
}