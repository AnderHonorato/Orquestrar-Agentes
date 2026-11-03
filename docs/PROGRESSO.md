# Progresso real — Orquestrar Agentes Organic Studio

Atualização: 03/11/2026. Branch de desenvolvimento: ander-flow/organic-orchestrator. A main permanece separada.

## Implementado e verificado
- Interface Organic responsiva PT-BR, modo escuro, estúdio de quatro especialistas, histórico local/session, laboratório com busca e filtro de 46 referências únicas dos cinco posts.
- Provedores: OpenAI, Anthropic, Gemini, OpenRouter e endpoint OpenAI-compatível Ollama. Um provedor/modelo por especialista e provedor/modelo separado para o líder. As chamadas usam APIs configuradas no servidor (sem cobrança/execução enquanto faltarem credenciais).
- Orquestração paralela via Promise.allSettled e consolidação do líder. Resultado é texto/planejamento, não alteração real de arquivos.
- Controle básico de acesso por STUDIO_ACCESS_TOKEN, comparação de hash em tempo constante, checagem de origem, limitação de concorrência no servidor Node, cabeçalhos de segurança.
- Funções serverless de prévia no Vercel e processo Node para auto-hospedagem; configuração Railway preparada.
- Módulo de domínio de propostas e decisões explícitas (server/approvals.js), ainda NÃO conectado à interface nem a execuções externas.
- GitHub Actions rodou e passou nos commits ac8138e, 1098b5d, 42e9412 e 4e3bc43.
- Vercel publicado em https://orquestrar-organic-studio.vercel.app/ e GET /api/health respondeu com ok=true.
- Pasta Drive criada: https://drive.google.com/drive/folders/1e6Ne3TlmDn9bPCmp8RySqjStbw1W974z

## Limitações e bloqueios reais
- Vercel está SOMENTE LEITURA: STUDIO_ACCESS_TOKEN e credenciais OpenAI/Anthropic/Gemini/OpenRouter não estão configurados. Não há uso real de modelos neste deploy até essa configuração.
- Vercel Functions não oferecem persistência de arquivos local: histórico temporário somente na sessão do navegador. Não há memória durável de agentes ou rotinas contínuas no Vercel.
- Railway conectado recusou novo projeto: trial expirado e plano necessário. Não assumir custos nem ativar recursos pagos sem decisão do usuário.
- O Drive contém uma pasta, NÃO um ZIP de backup do código. Upload da fonte ainda pendente.
- Sem importação/cópia efetiva do código Open Duet, sem conexão MCP operativa, sem shell, sem implantação por agentes, sem instalador de PC, sem APK e sem testes de API com chaves reais.
- Catálogo de repositórios é REFERÊNCIA EXTERNA, não pacote instalado. Licenças, dependências e segurança devem ser avaliadas caso a caso.

## Fontes analisadas
- https://x.com/robiartec/status/2117262099298623857
- https://x.com/victorpfreitas/status/2117258182066123122
- https://x.com/0xluffy_eth/status/2117230045421056236
- https://x.com/thegreatest_sv/status/2117231247433118169
- https://x.com/hurricodes/status/2117365603828650391

## Próximas ações
1. Conectar propostas/aprovações à API e interface com autenticação, trilha e nenhuma execução automática.
2. Implementar banco e memória com acesso por usuário e retenção controlada antes de habilitar rotinas.
3. Adicionar adaptadores MCP em sandbox, permissões por ferramenta, auditoria e limites de custo; testes com provedor real após credenciais.
4. Integrar capacidades selecionadas dos repositórios com licenças verificadas; não instalar 46 pacotes cegamente.
5. Preparar desktop e Android APK via pipelines de CI, testar artefatos e disponibilizar links somente após builds confirmadas.
6. Exportar repositório/ZIP e inserir na pasta do Google Drive, verificando o upload.

As tarefas recorrentes devem consultar o commit atual do GitHub antes de editar, para não sobrescrever trabalho paralelo.

## Lote incremental — 03/11/2026, 08h (Brasília)
- Adicionado `server/approval-registry.js`: registro de propostas em memória, limite de itens, revisão vinculada ao fingerprint, cópias defensivas e auditoria hash encadeada; nenhuma execução externa.
- Adicionado `tests/approval-registry.test.js`: testes de aprovação/rejeição, limite, fingerprint e isolamento de retornos.
- Commits: `1098440` e `6387710` na branch de desenvolvimento; `main` não alterada.
- **Não verificado ainda**: resultado da CI deste lote; registro ainda não conectado às rotas HTTP nem persistido. Hash encadeado detecta alteração acidental, mas não substitui armazenamento imutável ou assinatura.
- Próximo lote: integrar rotas autenticadas com validação de origem e testes HTTP, evitando expor propostas entre usuários; depois persistência durável.
