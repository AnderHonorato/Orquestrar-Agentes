# Teste e persistência das aprovações

## Servidor Node
O módulo server/approval-service.js carrega um snapshot íntegro antes de abrir o servidor, serializa as mutações em uma fila e grava primeiro no disco. Uma proposta ou revisão só fica visível após a gravação atômica ter sido concluída. Falhas de I/O retornam 503 e não aprovam o pedido. O registro permanece **sem execução automática** de ações.

DATA_DIR deve apontar para volume persistente, com permissão restrita. A implementação é adequada a UMA instância de Node; múltiplos processos/replicas e escrita NFS compartilhada requerem transações em banco real, não apenas fila local.

A integridade por SHA-256 detecta corrupção e alterações parciais, mas não protege contra um atacante que consiga substituir todo o snapshot e recomputar os hashes. Para maior segurança, usar assinaturas/HMAC e gestão de chaves fora do volume.

## GitHub Actions (servidor Ubuntu)
A cada push na branch ander-flow/organic-orchestrator, o workflow .github/workflows/ci.yml roda npm test com Node 22. tests/approval-service.test.js cobre reinício, 12 mutações concorrentes, falha de gravação, adulteração e limites. tests/approvals-http.test.js testa autenticação, revisão e auditoria HTTP em uma porta real do runner.

## Vercel
A implantação Vercel serve a interface Organic e os endpoints serverless. Sem banco externo, a UI de aprovações recebe erro explícito 501 (somente após autenticação), e não simula operações duráveis. Não deixar o usuário acreditar que aprovação funcionou quando nada foi salvo. Health e providers funcionam mesmo sem credenciais de provedores.

## Bloqueios atuais
- STUDIO_ACCESS_TOKEN e chaves de IA não configuradas no Vercel.
- Vercel não fornece armazenamento persistente por filesystem; Railway recusou novo projeto porque o trial expirou.
- Sem controles de acesso multiusuário ou agentes com ferramentas de execução.
- Sem builds APK e instalador PC testados.
