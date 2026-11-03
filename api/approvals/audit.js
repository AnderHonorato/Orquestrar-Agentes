import { isAuthorized } from '../../server/security.js';
export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (!isAuthorized(req.headers)) return res.status(401).json({error:'Acesso protegido'});
  return res.status(501).json({error:'Auditoria persistente disponível apenas em servidor Node configurado.'});
}
