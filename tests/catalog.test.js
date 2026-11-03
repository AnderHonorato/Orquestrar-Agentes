import test from 'node:test';
import assert from 'node:assert/strict';
import { library, categories } from '../web/catalog.js';
test('catálogo reúne referências reais sem duplicar projetos', () => {
  assert.equal(categories.length, 4);
  assert.equal(library.length, 46);
  assert.equal(new Set(library.map(x => x.repository.toLowerCase())).size, library.length);
});
test('todos os itens são links públicos de referência', () => {
  for (const item of library) {
    assert.match(item.url, /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
    assert.equal(item.status, 'Referência');
  }
});
