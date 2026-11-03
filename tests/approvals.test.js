import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeAction, reviewAction, fingerprint } from '../server/approvals.js';
test('aprovação nunca executa efeitos externos',()=>{
  const proposed=proposeAction({type:'git_write',title:'Atualizar repositório',description:'Criar uma branch para testes',target:'AnderHonorato/Orquestrar-Agentes'});
  assert.equal(proposed.status,'pending');
  assert.equal(proposed.executed,false);
  const approved=reviewAction(proposed,'approved','Revisado');
  assert.equal(approved.status,'approved');
  assert.equal(approved.executed,false);
  assert.equal(fingerprint(approved),fingerprint(proposed));
  assert.throws(()=>reviewAction(approved,'approved'));
});
test('rejeita tipos e descrições inválidos',()=>{
  assert.throws(()=>proposeAction({type:'run_everything',title:'Executar tudo',description:'Sem revisão ou segurança',target:'externo'}));
  assert.throws(()=>proposeAction({type:'deploy',title:'x',description:'curta',target:'prod'}));
});
test('decisões são restritas',()=>{
  const proposed=proposeAction({type:'deploy',title:'Publicar versão',description:'Publicar após revisar testes',target:'site de teste'});
  assert.throws(()=>reviewAction(proposed,'executed'));
  assert.equal(reviewAction(proposed,'rejected').status,'rejected');
});
