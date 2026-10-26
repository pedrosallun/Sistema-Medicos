# Elo no Railway

## Implantação

- Workspace: **thiagomagha's Projects** (`98721d4d-f350-4504-8a39-81f7d75619e8`).
- Projeto novo: **elo-preconsulta** (`5fbf1377-fb6f-42ad-9e40-70be6fb1d825`).
- Ambiente: **production** (`80d527f3-1882-4e76-a16e-dd87d7669dc1`).
- Aplicação: **elo-web** (`0f95e80c-576c-436c-b3c6-9438d0780c93`).
- Banco: **Postgres** (`89e7b2c6-746d-4b68-a10e-701a1b0593d0`), criado pelo template oficial PostgreSQL do Railway, com volume persistente.
- Site: https://elo-web-production-30c7.up.railway.app
- Dashboard: https://railway.com/project/5fbf1377-fb6f-42ad-9e40-70be6fb1d825
- Fonte: `pedrosallun/Sistema-Medicos`, branch `main`.

Não criar outro projeto para atualizar esta instalação. O serviço foi conectado diretamente ao GitHub. Alterações na branch configurada podem disparar novos deploys. O `Dockerfile` usa Node 22, e `railway.json` define o health check `/api/health`.

## Acesso e configuração

Consulte **Variables** do serviço **elo-web** para o login inicial: `ADMIN_EMAIL` e `ADMIN_PASSWORD`. A senha foi gerada aleatoriamente e não consta no repositório. Não a exponha em issues ou logs.

Configuração existente:

- `NODE_ENV=production`;
- `DATABASE_URL`: referência a `${{Postgres.DATABASE_URL}}`, pela rede privada;
- `PORT=3000`, alinhada à porta de destino do domínio;
- `DATA_ENCRYPTION_KEY`: chave aleatória de 32 bytes, em hexadecimal;
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: criação do administrador inicial;
- `ENABLE_AI=false`: nenhuma chamada externa de IA habilitada.

Não altere a chave de criptografia de um banco existente sem migração: os dados gravados dependem dela. Alterar `ADMIN_PASSWORD` em Variables não troca a senha do usuário já criado no banco. Recuperação e troca de senha pela interface permanecem como evolução pendente.

## Validação

O Railway concluiu o build Docker e os deploys da aplicação e do PostgreSQL. O teste pela URL pública confirmou:

- HTTPS e `/api/health` com banco acessível;
- bloqueio de consulta clínica anônima;
- login administrativo com cookie Secure;
- cadastro e geração do link individual;
- questionário com oito perguntas, envio e cálculo de perfil;
- preservação da preferência de não receber contato;
- bloqueio da reutilização do link;
- acompanhamento interno e auditoria.

A aplicação foi reiniciada, e o teste confirmou a persistência e a leitura das respostas criptografadas e do acompanhamento. O registro fictício foi excluído ao final, e a sessão de teste foi encerrada. Não foram cadastrados pacientes reais.

## Manutenção

Acompanhe cada deploy até `SUCCESS`; upload ou início de build não prova prontidão. Em caso de falha, consulte os logs do serviço sem imprimir valores de variáveis. O resumo estruturado funciona sem OpenAI; ativação opcional e limitações estão no README. WhatsApp não está integrado.

Antes de uso clínico real, finalize as definições de privacidade e retenção descritas no README, valide o questionário e configure/teste backups e restauração do PostgreSQL com guarda separada da chave.

## Autenticação de operação

A CLI oficial utiliza `https://backboard.railway.com/graphql/v2`. `RAILWAY_API_TOKEN` usa `Authorization: Bearer`; `RAILWAY_TOKEN` usa `Project-Access-Token` para tokens de projeto. O token de conta fornecido posteriormente autenticou e permitiu criar os recursos acima. Nenhum token de Railway foi salvo no código ou nas variáveis da aplicação.

`whoami` sozinho não valida tokens restritos a workspace. Para esses tokens, consulte `apiToken { workspaces { id name } }`. Preserve o acesso ao workspace correto ao operar a instalação.

Fontes oficiais: https://docs.railway.com/integrations/api e https://github.com/railwayapp/cli.
