import { library, categories } from './catalog.js';
const $ = id => document.getElementById(id);
let agents = [];
function element(tag, text, cls) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}
const apiHeaders = () => ({ 'content-type': 'application/json', 'x-studio-token': sessionStorage.getItem('studio-key') || '' });
function selectView(name) {
  document.querySelectorAll('.view').forEach(view => view.hidden = view.id !== name);
  document.querySelectorAll('nav button[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === name));
  if (name === 'history') loadHistory();
}
document.querySelectorAll('nav button[data-view]').forEach(button => button.addEventListener('click', () => selectView(button.dataset.view)));
function buildAccess() {
  const settings = $('providers-list').parentElement;
  const access = element('div', undefined, 'card access-card');
  const title = element('h2', 'Acesso protegido');
  const description = element('p', 'O código libera o backend. Chaves de modelos ficam somente no servidor.', 'hint');
  const input = element('input');
  input.type = 'password';
  input.autocomplete = 'off';
  input.placeholder = 'Código de acesso do servidor';
  input.setAttribute('aria-label', 'Código de acesso');
  input.value = sessionStorage.getItem('studio-key') || '';
  const button = element('button', 'Verificar acesso', 'primary');
  const message = element('p', 'Sem acesso verificado.', 'hint');
  button.addEventListener('click', async () => {
    const token = input.value.trim();
    if (token.length > 512) { message.textContent = 'Código longo demais.'; return; }
    try {
      const response = await fetch('/api/history', { headers: { 'x-studio-token': token } });
      if (!response.ok) throw Error('Código incorreto ou proteção ainda não configurada.');
      sessionStorage.setItem('studio-key', token);
      message.textContent = 'Acesso autorizado nesta sessão do navegador.';
    } catch (error) { message.textContent = error.message; }
  });
  const clear = element('button', 'Esquecer código', 'secondary');
  clear.addEventListener('click', () => {
    sessionStorage.removeItem('studio-key');
    input.value = '';
    message.textContent = 'Código apagado desta sessão.';
  });
  access.append(title, description, input, button, clear, message);
  settings.insertBefore(access, $('providers-list'));
}
function buildLibrary() {
  const mount = document.querySelector('#tools .card');
  mount.replaceChildren();
  mount.append(element('h2', 'Biblioteca de ferramentas e skills'));
  mount.append(element('p', 'Referências dos cinco posts do X. Nenhuma destas ferramentas é instalada automaticamente; confira licença, requisitos e segurança antes de habilitar.', 'hint'));
  const controls = element('div', undefined, 'library-controls');
  const search = element('input');
  search.type = 'search';
  search.placeholder = 'Pesquisar projeto ou utilidade...';
  search.setAttribute('aria-label', 'Pesquisar recursos');
  const filter = element('select');
  filter.setAttribute('aria-label', 'Filtrar categoria');
  const all = element('option', 'Todas as áreas');
  all.value = '';
  filter.append(all);
  categories.forEach(category => { const option = element('option', category); option.value = category; filter.append(option); });
  controls.append(search, filter);
  const count = element('p', '', 'hint');
  const rows = element('div', undefined, 'library-grid');
  function render() {
    const query = search.value.toLocaleLowerCase('pt-BR');
    const subset = library.filter(item => (!filter.value || item.categories.includes(filter.value)) && (item.repository + ' ' + item.description + ' ' + item.categories.join(' ')).toLocaleLowerCase('pt-BR').includes(query));
    count.textContent = subset.length + ' referências encontradas · ' + library.length + ' projetos únicos';
    rows.replaceChildren();
    subset.forEach(item => {
      const card = element('article', undefined, 'library-card');
      card.append(element('small', item.categories.join(' / ')));
      card.append(element('h3', item.name));
      card.append(element('p', item.description));
      const link = element('a', 'Ver repositório ↗');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(link);
      rows.append(card);
    });
  }
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  mount.append(controls, count, rows);
  render();
}
function buildTheme() {
  const button = element('button', '◐ Tema', 'theme-toggle');
  button.type = 'button';
  button.setAttribute('aria-label', 'Alternar tema claro ou escuro');
  const apply = name => {
    document.documentElement.dataset.theme = name;
    localStorage.setItem('organic-theme', name);
  };
  apply(localStorage.getItem('organic-theme') === 'dark' ? 'dark' : 'light');
  button.addEventListener('click', () => apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  document.querySelector('aside').append(button);
}
async function init() {
  buildAccess();
  buildLibrary();
  buildTheme();
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) throw Error('Servidor indisponível.');
    const data = await response.json();
    agents = data.agents;
    $('notice').textContent = data.mode === 'somente-leitura' ? 'Servidor em modo somente leitura; configure STUDIO_ACCESS_TOKEN.' : 'Execuções exigem seu código de acesso e credenciais do modelo no servidor.';
    for (const provider of data.providers) {
      const option = element('option', provider.id + (provider.ready ? ' · configurado' : ' · sem chave'));
      option.value = provider.id;
      $('provider').append(option);
      const row = element('div', undefined, 'provider');
      row.append(element('strong', provider.id), element('span', provider.ready ? 'Configurado' : 'Configuração necessária', provider.ready ? 'ready' : 'missing'));
      $('providers-list').append(row);
    }
    agents.forEach((agent, index) => {
      const row = element('div', undefined, 'agent');
      const icon = element('span', ['✧','⌘','◇','◈'][index % 4], 'agent-icon');
      const info = element('div');
      info.append(element('strong', agent.name), element('p', agent.role));
      const check = element('input');
      check.type = 'checkbox';
      check.checked = true;
      check.dataset.index = index;
      check.setAttribute('aria-label', 'Ativar ' + agent.name);
      row.append(icon, info, check);
      $('agents').append(row);
    });
  } catch (error) { $('notice').textContent = error.message; }
}
$('run').addEventListener('click', async () => {
  const goal = $('goal').value.trim();
  if (!goal) { $('notice').textContent = 'Descreva um objetivo.'; return; }
  const selected = agents.filter((agent, index) => document.querySelector('[data-index="' + index + '"]')?.checked);
  if (!selected.length) { $('notice').textContent = 'Selecione ao menos um agente.'; return; }
  const button = $('run');
  button.disabled = true;
  button.textContent = 'Equipe trabalhando…';
  try {
    const response = await fetch('/api/runs', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ goal, provider: $('provider').value, model: $('model').value.trim() || undefined, agents: selected }) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Falha na execução.');
    rememberLocal(data);
    $('output').hidden = false;
    $('result').textContent = data.summary;
    const output = $('output');
    output.querySelectorAll('details').forEach(node => node.remove());
    for (const item of data.results || []) {
      const details = element('details');
      details.append(element('summary', item.agent), element('pre', item.response));
      output.append(details);
    }
    $('notice').textContent = data.status === 'completed' ? 'Concluído. Revise antes de aplicar.' : 'Parcial: ' + (data.failures || []).map(error => error.agent + ': ' + error.error).join('; ');
  } catch (error) { $('notice').textContent = 'Erro: ' + error.message; }
  finally { button.disabled = false; button.textContent = 'Iniciar orquestração ↗'; }
});
async function loadHistory() {
  const node = $('history-items');
  node.textContent = 'Carregando…';
  try {
    const response = await fetch('/api/history', { headers: { 'x-studio-token': sessionStorage.getItem('studio-key') || '' } });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Acesso não autorizado.');
    if (data.storage === 'browser') { try { data.items = JSON.parse(sessionStorage.getItem('organic-runs') || '[]'); } catch { data.items = []; } }
    node.replaceChildren();
    if (!data.items.length) node.append(element('p', 'Sem execuções.'));
    data.items.forEach(item => {
      const details = element('details');
      details.append(element('summary', item.goal + ' · ' + new Date(item.createdAt).toLocaleString('pt-BR')), element('pre', item.summary));
      node.append(details);
    });
  } catch (error) { node.textContent = error.message; }
}
init();

function rememberLocal(entry) {
  try { const entries=JSON.parse(sessionStorage.getItem('organic-runs') || '[]'); sessionStorage.setItem('organic-runs',JSON.stringify([entry,...entries].slice(0,20))); } catch { /* histórico opcional */ }
}
