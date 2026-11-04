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

## Execução 2026-11-03 — cobertura de orçamento no orquestrador
- Adicionado `tests/orchestrator-budget-integration.test.js`: valida orçamento na entrada `validateRun`, bloqueio de limite insuficiente, limite exato incluindo líder, valores inválidos e oito especialistas.
- Commits `2ce3fd8` e `4a2f28e`; branch de desenvolvimento, sem alterações na main.
- GitHub combined status de `4a2f28e`: **Vercel failure**, com destino indicando `build-rate-limit`/upgrade de plano; isso não demonstra erro do código. **npm test e CI Node ainda não confirmados**.
- Verificação de estado: `server/approval-service.js` já conecta persistência de aprovações, e `tests/approval-service.test.js` já cobre reinicialização, concorrência e rollback. Não duplicar esses módulos. O roadmap anterior estava desatualizado quanto a essa integração.
- Próximo: executar `npm test` em Node 22+ por runner independente da Vercel; investigar limite de builds; validar integração HTTP com persistência, depois abordar memória de agentes. Drive não sincronizado nesta rodada.

## Execução 2026-11-03 — orçamento preventivo de tokens
- Criado `server/token-budget.js`, conectado a `validateRun` e coberto por cinco testes em `tests/token-budget.test.js`.
- Campo opcional `maxEstimatedInputTokens` (100–1.000.000) bloqueia solicitações antes de chamar provedores quando a estimativa conservadora excede o teto. O cálculo usa bytes UTF-8/3 e reserva até 20.000 caracteres para o contexto do líder.
- Commits `714df54`, `7839cc6`, `e6bef7b` na branch de desenvolvimento; `main` preservada.
- **Limitação:** estimativa não equivale a tokens faturados, não mede saída nem garante limite de custo. Testes Node e CI ainda não verificados nesta execução; não alegar aprovação.
- Próximo: executar `npm test` com Node 22+, validar CI independente da Vercel, medir tokens reais de uso dos provedores, aplicar tetos de saída por modelo e registrar custos com preços versionados. Drive não sincronizado.

## Execução 2026-11-03 — teto de saída por modelo
- Criado `server/output-budget.js`: `maxOutputTokens` opcional (1–8192), padrão 1400; validação estrita em `validateRun`.
- `server/engine.js` envia `max_tokens` para Anthropic e APIs compatíveis OpenAI/Ollama/OpenRouter; `generationConfig.maxOutputTokens` para Gemini. Especialistas e líder recebem o limite.
- Adicionado `tests/output-budget.test.js` com valores válidos/inválidos e mock de requisição sem credenciais. Commits: `6c5aee1`, `e3070e5`, `2f26e65`, `e49dac9`.
- Limitação: provedor pode ignorar limite; não é teto de gasto. Não há contagem de tokens reais nem testes Node executados nesta rodada.
- Próximo: executar `npm test` em Node 22+, validar payloads de Anthropic e Gemini por mock, capturar usage dos provedores sem expor chaves e verificar CI. Drive não sincronizado.

## Execução 2026-11-03 — telemetria real de tokens por provedor
- `server/engine.js` agora oferece `includeUsage` opt-in sem alterar o retorno string de chamadas legadas; `normalizeUsage` interpreta campos Anthropic, Gemini e APIs OpenAI compatíveis.
- `server/orchestrator.js` usa retorno estruturado para especialistas e líder, persiste `usage` por agente e agrega tokens reportados com flag `incomplete` quando algum provedor não informa contagem. Custo monetário permanece `null` (não há tabela de preços validada).
- Criado `tests/provider-usage.test.js` com quatro casos de normalização. Commits `3986696`, `df27170`, `91faa36`.
- **Verificação pendente:** testes Node 22+, CI e chamadas reais não executados nesta rodada; sem garantia de compatibilidade para todas as versões de API. `main` não alterada; Google Drive não sincronizado.
- Próximo: executar suíte completa, testar mock HTTP por provedor, validar o formato de resposta da UI e capturar usage em erros/parciais; depois avaliar precificação versionada sem inventar custos.

## Execução 2026-11-03 — correção da telemetria em falhas parciais
- Corrigido `server/orchestrator.js`: `usage.incomplete` passa a ser `true` quando algum especialista ou o líder falha, mesmo que todos os agentes concluídos tenham informado tokens. Antes a telemetria podia parecer completa em execução parcial.
- Adicionado teste de regressão `tests/orchestrator-partial-usage.test.js` com mock HTTP de Ollama, especialista indisponível e líder bem-sucedido. Verifica status parcial, contagens apenas das respostas obtidas, `incomplete=true` e custo `null`.
- Commits `d72858f` e `d70dc55`; `main` não foi modificada.
- **Verificação limitada:** clone/execução local indisponível por falha de resolução DNS de github.com no container. Teste adicionado, mas **não executado**; nenhuma aprovação de CI presumida.
- Próximo: executar `npm test` em runner Node 22+, validar UI com uso parcial, tratar telemetria de falhas sem registrar segredos e implementar custo por tabela versionada apenas após verificar preços oficiais.
- Drive não sincronizado.

## Execução 2026-11-03 — contratos HTTP dos provedores
- Adicionado `tests/provider-http-contract.test.js` com quatro testes de requisição simulada para Anthropic, Gemini e OpenAI, verificando autenticação, formato de payload, limite de saída e normalização de usage; cobre também resposta sem metadados.
- Commit `28176db` na branch `ander-flow/organic-orchestrator`; main preservada. Os testes são mocks, **não comprovam compatibilidade real** com serviços externos.
- Node 22.16.0 disponível no container, porém `git ls-remote` falhou por DNS (`Could not resolve host: github.com`); suíte completa ainda não executada. Verificar no runner CI antes de considerar o lote validado.
- Próximo: executar `npm test`, corrigir qualquer falha, conferir contratos com APIs reais usando credenciais de teste e avaliar tokenização/custos por modelo. Google Drive ainda não sincronizado.

## Execução 2026-11-03 — reforço do CI independente de deploy
- Atualizado `.github/workflows/ci.yml` na branch de desenvolvimento (commit `0ed2cd1`): gatilho manual `workflow_dispatch`, permissões somente de leitura, cancelamento de execuções obsoletas, timeout de 12 minutos, Node 22, `NODE_ENV=test`, `npm test` e checagem sintática adicional de engine/orquestrador.
- Não alterado o código dos provedores nem a main. CI GitHub Actions é independente do limite de builds da Vercel.
- **Não confirmado:** execução/resultado do workflow; testes locais e contratos reais dos provedores continuam pendentes. Não confundir workflow configurado com suíte aprovada.
- Próximo: verificar o run de push no GitHub Actions, corrigir falhas efetivas, depois avançar para custo por tabela de preços versionada. Drive não sincronizado.

## Execução 2026-11-03 — estimativa monetária isolada
- Adicionado `server/cost-estimate.js` para calcular custo **estimado** apenas quando o operador informa tarifas por milhão de tokens e moeda; nunca presume preços de provedores.
- Adicionado `tests/cost-estimate.test.js` com quatro casos: cálculo, ausência de tarifas/uso incompleto, entradas inválidas e tarifa zero explícita.
- Commits `cbfed8f` e `289f5ca`; a `main` não foi alterada.
- **Ainda não integrado** ao endpoint/orquestrador; não há cobrança, consulta de preços, nem medição financeira real. Testes não executados nesta rodada.
- Próximo: integrar tarifas versionadas **por provedor/modelo** com validação de origem, sem aplicar tarifa única a agentes de modelos diferentes; testar a suíte Node e verificar CI. Google Drive pendente.

## Execução 2026-11-04 — custos por modelo (módulo isolado)
- Confirmado estado remoto antes de escrever: HEAD inicial `b7d1fdf` (QA Crew Studio); não repetir módulos existentes.
- Criado `server/run-costs.js` para calcular custos individuais de especialistas e líder usando somente tabela de preços explícita indexada por `[provedor, modelo]`; sem presumir preços vigentes.
- Criado `tests/run-costs.test.js` com cinco cenários: soma, tarifa ausente, moedas diferentes, execução parcial e telemetria ausente.
- Commits `4b50ea1` e `d5e80e0` na branch `ander-flow/organic-orchestrator`; main não editada.
- **Não integrado à rota HTTP/UI**; módulo isolado, não representa cobrança real. **Testes ainda não executados**; CI não verificada nesta execução.
- Próximo: executar Node 22 `npm test`, corrigir falhas, integrar estimativa opcional no fluxo de execução sem expor preços/chaves, exibir detalhamento Organic. Drive não sincronizado.


## Execução 2026-11-04 — integração de custos no endpoint
- Confirmado HEAD remoto inicial `230258d5b1044c06c21e50069a4f22b2c6a5ce7c` antes da alteração.
- `server/index.js` agora importa `estimateRunCosts` e acrescenta `costEstimate` ao resultado de `POST /api/runs` somente quando `STUDIO_PRICE_BOOK_JSON` estiver configurado no servidor.
- Formato: objeto JSON cujas chaves são `JSON.stringify([provider, model])`; valores contêm `currency`, `inputPerMillion`, `outputPerMillion`. Exemplo: `{"[\"openai\",\"modelo-a\"]":{"currency":"USD","inputPerMillion":1,"outputPerMillion":2}}`. Valores ilustrativos, **não tarifas oficiais**.
- JSON inválido ou valor raiz que não seja objeto bloqueia a inicialização. Tarifas ausentes e uso parcial continuam sem total monetário completo, conforme `run-costs.js`.
- Commit de implementação: `dc420bf`. **Sem testes executados ou CI confirmada nesta execução.** Não afirmar deploy nem custos faturados.
- Próximo: teste HTTP com variável de ambiente, validação de configurações por modelo, exibição Organic de custos e execução da suíte completa Node 22+.
- Sincronização Google Drive, desktop e APK continuam pendentes.
