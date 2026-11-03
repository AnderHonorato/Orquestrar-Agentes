import { randomUUID, createHash } from 'node:crypto';
const types = new Set(['git_write','deploy','shell','send_message','file_write','external_api']);
export function proposeAction(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Proposta inválida');
  if (!types.has(input.type)) throw Error('Tipo de ação desconhecido');
  if (typeof input.title !== 'string' || input.title.trim().length < 4 || input.title.length > 160) throw Error('Título inválido');
  if (typeof input.description !== 'string' || input.description.trim().length < 8 || input.description.length > 3000) throw Error('Descrição inválida');
  if (typeof input.target !== 'string' || input.target.trim().length < 3 || input.target.length > 400) throw Error('Destino inválido');
  return {id:randomUUID(),type:input.type,title:input.title.trim(),description:input.description.trim(),target:input.target.trim(),status:'pending',createdAt:new Date().toISOString(),approvedAt:null,reviewedAt:null,reviewNote:null,executed:false};
}
export function reviewAction(action,decision,note='') {
  if (!action || action.status !== 'pending') throw Error('Somente propostas pendentes podem ser revisadas');
  if (!['approved','rejected'].includes(decision)) throw Error('Decisão inválida');
  if (typeof note !== 'string' || note.length > 500) throw Error('Observação inválida');
  return {...action,status:decision,reviewNote:note,reviewedAt:new Date().toISOString(),approvedAt:decision==='approved'?new Date().toISOString():null,executed:false};
}
export function fingerprint(action) {
  return createHash('sha256').update(JSON.stringify([action.id,action.type,action.title,action.description,action.target,action.createdAt])).digest('hex');
}
