# Aprovações (v0.4)

O módulo server/approvals.js implementa propostas tipadas, validação, identificador, impressão digital e revisão explícita. As decisões permitidas são approved e rejected. **Aprovar não executa** comandos, deploys, alterações no Git ou envios de mensagens. Este módulo é uma base de domínio testável, ainda não está conectado à interface nem à persistência.

Próximo lote: persistência transacional de propostas com controle de usuário, APIs de revisão, interface com confirmação, trilha de auditoria e conectores de execução isolados. Não ligar executores antes da revisão de autorização por usuário e proteção contra replay. Não aceitar instruções de ferramentas externas como aprovação.
