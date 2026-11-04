import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { personalities, setAgentMood } from '../web/mascots.js';

const source = async file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('quatro personagens têm personalidade e falas de cada estado', () => {
  assert.equal(personalities.length, 4);
  assert.equal(new Set(personalities.map(person => person.nickname)).size, 4);
  for (const person of personalities) {
    for (const key of ['nature', 'greeting', 'busy', 'done', 'error', 'playful']) {
      assert.ok(person[key]?.length > 2, 'Faltando: ' + key);
    }
  }
});

test('mudanças de expressão refletem estado sem inventar resposta de IA', () => {
  const bubble = { textContent:'' };
  const state = { textContent:'' };
  const card = {
    dataset:{},
    querySelector(selector) {
      return selector === '.bubble' ? bubble : selector === '.agent-state' ? state : null;
    }
  };
  setAgentMood(card, 'idle', 0);
  assert.equal(card.dataset.mood, 'idle');
  setAgentMood(card, 'working', 0);
  assert.equal(bubble.textContent, personalities[0].busy);
  assert.equal(state.textContent, 'Pensando');
  setAgentMood(card, 'done', 0);
  assert.equal(state.textContent, 'Concluído');
  setAgentMood(card, 'error', 0);
  assert.equal(card.dataset.mood, 'error');
  assert.throws(() => setAgentMood(card, 'executing-tools', 0), /desconhecida/);
});

test('estúdio preserva telas, campos e API existentes', async () => {
  const html = await source('web/index.html');
  const app = await source('web/app.js');
  for (const id of ['studio', 'approvals', 'history', 'tools', 'settings', 'agents', 'goal', 'run',
    'output', 'result', 'notice', 'provider', 'model', 'providers-list',
    'approval-items', 'approval-status', 'refresh-approvals']) {
    assert.ok(html.includes('id="' + id + '"'), 'ID ausente: ' + id);
  }
  assert.match(html, /src="\/approvals-ui\.js"/);
  assert.match(app, /from '\.\/mascots\.js'/);
  assert.match(app, /\/api\/providers/);
  assert.match(app, /\/api\/runs/);
  assert.match(app, /setAgentMood\(agentCard\(item\.index\), 'working'/);
  assert.match(app, /setAgentMood\(agentCard\(item\.index\), 'error'/);
  assert.match(app, /data\.results/);
});

test('animações são 2D, acessíveis e respeitam movimento reduzido', async () => {
  const mascots = await source('web/mascots.js');
  const style = await source('web/styles.css');
  const server = await source('server/index.js');
  assert.match(mascots, /<svg viewBox=/);
  assert.match(mascots, /pointermove/);
  assert.match(mascots, /aria-label/);
  assert.match(style, /@keyframes blink/);
  assert.match(style, /@keyframes head-idle/);
  assert.match(style, /prefers-reduced-motion:reduce/);
  assert.match(server, /'\/mascots\.js'/);
  assert.doesNotMatch(mascots + style, /WebGL|three\.js|perspective\s*:/i);
  assert.doesNotMatch(mascots, /fetch\s*\(/);
});
