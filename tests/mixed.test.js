import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRun } from '../server/orchestrator.js';
test('aceita provedor distinto por especialista e líder',()=>{
  const agents=validateRun({goal:'Avaliar arquitetura',provider:'openai',leaderProvider:'gemini',agents:[
    {name:'Analista',role:'Planejar',provider:'anthropic',model:'claude-sonnet-4-5'},
    {name:'Auditor',role:'Revisar',provider:'ollama',model:'llama3.2'}
  ]});
  assert.equal(agents.length,2);
});
test('rejeita provedor individual desconhecido',()=>{
  assert.throws(()=>validateRun({goal:'Criar',agents:[{name:'A',role:'B',provider:'falso'}]}),/desconhecido/);
});
test('rejeita modelo malformado do líder',()=>{
  assert.throws(()=>validateRun({goal:'Criar',leaderModel:'gpt\nmalicioso'}),/inválido/);
});
