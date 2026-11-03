// Painel de revisão: nunca executa ações aprovadas automaticamente.
const mount = document.getElementById('approval-items');
const status = document.getElementById('approval-status');
const token = () => sessionStorage.getItem('studio-key') || '';
const headers = () => ({ 'content-type': 'application/json', 'x-studio-token': token() });
function node(tag, value) { const n = document.createElement(tag); if (value !== undefined) n.textContent = value; return n; }
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(), ...options.headers } });
  const body = await response.json();
  if (!response.ok) throw Error(body.error || 'Falha ao consultar aprovações');
  return body;
}
async function refresh() {
  status.textContent = 'Consultando propostas…';
  try {
    const [listing, audit] = await Promise.all([request('/api/approvals'), request('/api/approvals/audit')]);
    mount.replaceChildren();
    status.textContent = audit.valid ? 'Auditoria íntegra · ' + audit.events.length + ' eventos' : 'ALERTA: auditoria inconsistente';
    if (!audit.valid) return;
    if (!listing.items.length) mount.append(node('p', 'Nenhuma proposta cadastrada.'));
    for (const item of listing.items) {
      const card = node('article'); card.className = 'card';
      card.append(node('h2', item.title), node('p', item.description), node('p', 'Destino: ' + item.target), node('small', item.type + ' · ' + item.status));
      if (item.status === 'pending') {
        const note = node('textarea'); note.placeholder = 'Observação da revisão (opcional)'; note.maxLength = 500;
        note.setAttribute('aria-label', 'Observação para ' + item.title);
        card.append(note);
        for (const [decision, label] of [['approved', 'Aprovar'], ['rejected', 'Rejeitar']]) {
          const button = node('button', label); button.type = 'button'; button.className = decision === 'approved' ? 'primary' : 'secondary';
          button.addEventListener('click', async () => {
            button.disabled = true;
            try {
              await request('/api/approvals/' + encodeURIComponent(item.id) + '/review', {
                method: 'POST', body: JSON.stringify({ decision, note: note.value, fingerprint: item.fingerprint })
              });
              await refresh();
            } catch (error) { status.textContent = error.message; button.disabled = false; }
          });
          card.append(button);
        }
      }
      mount.append(card);
    }
  } catch (error) { status.textContent = error.message; mount.replaceChildren(); }
}
async function explainOrLoad() {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    if (health.hosting === 'vercel-serverless') {
      mount.replaceChildren();
      mount.append(node('p', 'O painel de aprovações precisa de servidor Node com armazenamento persistente. Esta prévia Vercel é somente para visualização.'));
      status.textContent = 'Prévia segura: nenhuma aprovação será registrada aqui.';
      return;
    }
  } catch { /* A solicitação normal apresentará eventual erro */ }
  return refresh();
}
document.querySelector('[data-view="approvals"]').addEventListener('click', explainOrLoad);
document.getElementById('refresh-approvals').addEventListener('click', explainOrLoad);
