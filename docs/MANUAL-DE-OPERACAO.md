# Manual de Operação
## Sistema de Avaliação de Candidatos

**Versão do documento:** 1.0
**Data:** 31 de julho de 2026
**Público-alvo:** Operadores finais do sistema (administradores, avaliadores e candidatos)

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Acesso ao Sistema](#2-acesso-ao-sistema)
3. [Procedimentos Operacionais (Passo a Passo)](#3-procedimentos-operacionais-passo-a-passo)
   - 3.1 [Perfil Administrador](#31-perfil-administrador)
   - 3.2 [Perfil Avaliador](#32-perfil-avaliador)
   - 3.3 [Perfil Candidato (Avaliado)](#33-perfil-candidato-avaliado)
4. [Resolução de Problemas Comuns (FAQ / Erros)](#4-resolução-de-problemas-comuns-faq--erros)
5. [Glossário](#5-glossário)

---

# 1. Visão Geral

## 1.1 Para que serve o software

O **Sistema de Avaliação de Candidatos** é uma plataforma web destinada à aplicação de provas e avaliações estruturadas de forma totalmente digital. Por meio dele, uma organização pode montar avaliações, aplicá-las a um grupo de candidatos, corrigi-las e divulgar os resultados, tudo em um único ambiente.

O sistema realiza as seguintes atividades principais:

| O que o sistema faz | Descrição |
|---|---|
| **Cadastro de perguntas** | Permite montar um banco de perguntas reutilizáveis, dissertativas ou de múltipla escolha. |
| **Montagem de avaliações** | Reúne perguntas selecionadas, define tempo de prova, nota mínima e regra de aprovação. |
| **Aplicação da prova** | O candidato responde em tela, com cronômetro visível e salvamento automático das respostas. |
| **Correção mista** | As questões de múltipla escolha são corrigidas automaticamente pelo sistema; as dissertativas são corrigidas manualmente pelo avaliador. |
| **Resultado e devolutiva** | Calcula a pontuação, define aprovação ou reprovação e disponibiliza feedback ao candidato. |
| **Acompanhamento** | Mostra ao avaliador quem já iniciou, quem finalizou, quanto tempo levou e quantas correções ainda faltam. |

## 1.2 Quem utiliza o sistema

O sistema trabalha com **três perfis de acesso**. Cada usuário recebe **um único perfil**, e cada perfil enxerga apenas as telas e funções que lhe dizem respeito.

### Administrador
Responsável por manter os acessos. É quem cadastra as pessoas que utilizarão o sistema, definindo se cada uma será avaliador ou candidato.

**Não** cria perguntas, **não** monta avaliações e **não** responde provas.

### Avaliador
Responsável pelo conteúdo e pela condução das avaliações. Cria as perguntas, monta os processos avaliativos, escolhe quem participará, publica a avaliação, acompanha a execução, corrige as questões dissertativas e define o resultado final.

**Não** cadastra usuários e **não** responde provas.

### Candidato (Avaliado)
É a pessoa avaliada. Visualiza as avaliações às quais foi vinculada, responde às questões dentro do tempo estabelecido, envia a prova e consulta o resultado quando a correção for concluída.

**Não** cria perguntas, **não** monta avaliações e **não** corrige provas.

> **Importante:** as funções são estritamente separadas por perfil. Se um usuário tentar acessar uma função que não pertence ao seu perfil, o sistema impedirá a ação e exibirá a mensagem **"Você não tem permissão para esta ação"**.

## 1.3 Fluxo geral de trabalho

O sistema segue sempre a mesma sequência lógica. Compreender esta sequência facilita o uso de qualquer uma das telas.

```
  ADMINISTRADOR              AVALIADOR                        CANDIDATO
        |                        |                                |
   1. Cadastra           2. Cadastra perguntas                    |
      usuários                   |                                |
        |               3. Cria o processo avaliativo             |
        |                        |                                |
        |               4. Adiciona perguntas                     |
        |                  e candidatos                           |
        |                        |                                |
        |               5. Publica o processo  ----------->  6. Inicia a prova
        |                        |                                |
        |                        |                           7. Responde
        |                        |                                |
        |               9. Acompanha        <-----------     8. Finaliza e envia
        |                  o andamento                            |
        |                        |                                |
        |              10. Corrige as dissertativas                |
        |                        |                                |
        |              11. Define aprovação e     ----------> 12. Consulta o
        |                  escreve o feedback                      resultado
```

---

# 2. Acesso ao Sistema

## 2.1 Requisitos mínimos

### Para o usuário final (operador)

| Item | Requisito mínimo | Recomendado |
|---|---|---|
| **Equipamento** | Computador desktop ou notebook | Computador desktop ou notebook |
| **Navegador de internet** | Google Chrome, Microsoft Edge ou Mozilla Firefox, em versão atualizada | Google Chrome ou Microsoft Edge atualizado |
| **Resolução de tela** | 1280 × 720 pixels | 1920 × 1080 pixels |
| **Conexão com a internet** | Conexão estável | Conexão estável por cabo, durante a realização de provas |
| **Configuração do navegador** | JavaScript habilitado e cookies permitidos | Idem |

> **Recomendação para candidatos:** realize a prova em computador, com conexão estável, e evite dispositivos móveis. Embora o sistema se adapte a telas menores, a leitura dos enunciados e a digitação de respostas dissertativas são significativamente mais confortáveis em tela grande.

### Para o ambiente do sistema (informação para a área de tecnologia)

Estes requisitos dizem respeito ao servidor onde o sistema está instalado e **não** precisam ser providenciados pelo operador final:

- Node.js versão 20 ou superior
- Banco de dados PostgreSQL versão 16
- Serviço da aplicação (API) publicado na porta `3000`
- Interface web publicada na porta `5173` em ambiente de desenvolvimento

## 2.2 Como fazer login

**Passo a passo:**

1. Abra o navegador de internet.
2. Digite na barra de endereços o endereço do sistema fornecido pela sua organização (por exemplo, `http://localhost:5173` em ambiente de testes) e pressione **Enter**.
3. O sistema exibirá a tela de acesso, identificada pelo título **"Processo Avaliativo"** e pelo subtítulo **"Acesse com suas credenciais"**.
4. No campo **E-mail**, digite o endereço de e-mail cadastrado para você pelo administrador.
5. No campo **Senha**, digite sua senha.
6. Clique no botão **Entrar**.
7. Aguarde. Enquanto o sistema valida os dados, o botão exibirá o texto **"Entrando..."**.
8. Sendo as credenciais válidas, o sistema conduzirá você automaticamente à tela inicial correspondente ao seu perfil.

### Tela inicial por perfil

O sistema direciona cada usuário à sua área de trabalho logo após o login:

| Perfil | Tela inicial exibida |
|---|---|
| Administrador | **Usuários** |
| Avaliador | **Processos avaliativos** |
| Candidato (Avaliado) | **Avaliações disponíveis** |

> **Observação sobre o primeiro acesso:** as credenciais são criadas pelo administrador. Caso você ainda não possua acesso, solicite o cadastro ao administrador do sistema da sua organização. O sistema **não** possui tela de autocadastro nem função de recuperação automática de senha.

## 2.3 Como navegar pela tela inicial

Após o login, todas as telas do sistema seguem a mesma estrutura visual, composta por três áreas.

```
+----------------+--------------------------------------------------+
|                |  [🔔]   Nome do Usuário  |  Perfil  |  [ Sair ]  |  <- Barra superior
|  📝 Avaliações |--------------------------------------------------|
|                |                                                  |
|  • Item menu 1 |                                                  |
|  • Item menu 2 |            Área de conteúdo                      |
|                |            (varia conforme a tela)               |
|                |                                                  |
|                |                                                  |
|  [ PERFIL ]    |                                                  |
+----------------+--------------------------------------------------+
   Menu lateral
```

### A) Menu lateral (à esquerda)

Reúne os atalhos para as telas disponíveis ao seu perfil. O item da tela em que você se encontra fica destacado em azul. Os itens variam conforme o perfil:

| Perfil | Itens do menu lateral |
|---|---|
| **Administrador** | Usuários |
| **Avaliador** | Processos · Banco de perguntas |
| **Candidato** | Disponíveis · Minhas avaliações |

No rodapé do menu lateral, o sistema exibe o nome do seu perfil, como forma de confirmação visual.

### B) Barra superior (no topo)

Contém, da esquerda para a direita:

- **Sino de notificações (🔔)** — clique para abrir o painel **Notificações**. Um selo numérico vermelho indica quantos avisos ainda não foram lidos (exibe "9+" quando houver mais de nove). O sistema verifica automaticamente a existência de novos avisos a cada 20 segundos.
- **Seu nome e seu perfil** — confirmam qual usuário está conectado.
- **Botão Sair** — encerra a sessão com segurança e retorna à tela de login.

### C) Área de conteúdo (ao centro)

Exibe a tela selecionada no menu lateral. É nela que os cadastros, listagens e formulários são apresentados.

### Recursos de apoio presentes nas telas

- **Ícone de informação (ℹ)** — aparece ao lado de campos que exigem atenção. Posicione o cursor do mouse sobre ele para ler uma explicação breve sobre o campo, sem sair da tela.
- **Mensagens temporárias (avisos)** — surgem no canto superior direito para confirmar uma ação ou apontar um erro. Mensagens de sucesso têm borda verde e desaparecem em 5 segundos; mensagens de erro têm borda vermelha e permanecem por 7 segundos. É possível fechá-las antecipadamente clicando no símbolo **×**.
- **Selos de situação** — pequenas etiquetas coloridas que indicam o estado de um item. A cor segue um padrão: verde para situações concluídas com êxito (Aprovado, Ativo, Corrigida), vermelho para situações negativas ou encerradas (Reprovado, Encerrado), amarelo para situações em andamento ou pendentes (Aguardando correção, Em andamento, Enviada) e cinza para rascunhos.

## 2.4 Encerramento da sessão

- **Saída manual:** clique no botão **Sair**, na barra superior. Esta é a forma recomendada de encerrar o uso, especialmente em computadores compartilhados.
- **Saída automática por inatividade:** após **30 minutos** sem nenhuma interação com o sistema, a sessão expira por segurança e será necessário fazer login novamente. Cada ação realizada renova automaticamente esse prazo.
- **Exceção importante:** durante uma prova em andamento, o candidato **não** é desconectado por inatividade. Ler enunciados e refletir sobre as respostas, sem digitar, não encerra o acesso. Nesse contexto, o que determina o encerramento é exclusivamente o cronômetro da prova.

---

# 3. Procedimentos Operacionais (Passo a Passo)

Esta seção apresenta as tarefas do dia a dia, organizadas por perfil. Localize a seção correspondente ao seu perfil de acesso.

---

## 3.1 Perfil Administrador

A função do administrador concentra-se no cadastro e na manutenção dos usuários do sistema.

### Procedimento 3.1.1 — Cadastrar um novo usuário

**Quando utilizar:** sempre que uma nova pessoa precisar de acesso ao sistema, seja como avaliador, seja como candidato.

**Passo a passo:**

1. No menu lateral, clique em **Usuários**.
2. Localize o formulário **Cadastrar usuário**, na parte superior da tela.
3. No campo **Nome**, digite o nome completo da pessoa.
4. No campo **E-mail**, digite o endereço de e-mail que ela utilizará para entrar no sistema.
5. No campo **Senha**, defina uma senha inicial com **no mínimo 6 caracteres**.
6. No campo **Perfil**, selecione uma das opções:
   - **Avaliado** — para candidatos que responderão às provas (opção pré-selecionada);
   - **Avaliador** — para quem criará e corrigirá avaliações;
   - **Administrador** — para quem cadastrará outros usuários.
7. **Somente se o perfil escolhido for "Avaliado":** o campo **Telefone (opcional)** será exibido. Preencha-o, caso deseje, no formato indicado pelo exemplo `+55 11 99999-8888`. Este campo pode ser deixado em branco.
8. Clique no botão **Cadastrar**. Durante o processamento, o botão exibirá **"Salvando..."**.
9. Confirme o êxito da operação por meio da mensagem **"Usuário cadastrado."**, exibida no canto superior direito.
10. Verifique que o novo usuário aparece na tabela abaixo do formulário, com seu nome, e-mail e perfil.
11. Comunique à pessoa cadastrada o endereço do sistema, o e-mail e a senha inicial.

**Pontos de atenção:**

- O e-mail é o identificador único de cada usuário. **Não é possível cadastrar duas pessoas com o mesmo e-mail.**
- Cada usuário recebe **um único perfil**. Se a mesma pessoa precisar atuar como avaliador e como candidato, será necessário criar dois cadastros com e-mails distintos.
- O perfil **não pode ser alterado** após o cadastro pela interface do sistema.
- Oriente o usuário a não compartilhar a senha recebida.

### Procedimento 3.1.2 — Consultar os usuários cadastrados

**Quando utilizar:** para verificar se determinada pessoa já possui acesso ou para conferir qual perfil lhe foi atribuído.

**Passo a passo:**

1. No menu lateral, clique em **Usuários**.
2. Localize a tabela abaixo do formulário de cadastro. O total de registros é exibido no cabeçalho, no formato **"X usuário(s)"**.
3. Consulte as colunas **Nome**, **E-mail** e **Perfil** para identificar o registro desejado.

**Ponto de atenção:** esta tela é apenas de consulta e cadastro. O sistema, na versão atual, não oferece funções de edição ou exclusão de usuários pela interface.

---

## 3.2 Perfil Avaliador

O avaliador conduz todo o ciclo da avaliação. A sequência recomendada de trabalho é: **cadastrar perguntas → criar o processo → adicionar perguntas e candidatos → publicar → acompanhar → corrigir → definir o resultado**.

### Procedimento 3.2.1 — Cadastrar uma pergunta dissertativa (aberta)

**Quando utilizar:** para incluir no banco uma questão cuja resposta será um texto livre, corrigido manualmente por você.

**Passo a passo:**

1. No menu lateral, clique em **Banco de perguntas**.
2. Localize o formulário **Nova pergunta**, na parte superior da tela.
3. No campo **Enunciado**, digite a pergunta que será apresentada ao candidato.
4. No campo **Tipo**, selecione **Aberta**.
5. No campo **Peso (pontos)**, informe quantos pontos a questão valerá. O valor deve ser **maior que zero**. O padrão sugerido é 10.
6. **Opcionalmente**, no campo **Instruções para o candidato**, escreva orientações sobre formato ou extensão da resposta — por exemplo, "Responda em até 5 linhas". Este texto **será exibido ao candidato** durante a prova.
7. **Opcionalmente**, no campo **Gabarito / notas do avaliador**, registre os pontos que você espera encontrar na resposta — por exemplo, "Mencionar X, Y e Z". Este texto é **visível apenas para você** no momento da correção e **nunca** é exibido ao candidato.
8. Clique em **Cadastrar pergunta**.
9. Confirme o êxito por meio da mensagem **"Pergunta cadastrada."**.

### Procedimento 3.2.2 — Cadastrar uma pergunta de múltipla escolha (fechada)

**Quando utilizar:** para incluir no banco uma questão com alternativas, corrigida automaticamente pelo sistema.

**Passo a passo:**

1. No menu lateral, clique em **Banco de perguntas**.
2. No formulário **Nova pergunta**, preencha o campo **Enunciado**.
3. No campo **Tipo**, selecione **Fechada**. A tela passará a exibir a área **Alternativas (marque a correta)**.
4. No campo **Peso (pontos)**, informe o valor da questão, sempre maior que zero.
5. Na área de alternativas, preencha o texto de cada opção nos campos disponíveis. São apresentados **dois campos iniciais**.
6. Para incluir mais opções, clique em **+ adicionar alternativa** quantas vezes forem necessárias.
7. Para remover uma opção, clique no botão **×** ao lado dela. Observe que a remoção fica indisponível quando restarem apenas duas alternativas.
8. Marque o **botão de seleção (círculo) à esquerda da alternativa correta**. Apenas uma alternativa pode ser marcada — esta é a resposta que o sistema utilizará na correção automática.
9. Clique em **Cadastrar pergunta**.
10. Confirme o êxito por meio da mensagem **"Pergunta cadastrada."**.

**Regras obrigatórias para perguntas fechadas:**

- No mínimo **duas** alternativas.
- Exatamente **uma** alternativa marcada como correta.
- Nenhum campo de alternativa pode ficar em branco.

### Procedimento 3.2.3 — Localizar, revisar, editar e excluir perguntas

**Quando utilizar:** para reaproveitar questões já criadas, corrigir um enunciado ou remover uma pergunta obsoleta.

**Para localizar uma pergunta:**

1. No menu lateral, clique em **Banco de perguntas**.
2. Localize a área de filtros, abaixo do formulário de cadastro.
3. No campo **Tipo**, selecione **Todos**, **Aberta** ou **Fechada**.
4. No campo **Buscar no enunciado**, digite uma palavra contida no texto da pergunta.
5. Clique em **Filtrar** ou pressione **Enter**.

**Para revisar o conteúdo de uma pergunta:**

1. Localize a pergunta na lista.
2. Clique em **Detalhes**. A área expandida exibirá, conforme o tipo:
   - **Perguntas abertas:** as instruções ao candidato e o gabarito de correção (destacado em amarelo, com a indicação de que somente você o vê);
   - **Perguntas fechadas:** todas as alternativas, com o símbolo **✓** e a marcação **(correta)** em verde ao lado da resposta correta.
3. Clique em **Ocultar** para recolher a área.

**Para editar uma pergunta:**

1. Localize a pergunta na lista e clique em **Editar**. O formulário no topo da tela será preenchido com os dados atuais e passará a se chamar **Editar pergunta**, com destaque visual.
2. Altere os campos desejados.
3. Clique em **Salvar alterações** ou, para desistir, clique em **Cancelar**.
4. Confirme o êxito por meio da mensagem **"Pergunta atualizada."**.

**Para excluir uma pergunta:**

1. Localize a pergunta na lista e clique em **Excluir**.
2. Confirme a operação na caixa de confirmação apresentada pelo navegador.
3. Confirme o êxito por meio da mensagem **"Pergunta excluída."**.

> **Regra fundamental:** uma pergunta **só pode ser editada ou excluída enquanto não estiver vinculada a nenhum processo avaliativo**. Essa trava existe para preservar a integridade das avaliações já montadas ou realizadas. Se você tentar alterar uma pergunta já vinculada, o sistema impedirá a ação e exibirá a mensagem **"Não é possível editar/remover — pergunta vinculada a uma avaliação."** Nesse caso, cadastre uma nova pergunta com o conteúdo corrigido.

### Procedimento 3.2.4 — Criar um processo avaliativo

**Quando utilizar:** para iniciar a montagem de uma nova prova.

**Passo a passo:**

1. No menu lateral, clique em **Processos**.
2. Clique no botão **Novo processo**. O formulário de criação será exibido. (Para fechá-lo sem criar, clique novamente no mesmo botão, agora rotulado **Fechar**.)
3. No campo **Título**, informe o nome da avaliação — por exemplo, "Processo Seletivo — Analista de Qualidade".
4. **Opcionalmente**, no campo **Descrição**, acrescente informações complementares que ajudem a identificar a avaliação.
5. No campo **Tempo (minutos)**, informe quantos minutos o candidato terá para responder. O valor padrão é 60 e deve ser maior que zero. O cronômetro começa a contar quando o candidato inicia a prova e **não pausa** em nenhuma hipótese.
6. No campo **Nota mínima (%)**, informe o percentual necessário para aprovação, entre 0 e 100. O valor padrão é 60, o que significa que o candidato precisará obter 60% do total de pontos.
7. No campo **Modo de aprovação**, escolha uma das opções:
   - **Automático** — o sistema aprova ou reprova comparando o desempenho com a nota mínima;
   - **Manual** — você decide o resultado, independentemente da nota apurada;
   - **Ambos** — o sistema calcula o resultado, mas você pode sobrescrevê-lo.
8. Marque a caixa **Exibir gabarito ao candidato após a correção** caso deseje que o candidato veja quais eram as alternativas corretas das questões fechadas ao consultar seu resultado. Deixe desmarcada para manter o gabarito reservado.
9. Clique em **Criar processo**.
10. Confirme o êxito por meio da mensagem **"Processo criado."**. O sistema conduzirá você automaticamente à tela de detalhe do processo recém-criado.

> **Situação inicial:** todo processo é criado com a situação **RASCUNHO**. Nessa condição ele ainda não é visível aos candidatos e pode ser livremente configurado.

### Procedimento 3.2.5 — Adicionar perguntas ao processo

**Pré-requisito:** o processo deve estar na situação **RASCUNHO**.

**Passo a passo:**

1. No menu lateral, clique em **Processos** e, em seguida, clique no cartão do processo desejado.
2. Localize a seção **Selecionar perguntas**. Ela lista as perguntas do seu banco que ainda **não** foram incluídas neste processo.
3. Marque a caixa de seleção de cada pergunta que deseja incluir. Cada item exibe o tipo, o enunciado e o peso, o que facilita a conferência.
4. Clique em **Adicionar selecionadas**.
5. Confirme o êxito por meio da mensagem **"Perguntas adicionadas."**.
6. Verifique o resultado na subseção **No processo (X)**, logo abaixo, que apresenta as perguntas já vinculadas em sua ordem de exibição, numeradas.

**Pontos de atenção:**

- Perguntas já adicionadas deixam de aparecer na lista de seleção, o que evita duplicidade.
- Cada pergunta conserva o peso definido no banco de perguntas.
- É necessário **ao menos uma pergunta** para publicar o processo.

### Procedimento 3.2.6 — Adicionar candidatos ao processo

**Pré-requisito:** o processo deve estar na situação **RASCUNHO** e os candidatos já devem ter sido cadastrados pelo administrador.

**Passo a passo:**

1. Na tela de detalhe do processo, localize a seção **Adicionar candidatos**. Ela lista todos os usuários com perfil de avaliado que ainda **não** foram vinculados a este processo.
2. Marque a caixa de seleção de cada candidato desejado. Cada item exibe o nome e o e-mail, o que permite distinguir homônimos.
3. Clique em **Adicionar selecionados**.
4. Confirme o êxito por meio da mensagem **"Candidatos adicionados."**.
5. Verifique o resultado na subseção **No processo (X)**, que relaciona os candidatos já vinculados.

**Pontos de atenção:**

- Somente usuários com perfil **Avaliado** podem ser adicionados como candidatos.
- Um candidato não pode ser adicionado duas vezes ao mesmo processo.
- **Apenas os candidatos vinculados conseguem visualizar e responder à avaliação.** Quem não estiver na lista simplesmente não verá o processo.
- Caso o candidato desejado não apareça na lista, solicite ao administrador que o cadastre.

### Procedimento 3.2.7 — Publicar o processo

**Quando utilizar:** quando a montagem estiver concluída e a avaliação puder ser liberada aos candidatos.

**Pré-requisitos:** o processo deve conter **ao menos uma pergunta** e **ao menos um candidato**.

**Passo a passo:**

1. Na tela de detalhe do processo, revise cuidadosamente as seções **No processo** de perguntas e de candidatos.
2. Confira, no cabeçalho da tela, o tempo, a nota mínima e o modo de aprovação configurados.
3. Clique no botão **Publicar processo**, no canto inferior direito.
4. Confirme o êxito por meio da mensagem **"Processo publicado."**.
5. Observe que o selo de situação passará de **RASCUNHO** para **ATIVO** e que a tela passará a exibir os painéis de acompanhamento.

> **Atenção — ação de efeito prático imediato:** após a publicação, a avaliação torna-se disponível aos candidatos vinculados e as seções de montagem deixam de ser exibidas. Revise a configuração antes de publicar.

### Procedimento 3.2.8 — Acompanhar o andamento da avaliação

**Quando utilizar:** durante e após a aplicação da prova, para saber quem já iniciou, quem finalizou e o que ainda falta corrigir.

**Passo a passo:**

1. No menu lateral, clique em **Processos** e abra o processo desejado (situação **ATIVO** ou **ENCERRADO**).
2. Consulte os três indicadores no topo da tela:
   - **Candidatos** — total de candidatos vinculados ao processo;
   - **Finalizaram** — quantos já enviaram a avaliação, manualmente ou por esgotamento do tempo;
   - **Tempo médio** — média de duração entre o início e o envio, considerando apenas quem finalizou.
3. Analise a tabela de acompanhamento, que apresenta uma linha por candidato com as seguintes colunas:

| Coluna | O que informa |
|---|---|
| **Candidato** | Nome do candidato. |
| **Situação** | Estado atual: *Não iniciou*, *EM_ANDAMENTO*, *ENVIADA*, *Aprovado* ou *Reprovado*. |
| **Score** | Pontuação apurada. Enquanto houver dissertativas pendentes, exibe a pontuação parcial. |
| **Abertas pend.** | Quantidade de questões dissertativas que ainda aguardam sua correção. |
| **Saídas** | Quantas vezes o candidato saiu da janela da prova durante sua realização. |
| **Tempo** | Duração total entre o início e o envio, no formato minutos e segundos. |

4. Utilize a coluna **Ações** conforme a situação de cada candidato:
   - **EM_ANDAMENTO** — botão **+ tempo**, para conceder minutos adicionais;
   - **ENVIADA** ou já corrigida — botão **corrigir**, que abre a tela de correção;
   - **Não iniciou** — nenhuma ação disponível.

> **Sobre a coluna "Saídas":** o registro é meramente informativo. Sair da janela **não** pausa o cronômetro nem encerra a prova. Um número elevado de saídas pode, contudo, indicar comportamento que mereça sua atenção.

### Procedimento 3.2.9 — Conceder tempo extra durante a prova

**Quando utilizar:** em situações pontuais e justificadas, como uma instabilidade de conexão comprovada.

**Pré-requisito:** a avaliação do candidato deve estar **EM_ANDAMENTO**.

**Passo a passo:**

1. Abra o processo e localize o candidato na tabela de acompanhamento.
2. Clique no botão **+ tempo**, na coluna de ações.
3. Na caixa apresentada pelo navegador, digite a quantidade de minutos adicionais e confirme.
4. Confirme o êxito por meio da mensagem **"+X min concedidos."**.

**Pontos de atenção:**

- O tempo é somado ao cronômetro do candidato **imediatamente**, sem que ele precise recarregar a página.
- A concessão só é possível enquanto a prova estiver em andamento. Após o envio, o sistema exibirá a mensagem **"A avaliação já foi finalizada"**.
- A concessão fica registrada no sistema.

### Procedimento 3.2.10 — Corrigir as questões dissertativas

**Quando utilizar:** após o candidato enviar a avaliação. Você será avisado pelo sino de notificações a cada novo envio.

**Passo a passo:**

1. Abra o processo e, na tabela de acompanhamento, clique em **corrigir** na linha do candidato.
2. A tela **Correção** será aberta, apresentando todas as questões da prova.
3. Percorra as questões. As de **múltipla escolha** já aparecem corrigidas, com a indicação **✓ Acertou** ou **✗ Errou**, a pontuação obtida e a observação *(correção automática)*. Nenhuma ação é necessária nessas questões.
4. Para cada questão **dissertativa**:
   - a. Leia o **Gabarito / notas do avaliador**, apresentado em destaque amarelo, caso você o tenha cadastrado;
   - b. Leia a **Resposta do candidato**, apresentada em fundo cinza. Respostas não preenchidas aparecem como *(em branco)*;
   - c. No campo **Pontos (0 a Y)**, digite a pontuação atribuída. O valor deve estar entre zero e o peso da questão;
   - d. **Opcionalmente**, no campo **Observação**, registre um comentário. Este texto **será exibido ao candidato** junto ao resultado;
   - e. Clique em **Salvar nota**;
   - f. Confirme o êxito por meio da mensagem **"Correção registrada."**.
5. Repita o passo 4 até que todas as questões dissertativas tenham sido pontuadas.

**Pontos de atenção:**

- Somente o avaliador responsável pelo processo pode corrigi-lo.
- A pontuação atribuída não pode exceder o peso da questão. Caso isso ocorra, o sistema exibirá **"Máximo X pontos nesta questão."**
- Corrija questão por questão, salvando cada uma individualmente.
- **O resultado total e a aprovação automática só são calculados após a correção de todas as dissertativas.**

### Procedimento 3.2.11 — Registrar o feedback e definir o resultado

**Quando utilizar:** ao concluir a correção de todas as questões dissertativas do candidato.

**Passo a passo:**

1. Na tela **Correção**, role até a seção final, que reúne o feedback e a decisão de aprovação.
2. No campo **Feedback geral**, escreva a devolutiva qualitativa sobre o desempenho do candidato. Este texto ficará visível a ele após a conclusão da correção.
3. Clique em **Salvar feedback** e confirme o êxito por meio da mensagem **"Feedback salvo."**.
4. Defina o resultado clicando em um dos botões:
   - **Aprovar** — registra a aprovação do candidato;
   - **Reprovar** — registra a reprovação do candidato.
5. Confirme a operação na caixa de confirmação apresentada pelo navegador.
6. Confirme o êxito por meio da mensagem **"Candidato aprovado."** ou **"Candidato reprovado."**.

**Pontos de atenção:**

- **A decisão manual sempre prevalece sobre o cálculo automático.** Ainda que o processo esteja configurado como Automático ou Ambos, um clique em **Aprovar** ou **Reprovar** substitui o resultado calculado e fica registrado como decisão manual.
- Se o processo estiver no modo **Automático**, o sistema define o resultado sozinho assim que a última dissertativa for corrigida, comparando o percentual obtido com a nota mínima. Nesse caso, os botões só devem ser utilizados se você desejar alterar a definição.
- Ao concluir a correção, o candidato recebe automaticamente um aviso de que seu resultado está disponível.

### Procedimento 3.2.12 — Consultar as notificações de novos envios

**Passo a passo:**

1. Observe o sino de notificações (🔔) na barra superior. O selo numérico vermelho indica quantos avisos ainda não foram lidos.
2. Clique no sino para abrir o painel **Notificações**.
3. Identifique os avisos não lidos, exibidos em negrito e com um ponto azul à esquerda.
4. Clique sobre o aviso desejado. O sistema marcará o aviso como lido e conduzirá você diretamente à tela correspondente.

---

## 3.3 Perfil Candidato (Avaliado)

### Procedimento 3.3.1 — Consultar as avaliações disponíveis

**Passo a passo:**

1. No menu lateral, clique em **Disponíveis**.
2. Analise os cartões apresentados. Cada um corresponde a uma avaliação que você pode iniciar e exibe o título, a descrição e, na parte inferior, a quantidade de perguntas e o tempo de prova em minutos.

**Se a mensagem "Nenhuma avaliação disponível no momento." for exibida,** verifique as seguintes possibilidades:

- Você ainda não foi vinculado a nenhuma avaliação — procure o avaliador responsável;
- A avaliação ainda não foi publicada;
- A data de início ainda não chegou ou a data de término já passou;
- Você já respondeu à avaliação — nesse caso, consulte **Minhas avaliações**.

### Procedimento 3.3.2 — Iniciar uma avaliação

> **Prepare-se antes de iniciar.** O cronômetro começa a contar no momento em que você confirma o início e **não pode ser pausado em nenhuma hipótese**. Reserve tempo suficiente, verifique sua conexão e evite interrupções.

**Passo a passo:**

1. No menu lateral, clique em **Disponíveis**.
2. Localize o cartão da avaliação desejada e confira o tempo previsto.
3. Clique no botão **Iniciar avaliação**.
4. Leia atentamente a caixa de confirmação: *Iniciar "[título]"? O tempo de [X] min começa a contar agora.*
5. Clique em **OK** para confirmar ou em **Cancelar** para desistir.
6. Aguarde a abertura da tela de prova. O botão exibirá **"Iniciando..."** durante o processamento.

**Pontos de atenção:**

- **Cada avaliação pode ser iniciada uma única vez.** Não existe a possibilidade de reiniciar a prova do zero.
- Se você sair e retornar dentro do prazo, retomará exatamente do ponto em que parou, com as respostas preservadas — mas o tempo terá continuado a correr.

### Procedimento 3.3.3 — Responder às questões

**Passo a passo:**

1. Ao iniciar a prova, observe a **barra fixa no topo da tela**, que permanece visível durante toda a avaliação:
   - À esquerda, a indicação **"Avaliação em andamento"**;
   - À direita, o **cronômetro** com o tempo restante, no formato horas e minutos. Quando restar menos de um minuto, o cronômetro passará a ser exibido em vermelho.
2. Percorra as questões, apresentadas uma abaixo da outra. O cabeçalho de cada uma informa o número, o valor em pontos e o tipo — *Dissertativa* ou *Múltipla escolha*.
3. Leia o enunciado e, quando houver, as instruções complementares apresentadas em texto menor logo abaixo.
4. Responda conforme o tipo da questão:
   - **Questão dissertativa:** clique na área de texto e digite sua resposta;
   - **Questão de múltipla escolha:** clique sobre a alternativa escolhida. A opção selecionada ficará destacada com borda e fundo azuis. Para trocar, basta clicar em outra alternativa.
5. Acompanhe o salvamento. Ao lado do número da questão, a indicação **"salvando…"** surge brevemente e desaparece quando a resposta é registrada.
6. Revise suas respostas quantas vezes desejar. **Todas as respostas podem ser alteradas livremente até o envio.**

**Pontos de atenção:**

- **O salvamento é automático.** Não existe botão de salvar: cada resposta é registrada sozinha, poucos instantes após você parar de digitar, e as alternativas são registradas imediatamente ao clique.
- **As funções de copiar, recortar e colar estão bloqueadas** nas áreas da prova, assim como o menu do botão direito do mouse. Trata-se de uma medida para preservar a integridade da avaliação. Digite suas respostas diretamente na tela.
- **O tempo continua correndo mesmo que você mude de aba ou minimize a janela.** Além disso, cada saída da janela da prova é registrada e fica visível ao avaliador.
- Você **não** será desconectado por permanecer lendo ou refletindo sem digitar.

### Procedimento 3.3.4 — Finalizar e enviar a avaliação

**Passo a passo:**

1. Antes de enviar, role a tela do início ao fim e confirme que todas as questões que você pretendia responder estão preenchidas.
2. Clique no botão **Finalizar e enviar**, no canto inferior direito da tela.
3. Leia a caixa de confirmação: *Finalizar e enviar a avaliação? Você não poderá alterar as respostas depois.*
4. Clique em **OK** para confirmar em definitivo, ou em **Cancelar** para continuar respondendo.
5. Aguarde o processamento. O botão exibirá **"Enviando..."**.
6. Confirme o êxito por meio da mensagem **"Avaliação enviada."**. O sistema conduzirá você automaticamente à tela de resultado.

> **Ação irreversível:** após o envio, **nenhuma resposta pode ser alterada**. Se você tentar fazê-lo, o sistema exibirá a mensagem **"A avaliação já foi finalizada"**.

**Envio automático por esgotamento do tempo:** caso o tempo termine antes de você clicar em **Finalizar e enviar**, o sistema exibirá o aviso **"Tempo esgotado. Enviando suas respostas..."** e enviará automaticamente tudo o que já havia sido salvo. Nenhuma resposta registrada é perdida.

### Procedimento 3.3.5 — Acompanhar as avaliações e consultar o resultado

**Para acompanhar a situação das suas avaliações:**

1. No menu lateral, clique em **Minhas avaliações**.
2. Analise a lista. Cada linha corresponde a uma avaliação e apresenta, à esquerda, o título e, quando aplicável, a nota obtida ou a indicação **"X questão(ões) aguardando correção"**; à direita, o selo com a situação atual.
3. Clique sobre a linha desejada. Se a avaliação ainda estiver em andamento, você retornará à prova; caso contrário, será conduzido à tela de resultado.

**Para consultar o resultado detalhado:**

1. Na tela **Resultado**, confira o selo de situação no cabeçalho: **Aguardando correção**, **Avaliada**, **Aprovado** ou **Reprovado**.
2. Consulte os indicadores de pontuação:
   - **Score (fechadas)** — soma dos pontos das questões de múltipla escolha, disponível imediatamente após o envio;
   - **Score total** — soma de todas as questões, exibida apenas depois que o avaliador concluir a correção das dissertativas.
3. Caso a correção ainda esteja pendente, você verá um aviso em fundo amarelo informando que o resultado final e o feedback aparecerão ali quando concluídos.
4. Leia o **Feedback do avaliador**, quando disponível.
5. Percorra a seção de resultado por questão. Para cada uma são exibidos o enunciado, a pontuação no formato *obtido/total*, a sua resposta e, quando houver, a **Observação do avaliador**.
6. Nas questões de múltipla escolha, a alternativa correta será exibida **somente se o avaliador tiver configurado o processo para isso**. A ausência dessa informação não constitui erro do sistema.

### Procedimento 3.3.6 — Consultar as notificações

**Passo a passo:**

1. Observe o sino de notificações (🔔) na barra superior. O selo numérico vermelho indica a existência de avisos não lidos.
2. Clique no sino para abrir o painel **Notificações**.
3. Clique sobre o aviso de resultado disponível. O sistema o marcará como lido e conduzirá você diretamente à tela de resultado correspondente.

---

# 4. Resolução de Problemas Comuns (FAQ / Erros)

## 4.1 Problemas de acesso

### "Credenciais inválidas"

**O que significa:** o e-mail ou a senha informados não correspondem a um cadastro válido.

**Como proceder:**
1. Verifique se o e-mail foi digitado integralmente e sem espaços antes ou depois do texto.
2. Verifique se a tecla **Caps Lock** está desativada. A senha diferencia maiúsculas de minúsculas.
3. Confirme com o administrador se o seu cadastro foi efetivamente concluído.
4. **Não** insista em novas tentativas: após cinco erros consecutivos, o acesso será bloqueado temporariamente.

### "Acesso bloqueado temporariamente. Tente mais tarde"

**O que significa:** foram registradas **cinco tentativas seguidas** de acesso com credenciais incorretas. Trata-se de uma proteção contra tentativas indevidas de invasão.

**Como proceder:**
1. Aguarde **15 minutos** sem realizar novas tentativas.
2. Passado esse período, tente novamente com as credenciais corretas.
3. Se não tiver certeza da senha, contate o administrador **antes** de tentar de novo — o contador de erros é zerado apenas por um acesso bem-sucedido.

### "Informe e-mail e senha."

**O que significa:** um dos campos da tela de login ficou em branco.

**Como proceder:** preencha ambos os campos e clique novamente em **Entrar**.

### "Não foi possível entrar. Verifique suas credenciais."

**O que significa:** o sistema não conseguiu concluir a autenticação.

**Como proceder:**
1. Confira o e-mail e a senha, conforme orientado acima.
2. Verifique sua conexão com a internet.
3. Persistindo a falha, comunique à área de tecnologia, pois o serviço pode estar temporariamente indisponível.

### Esqueci minha senha

**Como proceder:** o sistema não dispõe de recuperação automática de senha. Contate o administrador, que providenciará uma nova credencial de acesso.

### Fui desconectado sem aviso

**O que significa:** a sessão expirou após **30 minutos** sem nenhuma interação.

**Como proceder:** faça login novamente. Lembre-se de que essa regra **não se aplica** durante uma prova em andamento.

### "Você não tem permissão para esta ação"

**O que significa:** foi solicitada uma função que não pertence ao seu perfil.

**Como proceder:** utilize apenas as telas disponíveis no seu menu lateral. Se você precisa executar uma tarefa de outro perfil, solicite ao administrador a criação de um cadastro específico, com e-mail distinto.

## 4.2 Problemas do Administrador

### "Preencha nome, e-mail e senha."

**O que significa:** um dos campos obrigatórios do cadastro ficou em branco.

**Como proceder:** preencha os três campos e clique novamente em **Cadastrar**. Apenas o telefone é opcional.

### O cadastro é recusado por e-mail já existente

**O que significa:** já existe um usuário registrado com esse endereço de e-mail.

**Como proceder:**
1. Consulte a tabela de usuários para localizar o cadastro existente.
2. Se a pessoa já possui acesso, oriente-a a utilizar as credenciais existentes.
3. Se for realmente necessário um segundo cadastro — por exemplo, para a mesma pessoa atuar em outro perfil —, utilize um endereço de e-mail diferente.

### "A senha deve ter ao menos 6 caracteres"

**Como proceder:** informe uma senha com seis caracteres ou mais.

### O campo Telefone não aparece

**O que significa:** o comportamento é esperado. O campo **Telefone (opcional)** é exibido somente quando o perfil selecionado é **Avaliado**.

## 4.3 Problemas do Avaliador

### "Não é possível editar/remover — pergunta vinculada a uma avaliação."

**O que significa:** a pergunta já foi incluída em um processo avaliativo. Alterá-la comprometeria a integridade das provas montadas ou já realizadas.

**Como proceder:** cadastre uma nova pergunta com o conteúdo corrigido e utilize-a nos próximos processos. A pergunta original permanecerá vinculada ao processo existente.

### "Informe ao menos duas alternativas"

**Como proceder:** clique em **+ adicionar alternativa** até que existam pelo menos duas opções preenchidas.

### "Indique a alternativa correta" ou "Marque apenas uma alternativa correta"

**Como proceder:** marque o botão de seleção de **exatamente uma** alternativa, que servirá de gabarito para a correção automática.

### "O peso deve ser maior que zero."

**Como proceder:** informe um valor positivo no campo **Peso (pontos)**. Questões sem pontuação não são admitidas.

### "A nota mínima deve estar entre 0 e 100"

**O que significa:** a nota mínima é um **percentual**, não uma pontuação absoluta.

**Como proceder:** informe um número entre 0 e 100. Para exigir 60% dos pontos, digite `60`.

### Não consigo publicar o processo

**Como proceder:** verifique os dois pré-requisitos obrigatórios:
1. O processo contém **ao menos uma pergunta**? Se não, o sistema exibirá **"Adicione ao menos uma pergunta antes de publicar"**.
2. O processo contém **ao menos um candidato**? Se não, adicione-os na seção correspondente.

### O candidato não aparece na lista para ser adicionado

**Possíveis causas e providências:**
1. O usuário ainda não foi cadastrado — solicite o cadastro ao administrador.
2. O usuário foi cadastrado com perfil de avaliador ou administrador — apenas usuários com perfil **Avaliado** podem ser candidatos.
3. O candidato **já foi adicionado** a este processo — verifique a subseção **No processo (X)**, pois candidatos já vinculados deixam de aparecer na lista de seleção.

### Não consigo mais adicionar perguntas ou candidatos

**O que significa:** o processo já foi publicado. As seções de montagem só ficam disponíveis enquanto a situação é **RASCUNHO**.

**Como proceder:** crie um novo processo com a configuração desejada. Não é possível alterar a composição de um processo já publicado.

### "Máximo X pontos nesta questão."

**O que significa:** a pontuação informada excede o peso definido para a questão.

**Como proceder:** informe um valor entre zero e o peso indicado no rótulo do campo, apresentado no formato **Pontos (0 a Y)**.

### O score total do candidato não é exibido

**O que significa:** ainda há questões dissertativas pendentes de correção.

**Como proceder:** consulte a coluna **Abertas pend.** na tabela de acompanhamento e corrija as questões restantes. O total e a aprovação automática só são calculados quando **todas** as dissertativas tiverem sido pontuadas.

### O candidato aparece como "Não iniciou"

**O que significa:** o candidato foi vinculado ao processo, mas ainda não abriu a prova.

**Como proceder:** confirme que ele possui acesso ao sistema e que foi comunicado sobre a avaliação. Não há pontuação nem ações de correção disponíveis nessa situação.

### "A avaliação já foi finalizada"

**O que significa:** houve tentativa de conceder tempo extra a um candidato que já enviou a prova.

**Como proceder:** não há providência aplicável. O tempo extra só pode ser concedido durante a realização da prova. Prossiga para a correção.

## 4.4 Problemas do Candidato

### Não vejo nenhuma avaliação disponível

**Possíveis causas e providências:**
1. Você não foi vinculado a nenhum processo — contate o avaliador responsável.
2. A avaliação ainda não foi publicada — aguarde a comunicação do avaliador.
3. A data de início ainda não chegou ou a data de término já passou.
4. Você já respondeu à avaliação — consulte **Minhas avaliações**.

### Minha conexão caiu durante a prova

**Como proceder:**
1. Restabeleça a conexão com a internet.
2. Acesse o sistema novamente com suas credenciais.
3. Clique em **Minhas avaliações** e, em seguida, na avaliação em andamento.
4. Você retomará a prova exatamente no ponto em que parou, com **todas as respostas salvas preservadas**.

> **Atenção:** o tempo **não é pausado** durante a interrupção. Os minutos decorridos serão descontados do seu tempo restante. Se o prazo terminar enquanto você estiver sem acesso, a prova será enviada automaticamente com as respostas já registradas.

### Fechei a janela por engano

**Como proceder:** siga exatamente os passos do item anterior. O procedimento é o mesmo e suas respostas estarão preservadas.

### Não consigo colar um texto na resposta

**O que significa:** o comportamento é intencional. As funções de copiar, recortar e colar estão bloqueadas nas áreas da prova, como medida de integridade da avaliação.

**Como proceder:** digite a resposta diretamente no campo.

### Não encontro o botão de salvar

**O que significa:** o sistema não possui botão de salvar. **O salvamento é automático.**

**Como proceder:** observe a indicação **"salvando…"** ao lado do número da questão. Ela surge logo após você digitar e desaparece quando a resposta é registrada.

### "Erro ao salvar resposta."

**O que significa:** houve falha momentânea na comunicação com o servidor.

**Como proceder:**
1. Verifique sua conexão com a internet.
2. Faça uma pequena alteração na resposta — acrescente e remova um caractere — para provocar uma nova tentativa de salvamento.
3. Aguarde a indicação **"salvando…"** desaparecer.
4. Persistindo o erro, comunique imediatamente o avaliador, que poderá conceder tempo extra.

### O tempo acabou antes de eu enviar

**O que significa:** o sistema enviou automaticamente todas as respostas que já haviam sido salvas.

**Como proceder:** nenhuma providência é necessária. Nenhuma resposta registrada foi perdida. Consulte **Minhas avaliações** para acompanhar a correção.

### Enviei sem querer / quero alterar uma resposta enviada

**O que significa:** o envio é definitivo. Após a finalização, nenhuma resposta pode ser modificada.

**Como proceder:** não há como reverter pela interface. Contate imediatamente o avaliador responsável e relate a ocorrência.

### Minha avaliação está "Aguardando correção" há dias

**O que significa:** existem questões dissertativas que ainda dependem da análise manual do avaliador.

**Como proceder:** aguarde. Você receberá uma notificação pelo sino assim que a correção for concluída. Caso o prazo se estenda além do previsto pela sua organização, entre em contato com o avaliador responsável.

### Não vejo as alternativas corretas no meu resultado

**O que significa:** o comportamento é esperado. A exibição do gabarito é uma configuração definida pelo avaliador em cada processo.

**Como proceder:** se você precisar conhecer as respostas corretas, solicite-as ao avaliador responsável.

### Iniciei a prova por engano e quero recomeçar

**O que significa:** cada avaliação pode ser iniciada uma única vez e não pode ser reiniciada.

**Como proceder:** contate imediatamente o avaliador. Ele poderá conceder tempo extra, conforme a política da sua organização.

## 4.5 Problemas gerais

### A tela não carrega ou fica em branco

**Como proceder:**
1. Atualize a página pressionando **F5**.
2. Verifique sua conexão com a internet.
3. Limpe o cache do navegador ou abra o sistema em uma janela anônima.
4. Teste outro navegador entre os recomendados.
5. Persistindo o problema, comunique à área de tecnologia.

> **Exceção:** se você estiver **realizando uma prova**, evite limpar o cache. Apenas atualize a página com **F5** — suas respostas salvas serão recuperadas automaticamente.

### Os botões não respondem ao clique

**Como proceder:**
1. Verifique se o JavaScript está habilitado no navegador.
2. Desative temporariamente extensões e bloqueadores de conteúdo.
3. Atualize a página pressionando **F5**.

### As mensagens desaparecem antes de eu conseguir ler

**O que significa:** as mensagens de sucesso permanecem visíveis por 5 segundos e as de erro por 7 segundos.

**Como proceder:** posicione o cursor sobre a mensagem para lê-la com calma, ou repita a operação para que ela seja exibida novamente.

### O sino de notificações não atualiza

**O que significa:** o sistema verifica a existência de novos avisos a cada 20 segundos.

**Como proceder:** aguarde alguns instantes ou atualize a página pressionando **F5**.

---

# 5. Glossário

| Termo | Definição |
|---|---|
| **Administrador** | Perfil de acesso responsável por cadastrar usuários e manter os acessos ao sistema. Não cria avaliações nem responde provas. |
| **Alternativa** | Cada uma das opções de resposta de uma pergunta fechada. Uma delas — e apenas uma — é marcada como correta. |
| **Aprovação automática** | Modo em que o sistema define aprovação ou reprovação comparando o desempenho percentual do candidato com a nota mínima do processo. Ocorre somente após a correção de todas as dissertativas. |
| **Aprovação manual** | Modo em que o avaliador decide o resultado por meio dos botões **Aprovar** e **Reprovar**. A decisão manual sempre prevalece sobre a automática. |
| **Autenticação** | Processo de identificação do usuário por meio de e-mail e senha, realizado na tela de login. |
| **Avaliado** | Denominação técnica do candidato no sistema. É o perfil de quem responde às avaliações. |
| **Avaliador** | Perfil de acesso responsável por criar perguntas, montar processos avaliativos, acompanhar a aplicação, corrigir questões dissertativas e definir resultados. |
| **Banco de perguntas** | Repositório pessoal de perguntas de cada avaliador. As perguntas ali cadastradas podem ser reutilizadas em diversos processos avaliativos. |
| **Candidato** | Pessoa vinculada a um processo avaliativo para respondê-lo. Corresponde ao perfil **Avaliado**. |
| **Cronômetro** | Contador regressivo exibido no topo da tela durante a prova. Indica o tempo restante e não pode ser pausado. |
| **Enunciado** | Texto da pergunta apresentado ao candidato. |
| **Envio automático** | Remessa das respostas realizada pelo próprio sistema quando o tempo da prova se esgota, preservando tudo o que havia sido salvo. |
| **Feedback geral** | Comentário qualitativo redigido pelo avaliador sobre o desempenho global do candidato. Fica visível a ele após a conclusão da correção. |
| **Gabarito** | Em perguntas fechadas, a alternativa correta utilizada na correção automática. Em perguntas abertas, as anotações de referência do avaliador, jamais exibidas ao candidato. |
| **Instruções** | Orientações complementares de uma pergunta aberta — por exemplo, sobre extensão ou formato da resposta. São exibidas ao candidato durante a prova. |
| **Nota mínima** | Percentual de acertos exigido para aprovação, definido na criação do processo. Expresso de 0 a 100. |
| **Notificação** | Aviso interno do sistema, acessível pelo sino na barra superior. Informa ao avaliador sobre novos envios e ao candidato sobre resultados disponíveis. |
| **Observação** | Comentário do avaliador registrado em uma questão específica durante a correção. Fica visível ao candidato na tela de resultado. |
| **Peso** | Valor em pontos atribuído a uma pergunta. A nota final resulta da soma dos pontos obtidos dividida pela soma dos pesos de todas as questões. |
| **Perfil** | Conjunto de permissões de um usuário. Cada usuário possui um único perfil: Administrador, Avaliador ou Avaliado. |
| **Pergunta aberta (dissertativa)** | Questão respondida em texto livre, corrigida manualmente pelo avaliador. |
| **Pergunta fechada (múltipla escolha)** | Questão com alternativas, em que o candidato escolhe uma opção. É corrigida automaticamente pelo sistema. |
| **Processo avaliativo** | Conjunto formado por uma prova completa: título, tempo, nota mínima, regra de aprovação, perguntas selecionadas e candidatos vinculados. |
| **Publicação** | Ato de liberar um processo aos candidatos, alterando sua situação de **RASCUNHO** para **ATIVO**. |
| **Saída de janela** | Registro de cada vez que o candidato alterna para outra aba ou janela durante a prova. É informativo e visível ao avaliador; não interrompe o cronômetro. |
| **Salvamento automático** | Registro das respostas realizado pelo sistema sem ação do usuário, poucos instantes após cada alteração. |
| **Score (fechadas)** | Soma dos pontos obtidos apenas nas questões de múltipla escolha. Fica disponível imediatamente após o envio da prova. Também chamado de pontuação parcial. |
| **Score total** | Soma dos pontos de todas as questões, abertas e fechadas. Disponível somente após a correção completa. |
| **Sessão** | Período em que o usuário permanece conectado. Expira após 30 minutos de inatividade, exceto durante uma prova em andamento. |
| **Tempo extra** | Minutos adicionais concedidos pelo avaliador a um candidato durante a realização da prova. São somados ao cronômetro de imediato. |
| **Tentativa** | Registro da participação de um candidato em um processo avaliativo, contendo suas respostas, tempos e pontuação. Cada candidato possui uma única tentativa por processo. |

## Situações do processo avaliativo

| Situação | Significado |
|---|---|
| **RASCUNHO** | O processo está em montagem. Perguntas e candidatos podem ser adicionados. Não é visível aos candidatos. |
| **ATIVO** | O processo foi publicado e está disponível aos candidatos vinculados. |
| **ENCERRADO** | O processo foi finalizado e não aceita novas participações. |

## Situações da avaliação do candidato

| Situação | Significado |
|---|---|
| **Não iniciou** | O candidato foi vinculado ao processo, mas ainda não abriu a prova. |
| **EM_ANDAMENTO** | O candidato iniciou a prova e o cronômetro está correndo. |
| **ENVIADA** | As respostas foram enviadas e aguardam a correção das questões dissertativas. |
| **CORRIGIDA** | A correção foi concluída. O resultado e o feedback estão disponíveis ao candidato. |
| **Aguardando correção** | Denominação exibida ao candidato enquanto há questões pendentes de análise pelo avaliador. |
| **Aprovado** | O candidato atingiu o resultado exigido, por definição automática ou manual. |
| **Reprovado** | O candidato não atingiu o resultado exigido, por definição automática ou manual. |

## Modos de aprovação

| Modo | Comportamento |
|---|---|
| **Automático** | O sistema aprova ou reprova comparando o desempenho com a nota mínima, após a correção de todas as dissertativas. |
| **Manual** | O avaliador decide o resultado, independentemente da pontuação apurada. |
| **Ambos** | O sistema calcula o resultado, mas o avaliador pode sobrescrevê-lo. A decisão manual prevalece. |

---

## Anexo — Referência rápida de mensagens do sistema

### Mensagens de confirmação (borda verde)

| Mensagem | Contexto |
|---|---|
| "Usuário cadastrado." | Novo usuário criado com êxito. |
| "Pergunta cadastrada." | Nova pergunta incluída no banco. |
| "Pergunta atualizada." | Alteração de pergunta salva. |
| "Pergunta excluída." | Pergunta removida do banco. |
| "Processo criado." | Novo processo criado como rascunho. |
| "Perguntas adicionadas." | Perguntas vinculadas ao processo. |
| "Candidatos adicionados." | Candidatos vinculados ao processo. |
| "Processo publicado." | Processo liberado aos candidatos. |
| "+X min concedidos." | Tempo extra concedido a um candidato. |
| "Correção registrada." | Pontuação de uma questão dissertativa salva. |
| "Feedback salvo." | Feedback geral registrado. |
| "Candidato aprovado." | Aprovação manual registrada. |
| "Candidato reprovado." | Reprovação manual registrada. |
| "Avaliação enviada." | Prova finalizada e enviada pelo candidato. |

### Mensagens de erro (borda vermelha)

| Mensagem | Providência |
|---|---|
| "Informe e-mail e senha." | Preencher ambos os campos de login. |
| "Não foi possível entrar. Verifique suas credenciais." | Conferir e-mail e senha. |
| "Credenciais inválidas" | Conferir e-mail e senha; evitar novas tentativas em sequência. |
| "Acesso bloqueado temporariamente. Tente mais tarde" | Aguardar 15 minutos. |
| "Você não tem permissão para esta ação" | Utilizar apenas as funções do seu perfil. |
| "Preencha nome, e-mail e senha." | Completar os campos obrigatórios do cadastro. |
| "A senha deve ter ao menos 6 caracteres" | Informar senha mais longa. |
| "Informe o enunciado." | Preencher o texto da pergunta. |
| "O peso deve ser maior que zero." | Informar valor positivo. |
| "Informe ao menos duas alternativas" | Acrescentar alternativas à pergunta fechada. |
| "Não é possível editar/remover — pergunta vinculada a uma avaliação." | Criar uma nova pergunta com o conteúdo corrigido. |
| "Informe o título." | Preencher o título do processo. |
| "A nota mínima deve estar entre 0 e 100" | Informar percentual válido. |
| "Selecione ao menos uma pergunta." | Marcar perguntas antes de adicionar. |
| "Selecione ao menos um candidato." | Marcar candidatos antes de adicionar. |
| "Adicione ao menos uma pergunta antes de publicar" | Compor o processo antes de publicá-lo. |
| "Informe os pontos." | Preencher a pontuação na correção. |
| "Máximo X pontos nesta questão." | Informar valor entre zero e o peso da questão. |
| "A avaliação já foi finalizada" | Nenhuma alteração é possível após o envio. |
| "O tempo da avaliação foi encerrado" | A prova foi enviada automaticamente. |
| "Erro ao salvar resposta." | Verificar a conexão e provocar novo salvamento. |

### Mensagens informativas

| Mensagem | Contexto |
|---|---|
| "Tempo esgotado. Enviando suas respostas..." | O prazo terminou e o envio automático está em curso. |

---

*Documento elaborado para operadores finais do Sistema de Avaliação de Candidatos. Em caso de dúvidas não contempladas neste manual, contate o administrador do sistema ou a área de tecnologia da sua organização.*
