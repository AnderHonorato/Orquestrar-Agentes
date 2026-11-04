import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../web/app.js', import.meta.url), 'utf8');

test('Organic exibe falhas do resultado e ao reabrir histórico', () => {
  assert.match(app, /Array\.isArray\(result\.failures\)/);
  assert.match(app, /Falhas dos agentes/);
  assert.match(app, /responses\.append\(failuresPanel\)/);
  assert.match(app, /displayResult\(item\)/);
  assert.match(app, /textContent =|element\('p', agentName/);
  assert.doesNotMatch(app, /eval\(|new Function\(/);
});
