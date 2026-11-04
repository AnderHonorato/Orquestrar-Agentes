import { library, categories } from './catalog.js';
import { personalities, createPortrait, setAgentMood } from './mascots.js';

const $ = id => document.getElementById(id);
let agents = [];
let providers = [];
let running = false;
const pages = {
  studio:'ESTÚDIO / EQUIPE',
  approvals:'ESTÚDIO / APROVAÇÕES',
  history:'ESTÚDIO / HISTÓRICO',
  tools:'ESTÚDIO / BIBLIOTECA',
  settings:'ESTÚDIO / MODELOS'
};
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const authorization = () => ({ 'content-type':'application/json', 'x-studio-token':sessionStorage.getItem('studio-key') || '' });

function selectView(name) {
  if (!Object.hasOwn(pages, name)) return;
  document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== name; });
  document.querySelectorAll('nav button[data-view]').forEach(button => {
    const active = button.dataset.view === name;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('page-name').textContent = pages[name];
  if (name === 'history') loadHistory();
}

function buildTheme() {
  const button = element('button', '◐ Tema', 'theme-toggle');
  button.type = 'button';
  button.setAttribute('aria-label', 'Alternar tema claro e escuro');
  let theme;
  try { theme = localStorage.getItem('organic-theme'); } catch { /* Navegador restrito */ }
  const apply = value => {
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem('organic-theme', value); } catch { /* Preferência local opcional */ }
  };
  apply(theme === 'light' ? 'light' : 'dark');
  button.addEventListener('click', () => apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  document.querySelector('.top-actions').append(button);
}

function buildAccess() {
  const access = element('div', undefined, 'card access-card');
  access.append(
    element('h2', 'Código de acesso'),
    element('p', 'Autoriza execuções. As chaves dos modelos continuam no servidor.')
  );
  const input = element('input');
  input.type = 'password';
  input.autocomplete = 'off';
  input.placeholder = 'Código do servidor';
  input.setAttribute('aria-label', 'Código de acesso ao servidor');
  input.value = sessionStorage.getItem('studio-key') || '';
  const verify = element('button', 'Verificar acesso', 'primary');
  verify.type = 'button';
  const forget = element('button', 'Esquecer código', 'secondary');
  forget.type = 'button';
  const message = element('p', 'Nenhum acesso verificado.', 'hint');
  message.setAttribute('role', 'status');
  verify.addEventListener('click', async () => {
    const token = input.value.trim();
    if (token.length > 512) { message.textContent = 'Código longo demais.'; return; }
    verify.disabled = true;
    try {
      const response = await fetch('/api/history', { headers:{ 'x-studio-token': token } });
      if (!response.ok) throw Error('Código inválido ou acesso não configurado.');
      sessionStorage.setItem('studio-key', token);
      message.textContent = 'Acesso liberado nesta sessão.';
    } catch (error) {
      message.textContent = error.message;
    } finally {
      verify.disabled = false;
    }
  });
  forget.addEventListener('click', () => {
    sessionStorage.removeItem('studio-key');
    input.value = '';
    message.textContent = 'Código descartado desta sessão.';
  });
  access.append(input, verify, forget, message);
  $('settings').querySelector('.settings-content').insertBefore(access, $('providers-list'));
}

function buildLibrary() {
  const mount = $('library');
  mount.replaceChildren();
  mount.append(
    element('h2', 'Explorar recursos'),
    element('p', 'Referências dos cinco posts. Não são ferramentas instaladas; confirme licença e segurança antes de integrar.')
  );
  const controls = element('div', undefined, 'library-controls');
  const search = element('input');
  search.type = 'search';
  search.placeholder = 'Pesquisar ferramenta';
  search.setAttribute('aria-label', 'Pesquisar biblioteca');
  const filter = element('select');
  filter.setAttribute('aria-label', 'Filtrar biblioteca');
  const all = element('option', 'Todas as áreas');
  all.value = '';
  filter.append(all);
  categories.forEach(category => {
    const option = element('option', category);
    option.value = category;
    filter.append(option);
  });
  controls.append(search, filter);
  const count = element('p', '', 'hint');
  const cards = element('div', undefined, 'library-grid');
  function refresh() {
    const query = search.value.toLocaleLowerCase('pt-BR');
    const found = library.filter(item => {
      return (!filter.value || item.categories.includes(filter.value)) &&
        (item.repository + ' ' + item.description + ' ' + item.categories.join(' ')).toLocaleLowerCase('pt-BR').includes(query);
    });
    count.textContent = found.length + ' de ' + library.length + ' referências';
    cards.replaceChildren();
    found.forEach(item => {
      const card = element('article', undefined, 'library-card');
      card.append(
        element('small', item.categories.join(' / ')),
        element('h3', item.name),
        element('p', item.description)
      );
      const link = element('a', 'Ver no GitHub ↗');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(link);
      cards.append(card);
    });
  }
  search.addEventListener('input', refresh);
  filter.addEventListener('change', refresh);
  mount.append(controls, count, cards);
  refresh();
}

function modelChoice(id, emptyLabel) {
  const select = element('select');
  select.id = id;
  const inherit = element('option', emptyLabel);
  inherit.value = '';
  select.append(inherit);
  providers.forEach(provider => {
    const option = element('option', provider.id + (provider.ready ? '' : ' · sem chave'));
    option.value = provider.id;
    select.append(option);
  });
  return select;
}

function buildLeader() {
  const slot = $('leader-config');
  slot.replaceChildren();
  const fields = element('div', undefined, 'fields');
  const providerCell = element('div');
  const providerLabel = element('label', 'Provedor do líder');
  providerLabel.htmlFor = 'leader-provider';
  providerCell.append(providerLabel, modelChoice('leader-provider', 'Usar o principal'));
  const modelCell = element('div');
  const modelLabel = element('label', 'Modelo do líder');
  modelLabel.htmlFor = 'leader-model';
  const model = element('input');
  model.id = 'leader-model';
  model.placeholder = 'Automático';
  modelCell.append(modelLabel, model);
  fields.append(providerCell, modelCell);
  slot.append(fields);
}

function buildAgentConfiguration(index) {
  const details = element('details', undefined, 'agent-config');
  details.append(element('summary', 'Ajustar modelo'));
  const modelLabel = element('label', 'Provedor');
  modelLabel.htmlFor = 'agent-provider-' + index;
  const modelChoiceControl = modelChoice('agent-provider-' + index, 'Herdar principal');
  modelChoiceControl.dataset.agentProvider = index;
  const nameLabel = element('label', 'Nome do modelo');
  nameLabel.htmlFor = 'agent-model-' + index;
  const modelInput = element('input');
  modelInput.id = 'agent-model-' + index;
  modelInput.dataset.agentModel = index;
  modelInput.placeholder = 'Automático';
  details.append(modelLabel, modelChoiceControl, nameLabel, modelInput);
  return details;
}

function buildAgentCard(agent, index) {
  const person = personalities[index % personalities.length];
  const card = element('article', undefined, 'agent');
  card.dataset.index = index;
  card.dataset.mood = 'idle';

  const top = element('div', undefined, 'agent-top');
  const num = element('span', String(index + 1).padStart(2, '0'), 'agent-id');
  const state = element('span', 'Disponível', 'agent-state');
  top.append(num, state);

  const portrait = createPortrait(index, person.nickname);
  portrait.addEventListener('click', () => {
    if (running || card.getAttribute('aria-disabled') === 'true') return;
    setAgentMood(card, 'playful', index);
    window.setTimeout(() => {
      if (!running && card.dataset.mood === 'playful') setAgentMood(card, 'idle', index);
    }, 1400);
  });

  const meta = element('div', undefined, 'agent-details');
  const info = element('div');
  info.append(element('div', person.nickname, 'agent-name'), element('p', agent.name, 'agent-personality'));
  const toggle = element('label', undefined, 'agent-toggle');
  const checkbox = element('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.index = index;
  checkbox.checked = true;
  checkbox.setAttribute('aria-label', 'Ativar ' + agent.name);
  const activeLabel = element('span', 'Ativo');
  checkbox.addEventListener('change', () => {
    card.setAttribute('aria-disabled', String(!checkbox.checked));
    if (!running) setAgentMood(card, 'idle', index, checkbox.checked ? undefined : 'Em pausa');
  });
  toggle.append(checkbox, activeLabel);
  meta.append(info, toggle);

  card.append(top, portrait, meta, buildAgentConfiguration(index));
  setAgentMood(card, 'idle', index);
  return card;
}

function setTeamState(text) {
  $('team-state').textContent = text;
}
function agentCard(index) {
  return document.querySelector('.agent[data-index="' + index + '"]');
}
function selectedAgents() {
  return agents.map((agent, index) => {
    const enabled = document.querySelector('input[data-index="' + index + '"]')?.checked;
    const provider = document.querySelector('[data-agent-provider="' + index + '"]')?.value;
    const model = document.querySelector('[data-agent-model="' + index + '"]')?.value.trim();
    return enabled ? { index, data:{
      ...agent,
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {})
    } } : null;
  }).filter(Boolean);
}

function displayResult(result) {
  $('output').hidden = false;
  $('result').textContent = result.summary || 'Nenhum resumo recebido.';
  const responses = $('agent-responses');
  responses.replaceChildren();
  const previousCost = $('cost-details');
  if (previousCost) previousCost.remove();
  if (result.costEstimate) {
    const cost = result.costEstimate;
    const panel = element('section', undefined, 'card');
    panel.id = 'cost-details';
    panel.setAttribute('aria-label', 'Estimativa de custos');
    panel.append(element('h3', 'Estimativa de consumo'));
    const summary = cost.complete && Number.isFinite(cost.amount) && cost.currency
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cost.currency, maximumFractionDigits: 6 }).format(cost.amount)
      : 'Total indisponível: consumo parcial, tarifa ausente ou moedas incompatíveis.';
    panel.append(element('p', summary));
    // Subtotal é apenas informativo: jamais substituir o total indisponível.
    if (!cost.complete && Number.isFinite(cost.knownSubtotal) && cost.currency &&
        Number.isSafeInteger(cost.knownItems) && Number.isSafeInteger(cost.totalItems) &&
        cost.knownItems > 0 && cost.knownItems <= cost.totalItems) {
      const subtotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: cost.currency, maximumFractionDigits: 6
      }).format(cost.knownSubtotal);
      panel.append(element('p', 'Subtotal conhecido (' + cost.knownItems + ' de ' +
        cost.totalItems + ' agentes): ' + subtotal + '. Não é o custo total.', 'hint'));
    }
    panel.append(element('p', 'Estimativa com tarifas configuradas pelo operador; não representa cobrança.', 'hint'));
    for (const item of cost.items || []) {
      const row = element('p', item.agent + ' · ' + (item.provider || 'provedor não informado') + ' / ' + (item.model || 'modelo não informado') + ': ' +
        (item.complete && Number.isFinite(item.amount) && item.currency
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: item.currency, maximumFractionDigits: 6 }).format(item.amount)
          : 'sem estimativa completa'));
      panel.append(row);
    }
    $('output').append(panel);
  }
  for (const item of result.results || []) {
    const details = element('details');
    details.append(element('summary', item.agent), element('pre', item.response));
    responses.append(details);
  }
}

async function runTeam() {
  if (running) return;
  const goal = $('goal').value.trim();
  if (!goal) { $('notice').textContent = 'Descreva sua missão primeiro.'; $('goal').focus(); return; }
  const picked = selectedAgents();
  if (!picked.length) { $('notice').textContent = 'Ative pelo menos um agente.'; return; }
  running = true;
  const button = $('run');
  button.disabled = true;
  button.textContent = 'Equipe pensando…';
  setTeamState('Trabalhando');
  $('notice').textContent = 'Consultando os modelos configurados. Isso pode levar um momento.';
  for (const item of picked) setAgentMood(agentCard(item.index), 'working', item.index);

  try {
    const response = await fetch('/api/runs', {
      method:'POST', headers:authorization(), body:JSON.stringify({
        goal,
        provider:$('provider').value,
        model:$('model').value.trim() || undefined,
        agents:picked.map(item => item.data),
        leaderProvider:$('leader-provider')?.value || undefined,
        leaderModel:$('leader-model')?.value.trim() || undefined
      })
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Não foi possível executar a missão.');
    rememberLocal(data);
    displayResult(data);
    const concluded = new Set((data.results || []).map(item => item.agent));
    const broken = new Set((data.failures || []).map(item => item.agent));
    for (const item of picked) {
      const mood = concluded.has(item.data.name) ? 'done' : broken.has(item.data.name) ? 'error' : 'idle';
      setAgentMood(agentCard(item.index), mood, item.index);
    }
    const complete = data.status === 'completed';
    setTeamState(complete ? 'Missão concluída' : 'Revisão necessária');
    $('notice').textContent = complete ? 'Pronto! Confira as contribuições abaixo.' :
      'Resultado parcial. Alguns modelos não concluíram; confira os detalhes.';
  } catch (error) {
    for (const item of picked) setAgentMood(agentCard(item.index), 'error', item.index);
    setTeamState('Precisa de atenção');
    $('notice').textContent = 'Não foi possível concluir: ' + String(error.message || error);
  } finally {
    running = false;
    button.disabled = false;
    button.replaceChildren(document.createTextNode('Enviar missão '), element('span', '↗'));
  }
}

function rememberLocal(entry) {
  try {
    const entries = JSON.parse(sessionStorage.getItem('organic-runs') || '[]');
    sessionStorage.setItem('organic-runs', JSON.stringify([entry, ...entries].slice(0, 20)));
  } catch { /* Histórico opcional na sessão */ }
}

async function loadHistory() {
  const node = $('history-items');
  node.textContent = 'Carregando…';
  try {
    const response = await fetch('/api/history', { headers:{ 'x-studio-token':sessionStorage.getItem('studio-key') || '' } });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Acesso não autorizado.');
    if (data.storage === 'browser') {
      try { data.items = JSON.parse(sessionStorage.getItem('organic-runs') || '[]'); }
      catch { data.items = []; }
    }
    node.replaceChildren();
    if (!data.items.length) node.append(element('p', 'Nenhuma missão registrada.'));
    for (const item of data.items) {
      const details = element('details');
      details.append(element('summary', item.goal + ' · ' + new Date(item.createdAt).toLocaleString('pt-BR')), element('pre', item.summary || ''));
      const replay = element('button', 'Reabrir resultado', 'secondary');
      replay.type = 'button';
      replay.addEventListener('click', () => {
        displayResult(item);
        selectView('studio');
        $('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      details.append(replay);
      node.append(details);
    }
  } catch (error) { node.textContent = error.message; }
}

async function initialize() {
  document.querySelectorAll('nav button[data-view]').forEach(button => {
    button.addEventListener('click', () => selectView(button.dataset.view));
  });
  buildTheme();
  buildAccess();
  buildLibrary();
  $('run').addEventListener('click', runTeam);
  selectView('studio');
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) throw Error('Motor de modelos indisponível.');
    const data = await response.json();
    agents = data.agents || [];
    providers = data.providers || [];
    buildLeader();
    const available = providers.some(provider => provider.ready);
    const indicator = $('server-indicator');
    indicator.replaceChildren(element('span', undefined, 'tiny-dot'), document.createTextNode(
      available ? 'Modelos configurados' : 'Modo de visualização'
    ));
    if (!available) indicator.classList.add('offline');
    $('notice').textContent = data.mode === 'somente-leitura' ?
      'Prévia visual. Para executar, configure o código em Modelos.' :
      'Equipe pronta. Você decide quando executar.';
    $('provider').replaceChildren();
    $('providers-list').replaceChildren();
    for (const provider of providers) {
      const option = element('option', provider.id + (provider.ready ? '' : ' · sem chave'));
      option.value = provider.id;
      $('provider').append(option);
      const row = element('div', undefined, 'provider');
      row.append(element('strong', provider.id), element('span', provider.ready ? 'Configurado' : 'Sem credencial', provider.ready ? 'ready' : 'missing'));
      $('providers-list').append(row);
    }
    $('agents').replaceChildren(...agents.map(buildAgentCard));
    setTeamState(agents.length + ' agentes disponíveis');
  } catch (error) {
    $('server-indicator').textContent = 'Servidor indisponível';
    $('notice').textContent = error.message;
    setTeamState('Conexão indisponível');
  }
}
initialize();
