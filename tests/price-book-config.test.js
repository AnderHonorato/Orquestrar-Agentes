import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const sample = { [JSON.stringify(['openai', 'modelo-a'])]: { currency: 'USD', inputPerMillion: 1, outputPerMillion: 2 } };
function check(book) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./server/index.js'); console.log('CONFIG_OK')"], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, NODE_ENV: 'test', STUDIO_PRICE_BOOK_JSON: book }
  });
}
test('aceita tabela explícita válida sem inicializar listener HTTP', () => {
  const result = check(JSON.stringify(sample));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CONFIG_OK/);
});
test('rejeita JSON inválido e estrutura raiz não objeto', () => {
  for (const value of ['{', '[]', 'null']) {
    const result = check(value);
    assert.notEqual(result.status, 0, value);
  }
});
test('rejeita chaves de modelo e preços inválidos', () => {
  for (const book of [
    { modelo: sample[Object.keys(sample)[0]] },
    { [JSON.stringify(['openai', 'modelo-a'])]: { currency: 'USD', inputPerMillion: -1, outputPerMillion: 2 } },
    { [JSON.stringify(['openai', 'modelo-a'])]: { currency: 'USD', inputPerMillion: '1', outputPerMillion: 2 } },
    { [JSON.stringify(['openai', 'modelo-a'])]: { currency: 'XYZ', inputPerMillion: 1, outputPerMillion: 2 } }
  ]) {
    const result = check(JSON.stringify(book));
    assert.notEqual(result.status, 0, result.stderr);
  }
});
