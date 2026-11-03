import { isAuthorized } from '../server/security.js';
// Vercel não dispõe de armazenamento persistente de arquivos para aprovações.
// A interface recebe um erro explícito, em vez de simular persistência.
export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (!isAuthorized(req.headers)) return res.status(401).json({error:'Acesso protegido'});
  return res.status(501).json({error:'Aprovações requerem servidor Node com volume persistente. Esta prévia Vercel não permite aprovar ou criar propostas.'});
}
