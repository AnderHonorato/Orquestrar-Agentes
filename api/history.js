import { isAuthorized } from '../server/security.js';
export default function handler(req,res) {
  if(!isAuthorized(req.headers)) return res.status(401).json({error:'Acesso protegido. Informe o código de acesso em Modelos.'});
  if(req.method !== 'GET') return res.status(405).json({error:'Método não permitido'});
  return res.status(200).json({items:[],storage:'browser',note:'Histórico temporário somente nesta sessão do navegador; sem banco persistente conectado.'});
}