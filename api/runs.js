import { randomUUID } from 'node:crypto';
import { isAuthorized, isSameOrigin } from '../server/security.js';
import { validateRun, orchestrate } from '../server/orchestrator.js';
export default async function handler(req,res) {
  res.setHeader('cache-control','no-store');
  if(!isAuthorized(req.headers)) return res.status(401).json({error:'Acesso protegido. Informe o código de acesso em Modelos.'});
  if(req.method !== 'POST') return res.status(405).json({error:'Método não permitido'});
  if(!isSameOrigin(req.headers)) return res.status(403).json({error:'Origem não permitida'});
  try {
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!body||JSON.stringify(body).length>64000) return res.status(413).json({error:'Corpo inválido ou maior que 64 KB'});
    validateRun(body);
    const result=await orchestrate(body);
    const entry={id:randomUUID(),createdAt:new Date().toISOString(),goal:body.goal,provider:body.provider||'openai',...result};
    return res.status(200).json(entry);
  } catch(error) {
    return res.status(400).json({error:String(error?.message||'Falha').slice(0,220)});
  }
}