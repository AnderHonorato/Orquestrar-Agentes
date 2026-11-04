import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../web/app.js', import.meta.url), 'utf8');

test('interface Organic distingue subtotal conhecido de custo total', () => {
  assert.match(source, /Subtotal conhecido/);
  assert.match(source, /Não é o custo total/);
  assert.match(source, /!cost\.complete && Number\.isFinite\(cost\.knownSubtotal\)/);
  assert.match(source, /cost\.knownItems <= cost\.totalItems/);
});
test('renderização mantém texto seguro e não injeta HTML de custos', () => {
  assert.match(source, /panel\.append\(element\('p', 'Subtotal conhecido/);
  assert.doesNotMatch(source, /innerHTML\s*=/);
});
