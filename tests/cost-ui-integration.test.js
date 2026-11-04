import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ui = await readFile(new URL('../web/app.js', import.meta.url), 'utf8');
const server = await readFile(new URL('../server/index.js', import.meta.url), 'utf8');

test('custo é calculado apenas com tabela configurada no servidor', () => {
  assert.match(server, /process\.env\.STUDIO_PRICE_BOOK_JSON/);
  assert.match(server, /priceBook \? \{ costEstimate: estimateRunCosts\(result, priceBook\) \} : \{\}/);
  assert.doesNotMatch(ui, /STUDIO_PRICE_BOOK_JSON/);
});

test('painel distingue estimativa de cobrança e evita HTML dinâmico', () => {
  assert.match(ui, /Estimativa com tarifas configuradas pelo operador; não representa cobrança/);
  assert.match(ui, /cost\.complete && Number\.isFinite\(cost\.amount\)/);
  assert.match(ui, /panel\.append\(row\)/);
  assert.doesNotMatch(ui, /innerHTML\s*=/);
});
