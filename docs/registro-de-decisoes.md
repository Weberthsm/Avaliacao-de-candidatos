# Registro de Decisões (ADR)

Decisões de arquitetura e de produto do Software de Processo Avaliativo, em ordem cronológica. Cada decisão segue o formato: **Contexto → Decisão → Consequências**.

Data de referência do registro: **2026-06-28** (todas as decisões abaixo foram tomadas durante a fase de planejamento e construção da API).

---

## ADR-001 — Domínio do sistema: Processo Avaliativo
**Status:** Aceita

**Contexto:** O contexto inicial do frontend mencionava uma "API de gestão de compras pessoais de supermercado", e havia um `swagger.yaml` na pasta que era apenas o HTML estático do Swagger UI. Ambos eram resíduos de um template de outro projeto.

**Decisão:** O domínio do sistema é **Processo Avaliativo** — avaliadores aplicam avaliações (questões abertas e fechadas) a avaliados. A menção a supermercado foi descartada como engano.

**Consequências:** Todo o projeto (user stories, API, futuro frontend) é construído sobre o domínio de avaliação. Qualquer artefato que cite "compras/supermercado" deve ser ignorado.

---

## ADR-002 — Metodologia de escrita das user stories
**Status:** Aceita

**Contexto:** As funcionalidades precisavam ser capturadas de forma orientada a negócio, testável e revisável.

**Decisão:** Adotar a [Metodologia de User Stories](../METODOLOGIA-user-stories.md): narrativa **Como / Quero / Para que**, **Regras de Negócio numeradas** (`RN-NN.M`) e **critérios de aceitação em Gherkin declarativo**, seguindo INVEST.

**Consequências:**
- Papéis devem ser humanos de negócio (proibido "sistema" como ator).
- Sem vocabulário técnico nas histórias (sem JWT, hash, HTTP 4xx, tabela, etc.).
- Cada RN deve poder virar ao menos um cenário de teste.
- O time de QA usa os cenários Gherkin como base para os casos de teste.

---

## ADR-003 — Modelo de atores
**Status:** Aceita

**Contexto:** O levantamento inicial previa apenas "avaliador" e "avaliado". Mas a US-03 (cadastro de usuários) precisa de alguém que cadastre os demais.

**Decisão:** Três papéis: **Administrador** (cadastra usuários), **Avaliador** (cria perguntas/processos, corrige, aprova) e **Avaliado** (responde avaliações).

**Consequências:** Um perfil `ADMIN` foi adicionado ao modelo. O primeiro administrador é criado via seed (ver ADR-019). Cada usuário tem um único papel.

---

## ADR-004 — Stack tecnológica
**Status:** Aceita

**Contexto:** Requisito explícito do solicitante para a API.

**Decisão:** **NestJS** (framework) + **TypeScript** + **Prisma** (ORM) + **PostgreSQL** (banco) + **Swagger/OpenAPI** (documentação) + **class-validator** (validação). Autenticação com **JWT**.

**Consequências:** Estrutura modular do Nest, schema declarativo no Prisma, documentação gerada por decorators. Versões fixadas no `package.json`.

---

## ADR-005 — Entrega em fases (API antes do frontend)
**Status:** Aceita

**Contexto:** São 35 user stories; construir API + frontend de uma vez seria volumoso e arriscado para a qualidade.

**Decisão:** **Fase 1 = API completa** (NestJS + Prisma + Swagger + seed). **Fase 2 = Frontend** (Vue 3 + Tailwind).

**Consequências:** A API é entregue e validada de ponta a ponta antes de iniciar o frontend. Itens puramente de interface ficam para a Fase 2 (ver ADR-021).

**Atualização (2026-06-28):** Fase 1 e **Fase 2 concluídas**. O frontend (Vite + Vue 3 + Tailwind + Pinia + Vue Router + Axios) está em `web/`, com build e type-check limpos, e foi verificado em navegador real: login do admin → token persistido → rota por perfil → tabela de usuários carregada da API.

---

## ADR-006 — Funcionalidades de tempo real via polling
**Status:** Aceita

**Contexto:** US-12 (tempo extra "sem recarregar a página"), US-18 (timer) e US-33/US-34 (avisos) sugerem atualização em tempo real.

**Decisão:** Implementar tempo real por **polling REST** (o frontend consulta a API periodicamente), e não por WebSocket.

**Consequências:**
- O timer é calculado no servidor (a partir do início) e exibido pelo frontend.
- Tempo extra e notificações são lidos por consultas periódicas.
- O envio automático ao esgotar o tempo é resolvido de forma preguiçosa (ver ADR-015).
- Pode haver pequeno atraso entre o evento e a atualização na tela — aceitável para o caso de uso.

---

## ADR-007 — Autenticação como middleware; autorização por guard
**Status:** Aceita

**Contexto:** Requisito explícito: "a autenticação deve ser parte do Middleware, utilizando token JWT".

**Decisão:** A **autenticação** é um `AuthMiddleware` aplicado a todas as rotas exceto as públicas (login, refresh, health, docs) — valida o JWT e anexa o usuário à requisição. A **autorização por perfil** é feita por um `RolesGuard` global, ativado pelo decorator `@Roles()`.

**Consequências:** Rotas públicas são declaradas por exclusão no middleware. Erros de autenticação retornam 401; de autorização, 403.

---

## ADR-008 — Localização e organização do projeto
**Status:** Aceita

**Contexto:** Definir onde o código vive e como se organiza para escalar.

**Decisão:** Raiz em `C:\Projetos\Avaliacao`. A API em `api/`, organizada de forma **modular por domínio** (auth, users, questions, processes, attempts, answers, scoring, notifications). O frontend virá em pasta própria na Fase 2.

**Consequências:** Cada módulo isola controller, service e DTOs. Facilita testes e crescimento. Os `.md` de planejamento ficam na raiz.

---

## ADR-009 — Modelo de pontuação
**Status:** Aceita

**Contexto:** O sistema mistura questões abertas e fechadas; era preciso definir como pontuar.

**Decisão:**
- Cada pergunta tem um **peso** em pontos (podem ser diferentes entre questões).
- **Fechada:** correção automática, tudo-ou-nada (acerto = peso, erro = 0; sem pontuação parcial).
- **Aberta:** correção manual, de 0 até o peso da questão.
- **Resultado parcial** (só fechadas) fica disponível assim que a avaliação é enviada.
- **Resultado total** só é consolidado quando todas as abertas forem corrigidas.
- **Percentual** = pontos obtidos ÷ soma dos pesos × 100.

**Consequências:** Enquanto há abertas pendentes, o sistema mostra o parcial e quantas faltam corrigir. A aprovação automática (ADR-010) só dispara após o total.

---

## ADR-010 — Modos de aprovação
**Status:** Aceita

**Contexto:** O solicitante pediu marcação manual e automática de aprovação.

**Decisão:** O processo define o modo: **automático**, **manual** ou **ambos**. No automático, aprova/reprova comparando o percentual com a nota mínima. No manual, o avaliador decide. **A decisão manual sempre prevalece** sobre a automática (controlada por um indicador de "aprovado manualmente").

**Consequências:** Uma correção automática posterior não sobrescreve uma decisão manual já tomada.

---

## ADR-011 — Pergunta fechada com resposta única
**Status:** Aceita (decisão de refinamento adotada)

**Contexto:** Pergunta de refinamento em aberto: questões fechadas teriam uma ou múltiplas respostas corretas?

**Decisão:** Por ora, questões fechadas têm **exatamente uma** alternativa correta. Mínimo de 2 alternativas, apenas 1 marcada como correta.

**Consequências:** Correção automática simples (compara a escolha com o gabarito único). Suporte a múltipla escolha fica como pendência (ver pendências).

---

## ADR-012 — Tentativa única por candidato
**Status:** Aceita

**Contexto:** Definir se o candidato pode refazer a avaliação.

**Decisão:** **Uma única tentativa** por candidato por processo. Não é possível reiniciar; ao reabrir, o candidato **retoma de onde parou** (dentro do tempo).

**Consequências:** Restrição de unicidade no modelo. Reentrada após queda restaura as respostas salvas (auto-save). Múltiplas tentativas ficam como pendência.

---

## ADR-013 — Exibição de gabarito configurável
**Status:** Aceita

**Contexto:** O candidato deveria ver as respostas corretas das fechadas após a correção?

**Decisão:** É uma **opção por processo** (`exibirGabarito`). Quando ligada, o candidato vê a alternativa correta das fechadas no resultado; quando desligada, não.

**Consequências:** Durante a prova o gabarito **nunca** é exposto (as alternativas vão sem indicar a correta), independentemente dessa configuração.

---

## ADR-014 — Arquivamento de perguntas e bloqueio de edição em uso
**Status:** Parte do arquivamento substituída pelo ADR-024 (a edição em uso permanece)

**Contexto:** Perguntas reutilizáveis precisam ser mantidas sem corromper avaliações já aplicadas.

**Decisão:** Perguntas são **arquivadas** (soft delete), preservando o histórico — não são apagadas. Perguntas **vinculadas a um processo ativo não podem ser editadas**. Arquivadas não entram em novos processos.

**Consequências:** Integridade das respostas já dadas é protegida. Para "alterar" uma pergunta em uso, cria-se uma nova.

---

## ADR-015 — Envio automático preguiçoso na expiração
**Status:** Aceita

**Contexto:** Com a abordagem de polling (ADR-006), não há um agendador rodando em segundo plano para encerrar provas no exato instante do fim do tempo.

**Decisão:** O envio automático (US-20) é **preguiçoso**: ao acessar/responder uma tentativa cujo tempo já expirou, o sistema a finaliza automaticamente, registrando o término no momento do prazo e corrigindo as fechadas.

**Consequências:** O cálculo do tempo é sempre confiável (feito a partir do início no servidor). Limitação: uma tentativa totalmente abandonada permanece "em andamento" no banco até alguém acessá-la. Caso vire requisito encerrar no instante exato, adiciona-se um agendador depois.

---

## ADR-016 — US-35: Continuidade da sessão durante a prova
**Status:** Aceita

**Contexto:** Identificou-se um risco: a regra de expiração de sessão por inatividade (RN-01.4) poderia desconectar o candidato no meio da prova (ex.: lendo/pensando numa questão dissertativa), e como a tentativa é única, o prejuízo seria grave.

**Decisão:** Criada a **US-35 — Continuidade da sessão durante a avaliação**, e a RN-01.4 foi reescopada: a expiração por inatividade vale **fora** da prova; **durante** a prova, quem governa o encerramento é o cronômetro. A US-35 ficou posicionada no Epic 4 (e assim permanece, por decisão do solicitante).

**Consequências:** O cronômetro da prova passa a ser conceitualmente independente da sessão. A implementação da estratégia de sessão está no ADR-017.

---

## ADR-017 — Estratégia de token: sessão deslizante (Opção A)
**Status:** Aceita (API e frontend concluídos em 2026-06-28)

**Contexto:** O token de acesso estava fixado em 30 minutos, menor que a duração possível de uma prova (60–90 min). Isso desconectaria o candidato no meio da avaliação, violando a US-35.

**Decisão:** Adotar **sessão deslizante** com cronômetro desacoplado do token:
1. O middleware **renova o token a cada requisição válida** (reinicia o relógio de inatividade) e devolve o token novo.
2. O frontend mantém a sessão viva durante leitura/reflexão com um **heartbeat** periódico.
3. Em caso de expiração real (queda/abandono), o frontend usa o **refresh token** para renovar a sessão **sem novo login** e o candidato **retoma de onde parou**.
4. O **cronômetro nunca depende do token**: se o tempo acabar durante uma interrupção, a prova é enviada automaticamente (ADR-015 / US-20).

**Consequências:** Expirar o token nunca encerra a prova cedo — no pior caso há reautenticação silenciosa. A renovação deslizante é implementada na API; heartbeat e refresh silencioso são do frontend (Fase 2).

**Implementação na API (concluída em 2026-06-28):**
- O `AuthMiddleware` re-emite o token a cada requisição autenticada e o devolve no header `X-Renewed-Token` (constante `RENEWED_TOKEN_HEADER`).
- O header é exposto via CORS (`exposedHeaders: ['X-Renewed-Token']`) para o frontend conseguir lê-lo.
- `JWT_EXPIRES_IN` passa a representar a **janela de inatividade** (padrão 30 min), reiniciada a cada requisição.
- Rotas públicas (login, refresh, health, docs) não emitem o header.
- Verificado ao vivo: o token renovado é um JWT válido, funciona nas requisições seguintes, e o `exp` desliza para frente a cada chamada.

**Implementação no frontend (concluída em 2026-06-28):** o `http.ts` lê o `X-Renewed-Token` e substitui o token guardado a cada resposta; a `ExamView` envia heartbeat a cada 30s durante a prova (renova a sessão e ressincroniza o tempo, inclusive tempo extra); o interceptor de resposta intercepta `401`, renova via refresh token de forma silenciosa e repete a requisição, deslogando apenas se o refresh falhar.

---

## ADR-018 — Documentação Swagger em arquivo + endpoint; erro padronizado
**Status:** Aceita

**Contexto:** Requisito: documentar a API com Swagger em forma de arquivo numa pasta de recursos, descrevendo o modelo JSON de resposta e os status codes de erro, além de um endpoint que renderize o Swagger.

**Decisão:** A especificação OpenAPI é **gerada no boot** em `api/resources/swagger.json` e `swagger.yaml`. O endpoint **`/docs`** renderiza o Swagger UI; `/docs-json` serve a especificação. Toda resposta de erro tem corpo padronizado (`statusCode`, `error`, `message`, `timestamp`, `path`).

**Consequências:** A documentação acompanha o código (gerada por decorators). Os status codes de erro de cada operação estão descritos.

---

## ADR-019 — Usuário administrador inicial via seed
**Status:** Aceita

**Contexto:** Ninguém cadastra o primeiro administrador (a US-03 pressupõe um admin já existente).

**Decisão:** Um **seed** cria o administrador inicial a partir de variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.).

**Consequências:** Admin padrão: `admin@avaliacao.local` / `Admin@123`. Recomenda-se trocar a senha após o primeiro acesso (forçar a troca é uma pendência).

---

## ADR-020 — Normalização da saída de build
**Status:** Aceita

**Contexto:** Como `prisma/seed.ts` fica fora de `src`, o build gerava `dist/src/main.js` em vez de `dist/main.js`, quebrando `start:prod`.

**Decisão:** Criar `tsconfig.build.json` que exclui `prisma` (e `test`, `dist`, specs) do build.

**Consequências:** A saída do build volta a ser `dist/main.js`. O seed roda via `ts-node`, sem precisar ser compilado no build da aplicação.

---

## ADR-021 — Itens deferidos ao frontend
**Status:** Aceita

**Contexto:** Algumas histórias têm parte ou totalidade no comportamento de interface.

**Decisão:** Ficam para a Fase 2 (frontend):
- **US-22** (bloquear copiar/colar) — totalmente de interface.
- **US-21** — o *registro* da saída de aba está na API; a *detecção* é do frontend.
- **US-19 RN-19.1** — a tela de confirmação de envio é do frontend (o endpoint de envio já existe).
- Heartbeat e refresh silencioso da sessão (ADR-017).

**Consequências:** Esses pontos não bloqueiam a entrega da API; serão cobertos no frontend.

**Atualização (2026-06-28) — todos implementados no frontend:**
- US-22: a `ExamView` bloqueia `copy`/`paste`/`cut`/`contextmenu` em toda a área da prova.
- US-21: detecção via `visibilitychange`, chamando o endpoint de registro sem pausar o tempo.
- US-19 RN-19.1: tela de confirmação antes do envio definitivo.

---

## ADR-022 — Ambiente de banco de dados
**Status:** Aceita

**Contexto:** Necessário um PostgreSQL para rodar a API.

**Decisão:** Usar PostgreSQL local na porta 5432 (banco `avaliacao`, usuário `avaliacao`). Há um `docker-compose.yml` como alternativa para quem usa Docker.

**Consequências:** Na máquina atual, o banco e o usuário foram criados, a migration inicial aplicada e o admin semeado. Dados de teste foram inseridos durante a verificação (usuários e processos de exemplo).

---

## ADR-023 — Visibilidade dos vínculos do processo (candidatos e perguntas)
**Status:** Aceita (2026-06-28)

**Contexto:** Após adicionar candidatos/perguntas a um processo, não havia como ver *quem/o que* já estava vinculado — a API só expunha contagens. Além disso, o painel de acompanhamento (US-31) listava apenas candidatos que já tinham iniciado a avaliação, deixando invisíveis os vinculados que ainda não começaram.

**Decisão:**
- Adicionados os endpoints `GET /processes/:id/candidates` e `GET /processes/:id/questions`, que listam os vínculos do processo.
- O painel de acompanhamento passa a listar **todos os candidatos vinculados**, exibindo "Não iniciou" para quem ainda não começou.
- No frontend, a tela de montagem mostra a seção "No processo" e oculta da seleção o que já foi adicionado (evitando o erro de duplicidade).

**Consequências:** Mudança de comportamento da US-31 (antes só tentativas iniciadas). As histórias US-09 (RN-09.5), US-10 (RN-10.4) e US-31 (RN-31.1/31.2) foram atualizadas no README. Verificado ao vivo no navegador (rascunho e processo publicado).

---

## ADR-024 — Excluir perguntas (substitui o arquivamento) e visualizar detalhes
**Status:** Aceita (2026-06-29) — substitui a parte de arquivamento do ADR-014

**Contexto:** O avaliador não conseguia ver os detalhes de uma pergunta já cadastrada (alternativas das fechadas, instruções das abertas), e a ação disponível era apenas "arquivar" (soft delete), pouco intuitiva. O pedido foi: poder visualizar os detalhes e poder excluir perguntas que ainda não foram usadas.

**Decisão:**
- A ação de **arquivar** (soft delete via `ativa = false`) é substituída por **excluir** (hard delete). A exclusão só é permitida quando a pergunta **não está vinculada a nenhuma avaliação** (processo); caso contrário, é impedida com mensagem clara.
- O `DELETE /questions/:id` passa a excluir definitivamente (alternativas em cascata), com a trava de vínculo.
- O avaliador pode **visualizar os detalhes** de cada pergunta na listagem (alternativas com a correta destacada, nas fechadas; instruções, nas abertas) — os dados já vinham na listagem, faltava a interface.

**Consequências:** US-06 (RN-06.4 passa a tratar de visualização de detalhes) e US-07 (vira "Editar e excluir") atualizadas; o cenário de "pergunta arquivada" foi removido da US-06 e da US-09. O campo `ativa` segue no modelo, porém dormente. Verificado ao vivo (excluir bloqueado para vinculada; excluir e detalhes funcionando).

**Complemento (2026-06-29) — edição alinhada à mesma trava:** a edição de pergunta (US-07) passou a usar a **mesma regra da exclusão** — antes era bloqueada apenas para processo *ativo*; agora é bloqueada para **qualquer** vínculo a avaliação. Editar e excluir ficaram simétricos (RN-07.1). No frontend, o banco de perguntas ganhou os botões **Detalhes**, **Editar** (reaproveita o formulário em modo de edição) e **Excluir**. Verificado ao vivo: edição de pergunta livre salva; edição de pergunta vinculada é bloqueada com mensagem.
