# Publicação no Railway

## Estado verificado

O código foi enviado ao GitHub, branch `main`. Não houve criação de projeto, serviço ou banco no Railway.

Em 26/10/2026, a investigação usou a CLI oficial `5.71.0`, seu código-fonte público e a documentação oficial de autenticação. A CLI atual usa **`https://backboard.railway.com/graphql/v2`**. O domínio `.app` usado inicialmente é um endpoint anterior; o endpoint atual também foi testado.

Resultados com a credencial recebida, sem registrá-la no repositório:

| Verificação | Resultado |
| --- | --- |
| `RAILWAY_API_TOKEN` + `railway whoami --json` | Unauthorized |
| `RAILWAY_TOKEN` + `railway status --json` | Invalid RAILWAY_TOKEN |
| Bearer + `apiToken { workspaces { id name } }` | Not Authorized |
| Cabeçalho Project-Access-Token + `projectToken` | Project Token not found / CLI Invalid RAILWAY_TOKEN |

`whoami` sozinho não determina validade de tokens restritos a workspace: a consulta `me` é de conta pessoal. Por isso foi consultado também `apiToken`, que identifica o contexto de tokens de conta/workspace. Esse teste também foi recusado. Não é possível identificar o workspace ou criar recursos com os acessos observados.

A próxima informação útil é a tela de origem da chave (token de conta/workspace, token de projeto ou identificador) e o link/ID do workspace do Thiago. Não enviar valores de segredos em commits ou issues. Se uma nova credencial for necessária, fornecê-la por configuração segura.

## Fluxo quando a autenticação estiver resolvida

1. Validar o token de conta/workspace no endpoint atual e confirmar o ID do workspace.
2. Criar **um projeto novo**, sem reutilizar nem alterar outros projetos do Thiago.
3. Adicionar o PostgreSQL oficial pelo catálogo do Railway.
4. Adicionar um serviço conectado a `pedrosallun/Sistema-Medicos`, branch `main`. O repositório já fornece `Dockerfile` e `railway.json`.
5. Configurar `DATABASE_URL` com referência à rede privada do PostgreSQL, `NODE_ENV=production`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `DATA_ENCRYPTION_KEY`, conforme o README. Não incluir credenciais no código. Guardar senha e chave no cofre/configurações do Railway. OpenAI é opcional e não bloqueia esse deploy.
6. Publicar, acompanhar o build até concluir e gerar domínio HTTPS para o serviço da aplicação.
7. Validar `/api/health`, login com cookie Secure e a jornada completa com dados fictícios. Confirmar também a persistência após reinício do serviço.

A CLI oferece `railway init --name elo-preconsulta --workspace <ID> --json` para criação e `railway up --detach --json` para upload local. Também permite conectar a fonte GitHub com `railway service source connect --repo pedrosallun/Sistema-Medicos --branch main --service <SERVICO>`. Não executar criação novamente sem checar o resultado da tentativa anterior: isso evita projetos duplicados.

## Fontes oficiais consultadas

- https://docs.railway.com/integrations/api
- https://github.com/railwayapp/cli/blob/master/src/client.rs
- https://github.com/railwayapp/cli/blob/master/src/config.rs

Esses arquivos documentam a separação: `RAILWAY_API_TOKEN` usa `Authorization: Bearer`; `RAILWAY_TOKEN` usa `Project-Access-Token`. Um token limitado a um projeto existente não autoriza, por si só, criar um projeto novo em outro workspace.
