import { catalog } from '../server/engine.js';
import { defaultAgents } from '../server/orchestrator.js';
import { publicAccessStatus } from '../server/security.js';
export default function handler(req,res) {
  if(req.method !== 'GET') return res.status(405).json({error:'Método não permitido'});
  return res.status(200).json({providers:catalog(),agents:defaultAgents,mode:publicAccessStatus(),hosting:'vercel-serverless'});
}