import test from 'node:test';
import assert from 'node:assert/strict';
import health from '../api/health.js';
import providers from '../api/providers.js';
import history from '../api/history.js';
import runs from '../api/runs.js';
function response() {
  return {statusCode:200,body:null,headers:{},status(n){this.statusCode=n;return this;},json(value){this.body=value;return this;},setHeader(k,v){this.headers[k]=v;}};
}
test('health expõe estado sem credenciais',()=>{
  const r=response();health({method:'GET'},r);
  assert.equal(r.statusCode,200);assert.equal(r.body.ok,true);
});
test('providers não publica chave secreta',()=>{
  const r=response();providers({method:'GET'},r);
  assert.equal(r.statusCode,200);assert.equal(JSON.stringify(r.body).includes('sk-'),false);
});
test('history exige autenticação',()=>{
  const r=response();history({method:'GET',headers:{}},r);
  assert.equal(r.statusCode,401);
});
test('runs bloqueia execução sem código',async()=>{
  const r=response();await runs({method:'POST',headers:{},body:{goal:'teste',provider:'ollama'}},r);
  assert.equal(r.statusCode,401);
});
