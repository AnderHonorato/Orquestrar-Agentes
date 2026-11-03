import { complete, validateProvider } from './engine.js';
import { validateCallBudget } from './call-budget.js';

export const defaultAgents = [
  { name: 'Arquiteto', role: 'Planejar arquitetura, dependências e riscos' },
  { name: 'Implementador', role: 'Detalhar implementação técnica e critérios de aceite' },
  { name: 'Revisor', role: 'Identificar bugs, falhas de segurança e testes' },
  { name: 'Designer Organic', role: 'Aprimorar interface, animações e acessibilidade' }
];

export function validateRun(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Solicitação inválida');
  if (typeof input.goal !== 'string' || !input.goal.trim() || input.goal.length > 6000) throw Error('Objetivo inválido');
  const agents = input.agents || defaultAgents;
  if (!Array.isArray(agents) || agents.length < 1 || agents.length > 8) throw Error('Agentes inválidos');
  validateCallBudget(input, agents.length);
  const fallback = input.provider || 'openai';
  validateProvider(fallback, input.model);
  validateProvider(input.leaderProvider || fallback, input.leaderModel || input.model);
  for (const agent of agents) {
    if (!agent || typeof agent.name !== 'string' || !agent.name.trim() || agent.name.length > 60 ||
        typeof agent.role !== 'string' || !agent.role.trim() || agent.role.length > 500) throw Error('Agentes inválidos');
    validateProvider(agent.provider || fallback, agent.model || input.model);
  }
  return agents;
}

export async function orchestrate(input) {
  const agents = validateRun(input);
  const fallback = input.provider || 'openai';
  const results = await Promise.allSettled(agents.map(async agent => {
    const provider = agent.provider || fallback;
    const model = agent.model || input.model;
    const response = await complete({
      provider, model,
      system: 'Você é ' + agent.name + '. Especialidade: ' + agent.role + '. Responda em PT-BR. Evite inventar ações. Não afirme executar ferramentas ou editar arquivos.',
      prompt: input.goal
    });
    return { agent: agent.name, provider, model: model || null, response };
  }));
  const completed = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  const failures = results.flatMap((result, index) => result.status === 'rejected' ? [
    { agent: agents[index].name, error: String(result.reason?.message || result.reason).slice(0,220) }
  ] : []);
  if (!completed.length) return { status: 'failed', results: [], failures, summary: 'Nenhum especialista concluiu.' };
  const leaderProvider = input.leaderProvider || fallback;
  const leaderModel = input.leaderModel || input.model;
  let summary;
  try {
    summary = await complete({
      provider: leaderProvider, model: leaderModel,
      system: 'Você é o agente líder. Consolide as contribuições e conflitos em um plano objetivo em PT-BR, priorize revisão de erros e critérios de aceite. Não afirme execução real.',
      prompt: 'Objetivo: ' + input.goal + '\n\n' + completed.map(item =>
        item.agent + ' (' + item.provider + (item.model ? '/' + item.model : '') + '):\n' + item.response
      ).join('\n\n').slice(0,20000)
    });
  } catch (error) {
    failures.push({ agent: 'Líder', error: String(error?.message || error).slice(0,220) });
    summary = completed.map(item => item.agent + ' (' + item.provider + '):\n' + item.response).join('\n\n');
  }
  return { status: failures.length ? 'partial' : 'completed', results: completed, failures, summary,
    leader: { provider: leaderProvider, model: leaderModel || null } };
}
