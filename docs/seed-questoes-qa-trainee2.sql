-- ============================================================
-- Seed: Questões de Avaliação QA Trainee
-- 31 questões abertas | instrucoes = null (sem dica ao candidato)
--                      | gabarito   = guia do avaliador (nunca exposto ao candidato)
--
-- INSTRUÇÃO: substitua o e-mail abaixo pelo e-mail do avaliador
-- cadastrado no sistema antes de executar.
-- ============================================================

DO $$
DECLARE
  vid TEXT;
BEGIN

  SELECT id INTO vid
    FROM usuarios
   WHERE email = 'seu.email@dominio.com'
   LIMIT 1;

  IF vid IS NULL THEN
    RAISE EXCEPTION 'Avaliador não encontrado. Ajuste o e-mail na linha acima.';
  END IF;

  INSERT INTO perguntas
    (id, avaliador_id, enunciado, tipo, peso, instrucoes, gabarito, ativa, criado_em)
  VALUES

  -- ══════════════════════════════════════════════════════
  -- FUNDAMENTOS DE QA
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'O que é um bug? Qual a diferença entre erro, defeito e falha?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Resposta esperada: Bug/Defeito é uma discrepância entre o comportamento esperado e o comportamento obtido. Erro é o engano humano que causou o defeito. Falha é quando o defeito se manifesta durante a execução. Bom sinal: mencionar o exemplo concreto de um bug que encontrou no desafio. Red flag: confunde bug com falta de funcionalidade ou com erro de programação apenas.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Qual a diferença entre condição de teste e caso de teste?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Condição de teste: o QUE testar (ex: ''o sistema deve rejeitar IDs negativos''). Caso de teste: o COMO testar, com pré-condição, passos detalhados e resultado esperado. Bom sinal: conseguir dar um exemplo de cada. Red flag: achar que são a mesma coisa ou inverter os conceitos.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Um bug que trava o sistema mas só aparece num cenário que 0,1% dos usuários usa — qual seria sua severidade e prioridade?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Severidade alta (trava o sistema) mas prioridade baixa (poucos usuários afetados). Severidade = impacto técnico. Prioridade = urgência de correção, que depende do contexto de negócio. Red flag: achar que severidade alta = prioridade alta sempre.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Me explica com suas palavras o que são testes exploratórios e quando você usaria.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Teste exploratório é onde aprendizado, design e execução acontecem ao mesmo tempo, sem script fixo. Você usa quando quer descobrir problemas desconhecidos, não apenas confirmar o que já sabe. Bom sinal: mencionar Michael Bolton ou a distinção checking/testing. Red flag: confundir com ''testar sem planejamento'' ou ''testar à toa''.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é a pirâmide de testes e por que ela importa?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Base: testes de unidade (muitos, rápidos, baratos). Meio: testes de integração. Topo: testes E2E/UI (poucos, lentos, caros). Quanto mais alto na pirâmide, mais caro e frágil o teste. Bom sinal: entender que inverter a pirâmide é um problema de custo e velocidade. Red flag: não saber o que cada nível representa.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é um smoke test e quando ele é executado?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Um conjunto mínimo de testes para verificar se o build básico está funcional antes de rodar testes mais completos. É executado logo após um novo deploy ou build. Origem: testar hardware para ver se soltava fumaça. Red flag: confundir com teste de performance ou teste de sanidade.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são heurísticas de teste?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Atalhos de raciocínio baseados em experiência que guiam o que testar. Ex: testar valores limite, testar campos obrigatórios vazios, testar com usuário sem permissão. Não garantem encontrar todos os bugs, mas aumentam a probabilidade. Bom sinal: dar exemplos práticos. Red flag: não conhecer o termo — perguntar se já usou o raciocínio sem saber o nome.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é data-driven testing?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Técnica onde o mesmo caso de teste é executado múltiplas vezes com dados diferentes (de uma planilha ou fonte externa). Permite testar muitas combinações sem duplicar o código do teste. Red flag: não conhecer o termo — aceitável para trainee se conseguir descrever o conceito.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Quando você usaria uma tabela de decisão nos seus testes?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Quando existe uma combinação de condições que levam a diferentes resultados. Ex: usuário admin + produto disponível = ação X; usuário comum + produto esgotado = ação Y. Ajuda a mapear todas as combinações possíveis.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- API REST
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Me explica o que é uma API como se eu não soubesse nada de tecnologia.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'API é uma interface que permite que dois sistemas se comuniquem. Ex: quando você paga com cartão numa loja, a loja chama a API do banco para verificar o saldo. Bom sinal: usar analogia simples sem jargão. Red flag: explicação apenas técnica sem conseguir simplificar.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Qual a diferença entre frontend e backend? Por que um QA precisa entender isso?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Frontend: o que o usuário vê (tela, botões). Backend: a lógica e os dados por trás. Um QA precisa entender porque um bug pode estar em qualquer camada, e testar só a tela não garante que o backend está correto. Bom sinal: mencionar que APIs são testes de backend.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Quais são os principais verbos HTTP e quando cada um é usado?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'GET: buscar dados. POST: criar. PUT: atualizar (substituição total). DELETE: deletar. PATCH: atualização parcial. Bom sinal: diferenciar PUT de PATCH. Red flag: não saber que GET não tem body, ou confundir POST com PUT.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Me diz o que significam: 200, 201, 400, 401, 403, 404, 500.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   '200 OK. 201 Created. 400 Bad Request (erro do cliente). 401 Unauthorized (não autenticado). 403 Forbidden (autenticado mas sem permissão). 404 Not Found. 500 Internal Server Error. Red flag: não saber a diferença entre 401 e 403.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é JSON e por que é usado em APIs?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'JSON (JavaScript Object Notation) é um formato leve de texto para estruturar e trocar dados. Fácil de ler por humanos e máquinas. Alternativa ao XML. Ex: {"nome": "João", "idade": 30}. Red flag: confundir JSON com JavaScript.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Para que servem os headers numa requisição HTTP? Me dá um exemplo.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Headers carregam metadados da requisição: tipo de conteúdo (Content-Type: application/json), autenticação (Authorization: Bearer token), idioma, etc. São separados do body. Red flag: achar que headers são opcionais ou não saber para que servem.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é JWT e como você testaria uma API que usa autenticação JWT?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'JWT (JSON Web Token) é um token assinado que carrega informações do usuário. Para testar: verificar se a API rejeita requisições sem token, com token expirado, com token inválido ou de outro usuário. Bom sinal: mencionar testar o que acontece com token expirado. Red flag: não saber que JWT é um token de autenticação.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é um mock em testes? Quando você usaria?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Mock é uma simulação de um componente real (ex: simular um banco de pagamentos) para que o teste não dependa de serviços externos. Usado para isolar o que está sendo testado e criar cenários difíceis de reproduzir (ex: timeout, erro 500 do serviço externo). Red flag: confundir mock com dado de teste (fixture).',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são testes de contrato de API?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Verificam que o contrato entre o consumidor e o provedor da API é respeitado — tipos de dados, campos obrigatórios, estrutura da resposta. Garante que uma mudança no backend não quebra quem consome a API. Bom sinal: mencionar JSON Schema como forma de validar contrato.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- FERRAMENTAS
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Me mostra como você usaria o Postman para testar um endpoint POST que cria um usuário.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Esperado: criar uma requisição POST, configurar o body em JSON com os campos do usuário, adicionar o header Content-Type: application/json, enviar e verificar o status code (201) e os campos da resposta. Bom sinal: mencionar testar também com campos faltando ou inválidos. Red flag: só saber fazer GET e não explorar outros verbos.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é o Swagger e como ele ajuda o trabalho de QA?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Swagger é uma documentação interativa da API que descreve todos os endpoints, parâmetros, tipos e exemplos. Permite ao QA entender o contrato esperado da API e até testar direto pela interface. Bom sinal: usar o Swagger como fonte de verdade para criar condições de teste.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Como você registraria um bug no Jira?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Criar uma issue do tipo Bug com: título claro, descrição dos passos para reproduzir, resultado esperado vs obtido, ambiente/versão, evidências (screenshot/log), severidade e prioridade. Bom sinal: mencionar que o bug precisa ser reproduzível por quem vai corrigir. Red flag: criar um bug só com ''o sistema está errado'' sem detalhes de reprodução.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Para que serve o Git no contexto de QA?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Controle de versão: permite rastrear mudanças no código e nos testes, colaborar em equipe, criar branches para novas features e reverter mudanças. QA usa para versionar scripts de teste automatizados e alinhar com a versão do código sendo testado. Red flag: achar que Git é só para devs.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Você conhece o Zephyr? Para que serve?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Plugin do Jira para gestão de testes: permite criar planos de teste, casos de teste, ciclos de execução e relatórios de cobertura — tudo dentro do Jira, integrado com as issues. Bom sinal: se usou no desafio ou em estudo prático.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é o Cypress e em que contexto você usaria?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Cypress é uma ferramenta de automação de testes end-to-end para aplicações web. Permite simular ações do usuário no browser e verificar resultados. Usado quando a equipe precisa de testes automatizados de interface. Bom sinal: entender que automação complementa o teste manual, não substitui. Red flag: achar que automação elimina a necessidade de testes exploratórios.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- METODOLOGIAS E CULTURA
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'O que é BDD? Me dá um exemplo de um cenário escrito em BDD.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Behavior Driven Development: testes escritos em linguagem natural (Gherkin) no formato Dado que (pré-condição), Quando (ação), Então (resultado esperado). Ex: Dado que o usuário está autenticado / Quando ele faz GET /posts / Então deve retornar status 200 e uma lista de posts. Bom sinal: conseguir escrever um cenário do desafio em BDD. Red flag: descrever BDD como uma ferramenta, não uma metodologia.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é uma sprint e como o QA participa dela?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Sprint é um ciclo de desenvolvimento de duração fixa (1-4 semanas). QA participa do refinamento (entendendo os requisitos e levantando riscos), testa durante a sprint e participa da review. Bom sinal: saber que QA deve estar envolvido desde o início, não só no final. Red flag: achar que QA só entra depois que o dev termina.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é uma User Story e como você usa para criar testes?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'User Story descreve uma funcionalidade do ponto de vista do usuário: ''Como [quem], quero [o quê], para [por quê]''. QA usa para entender o comportamento esperado e derivar condições de teste a partir dos critérios de aceite. Red flag: não saber o que são critérios de aceite.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são fixtures em testes automatizados?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Fixtures são dados fixos e pré-configurados inseridos no banco ou sistema antes da execução dos testes, para garantir um estado consistente. Ex: criar um usuário admin no banco antes de testar a rota de admin. Bom sinal: entender por que os testes precisam de dados confiáveis e isolados. Red flag: confundir fixture com mock.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Por que QA deve participar do refinamento de requisitos?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Para levantar ambiguidades, identificar cenários de erro que o time não pensou, entender as regras de negócio antes de começar o desenvolvimento e ter mais tempo para planejar os testes. QA que entra só no final do desenvolvimento é QA que encontra bugs tarde demais.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- BANCO DE DADOS E IA
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Me escreve uma query SQL para buscar todos os usuários com nome ''João'' na tabela usuarios.',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'SELECT * FROM usuarios WHERE nome = ''João''; Bom sinal: mencionar que WHERE é case-sensitive ou não dependendo do banco. Red flag: não saber o que é SELECT ou WHERE.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Como você usaria IA no seu dia a dia como QA?',
   'ABERTA'::"TipoPergunta", 10, NULL,
   'Ex: gerar casos de teste a partir de uma User Story, criar dados de teste variados, sugerir cenários de borda, revisar documentação, ajudar a entender erros de log. Bom sinal: entender que IA é uma ferramenta auxiliar, não substitui o raciocínio do QA. Red flag: achar que pode simplesmente delegar tudo para a IA sem validar.',
   true, NOW());

  RAISE NOTICE '31 questões inseridas com sucesso para o avaliador %.', vid;

END $$;
