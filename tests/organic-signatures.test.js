import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('retratos possuem quatro assinaturas distintas e cor própria', async () => {
  const source = await readFile(new URL('../web/mascots.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  assert.match(source, /agent-signature/);
  assert.match(source, /\[index % 4\]/);
  assert.match(source, /stroke="var\(--agent-glow/);
  for (let i = 1; i <= 4; i++) assert.match(css, new RegExp('agent:nth-child\\(' + i + '\\)'));
  assert.match(css, /prefers-reduced-motion/);
});
