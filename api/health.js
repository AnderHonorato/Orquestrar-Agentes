import { publicAccessStatus } from '../server/security.js';
export default function handler(req,res) {
  if(req.method !== 'GET') return res.status(405).json({error:'Método não permitido'});
  return res.status(200).json({ok:true,version:'0.3.0',mode:publicAccessStatus(),hosting:'vercel-serverless',persistence:'navegador'});
}