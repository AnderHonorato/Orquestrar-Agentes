# Estado verificado

## Implementado nesta branch
- Web responsiva PT-BR Organic, histórico local, quatro especialistas em paralelo e consolidação por líder.
- Provedores OpenAI, Anthropic, Gemini, OpenRouter e Ollama com chave no servidor.
- Validação de entradas, testes unitários e CI.

## Pendente
- Importação do Open Duet (ainda NÃO foi copiado), memória semântica, permissões reais, MCP, agendamento, ferramentas GitHub/Gmail/Calendar, streaming, autenticação e rate limiting.
- Builds desktop, APK Android, hospedagem pública e testes reais de modelos com credenciais.
- Avaliar licenças e código dos links do X antes de integrar.

## Referências
- Open Duet Apache-2.0: https://github.com/Anil-matcha/open-duet
- Galeria de 475 demos: https://github.com/yihui-dev/awesome-opus5-5-videos
- https://x.com/robiartec/status/2117262099298623857
- https://x.com/victorpfreitas/status/2117258182066123122
- https://x.com/0xluffy_eth/status/2117230045421056236
- https://x.com/thegreatest_sv/status/2117231247433118169
- https://x.com/hurricodes/status/2117365603828650391

## Execução 2026-11-03 — integração HTTP de aprovações
- Rotas autenticadas: GET/POST /api/approvals, POST /api/approvals/:id/review, GET /api/approvals/audit.
- Revisão exige fingerprint da proposta e verificação de origem em escritas. Não há execução de efeitos externos.
- Reutilizado registro já existente (hash encadeado, limite de 200); não recriado.
- Commits: dc14e1e e 617efc7. Testes/CI deste lote ainda NÃO confirmados.
- Bloqueios: registro somente em memória, sem persistência ou UI conectada; implantação não verificada; Google Drive não sincronizado.
- Próximo: testes HTTP integrados, persistência com armazenamento transacional e interface de revisão; verificar CI antes de liberar ações.
