import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = name => readFile(new URL('../web/' + name, import.meta.url), 'utf8');

test('quatro personagens possuem personalidades e silhuetas próprias', async () => {
  const { personalities } = await import('../web/mascots.js');
  assert.equal(personalities.length, 4);
  assert.equal(new Set(personalities.map(person => person.nickname)).size, 4);
  for (const person of personalities) {
    for (const state of ['greeting', 'busy', 'done', 'error', 'playful']) {
      assert.ok(person[state]?.trim(), person.nickname + ' sem ' + state);
    }
  }
  const source = await read('mascots.js');
  assert.match(source, /const silhouettes = \[/);
  assert.match(source, /prefers-reduced-motion/);
  assert.doesNotMatch(source, /eval\s*\(|new Function\s*\(/);
});

test('reação visual por agente respeita acessibilidade e mantém controles', async () => {
  const css = await read('styles.css');
  const js = await read('mascots.js');
  for (let index = 1; index <= 4; index++) {
    assert.ok(css.includes('.agent:nth-child(' + index + ')'), 'sem estilo para agente ' + index);
  }
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /organic-aura/);
  assert.match(js, /aria-label/);
  assert.match(js, /pointerleave/);
  assert.match(js, /safeMoods/);
});
