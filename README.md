# Software de Processo Avaliativo

Plataforma web para conduzir processos avaliativos estruturados entre **avaliadores** e **avaliados**, com suporte a questões abertas e fechadas, controle de tempo, salvamento automático, correção mista (automática para fechadas, manual para abertas), pontuação calculada e feedback.

## Visão geral

O projeto nasceu de um refinamento orientado a negócio: as funcionalidades foram capturadas como **user stories** (neste arquivo), validadas contra a [Metodologia de User Stories](METODOLOGIA-user-stories.md) e então implementadas como uma **API REST**.

```
Avaliacao/
├── README.md                       # este arquivo — visão geral + user stories
├── METODOLOGIA-user-stories.md     # guia de escrita das histórias (INVEST + Gherkin)
└── api/                            # API REST (NestJS + Prisma + PostgreSQL)
    └── README.md                   # documentação técnica e instruções de execução
```

### Componentes

| Componente | Descrição | Status |
|---|---|---|
| **User Stories** | 35 histórias com regras de negócio e critérios de aceitação | ✅ Concluído |
| **API REST** | NestJS + Prisma + PostgreSQL + Swagger, em [`/api`](api/) | ✅ Fase 1 concluída |
| **Frontend Web** | Vue 3 + Tailwind (consome a API) | ⏳ Próxima fase |

### Como rodar a API

A API está em [`api/`](api/) com instruções completas no seu [README](api/README.md). Resumo:

```bash
cd api
cp .env.example .env
npm install
npx prisma migrate dev      # cria as tabelas no PostgreSQL
npm run prisma:seed         # cria o administrador inicial
npm run start:dev
```

Documentação interativa em `http://localhost:3000/docs`.

### Papéis e fluxo

- **Administrador** cadastra avaliadores e avaliados.
- **Avaliador** cria perguntas, monta processos, adiciona candidatos, corrige questões abertas e define aprovação.
- **Avaliado** responde às avaliações dentro do tempo, com salvamento automático, e acompanha seus resultados.

---

## User Stories

Histórias de usuário de todas as funcionalidades do sistema, escritas segundo a [Metodologia de User Stories](METODOLOGIA-user-stories.md): narrativa **Como / Quero / Para que**, **Regras de Negócio numeradas** (`RN-NN.M`) e **critérios de aceitação em Gherkin declarativo**.

**Papéis de negócio:**
- **Administrador** — responsável por cadastrar usuários e manter os acessos.
- **Avaliador** — cria e gerencia perguntas, processos e correções.
- **Avaliado (candidato)** — responde às avaliações.

---

## Epic 1 — Autenticação e Usuários

### US-01 — Acesso ao sistema
**Como** avaliador ou avaliado
**Quero** entrar no sistema com minhas credenciais
**Para que** eu acesse apenas as áreas e funções compatíveis com meu papel

**Regras de Negócio:**
- RN-01.1 — O acesso só é concedido a quem informa credenciais válidas previamente cadastradas.
- RN-01.2 — Após várias tentativas seguidas de acesso incorreto, o usuário é temporariamente impedido de tentar novamente.
- RN-01.3 — Ao entrar, o usuário é direcionado à área correspondente ao seu papel.
- RN-01.4 — Fora de uma avaliação em andamento, a sessão expira após um período de inatividade, exigindo novo acesso. Durante uma avaliação em andamento, vale a regra de continuidade descrita na US-35.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Acesso com credenciais válidas
  Dado que sou um usuário cadastrado
  Quando informo minhas credenciais corretas
  Então tenho acesso à minha área de trabalho

Cenário: Acesso com credenciais inválidas
  Quando informo credenciais incorretas
  Então o acesso é negado
  E vejo a mensagem "Credenciais inválidas"

Cenário: Bloqueio temporário por tentativas seguidas
  Dado que errei minhas credenciais cinco vezes seguidas
  Quando tento acessar novamente
  Então o acesso é temporariamente impedido
  E vejo a mensagem "Acesso bloqueado temporariamente. Tente mais tarde"

Cenário: Expiração da sessão por inatividade
  Dado que estou inativo há mais de 30 minutos
  Quando tento realizar uma ação
  Então sou solicitado a acessar o sistema novamente
```

### US-02 — Acessos distintos por papel
**Como** administrador
**Quero** que avaliadores e avaliados tenham acessos separados
**Para que** a integridade do processo avaliativo seja preservada

**Regras de Negócio:**
- RN-02.1 — O avaliado não pode criar perguntas, criar processos nem corrigir avaliações.
- RN-02.2 — O avaliador não pode responder avaliações como candidato.
- RN-02.3 — Qualquer tentativa de uso de uma função fora do papel é impedida.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Avaliado tenta acessar função de avaliador
  Dado que estou no papel de avaliado
  Quando tento criar um processo avaliativo
  Então a ação é impedida
  E vejo a mensagem "Você não tem permissão para esta ação"

Cenário: Avaliador tenta responder uma avaliação
  Dado que estou no papel de avaliador
  Quando tento iniciar uma avaliação como candidato
  Então a ação é impedida
  E vejo a mensagem "Você não tem permissão para esta ação"
```

### US-03 — Cadastro de usuários
**Como** administrador
**Quero** cadastrar avaliadores e avaliados
**Para que** apenas as pessoas certas tenham acesso ao sistema

**Regras de Negócio:**
- RN-03.1 — Nome, e-mail, senha e papel são obrigatórios para concluir o cadastro.
- RN-03.2 — Não pode haver dois usuários com o mesmo e-mail.
- RN-03.3 — O telefone celular do avaliado é opcional.
- RN-03.4 — Todo usuário cadastrado recebe um único papel: avaliador ou avaliado.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Cadastro de usuário com dados completos
  Quando cadastro um usuário informando nome, e-mail, senha e papel
  Então o usuário passa a ter acesso ao sistema

Cenário: Cadastro sem campo obrigatório
  Quando cadastro um usuário sem informar o e-mail
  Então o cadastro é rejeitado
  E vejo a mensagem "Informe todos os campos obrigatórios"

Cenário: Cadastro com e-mail já existente
  Dado que já existe um usuário com o e-mail informado
  Quando tento cadastrar outro usuário com o mesmo e-mail
  Então o cadastro é rejeitado
  E vejo a mensagem "Já existe um usuário com este e-mail"

Cenário: Cadastro de avaliado sem telefone
  Quando cadastro um avaliado sem informar o telefone
  Então o cadastro é concluído normalmente
```

---

## Epic 2 — Banco de Perguntas

### US-04 — Cadastrar pergunta aberta
**Como** avaliador
**Quero** cadastrar perguntas abertas com enunciado e peso
**Para que** eu possa avaliar respostas dissertativas dos candidatos

**Regras de Negócio:**
- RN-04.1 — Enunciado e peso são obrigatórios para uma pergunta aberta.
- RN-04.2 — O peso deve ser um valor positivo.
- RN-04.3 — As instruções de resposta são opcionais.
- RN-04.4 — Perguntas abertas não possuem gabarito e serão corrigidas manualmente.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Cadastro de pergunta aberta válida
  Quando cadastro uma pergunta aberta com enunciado e peso positivo
  Então a pergunta fica disponível no meu banco de perguntas

Cenário: Cadastro de pergunta aberta sem peso
  Quando cadastro uma pergunta aberta sem informar o peso
  Então o cadastro é rejeitado
  E vejo a mensagem "Informe o peso da pergunta"

Cenário: Cadastro de pergunta aberta com peso inválido
  Quando cadastro uma pergunta aberta com peso zero ou negativo
  Então o cadastro é rejeitado
  E vejo a mensagem "O peso deve ser maior que zero"
```

### US-05 — Cadastrar pergunta fechada
**Como** avaliador
**Quero** cadastrar perguntas fechadas com alternativas e gabarito
**Para que** as respostas dos candidatos sejam corrigidas automaticamente

**Regras de Negócio:**
- RN-05.1 — Enunciado, peso, alternativas e a alternativa correta são obrigatórios.
- RN-05.2 — A pergunta deve ter no mínimo duas alternativas.
- RN-05.3 — Apenas uma alternativa pode ser indicada como correta.
- RN-05.4 — O peso deve ser um valor positivo.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Cadastro de pergunta fechada válida
  Quando cadastro uma pergunta fechada com enunciado, peso, alternativas e uma correta
  Então a pergunta fica disponível no meu banco de perguntas

Cenário: Cadastro de pergunta fechada com uma única alternativa
  Quando cadastro uma pergunta fechada com apenas uma alternativa
  Então o cadastro é rejeitado
  E vejo a mensagem "Informe ao menos duas alternativas"

Cenário: Cadastro de pergunta fechada sem gabarito
  Quando cadastro uma pergunta fechada sem indicar a alternativa correta
  Então o cadastro é rejeitado
  E vejo a mensagem "Indique a alternativa correta"

Cenário: Cadastro de pergunta fechada com mais de uma correta
  Quando cadastro uma pergunta fechada marcando duas alternativas como corretas
  Então o cadastro é rejeitado
  E vejo a mensagem "Marque apenas uma alternativa correta"
```

### US-06 — Localizar perguntas
**Como** avaliador
**Quero** listar e filtrar as perguntas cadastradas
**Para que** eu encontre rapidamente as perguntas que desejo reutilizar

**Regras de Negócio:**
- RN-06.1 — A listagem exibe apenas as perguntas criadas pelo próprio avaliador.
- RN-06.2 — É possível filtrar as perguntas por tipo (aberta ou fechada).
- RN-06.3 — É possível buscar perguntas por palavra contida no enunciado.
- RN-06.4 — O avaliador pode visualizar os detalhes de cada pergunta: enunciado completo, instruções (abertas) e as alternativas com a indicação da correta (fechadas).

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Listar minhas perguntas
  Dado que possuo perguntas cadastradas
  Quando acesso o banco de perguntas
  Então vejo apenas as perguntas que criei

Cenário: Filtrar por tipo de pergunta
  Quando filtro as perguntas pelo tipo "fechada"
  Então vejo somente as perguntas fechadas

Cenário: Buscar por palavra no enunciado
  Quando busco perguntas pela palavra "qualidade"
  Então vejo apenas perguntas cujo enunciado contém "qualidade"

Cenário: Visualizar os detalhes de uma pergunta fechada
  Dado que possuo uma pergunta fechada cadastrada
  Quando abro os detalhes dessa pergunta
  Então vejo suas alternativas com a indicação de qual é a correta
```

### US-07 — Editar e excluir pergunta
**Como** avaliador
**Quero** editar ou excluir perguntas existentes
**Para que** eu mantenha meu banco de perguntas atualizado e organizado

**Regras de Negócio:**
- RN-07.1 — Editar e excluir seguem a mesma trava: só são permitidos enquanto a pergunta **não estiver vinculada a nenhuma avaliação** (processo), para não comprometer avaliações existentes.
- RN-07.2 — A edição permite alterar enunciado, peso, instruções, tipo e alternativas (o conjunto de alternativas é substituído).
- RN-07.3 — A exclusão remove a pergunta e suas alternativas definitivamente.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Editar pergunta não vinculada
  Dado que possuo uma pergunta que não está em nenhuma avaliação
  Quando altero seu enunciado e salvo
  Então a alteração é salva

Cenário: Tentar editar pergunta vinculada a uma avaliação
  Dado que uma pergunta está vinculada a uma avaliação
  Quando tento editá-la
  Então a edição é impedida
  E vejo a mensagem "Pergunta vinculada a uma avaliação não pode ser editada"

Cenário: Excluir pergunta não vinculada
  Dado que possuo uma pergunta que não está em nenhuma avaliação
  Quando a excluo
  Então ela é removida do banco de perguntas

Cenário: Tentar excluir pergunta vinculada a uma avaliação
  Dado que uma pergunta está vinculada a uma avaliação
  Quando tento excluí-la
  Então a exclusão é impedida
  E vejo a mensagem "Pergunta vinculada a uma avaliação não pode ser excluída"
```

---

## Epic 3 — Processo Avaliativo

### US-08 — Criar processo avaliativo
**Como** avaliador
**Quero** criar um processo avaliativo com suas configurações
**Para que** eu organize uma avaliação completa para os candidatos

**Regras de Negócio:**
- RN-08.1 — Título, tempo limite, nota mínima de aprovação e modo de aprovação são obrigatórios.
- RN-08.2 — O modo de aprovação pode ser automático, manual ou ambos.
- RN-08.3 — As datas de início e fim são opcionais; sem elas, o processo permanece aberto até ser encerrado manualmente.
- RN-08.4 — O avaliador decide se o gabarito das perguntas fechadas será exibido ao candidato após a correção.
- RN-08.5 — Um processo recém-criado permanece como rascunho até ser publicado.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Criar processo com configurações completas
  Quando crio um processo informando título, tempo limite, nota mínima e modo de aprovação
  Então o processo é criado como rascunho

Cenário: Criar processo sem nota mínima
  Quando crio um processo sem informar a nota mínima de aprovação
  Então a criação é rejeitada
  E vejo a mensagem "Informe a nota mínima de aprovação"

Cenário: Criar processo sem datas definidas
  Quando crio um processo sem informar datas de início e fim
  Então o processo é criado e permanecerá aberto até eu encerrá-lo manualmente
```

### US-09 — Selecionar perguntas para o processo
**Como** avaliador
**Quero** selecionar perguntas e definir sua ordem no processo
**Para que** o candidato responda exatamente às questões que escolhi

**Regras de Negócio:**
- RN-09.1 — O avaliador escolhe entre as perguntas do seu banco quais comporão o processo.
- RN-09.2 — O avaliador define a ordem em que as perguntas serão exibidas.
- RN-09.3 — Cada pergunta conserva seu próprio peso dentro do processo.
- RN-09.4 — Um processo precisa de ao menos uma pergunta para ser publicado.
- RN-09.5 — O avaliador visualiza as perguntas já vinculadas ao processo, na ordem definida; perguntas já adicionadas não são oferecidas novamente para seleção.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Adicionar perguntas e ordená-las
  Dado que tenho perguntas no banco
  Quando adiciono perguntas ao processo e defino sua ordem
  Então as perguntas passam a compor o processo na ordem escolhida

Cenário: Ver as perguntas já vinculadas ao processo
  Dado que adicionei perguntas ao processo
  Quando abro o processo
  Então vejo a lista das perguntas já vinculadas, na ordem definida
```

### US-10 — Adicionar candidatos ao processo
**Como** avaliador
**Quero** adicionar candidatos ao processo
**Para que** apenas as pessoas autorizadas possam responder à avaliação

**Regras de Negócio:**
- RN-10.1 — Somente usuários com papel de avaliado podem ser adicionados como candidatos.
- RN-10.2 — Um mesmo candidato não pode ser adicionado duas vezes ao mesmo processo.
- RN-10.3 — Apenas candidatos vinculados ao processo conseguem visualizá-lo e respondê-lo.
- RN-10.4 — O avaliador visualiza os candidatos já vinculados ao processo; candidatos já adicionados não são oferecidos novamente para seleção.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Adicionar candidato ao processo
  Quando adiciono um avaliado ao processo
  Então ele passa a ser um candidato autorizado a responder

Cenário: Ver os candidatos já vinculados ao processo
  Dado que adicionei candidatos ao processo
  Quando abro o processo
  Então vejo a lista dos candidatos já vinculados
  E esses candidatos não aparecem mais na lista de seleção

Cenário: Tentar adicionar o mesmo candidato duas vezes
  Dado que um candidato já está no processo
  Quando tento adicioná-lo novamente
  Então a ação é impedida
  E vejo a mensagem "Candidato já adicionado a este processo"

Cenário: Candidato não vinculado não enxerga o processo
  Dado que um avaliado não foi adicionado ao processo
  Quando ele consulta suas avaliações disponíveis
  Então o processo não aparece para ele
```

### US-11 — Publicar processo
**Como** avaliador
**Quero** publicar o processo
**Para que** os candidatos possam iniciar a avaliação

**Regras de Negócio:**
- RN-11.1 — Só é possível publicar um processo que tenha ao menos uma pergunta e um candidato.
- RN-11.2 — Após publicado, o processo passa a ficar ativo.
- RN-11.3 — Havendo data de início, o processo só fica disponível ao candidato a partir dessa data.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Publicar processo completo
  Dado que o processo tem ao menos uma pergunta e um candidato
  Quando publico o processo
  Então ele fica ativo

Cenário: Tentar publicar processo sem perguntas
  Dado que o processo não tem perguntas
  Quando tento publicá-lo
  Então a publicação é impedida
  E vejo a mensagem "Adicione ao menos uma pergunta antes de publicar"

Cenário: Processo com data de início futura
  Dado que o processo tem data de início futura
  Quando o candidato consulta suas avaliações antes dessa data
  Então o processo ainda não está disponível para iniciar
```

### US-12 — Conceder tempo extra durante a avaliação
**Como** avaliador
**Quero** conceder tempo extra a um candidato durante a avaliação
**Para que** eu atenda necessidades pontuais sem prejudicá-lo

**Regras de Negócio:**
- RN-12.1 — O tempo extra só pode ser concedido enquanto a avaliação do candidato estiver em andamento.
- RN-12.2 — O tempo restante do candidato é atualizado imediatamente, sem que ele precise recarregar a página.
- RN-12.3 — O tempo extra concedido é somado ao tempo original e fica registrado.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Conceder tempo extra durante a prova
  Dado que um candidato está respondendo a avaliação
  Quando concedo 10 minutos extras a ele
  Então o tempo restante dele aumenta em 10 minutos imediatamente

Cenário: Tentar conceder tempo após o envio
  Dado que o candidato já enviou a avaliação
  Quando tento conceder tempo extra
  Então a ação é impedida
  E vejo a mensagem "A avaliação já foi finalizada"
```

---

## Epic 4 — Aplicação da Avaliação

### US-13 — Visualizar avaliações disponíveis
**Como** avaliado
**Quero** ver a lista de avaliações disponíveis para mim
**Para que** eu saiba quais avaliações preciso responder

**Regras de Negócio:**
- RN-13.1 — O candidato vê apenas processos ativos aos quais foi vinculado.
- RN-13.2 — Avaliações já enviadas não aparecem como disponíveis para nova resposta.
- RN-13.3 — Avaliações fora da janela de datas não ficam disponíveis para iniciar.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Ver avaliações disponíveis
  Dado que fui vinculado a um processo ativo
  Quando acesso minhas avaliações
  Então vejo a avaliação disponível para iniciar

Cenário: Avaliação já enviada não aparece como disponível
  Dado que já enviei uma avaliação
  Quando acesso minhas avaliações disponíveis
  Então essa avaliação não aparece para nova resposta

Cenário: Avaliação encerrada não fica disponível
  Dado que a data de término do processo já passou
  Quando acesso minhas avaliações
  Então o processo não está mais disponível para iniciar
```

### US-14 — Iniciar avaliação
**Como** avaliado
**Quero** iniciar uma avaliação
**Para que** o tempo comece a contar e eu possa responder às questões

**Regras de Negócio:**
- RN-14.1 — Ao iniciar, são registrados a data e o horário de início.
- RN-14.2 — A contagem regressiva de tempo é iniciada com base no tempo limite do processo.
- RN-14.3 — Cada candidato pode iniciar a avaliação uma única vez.
- RN-14.4 — Uma avaliação já iniciada não pode ser reiniciada do zero.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Iniciar uma avaliação disponível
  Dado que tenho uma avaliação disponível
  Quando inicio a avaliação
  Então a contagem regressiva começa
  E o horário de início é registrado

Cenário: Tentar iniciar uma avaliação já iniciada
  Dado que já iniciei a avaliação
  Quando tento iniciá-la novamente
  Então a ação é impedida
  E retorno ao ponto em que parei sem reiniciar o tempo
```

### US-15 — Responder questões
**Como** avaliado
**Quero** responder às perguntas abertas e fechadas
**Para que** eu registre minhas respostas na avaliação

**Regras de Negócio:**
- RN-15.1 — Perguntas abertas recebem resposta em texto livre.
- RN-15.2 — Perguntas fechadas recebem a seleção de uma única alternativa.
- RN-15.3 — Respostas só podem ser registradas enquanto a avaliação estiver em andamento.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Responder uma pergunta aberta
  Dado que estou respondendo a avaliação
  Quando escrevo a resposta de uma pergunta aberta
  Então minha resposta é registrada

Cenário: Responder uma pergunta fechada
  Dado que estou respondendo a avaliação
  Quando seleciono uma alternativa de uma pergunta fechada
  Então minha escolha é registrada

Cenário: Tentar responder após o envio
  Dado que já enviei a avaliação
  Quando tento registrar uma resposta
  Então a ação é impedida
```

### US-16 — Salvamento automático das respostas
**Como** avaliado
**Quero** que minhas respostas sejam salvas automaticamente conforme as forneço
**Para que** eu não perca o que respondi em caso de queda de conexão ou fechamento acidental

**Regras de Negócio:**
- RN-16.1 — Cada resposta é salva automaticamente assim que fornecida ou alterada, sem ação manual de salvar.
- RN-16.2 — O candidato recebe uma confirmação de que a resposta foi salva.
- RN-16.3 — Ao retornar a uma avaliação interrompida, o candidato encontra suas respostas preservadas.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Salvamento automático ao responder
  Dado que estou respondendo a avaliação
  Quando forneço uma resposta
  Então ela é salva automaticamente
  E vejo a confirmação "Resposta salva"

Cenário: Recuperar respostas após interrupção
  Dado que respondi algumas questões e minha conexão caiu
  Quando retorno à avaliação ainda dentro do tempo
  Então minhas respostas anteriores estão preservadas
```

### US-17 — Revisar respostas antes do envio
**Como** avaliado
**Quero** alterar minhas respostas enquanto não finalizei a avaliação
**Para que** eu possa revisar e corrigir antes do envio definitivo

**Regras de Negócio:**
- RN-17.1 — As respostas podem ser alteradas livremente até o envio.
- RN-17.2 — Cada alteração substitui a resposta anterior.
- RN-17.3 — Após o envio, nenhuma resposta pode ser modificada.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Alterar uma resposta antes de enviar
  Dado que respondi uma questão e ainda não enviei a avaliação
  Quando altero minha resposta
  Então a nova resposta substitui a anterior

Cenário: Tentar alterar resposta após o envio
  Dado que já enviei a avaliação
  Quando tento alterar uma resposta
  Então a ação é impedida
  E vejo a mensagem "A avaliação já foi finalizada"
```

### US-18 — Acompanhar o tempo restante
**Como** avaliado
**Quero** ver o tempo restante em contagem regressiva
**Para que** eu administre meu tempo durante a avaliação

**Regras de Negócio:**
- RN-18.1 — O tempo restante é exibido de forma contínua e visível durante toda a avaliação.
- RN-18.2 — Quando o avaliador concede tempo extra, o tempo exibido reflete o acréscimo automaticamente.
- RN-18.3 — O tempo continua a correr mesmo que o candidato saia da janela da avaliação.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Visualizar contagem regressiva
  Dado que iniciei a avaliação
  Quando estou respondendo
  Então vejo continuamente o tempo restante

Cenário: Tempo restante reflete tempo extra concedido
  Dado que estou respondendo a avaliação
  Quando o avaliador me concede tempo extra
  Então o tempo restante exibido aumenta imediatamente

Cenário: Tempo segue correndo fora da janela
  Dado que iniciei a avaliação
  Quando saio da janela da avaliação por alguns minutos
  Então ao retornar o tempo restante reflete o tempo decorrido
```

### US-19 — Finalizar e enviar avaliação
**Como** avaliado
**Quero** informar que finalizei a avaliação e enviá-la
**Para que** minhas respostas sejam registradas para correção

**Regras de Negócio:**
- RN-19.1 — O envio exige uma confirmação explícita do candidato.
- RN-19.2 — Ao enviar, são registrados a data e o horário de término.
- RN-19.3 — Após o envio, as respostas ficam bloqueadas para alteração.
- RN-19.4 — A pontuação das perguntas fechadas fica disponível imediatamente após o envio.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Finalizar avaliação com confirmação
  Dado que respondi a avaliação
  Quando confirmo a finalização
  Então minhas respostas são enviadas
  E o horário de término é registrado

Cenário: Cancelar a finalização
  Dado que solicitei finalizar a avaliação
  Quando não confirmo a finalização
  Então continuo respondendo normalmente

Cenário: Pontuação parcial disponível após envio
  Dado que enviei a avaliação
  Quando consulto meu resultado
  Então vejo a pontuação das perguntas fechadas
  E vejo que as perguntas abertas aguardam correção
```

### US-20 — Envio automático ao esgotar o tempo
**Como** avaliado
**Quero** que minha avaliação seja enviada automaticamente quando o tempo se esgotar
**Para que** eu não perca as respostas que já forneci

**Regras de Negócio:**
- RN-20.1 — Ao esgotar o tempo, as respostas fornecidas até o momento são enviadas automaticamente.
- RN-20.2 — O horário de término é registrado como o momento do esgotamento do tempo.
- RN-20.3 — Após o envio automático, as respostas ficam bloqueadas para alteração.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Envio automático no fim do tempo
  Dado que estou respondendo a avaliação
  Quando o tempo se esgota
  Então minhas respostas fornecidas até o momento são enviadas automaticamente
  E o horário de término é registrado

Cenário: Bloqueio de alterações após o esgotamento
  Dado que o tempo da avaliação se esgotou
  Quando tento alterar uma resposta
  Então a ação é impedida
  E vejo a mensagem "O tempo da avaliação foi encerrado"
```

### US-21 — Acompanhar saídas de janela do candidato
**Como** avaliador
**Quero** saber quando o candidato saiu da janela da avaliação
**Para que** eu tenha visibilidade sobre o comportamento durante a prova

**Regras de Negócio:**
- RN-21.1 — Cada saída da janela durante a avaliação é registrada com data e horário.
- RN-21.2 — A contagem de tempo não é interrompida quando o candidato sai da janela.
- RN-21.3 — O total de saídas de cada candidato fica visível no acompanhamento de resultados.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Registrar saída de janela
  Dado que um candidato está respondendo a avaliação
  Quando ele sai da janela da avaliação
  Então essa saída é registrada
  E o tempo continua correndo

Cenário: Visualizar total de saídas
  Dado que um candidato saiu da janela três vezes
  Quando consulto os resultados desse candidato
  Então vejo que houve três saídas durante a prova
```

### US-22 — Impedir cópia de conteúdo na prova
**Como** avaliador
**Quero** impedir copiar e colar nas áreas de resposta
**Para que** seja dificultada a cópia indevida de conteúdo durante a prova

**Regras de Negócio:**
- RN-22.1 — As ações de copiar, recortar e colar ficam indisponíveis nas áreas de resposta.
- RN-22.2 — A restrição vale tanto para campos de texto quanto para a seleção de alternativas.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Tentar copiar o enunciado de uma questão
  Dado que estou respondendo a avaliação
  Quando tento copiar o conteúdo de uma questão
  Então a cópia não é realizada

Cenário: Tentar colar conteúdo numa resposta aberta
  Dado que estou respondendo uma questão aberta
  Quando tento colar um conteúdo externo
  Então a colagem não é realizada
```

### US-35 — Continuidade da sessão durante a avaliação
**Como** avaliado
**Quero** permanecer na avaliação mesmo sem interagir por um tempo
**Para que** eu não seja desconectado indevidamente enquanto leio ou penso nas respostas

**Regras de Negócio:**
- RN-35.1 — Enquanto a avaliação está em andamento, o candidato não é desconectado por falta de interação; quem governa o encerramento é exclusivamente o tempo da prova.
- RN-35.2 — Ler o enunciado ou refletir sobre a resposta, sem alterar respostas, não é tratado como motivo para encerrar o acesso.
- RN-35.3 — Se a sessão for interrompida por causa externa (queda de conexão ou fechamento da janela), ao acessar novamente dentro do tempo o candidato retoma a avaliação exatamente no ponto em que parou.
- RN-35.4 — O tempo de prova decorrido durante uma interrupção externa é contado normalmente, pois o tempo não pausa.
- RN-35.5 — Quando o tempo da prova se esgota, o encerramento segue a regra de envio automático (US-20), independentemente de a sessão estar ativa ou não.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Permanecer na prova durante reflexão prolongada
  Dado que iniciei a avaliação e ainda há tempo restante
  Quando passo um longo período lendo e pensando sem alterar respostas
  Então continuo na avaliação normalmente
  E não sou desconectado por inatividade

Cenário: Retomar a avaliação após queda de conexão
  Dado que iniciei a avaliação e minha conexão caiu
  Quando acesso novamente o sistema dentro do tempo da prova
  Então retomo a avaliação no ponto em que parei
  E minhas respostas anteriores estão preservadas

Cenário: Tempo continua correndo durante a interrupção
  Dado que fiquei sem acesso por cinco minutos durante a prova
  Quando retomo a avaliação
  Então o tempo restante reflete os cinco minutos decorridos

Cenário: Esgotamento do tempo durante uma sessão interrompida
  Dado que o tempo da prova se esgota enquanto estou sem acesso
  Quando tento retomar a avaliação
  Então a avaliação já foi enviada automaticamente com as respostas salvas
  E vejo a mensagem "O tempo da avaliação foi encerrado"
```

---

## Epic 5 — Correção e Pontuação

### US-23 — Correção automática das questões fechadas
**Como** avaliador
**Quero** que as questões fechadas sejam corrigidas automaticamente após o envio
**Para que** a pontuação dessas questões fique disponível sem esforço manual

**Regras de Negócio:**
- RN-23.1 — A resposta do candidato é comparada com a alternativa correta cadastrada.
- RN-23.2 — Acerto recebe o peso total da questão; erro recebe zero, sem pontuação parcial.
- RN-23.3 — A pontuação das fechadas fica disponível assim que a avaliação é enviada.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Acerto em questão fechada
  Dado que uma questão fechada vale 10 pontos
  Quando o candidato seleciona a alternativa correta
  Então ele recebe 10 pontos nessa questão

Cenário: Erro em questão fechada
  Dado que uma questão fechada vale 10 pontos
  Quando o candidato seleciona uma alternativa incorreta
  Então ele recebe 0 ponto nessa questão
```

### US-24 — Corrigir questões abertas
**Como** avaliador
**Quero** ler as respostas das questões abertas e atribuir pontos
**Para que** eu avalie respostas dissertativas de forma justa

**Regras de Negócio:**
- RN-24.1 — A pontuação atribuída a uma questão aberta deve estar entre zero e o peso máximo da questão.
- RN-24.2 — O avaliador pode registrar uma observação para cada questão corrigida.
- RN-24.3 — Somente o avaliador responsável pelo processo pode corrigir suas questões.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Atribuir pontuação válida a uma questão aberta
  Dado que uma questão aberta vale 10 pontos
  Quando atribuo 8 pontos à resposta do candidato
  Então a pontuação é registrada

Cenário: Atribuir pontuação acima do peso da questão
  Dado que uma questão aberta vale 10 pontos
  Quando tento atribuir 12 pontos
  Então a ação é impedida
  E vejo a mensagem "A pontuação não pode exceder o peso da questão"

Cenário: Registrar observação na correção
  Quando corrijo uma questão aberta e escrevo uma observação
  Então a observação é registrada junto à questão
```

### US-25 — Conhecer o resultado total do candidato
**Como** avaliador
**Quero** que o resultado total seja consolidado após corrigir todas as questões abertas
**Para que** eu conheça o desempenho final do candidato

**Regras de Negócio:**
- RN-25.1 — O resultado total é a soma dos pontos das questões fechadas e abertas.
- RN-25.2 — O desempenho é expresso como percentual sobre a soma dos pesos de todas as questões.
- RN-25.3 — Enquanto houver questões abertas pendentes, apenas o resultado parcial é exibido, indicando quantas faltam corrigir.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Resultado total após corrigir todas as abertas
  Dado que corrigi todas as questões abertas de um candidato
  Quando consulto o resultado dele
  Então vejo a pontuação total e o percentual de desempenho

Cenário: Resultado parcial com abertas pendentes
  Dado que ainda há duas questões abertas a corrigir
  Quando consulto o resultado do candidato
  Então vejo apenas o resultado parcial
  E vejo que há "2 questões abertas aguardando correção"
```

### US-26 — Definição automática de aprovação
**Como** avaliador
**Quero** que o candidato seja aprovado ou reprovado automaticamente conforme a nota mínima
**Para que** o resultado seja definido sem intervenção manual quando assim configurado

**Regras de Negócio:**
- RN-26.1 — A definição automática só ocorre após todas as questões abertas serem corrigidas.
- RN-26.2 — Desempenho igual ou superior à nota mínima resulta em aprovação; inferior resulta em reprovação.
- RN-26.3 — A definição automática só se aplica quando o processo está configurado para esse modo.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Aprovação automática ao atingir a nota mínima
  Dado que o processo está no modo automático e a nota mínima é 70%
  E corrigi todas as questões abertas do candidato
  Quando o desempenho dele é 80%
  Então ele é aprovado automaticamente

Cenário: Reprovação automática abaixo da nota mínima
  Dado que o processo está no modo automático e a nota mínima é 70%
  E corrigi todas as questões abertas do candidato
  Quando o desempenho dele é 60%
  Então ele é reprovado automaticamente

Cenário: Aprovação automática aguarda correção das abertas
  Dado que o processo está no modo automático
  E ainda há questões abertas a corrigir
  Quando consulto a situação do candidato
  Então a definição de aprovação ainda não foi realizada
```

### US-27 — Definição manual de aprovação
**Como** avaliador
**Quero** aprovar ou reprovar manualmente um candidato
**Para que** eu tenha a palavra final independentemente da nota calculada

**Regras de Negócio:**
- RN-27.1 — O avaliador pode marcar o candidato como aprovado ou reprovado manualmente.
- RN-27.2 — A decisão manual prevalece sobre a definição automática.
- RN-27.3 — A decisão manual fica registrada e visível no resultado do candidato.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Aprovar manualmente um candidato
  Dado que estou avaliando o resultado de um candidato
  Quando o marco manualmente como aprovado
  Então o resultado dele passa a constar como aprovado

Cenário: Decisão manual prevalece sobre a automática
  Dado que o candidato foi reprovado automaticamente
  Quando o aprovo manualmente
  Então o resultado final dele consta como aprovado
```

### US-28 — Registrar feedback geral
**Como** avaliador
**Quero** escrever um feedback geral sobre o desempenho do candidato
**Para que** o avaliado receba uma devolutiva qualitativa da sua avaliação

**Regras de Negócio:**
- RN-28.1 — O feedback geral é um texto livre vinculado à avaliação do candidato.
- RN-28.2 — O feedback só fica visível ao candidato após a correção completa da avaliação.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Escrever feedback geral
  Dado que corrigi a avaliação de um candidato
  Quando escrevo um feedback geral sobre o desempenho dele
  Então o feedback é registrado

Cenário: Feedback indisponível antes da correção completa
  Dado que ainda há questões a corrigir
  Quando o candidato consulta seu resultado
  Então o feedback geral ainda não está visível
```

---

## Epic 6 — Acompanhamento e Resultados

### US-29 — Acompanhar minhas avaliações
**Como** avaliado
**Quero** visualizar os processos e respostas que enviei e seu andamento
**Para que** eu saiba se minha avaliação já foi corrigida ou ainda está pendente

**Regras de Negócio:**
- RN-29.1 — A lista mostra cada avaliação com seu andamento: aguardando correção, avaliada, aprovado ou reprovado.
- RN-29.2 — O candidato visualiza apenas suas próprias avaliações.
- RN-29.3 — O resultado só aparece após a correção completa pelo avaliador.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Ver andamento das minhas avaliações
  Dado que enviei avaliações
  Quando acesso minha área de avaliações
  Então vejo cada uma com seu andamento atual

Cenário: Avaliação aguardando correção
  Dado que enviei uma avaliação com questões abertas
  Quando o avaliador ainda não concluiu a correção
  Então a avaliação aparece como "aguardando correção"

Cenário: Não vejo avaliações de outros candidatos
  Quando acesso minha área de avaliações
  Então vejo somente as minhas avaliações
```

### US-30 — Visualizar detalhes da avaliação corrigida
**Como** avaliado
**Quero** ver minhas respostas, a pontuação por questão e as observações do avaliador
**Para que** eu entenda meu desempenho em cada questão

**Regras de Negócio:**
- RN-30.1 — Para cada questão, são exibidos a resposta dada, os pontos obtidos e a observação do avaliador, quando houver.
- RN-30.2 — O gabarito das questões fechadas só é exibido se o processo estiver configurado para isso.
- RN-30.3 — O feedback geral fica visível nesta área após a correção completa.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Ver detalhes da avaliação corrigida
  Dado que minha avaliação foi corrigida
  Quando acesso seus detalhes
  Então vejo minha resposta, a pontuação e as observações de cada questão
  E vejo o feedback geral do avaliador

Cenário: Gabarito exibido quando configurado
  Dado que o processo permite exibir o gabarito
  Quando acesso os detalhes da avaliação corrigida
  Então vejo a alternativa correta de cada questão fechada

Cenário: Gabarito oculto quando não configurado
  Dado que o processo não permite exibir o gabarito
  Quando acesso os detalhes da avaliação corrigida
  Então a alternativa correta das questões fechadas não é exibida
```

### US-31 — Acompanhar candidatos do processo
**Como** avaliador
**Quero** ver a lista de candidatos de um processo com seu andamento e pontuação
**Para que** eu acompanhe o progresso das correções e dos resultados

**Regras de Negócio:**
- RN-31.1 — O acompanhamento mostra **todos os candidatos vinculados** ao processo, inclusive os que ainda não iniciaram a avaliação.
- RN-31.2 — O candidato que ainda não iniciou é exibido com a situação "Não iniciou", sem pontuação nem ações de correção.
- RN-31.3 — Para os candidatos que iniciaram, são exibidos o andamento do envio, a pontuação e a situação de aprovação.
- RN-31.4 — É indicado quantas questões abertas ainda faltam corrigir por candidato.
- RN-31.5 — Apenas o avaliador responsável pelo processo tem acesso a esse acompanhamento.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Acompanhar candidatos de um processo
  Dado que sou o avaliador responsável pelo processo
  Quando acesso o acompanhamento de candidatos
  Então vejo todos os candidatos vinculados, com sua situação e pontuação

Cenário: Candidato vinculado que ainda não começou
  Dado que um candidato foi adicionado mas ainda não iniciou a avaliação
  Quando acesso o acompanhamento de candidatos
  Então esse candidato aparece com a situação "Não iniciou"

Cenário: Ver pendências de correção por candidato
  Dado que um candidato tem questões abertas a corrigir
  Quando consulto o acompanhamento
  Então vejo quantas questões abertas ainda faltam corrigir para ele
```

### US-32 — Conhecer o tempo de resposta e a média do processo
**Como** avaliador
**Quero** ver quanto tempo cada candidato levou e a média do processo
**Para que** eu avalie a dificuldade da prova e o desempenho dos candidatos

**Regras de Negócio:**
- RN-32.1 — O tempo de cada candidato corresponde ao intervalo entre o início e o término da avaliação.
- RN-32.2 — A média de tempo considera apenas os candidatos que finalizaram a avaliação.
- RN-32.3 — O total de saídas de janela de cada candidato é exibido junto ao tempo.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Ver tempo de resposta de um candidato
  Dado que um candidato finalizou a avaliação
  Quando consulto seus dados
  Então vejo quanto tempo ele levou para concluir

Cenário: Ver média de tempo do processo
  Dado que vários candidatos finalizaram a avaliação
  Quando consulto o processo
  Então vejo a média de tempo dos candidatos que finalizaram
```

### US-33 — Ser avisado sobre novos envios
**Como** avaliador
**Quero** ser avisado quando um candidato enviar a avaliação
**Para que** eu saiba quando iniciar a correção

**Regras de Negócio:**
- RN-33.1 — O aviso é gerado quando o candidato finaliza a avaliação, de forma manual ou automática.
- RN-33.2 — O aviso identifica o candidato e o processo correspondente.
- RN-33.3 — O aviso permanece disponível até ser marcado como lido.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Aviso ao avaliador sobre novo envio
  Dado que sou o avaliador de um processo
  Quando um candidato finaliza a avaliação
  Então recebo um aviso identificando o candidato e o processo

Cenário: Marcar aviso como lido
  Dado que recebi um aviso de novo envio
  Quando marco o aviso como lido
  Então ele deixa de constar como pendente
```

### US-34 — Ser avisado sobre o resultado disponível
**Como** avaliado
**Quero** ser avisado quando minha avaliação for corrigida
**Para que** eu acesse meu resultado assim que estiver pronto

**Regras de Negócio:**
- RN-34.1 — O aviso é gerado quando o avaliador conclui a correção completa da avaliação.
- RN-34.2 — O aviso conduz o candidato à área de resultados.
- RN-34.3 — O aviso permanece disponível até ser marcado como lido.

**Critérios de Aceitação (Gherkin):**

```gherkin
Cenário: Aviso ao candidato sobre resultado disponível
  Dado que minha avaliação tinha questões abertas pendentes
  Quando o avaliador conclui a correção completa
  Então recebo um aviso de que meu resultado está disponível

Cenário: Acessar resultado a partir do aviso
  Dado que recebi um aviso de resultado disponível
  Quando aciono o aviso
  Então sou conduzido à área de resultados da minha avaliação
```
