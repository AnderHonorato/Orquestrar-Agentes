# Orquestrar Agentes — Organic Studio

Protótipo original inspirado no [Open Duet](https://github.com/Anil-matcha/open-duet), não é fork ou cópia completa.

Requer Node.js 22+. Copie `.env.example` para `.env`, configure a chave de um provedor ou instale Ollama. Inicie com `node --env-file=.env server/index.js` e acesse `http://localhost:4173`. Execute `npm test` para testar.

O backend fica vinculado a 127.0.0.1, sem exposição pública. A equipe produz respostas especializadas e síntese do líder, mas **não executa comandos nem altera arquivos**. Histórico salvo em `.data/history.json` (não versionado).

Web local implementada; instalador de PC, APK e deploy público ainda pendentes. Antes de incorporar código do Open Duet (Apache-2.0), preservar créditos e licença. Ver [roadmap](docs/ROADMAP.md).
