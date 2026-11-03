// Catálogo de referências verificadas nas cinco publicações. Não são plugins instalados.
const groups = [
  { category: 'Agentes e automação', projects: [
    ['kepano/obsidian-skills', 'Memória e organização de conhecimento em Markdown'],
    ['teng-lin/notebooklm-py', 'Consulta a fontes do NotebookLM; cliente não oficial'],
    ['huggingface/skills', 'Pesquisa e ferramentas para modelos'],
    ['blader/humanizer', 'Revisão de estilo de textos'],
    ['coreyhaines31/marketingskills', 'Marketing e redação comercial'],
    ['vercel-labs/agent-skills', 'Boas práticas de React e implantação'],
    ['muratcankoylan/Agent-Skills-for-Context-Engineering', 'Engenharia de contexto para agentes'],
    ['czlonkowski/n8n-skills', 'Fluxos n8n para automações'],
    ['trailofbits/skills', 'Revisão de código, Python e segurança']
  ] },
  { category: 'Produção de vídeos', projects: [
    ['yihui-dev/awesome-opus5-5-videos', 'Galeria com prompts e vídeos; citada também no quinto post'],
    ['lemomo-ai/lemo-opuscar', 'Referências de estilos de curtas'],
    ['mexicat/pdoom-video', 'Vídeo musical criado com Three.js'],
    ['JohnHeibel/PDoomVideo', 'Exemplo de vídeo com estilo pintura'],
    ['Vincentwei1021/mg-styles-15', 'Exemplos de motion design com prompts'],
    ['JohnHeibel/ClaudeAnimationBase', 'Exemplo de personagem com estados emocionais'],
    ['athemeroy/awesome-claude-5-5-videos', 'Galeria de vídeos com fontes'],
    ['joeseesun/opus-video-prompts', 'Prompts para produção de vídeos']
  ] },
  { category: 'Motion e audiovisual', projects: [
    ['remotion-dev/remotion', 'Vídeos programados com React'],
    ['remotion-dev/skills', 'Instruções para agentes de vídeo'],
    ['juliangarnier/anime', 'Animações e linhas do tempo'],
    ['motiondivision/motion', 'Transições e animações de interface'],
    ['ManimCommunity/manim', 'Animações educativas e matemáticas'],
    ['airbnb/lottie-web', 'Animações vetoriais para web'],
    ['ahujasid/mcp-for-blender', 'Automação de cenas Blender via MCP'],
    ['mrdoob/three.js', 'Cenas interativas tridimensionais'],
    ['gkjohnson/three-gpu-pathtracer', 'Renderização e iluminação'],
    ['jrouwe/JoltPhysics', 'Simulação física e colisões'],
    ['pmndrs/postprocessing', 'Pós-processamento e efeitos'],
    ['Alchemist0823/three.quarks', 'Partículas tridimensionais'],
    ['cocopon/tweakpane', 'Painel para ajustar parâmetros visuais'],
    ['Comfy-Org/ComfyUI', 'Fluxos de geração audiovisual'],
    ['QwenAudio/CosyVoice', 'Síntese de voz'],
    ['librosa/librosa', 'Análise de áudio e batidas'],
    ['m-bain/whisperX', 'Sincronização de legendas'],
    ['obsproject/obs-studio', 'Captura e gravação'],
    ['mifi/lossless-cut', 'Cortes de vídeo sem reencodificação'],
    ['FFmpeg/FFmpeg', 'Processamento e exportação de mídia']
  ] },
  { category: 'Design e experiências', projects: [
    ['heygen-com/hyperframes', 'Renderização de vídeo a partir de HTML'],
    ['ahujasid/mcp-for-blender', 'Blender controlado por agentes'],
    ['achimala/dream-loop', 'Construção e revisão iterativa de cenas'],
    ['wheresryan22/anatomy', 'Objetos tridimensionais interativos'],
    ['oso95/scroll-world', 'Navegação visual por rolagem'],
    ['remotion-dev/remotion', 'Vídeos com React'],
    ['Vincentwei1021/video-shotcraft', 'Exemplos de vídeos promocionais'],
    ['greensock/GSAP', 'Animações de precisão'],
    ['LottieFiles/motion-design-skill', 'Princípios de animação para agentes'],
    ['Comfy-Org/ComfyUI', 'Fluxos visuais com modelos'],
    ['Nutlope/hallmark', 'Referências para evitar interfaces genéricas'],
    ['pbakaus/impeccable', 'Auditoria e melhoria de design']
  ] }
];
const records = new Map();
for (const group of groups) {
  for (const [repository, description] of group.projects) {
    const key = repository.toLowerCase();
    if (!records.has(key)) records.set(key, { repository, name: repository.split('/').at(-1), description, categories: [group.category], status: 'Referência', url: 'https://github.com/' + repository });
    else records.get(key).categories.push(group.category);
  }
}
export const library = [...records.values()];
export const categories = groups.map(group => group.category);
