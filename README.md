# Elo — Pré-consulta de Ortopedia

MVP da especificação da Clínica de Ortopedia (Raíssa e Glauber). Aplicação Node.js com interface responsiva em português e PostgreSQL em produção. O serviço clínico não contém credenciais padrão. Há um modo de demonstração isolado, com dados fictícios e acesso público de teste.

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

A aplicação usa um resumo determinístico e o identifica assim na interface. **Claude (Anthropic) é uma integração opcional, ainda sem validação ao vivo por falta de credencial.** WhatsApp não está integrado. Na configuração padrão, não envia informações a esses fornecedores. O teste das cores é uma versão inicial experimental criada para o MVP; não é instrumento validado nem diagnóstico. Precisa de validação da clínica antes de implantação assistencial.

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

O código está publicado em [pedrosallun/Sistema-Medicos](https://github.com/pedrosallun/Sistema-Medicos), branch `main`. A aplicação foi publicada no projeto **elo-preconsulta**, no workspace **thiagomagha's Projects**.

- Aplicação: https://elo-web-production-30c7.up.railway.app
- Projeto: https://railway.com/project/5fbf1377-fb6f-42ad-9e40-70be6fb1d825
- Login administrativo: consulte `ADMIN_EMAIL` e `ADMIN_PASSWORD` em Variables do serviço `elo-web`.

Consulte `docs/railway.md` para o estado da implantação e os passos de manutenção.

Para reproduzir em outro projeto:

1. Autenticar com uma credencial de conta/workspace capaz de **criar projetos** no workspace do Thiago. Token limitado a um projeto existente não atende esse objetivo. Confirmar o workspace pelo ID, não apenas pelo nome.
2. Criar um projeto novo, por exemplo `elo-preconsulta`, nesse workspace, e adicionar PostgreSQL.
3. Criar o serviço da aplicação com este diretório como fonte. O `Dockerfile` e `railway.json` estão prontos. A publicação pode usar a CLI (`railway init` no workspace correto, vínculo do serviço e `railway up`) ou uma conexão GitHub após envio do código.
4. Configurar no serviço da aplicação:
   - `NODE_ENV=production`;
   - `DATABASE_URL`: referência Railway para o PostgreSQL pela rede privada, por exemplo `${{Postgres.DATABASE_URL}}` (ajustar nome do serviço);
   - `ADMIN_EMAIL`: e-mail do primeiro administrador;
   - `ADMIN_PASSWORD`: senha exclusiva com pelo menos 12 caracteres;
   - `DATA_ENCRYPTION_KEY`: 32 bytes aleatórios em hexadecimal (64 caracteres). Gerar e guardar em cofre seguro; não publicar no repositório;
   - `PORT=3000`: alinhado à porta de destino do domínio público.
5. Gerar domínio HTTPS, verificar `/api/health`, entrar com o administrador e repetir o fluxo com paciente fictício. O cookie de sessão é Secure em produção e exige HTTPS.
6. Habilitar backups do PostgreSQL e guardar a chave separadamente. Testar restauração antes de dados reais. Não utilizar volume SQLite em produção.

O PostgreSQL usa a rede privada do Railway. Não desabilite a verificação TLS para conexões externas; use configuração de confiança apropriada se trocar a origem do banco. O Dockerfile não inclui arquivos `.env`, `.data`, testes ou credenciais. Não existe processo de build frontend: os assets são servidos diretamente com política CSP restritiva.

## Privacidade e escopo pendente

É uma implementação técnica inicial, não uma declaração de conformidade LGPD. Antes de pacientes reais, a clínica deve definir controlador/canal de direitos, bases legais, política de retenção, fornecedores e contratos, permissões de cada profissional e validar o questionário. Hoje a retenção é até exclusão administrativa; não há expurgo programado. O aviso informa essa limitação. O registro de exclusão permanece sem as respostas clínicas na auditoria.

Permanecem para as fases seguintes: ativação e validação ao vivo do Claude, WhatsApp Business, lembretes automáticos, edição/versionamento de perguntas pelo administrador, templates configuráveis, recuperação/troca/revogação de usuários, integração de agenda, NPS, comparecimento e relatórios avançados. O painel só apresenta indicadores que os dados atuais permitem calcular. Os históricos de resposta são preservados por pré-consulta; novos atendimentos geram novos registros, sem sobrescrever o anterior.

## Claude (Anthropic) opcional

No Railway, abra o projeto **elo-preconsulta** → serviço **elo-web** → **Variables** e adicione `ANTHROPIC_API_KEY` com sua chave da API Anthropic. Use uma chave criada no [console da Anthropic](https://console.anthropic.com/); a assinatura do aplicativo Claude é separada da API. Não coloque a chave no frontend, no GitHub ou no chat.

Configuração do backend:

```text
ANTHROPIC_API_KEY=<preencher somente nas variáveis seguras do Railway>
ENABLE_AI=true
AI_MODEL=claude-sonnet-4-6
```

Depois de salvar, aplique/deploy as alterações no Railway. O código só habilita IA quando `ENABLE_AI=true` e a chave existe. O serviço foi preparado com ativação e modelo acima; a chave ainda precisa ser informada pelo usuário. O painel oferece **Gerar rascunho com Claude** nos questionários elegíveis. É uma operação manual com revisão humana, sem geração de diagnósticos ou prescrições.

A integração usa a API Messages da Anthropic com ferramenta de saída estruturada, limites de tamanho, timeout e validação. A requisição omite os campos de identificação/agendamento. Textos abertos podem conter dados identificáveis e devem ser avaliados pela clínica. O fornecedor recebe relatos de saúde; avalie as bases legais e o contrato antes de ativar para pacientes reais.

O aviso do formulário identifica a Anthropic quando a integração está ativa. Questionários anteriores, sem o aviso desse fornecedor, permanecem bloqueados para IA. Colete uma nova pré-consulta com o aviso atualizado. Falhas da API preservam as respostas e o resumo estruturado. A integração foi testada com respostas simuladas; a validação real depende da chave e do crédito/permissão para o modelo na conta Anthropic.

## Resultado da validação nesta entrega

A suíte inicial de oito testes passou com SQLite e PostgreSQL local; a adaptação para Claude acrescenta testes de protocolo, saída inválida e aviso por fornecedor. O teste completo em Chromium passou, incluindo viewport móvel de 390 px. A auditoria npm não apontou vulnerabilidades conhecidas em dependências de produção. O Claude foi validado com fornecedor simulado, sem credencial real. O build Docker e o deploy Railway foram concluídos. O teste em produção confirmou HTTPS, saúde do banco, login e cookie Secure, bloqueio de acesso anônimo, cadastro, questionário, perfil, link de uso único, acompanhamento e auditoria.

Também foi confirmada a persistência das respostas e acompanhamentos após reinício da aplicação no Railway; o registro fictício foi removido ao final.

## Versão de demonstração

Demo pública: **https://elo-demo-production.up.railway.app**

O serviço separado `elo-demo` usa `DEMO_MODE=true` e banco SQLite exclusivamente em memória, mesmo que uma `DATABASE_URL` esteja presente. Ele não conecta ao PostgreSQL da clínica, usa chave de criptografia efêmera e não chama IA externa. Oito pacientes fictícios (seis pré-consultas concluídas, duas pendentes), perfis, objetivos, eventos e históricos são recriados a cada reinício. Não cadastre informações reais.

Acesso público solicitado: **teste@gmail.com** / **teste123**. Essas credenciais só são criadas no modo de demonstração. O serviço clínico mantém seu administrador e banco existentes. A interface mostra um aviso de demonstração. Alterações e sessões da demo são descartadas quando o processo reinicia.

Para testar localmente: `DEMO_MODE=true PORT=3001 node server.js`. Não ative esse modo no serviço clínico; ele inicia uma sessão de demonstração em memória, sem consultar os dados persistentes.
