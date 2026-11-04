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


## Execução 2026-11-03 — persistência conectada e testes online
- Base inicial verificada: commit f691da6 já tinha CI concluída com sucesso no GitHub Actions (run 41684109377).
- Commit 9db8750 conectou server/approval-service.js ao servidor HTTP. O serviço carrega snapshots antes de escutar, valida hashes/correspondência no restore, serializa propostas e revisões e publica o novo estado só depois de persistir no arquivo. Falha de gravação retorna erro 503 sem confirmar aprovação.
- Testes criados/ajustados para reinício do serviço, 12 propostas concorrentes, falha de armazenamento, snapshot adulterado, limite de itens e HTTP com diretório temporário.
- **GitHub Actions real**: workflow https://github.com/AnderHonorato/Orquestrar-Agentes/actions/runs/41685117371 concluído SUCCESS; passo npm test, node --check server/index.js e node --check web/app.js concluíram SUCCESS no runner online Ubuntu/Node 22.
- **Vercel real**: deploy de prévia dpl_5g6vb7TxF9MJRVWpriSoCjBWS2U2 em estado READY, com HTML Organic e GET /api/health retornando ok=true, GET /api/providers retornando os 5 provedores e todas credenciais indisponíveis.
- Na Vercel, rotas de aprovações retornam 401 sem token e 501 com token (não há persistência de arquivos serverless); a interface informa essa limitação. API persistente continua exclusiva ao servidor Node com DATA_DIR durável.
- Próximo: deploy de backend Node com volume persistente em servidor disponível sem criar cobrança indevida, autenticação por usuário, HMAC externo/DB transacional para mais de uma instância, modelos com credenciais e conectores MCP isolados. O backup Git/Drive permanece pendente.


### Verificação final de servidor online — 03/11/2026
- GitHub Actions (Ubuntu, Node.js 22): https://github.com/AnderHonorato/Orquestrar-Agentes/actions/runs/41685563494, resultado **success**. Passaram npm test, node --check server/index.js e node --check web/app.js para o commit 2cb1c760.
- Vercel de produção: deploy dpl_4uPXGE8G5o8wdi1PmcfdRhatr296, READY, SHA 2cb1c760, alias público https://orquestrar-organic-studio.vercel.app.
- Smoke test HTTP externo na URL estável: página inicial renderizada, GET /api/health com ok=true, GET /api/providers retornando 5 provedores (todos sem chave configurada), GET /approvals-ui.js com mensagem explícita de indisponibilidade de persistência na Vercel.
- Os testes HTTP reais do módulo persistente são executados no runner GitHub Actions com porta local e DATA_DIR temporário; NÃO existe backend Node persistente público hoje.
- Próximo trabalho: implantar servidor Node com volume e autenticação protegida sem custo não autorizado; conectar modelos por credenciais secretas; implementar memória durável, MCP isolado, app desktop e APK, e enviar backup ZIP à pasta Drive.


## Lote incremental — 03/11/2026, tarde (controle preventivo de chamadas)
- Adicionado `server/call-budget.js`, integrado em `validateRun` antes de qualquer chamada externa: `maxModelCalls` inteiro entre 1 e 9, com reserva obrigatória para todos os especialistas e líder. O padrão é 9 chamadas; não há retentativas automáticas no orquestrador atual.
- Criado `tests/call-budget.test.js` com quatro casos (padrão, insuficiência, entradas inválidas, mínimo). Arquivos gravados na branch `ander-flow/organic-orchestrator`, sem alteração na main.
- **Ainda não confirmado:** resultado da CI e execução real dos testes deste lote. O controle limita número de requisições, NÃO tokens nem custo em reais; chamadas de APIs podem gerar cobrança mesmo dentro do limite.
- Próximo: verificar Actions deste commit; expor seletor `maxModelCalls` na UI, limites de tokens/custo por provedor e cancelamento de chamadas; persistência e isolamento por usuário continuam pendentes.


### 03/11/2026 — Crew Studio 2D (refatoração de interface)
- Novo layout visual de uma cor de destaque, superfícies discretas e opções avançadas recolhidas; mantidas as cinco seções e fluxos do projeto.
- Quatro mascotes SVG autorais (Atlas/Arquiteto, Pip/Implementador, Nox/Revisor e Lumi/Designer), cada qual com silhueta/personalidade/expressões próprias, olhos que seguem o ponteiro, piscadas e cabeça animada com CSS 2D.
- Emoções UI sincronizadas aos estados de rede: o botão inicia working enquanto POST /api/runs está pendente, marca done apenas após resposta com resultado para o especialista, e error quando há falha. Frases são mensagens da interface, não falas reais de modelos. Não simular streaming nem execução de ferramentas.
- Toque/click no retrato produz reação curta, sem chamar APIs; navegação e preferências de acessibilidade preservadas.
- CI estendida para validar a sintaxe de web/mascots.js e approvals-ui.js; testes de 2D, estados, campos, APIs, redução de movimento e roteamento estático no servidor Node.
- Não foi copiado código do Open Duet nesta etapa. Nenhum recurso 3D foi incorporado.


### 04/11/2026 — validação da nova interface Crew Studio
- Commit 0164799: reconstrução da interface HTML/CSS, criação de web/mascots.js, integração de personalidades e estados reativos com /api/runs, correção da rota /mascots.js no servidor Node, e cobertura tests/crew-studio.test.js.
- Primeiro CI falhou em um falso positivo do teste que buscava a expressão "WebGL" inclusive em comentário que dizia "Sem WebGL"; nenhum teste de função dos mascotes falhou. Corrigido no commit 94d6002.
- CI GitHub Actions ONLINE aprovada no commit 94d6002, workflow https://github.com/AnderHonorato/Orquestrar-Agentes/actions/runs/41764729880. Todos os testes de código e checagens Node passaram.
- O novo projeto usa SVG/CSS/JS vetorial 2D, sem dependências 3D; quatro personagens e movimentos específicos com suporte a prefers-reduced-motion.
- O backend dos provedores e APIs de aprovação segue inalterado. O sistema NÃO faz streaming individual; os estados são atualizados quando a requisição começa e quando a resposta completa chega.
- BLOQUEIO DE PUBLICAÇÃO: Vercel retornou 402 payment_required / api-deployments-free-per-day (mais de 100 deployments por dia; aguardar janela de 24h ou rever plano pela conta, sem cobrança automática). A integração Git não disponibilizou um novo deployment READY para os commits 0164799/94d6002 na última consulta. O link estável do Vercel aponta para uma versão anterior. Não alegar que o novo Crew Studio já está disponível no site público.
- PRÓXIMAS ETAPAS: publicar prévia do commit testado quando quota disponível, verificar desktop e Android por captura de tela, testar toques e estados animados em navegador real, corrigir bugs visuais. Manter a branch ander-flow/organic-orchestrator separada da main.


### 04/11/2026 — verificação visual da nova versão no Vercel
- Após o limite da API de deploy direto, o Git do Vercel publicou automaticamente o commit 7a91980 no deployment READY: https://orquestrar-organic-studio-fs4yfacx3-anderhonoratos-projects.vercel.app/.
- O navegador externo renderizou o HTML com título Crew Studio e confirmou os quatro personagens, nomes e campos de modelo. Capturas verificadas em 390×844 (mobile) e 1440×900 (desktop): 2 colunas no mobile, 4 colunas no desktop, navegação inferior no mobile, navegação lateral no desktop.
- GitHub Actions confirmou PASS no commit 7a91980 (workflow 41765015434).
- O site está em modo de visualização, sem token e sem chaves de provedores. Não houve execução real de modelos.
- Verificação automatizada de cliques com ferramenta Context.dev não pôde ser executada devido a restrição de assinatura (PAID_PLAN_REQUIRED, sem consumo de créditos). Não afirmar que interações reais foram navegadas automaticamente.
- O alias de produção estável não foi intencionalmente atualizado neste lote; usar o URL único de preview acima para testar a nova versão. A verificação de movimento foi coberta por inspeção de CSS/JS e testes Node; não por gravação de vídeo.
