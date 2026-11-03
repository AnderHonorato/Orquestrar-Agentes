# Implantação do Organic Studio

## Vercel (prévia web sem serviço persistente)
O diretório web é publicado como site estático. As funções api/health, api/providers, api/history e api/runs executam isoladamente na Vercel. A autenticação é obrigatória para histórico e execução.

Defina variáveis privadas no painel do projeto:
- STUDIO_ACCESS_TOKEN: senha longa e aleatória com 16+ caracteres.
- OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY ou OPENROUTER_API_KEY, se quiser habilitar um provedor.

As funções não têm armazenamento persistente. O histórico do navegador é apenas temporário na sessão atual; não representa memória de agentes de longa duração. Ollama local em 127.0.0.1 não funciona em nuvem sem endpoint remoto e rede confiável. Não configure as chaves no JavaScript público, nem no repositório. Sem token o site continua exibindo apenas a interface e a biblioteca.

## Servidor Node contínuo (Railway ou VPS)
Execute npm start; Node 22+. Bind HOST=0.0.0.0, PORT da plataforma. Monte um volume em DATA_DIR para persistir histórico. Configure as mesmas credenciais. Healthcheck GET /api/health. A proteção do app é por token; para múltiplos usuários serão necessários contas, permissões e políticas adicionais.

## Avisos
O projeto ainda não importou código do Open Duet. Ferramentas do laboratório são referências, não capacidades executáveis. A branch de desenvolvimento não deve ser promovida automaticamente para main.
