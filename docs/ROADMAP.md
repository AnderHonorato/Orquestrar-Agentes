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

## Execução 2026-11-03 — cobertura HTTP
- Adicionado `tests/approvals-http.test.js` com testes de autenticação, rejeição de origem externa, proposta, fingerprint incorreto, aprovação única, ausência de execução externa e integridade da auditoria.
- Commits: `90d9923` e correção `9e8acab` (importação dinâmica em modo teste evita inicialização do servidor padrão).
- Verificação GitHub: status Vercel **pending** no commit `9e8acab`; **não** há confirmação de execução de `npm test` ou CI de testes. Teste precisa ser executado em ambiente Node 22+.
- Próximo: executar `npm test`, corrigir falhas observadas, persistir propostas de forma segura e conectar a UI Organic. A main não foi alterada neste lote; Drive não sincronizado.

## Execução 2026-11-03 — painel Organic de aprovações
- Criados `web/approvals-ui.js`, aba de aprovações no menu e rota estática no servidor. O painel lista propostas, valida o sinal de integridade da auditoria e envia decisões com fingerprint e token de sessão.
- Aprovação/rejeição continuam sem executar ações externas. Sem token, a interface exibe erro de autorização.
- Adicionado `tests/approvals-ui.test.js` para verificar referências do HTML, fingerprint e ausência de avaliação dinâmica de código.
- Commits: cbea040, f04a871, f238a2e, bc332fd. **Testes ainda não executados nesta execução**; nenhuma afirmação de deploy validado.
- Próximo: testar em Node 22+, persistir registro de propostas/auditoria com recuperação e integridade, validar UI em navegador, verificar CI, depois conectar criação de propostas à interface. Drive ainda não sincronizado.

## Execução 2026-11-03 — endurecimento da exposição de rede
- Corrigido `server/index.js`: o servidor agora escuta em `127.0.0.1` por padrão, alinhado ao README. A exposição em rede exige `HOST=0.0.0.0` explícito e controles de autenticação/rede apropriados.
- Commit `85a609a` na branch `ander-flow/organic-orchestrator`; `main` não alterada.
- Status combinado consultado no GitHub: nenhuma verificação retornada para esse commit; isso **não comprova testes aprovados**.
- Próximo lote: executar testes Node 22+ e smoke test da interface; auditar persistência transacional e configurações de hospedagem antes de liberar acesso público. Google Drive não sincronizado nesta execução.

## Execução 2026-11-03 — base de persistência de aprovações
- Criado `server/approval-storage.js` com snapshots JSON versionados, gravação por arquivo temporário + rename, permissões restritas e fila de escrita sequencial.
- Criado `tests/approval-storage.test.js` cobrindo leitura inicial, concorrência de gravações, rejeição de versão inválida e falha fechada em JSON corrompido.
- Commits `17dfd40` e `deec55c`. **Módulo ainda não conectado ao registro nem às rotas HTTP**; aprovações continuam voláteis. Não declarar persistência operacional.
- Bloqueio de verificação: ambiente local sem resolução DNS para github.com; testes Node e CI não executados nesta rodada. Google Drive não sincronizado.
- Próximo: adicionar exportação/restauração validada no registro, verificar cadeia de hashes e consistência entre eventos e itens, conectar salvamento com rollback/falha fechada nas mutações, então executar testes e CI.

## Execução 2026-11-03 — restauração validada do registro
- Registro agora exporta `snapshot()` e aceita `createApprovalRegistry({ snapshot })`, verificando versão, limites, IDs duplicados, estados, flags de execução, hashes encadeados e correspondência entre eventos e propostas.
- Testes adicionados em `tests/approval-restore.test.js` para round-trip, adulteração de proposta, alteração/remoção de auditoria e duplicatas.
- Commits `386e75a` e `87ab13a` na branch de desenvolvimento. **Testes ainda não executados**; sem evidência de CI aprovado.
- **Persistência ainda não operacional**: o servidor continua instanciando registro em memória; falta conectar `approval-storage.js` ao ciclo de mutações com gravação antes da resposta e recuperação segura na inicialização.
- Risco residual: a verificação atual não detecta substituição integral do snapshot e reescrita de toda a cadeia por um atacante com acesso ao disco; proteção requer assinatura/HMAC com segredo externo e controles de acesso. Também validar tipos e campos extras do snapshot.
- Próximo: testes reais Node 22+, conectar armazenamento com fila de transações sem perda de atualização, testar reinicialização, concorrência e falha de gravação; sincronizar Drive quando disponível.
