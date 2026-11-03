import test from 'node:test';
import assert from 'node:assert/strict';
import { createApprovalRegistry } from '../server/approval-registry.js';
import { fingerprint } from '../server/approvals.js';
const input = {type:'deploy',title:'Publicar ambiente de teste',description:'Publicar somente após validação humana',target:'ambiente de homologação'};
test('registro exige impressão digital e não executa ações', () => {
  const registry = createApprovalRegistry({maxItems:1});
  const action = registry.propose(input);
  assert.throws(() => registry.propose(input), /Limite/);
  assert.throws(() => registry.review(action.id,'approved','', 'errada'), /impressão/);
  const approved = registry.review(action.id,'approved','Conferido',fingerprint(action));
  assert.equal(approved.executed,false);
  assert.equal(registry.audit().length,2);
  assert.equal(registry.verify(),true);
  assert.throws(() => registry.review(action.id,'rejected','',fingerprint(action)),/pendentes/);
});
test('retornos não permitem modificar o registro', () => {
  const registry = createApprovalRegistry();
  const action = registry.propose(input);
  registry.list()[0].status='approved';
  registry.audit()[0].hash='falso';
  assert.equal(registry.list()[0].status,'pending');
  assert.equal(registry.verify(),true);
  assert.equal(registry.review(action.id,'rejected','',fingerprint(action)).status,'rejected');
});
