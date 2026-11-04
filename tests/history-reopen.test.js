import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('histórico reabre resultado completo sem reexecutar modelos', async () => {
  const app = await readFile(new URL('../web/app.js', import.meta.url), 'utf8');
  assert.match(app, /'Reabrir resultado'/);
  assert.match(app, /displayResult\(item\)/);
  assert.match(app, /selectView\('studio'\)/);
  assert.match(app, /\$\('output'\)\.scrollIntoView/);
  assert.match(app, /if \(result\.costEstimate\)/);
  assert.doesNotMatch(app, /eval\s*\(/);
});
