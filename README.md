# Elo — Pré-consulta de Ortopedia

MVP da especificação da Clínica de Ortopedia (Raíssa e Glauber). Aplicação Node.js com interface responsiva em português e PostgreSQL em produção. Não contém pacientes de demonstração nem credenciais padrão de produção.

## O que está implementado

- Login da equipe, sessões de oito horas e papéis `admin`, `doctor` e `staff`.
- Cadastro manual de consultas com identificação, nascimento, contatos, data, horário e médico.
- Links individuais aleatórios e de uso único; gerar outro invalida o anterior.
- Formulário móvel em quatro etapas: clínica, objetivos/eventos, oito perguntas de comunicação e privacidade.
- Pontuação automática por cor, perfil predominante/secundário e empates explicitamente mistos.
- Painel com busca por nome/telefone, agenda ordenada, indicadores de preenchimento e eventos futuros.
- Relato original, resumo estruturado, recomendação de comunicação, eventos e histórico de acompanhamento.
- Rascunhos de relacionamento apenas para pacientes que autorizaram contato. Não envia mensagens.
- Recepção acessa agendamentos, mas não respostas clínicas ou acompanhamentos.
- Administração cadastra usuários, consulta auditoria e exclui registros mediante confirmação.
- Criptografia AES-256-GCM dos dados de pacientes, respostas e acompanhamentos. Senhas com bcrypt; tokens armazenados por hash. Proteção de origem nas mutações, cookies HttpOnly/SameSite, limitação de requisições e cabeçalhos de segurança.

A aplicação usa um resumo determinístico e o identifica assim na interface. **OpenAI é uma integração opcional, desativada por padrão e ainda sem validação ao vivo por falta de credencial.** WhatsApp não está integrado. Na configuração padrão, não envia informações a esses fornecedores. O teste das cores é uma versão inicial experimental criada para o MVP; não é instrumento validado nem diagnóstico. Precisa de validação da clínica antes de implantação assistencial.

## Desenvolvimento

Node.js 22.13+ (validado também com Node 24), npm.

```sh
cd /workspace/Sistema-Medicos
npm ci --cache /tmp/npm-cache
npm run dev
```

O helper cria um usuário local com senha aleatória em `.data/dev-access.json`. Leia esse arquivo localmente para entrar; ele é ignorado pelo Git. Não use o helper em produção. SQLite é usado exclusivamente no desenvolvimento, com chave local em `.data/key`. Guarde a chave com o banco: perdê-la torna os dados irrecuperáveis.

Alternativa com configuração própria: copie `.env.example` para `.env`, preencha os valores e execute `node --env-file=.env server.js`. O servidor não lê `.env` automaticamente. O Node gera o esquema na inicialização. `ADMIN_EMAIL` e `ADMIN_PASSWORD` são usados somente para criar o primeiro administrador em um banco vazio; alterar essas variáveis não troca a senha já registrada.

## Verificação

```sh
npm run check
npm test
npm run test:browser
npm audit --omit=dev --cache /tmp/npm-cache
```

O teste de navegador usa Chromium em `/usr/bin/chromium`; ajuste `playwright.config.js` para outra instalação. As suítes usam dados fictícios e bancos temporários. O teste de API cobre autenticação, preenchimento e validação, perfis, bloqueio de links reutilizados, permissões da recepção, auditoria, exclusão, proteção de origem e ausência de dados clínicos em texto puro no banco. O navegador percorre cadastro → formulário móvel → prontuário → acompanhamento e verifica erros de JavaScript e largura móvel.

## Railway — projeto novo no workspace do Thiago

O projeto remoto ainda **não foi criado**: a credencial fornecida foi recusada pela API do Railway, como token de conta e como token de projeto. Nenhuma publicação foi realizada.

Quando houver acesso válido:

1. Autenticar com uma credencial de conta/workspace capaz de **criar projetos** no workspace do Thiago. Token limitado a um projeto existente não atende esse objetivo. Confirmar o workspace pelo ID, não apenas pelo nome.
2. Criar um projeto novo, por exemplo `elo-preconsulta`, nesse workspace, e adicionar PostgreSQL.
3. Criar o serviço da aplicação com este diretório como fonte. O `Dockerfile` e `railway.json` estão prontos. A publicação pode usar a CLI (`railway init` no workspace correto, vínculo do serviço e `railway up`) ou uma conexão GitHub após envio do código.
4. Configurar no serviço da aplicação:
   - `NODE_ENV=production`;
   - `DATABASE_URL`: referência Railway para o PostgreSQL pela rede privada, por exemplo `${{Postgres.DATABASE_URL}}` (ajustar nome do serviço);
   - `ADMIN_EMAIL`: e-mail do primeiro administrador;
   - `ADMIN_PASSWORD`: senha exclusiva com pelo menos 12 caracteres;
   - `DATA_ENCRYPTION_KEY`: 32 bytes aleatórios em hexadecimal (64 caracteres). Gerar e guardar em cofre seguro; não publicar no repositório;
   - `PORT`: fornecido automaticamente pelo Railway.
5. Gerar domínio HTTPS, verificar `/api/health`, entrar com o administrador e repetir o fluxo com paciente fictício. O cookie de sessão é Secure em produção e exige HTTPS.
6. Habilitar backups do PostgreSQL e guardar a chave separadamente. Testar restauração antes de dados reais. Não utilizar volume SQLite em produção.

O PostgreSQL usa a rede privada do Railway. Não desabilite a verificação TLS para conexões externas; use configuração de confiança apropriada se trocar a origem do banco. O Dockerfile não inclui arquivos `.env`, `.data`, testes ou credenciais. Não existe processo de build frontend: os assets são servidos diretamente com política CSP restritiva.

## Privacidade e escopo pendente

É uma implementação técnica inicial, não uma declaração de conformidade LGPD. Antes de pacientes reais, a clínica deve definir controlador/canal de direitos, bases legais, política de retenção, fornecedores e contratos, permissões de cada profissional e validar o questionário. Hoje a retenção é até exclusão administrativa; não há expurgo programado. O aviso informa essa limitação. O registro de exclusão permanece sem as respostas clínicas na auditoria.

Permanecem para as fases seguintes: ativação e validação ao vivo da OpenAI, WhatsApp Business, lembretes automáticos, edição/versionamento de perguntas pelo administrador, templates configuráveis, recuperação/troca/revogação de usuários, integração de agenda, NPS, comparecimento e relatórios avançados. O painel só apresenta indicadores que os dados atuais permitem calcular. Os históricos de resposta são preservados por pré-consulta; novos atendimentos geram novos registros, sem sobrescrever o anterior.

## OpenAI opcional

Configure `AI_API_KEY` por canal seguro e `ENABLE_AI=true` somente após a clínica avaliar o fornecedor e as bases legais. Opcional: `AI_MODEL` (padrão `gpt-4.1-mini`). O painel oferece geração manual de rascunho para revisão humana. A requisição omite os campos de identificação/agendamento e pede para não incluir identificadores presentes no texto livre; textos abertos podem ainda conter dados identificáveis e devem ser avaliados pela clínica. O fornecedor recebe relatos de saúde. O aviso do formulário se ajusta à ativação. `store:false` solicita não persistir o resultado como objeto de chat; não equivale a um contrato de retenção zero. Falhas da API preservam o resumo estruturado. Não há chamadas de IA automáticas nem uso para diagnóstico ou prescrição.

## Resultado da validação nesta entrega

Oito testes de lógica/API passaram com SQLite e com PostgreSQL local. O teste completo em Chromium passou, incluindo viewport móvel de 390 px. A auditoria npm não apontou vulnerabilidades conhecidas em dependências de produção. A OpenAI foi validada com fornecedor simulado, sem credencial real. O deploy Docker/Railway não foi executado: a autenticação da conta foi recusada.
