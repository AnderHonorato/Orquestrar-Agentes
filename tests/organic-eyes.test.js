import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('olhos SVG são endereçáveis individualmente sem imagens externas', async () => {
  const source = await readFile(new URL('../web/mascots.js', import.meta.url), 'utf8');
  assert.match(source, /class=\\"eye eye-left\\"/);
  assert.match(source, /class=\\"eye eye-right\\"/);
  assert.match(source, /class=\\"pupils\\"/);
});

test('quatro personalidades possuem formatos de olhar e estados próprios', async () => {
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  for (let i = 1; i <= 4; i++) assert.ok(css.includes(`.agent:nth-child(${i}) .eye`));
  assert.match(css, /\[data-mood="error"\] \.eye/);
  assert.match(css, /\[data-mood="done"\] \.eye/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
