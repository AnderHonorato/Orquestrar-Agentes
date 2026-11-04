// Retratos 2D originais: SVG vetorial + estados reais da interface. Sem WebGL e sem 3D.
export const personalities = Object.freeze([
  { nickname:'Atlas', nature:'Calmo & estratégico', greeting:'Tudo sob controle.', busy:'Traçando caminhos…', done:'Plano alinhado!', error:'Algo não encaixa.', playful:'Uma ideia por vez!' },
  { nickname:'Pip', nature:'Ágil & curioso', greeting:'Mãos à obra?', busy:'Montando as peças…', done:'Prontinho!', error:'Preciso revisar.', playful:'Já tive outra ideia!' },
  { nickname:'Nox', nature:'Atento & crítico', greeting:'Estou observando.', busy:'Investigando detalhes…', done:'Tudo conferido.', error:'Encontrei um alerta.', playful:'Hmm… interessante.' },
  { nickname:'Lumi', nature:'Criativa & expressiva', greeting:'Que tal ousar?', busy:'Explorando formas…', done:'Ficou lindo!', error:'Vamos ajustar.', playful:'Olha isso! ✨' }
]);
const silhouettes = [
  {
    ornament:'<path d="M54 78 42 32 Q41 23 52 29 L88 53 M153 52 187 29 Q199 23 196 36 L185 84" fill="#d4c9b6" stroke="#272d24" stroke-width="5" stroke-linejoin="round"/>',
    head:'M57 79 Q46 64 61 55 Q92 35 119 50 Q151 35 180 55 Q198 70 185 85 Q211 111 192 149 Q177 183 120 182 Q60 183 46 150 Q28 108 57 79Z',
    adorn:'<path d="M83 66 Q116 49 158 66" fill="none" stroke="#b7a995" stroke-width="4" stroke-linecap="round"/>',
    brows:'M70 91 Q87 85 102 93 M137 93 Q151 85 169 91'
  },
  {
    ornament:'<path d="M120 49 V22" stroke="#272d24" stroke-width="7" stroke-linecap="round"/><circle cx="120" cy="17" r="10" fill="#cbea9f" stroke="#272d24" stroke-width="5"/><rect x="31" y="107" width="20" height="31" rx="9" fill="#e5ddc9" stroke="#272d24" stroke-width="5"/><rect x="188" y="107" width="20" height="31" rx="9" fill="#e5ddc9" stroke="#272d24" stroke-width="5"/>',
    head:'M67 48 Q88 41 120 43 Q158 41 175 51 Q194 59 194 91 L194 137 Q191 180 157 183 L85 183 Q46 180 46 139 L46 90 Q46 61 67 48Z',
    adorn:'<rect x="70" y="64" width="99" height="6" rx="3" fill="#c8bca7" opacity=".8"/>',
    brows:'M71 91 Q86 84 102 90 M138 90 Q153 84 169 91'
  },
  {
    ornament:'<path d="M59 74 40 50 Q31 40 52 38 L84 53 M155 53 187 38 Q205 39 195 52 L182 78" fill="#c9bda8" stroke="#272d24" stroke-width="5" stroke-linejoin="round"/>',
    head:'M44 107 Q28 69 65 51 Q92 38 120 55 Q154 37 181 54 Q213 78 194 116 Q201 165 158 180 Q111 193 72 176 Q40 162 44 107Z',
    adorn:'<path d="M119 116 Q119 138 130 143" fill="none" stroke="#aea08a" stroke-width="3"/><circle cx="163" cy="108" r="29" fill="none" stroke="#302f28" stroke-width="4" opacity=".57"/>',
    brows:'M69 87 Q90 77 104 89 M138 88 Q156 74 175 90'
  },
  {
    ornament:'<path d="M58 71 Q29 53 58 46 Q71 36 92 43 Q114 20 139 43 Q168 28 178 51 Q209 47 194 78" fill="#ddcfbd" stroke="#272d24" stroke-width="5" stroke-linejoin="round"/>',
    head:'M56 79 Q38 61 58 53 Q74 43 92 51 Q121 28 141 52 Q170 39 184 62 Q204 78 190 92 Q205 117 190 146 Q178 184 117 183 Q58 183 45 145 Q31 115 56 79Z',
    adorn:'<path d="M87 60 Q107 47 126 59" fill="none" stroke="#bda78f" stroke-width="6" stroke-linecap="round"/><circle cx="173" cy="66" r="7" fill="#cbea9f" stroke="#272d24" stroke-width="3"/>',
    brows:'M69 93 Q87 83 105 95 M135 94 Q152 81 171 94'
  }
];

function svgPortrait(index) {
  const character = silhouettes[index % silhouettes.length];
  // Templates são constantes locais; nenhum dado de usuário é interpretado como HTML.
  return '<svg viewBox="0 0 240 205" class="agent-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<ellipse cx="120" cy="189" rx="69" ry="7" fill="#0b100d" opacity=".24"/>' +
    '<g class="head">' + character.ornament +
    '<path d="' + character.head + '" fill="var(--face)" stroke="#272d24" stroke-width="5.5" stroke-linejoin="round"/>' +
    character.adorn +
    '<g class="eyebrow" fill="none" stroke="#272d24" stroke-width="4.2" stroke-linecap="round"><path d="' + character.brows + '"/></g>' +
    '<g class="eye-lids"><ellipse cx="87" cy="110" rx="13" ry="17" fill="#262c24"/>' +
    '<ellipse cx="154" cy="110" rx="13" ry="17" fill="#262c24"/>' +
    '<g class="pupils"><circle cx="91" cy="104" r="4" fill="#f9f7eb"/><circle cx="158" cy="104" r="4" fill="#f9f7eb"/></g></g>' +
    '<g fill="none" stroke="#272d24" stroke-width="4" stroke-linecap="round">' +
    '<path class="mouth-idle" d="M110 149 Q120 157 132 149"/>' +
    '<path class="mouth-happy" d="M101 147 Q120 171 140 147"/>' +
    '<path class="mouth-think" d="M110 153 Q121 146 133 153"/>' +
    '<path class="mouth-error" d="M110 158 Q121 144 133 158"/>' +
    '</g><ellipse cx="68" cy="141" rx="12" ry="5" fill="#b69f88" opacity=".22"/>' +
    '<ellipse cx="172" cy="141" rx="12" ry="5" fill="#b69f88" opacity=".22"/></g></svg>';
}

export function createPortrait(index, name) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'portrait';
  button.setAttribute('aria-label', 'Interagir com ' + name);
  button.innerHTML = svgPortrait(index);
  const bubble = document.createElement('span');
  bubble.className = 'bubble';
  bubble.textContent = personalities[index % personalities.length].greeting;
  button.append(bubble);

  button.addEventListener('pointermove', event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
    button.style.setProperty('--look-x', (x * 4).toFixed(1) + 'px');
    button.style.setProperty('--look-y', (y * 3).toFixed(1) + 'px');
  });
  button.addEventListener('pointerleave', () => {
    button.style.removeProperty('--look-x');
    button.style.removeProperty('--look-y');
  });
  return button;
}

export function setAgentMood(card, mood, index, customMessage) {
  const safeMoods = new Set(['idle', 'working', 'done', 'error', 'playful']);
  if (!safeMoods.has(mood)) throw Error('Expressão desconhecida');
  const personality = personalities[index % personalities.length];
  const words = {
    idle:personality.greeting,
    working:personality.busy,
    done:personality.done,
    error:personality.error,
    playful:personality.playful
  };
  card.dataset.mood = mood;
  const bubble = card.querySelector('.bubble');
  const state = card.querySelector('.agent-state');
  if (bubble) bubble.textContent = customMessage || words[mood];
  if (state) state.textContent = {idle:'Disponível',working:'Pensando',done:'Concluído',error:'Atenção',playful:'Interagindo'}[mood];
}
