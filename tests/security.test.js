import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorized, isSameOrigin } from '../server/security.js';
test('nega execução quando não existe senha no servidor', () => {
  assert.equal(isAuthorized({ 'x-studio-token': 'qualquer' }, ''), false);
});
test('aceita apenas a senha exata e segura', () => {
  const secret = 'senha-de-teste-longa-123';
  assert.equal(isAuthorized({ 'x-studio-token': secret }, secret), true);
  assert.equal(isAuthorized({ 'x-studio-token': secret + 'x' }, secret), false);
  assert.equal(isAuthorized({}, secret), false);
});
test('bloqueia origens externas', () => {
  assert.equal(isSameOrigin({host:'app.example.com',origin:'https://evil.example.com'}), false);
  assert.equal(isSameOrigin({host:'app.example.com',origin:'https://app.example.com'}), true);
});