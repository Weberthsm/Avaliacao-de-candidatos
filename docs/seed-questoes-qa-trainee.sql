-- ============================================================
-- Seed: Questões de Avaliação QA Trainee
-- 31 questões abertas cobrindo 6 categorias de conhecimento
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
  -- CATEGORIA 1 — FUNDAMENTOS DE QA
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'O que é um bug? Qual a diferença entre erro, defeito e falha?',
   'ABERTA'::"TipoPergunta", 10,
   'Seja preciso nos conceitos; exemplos práticos são bem-vindos.',
   'Bug/Defeito = discrepância entre comportamento esperado e obtido. Erro = engano humano que causou o defeito. Falha = manifestação durante execução. ✓ Exemplo concreto. ✗ Confundir bug com ausência de funcionalidade.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Qual a diferença entre condição de teste e caso de teste? Dê um exemplo de cada.',
   'ABERTA'::"TipoPergunta", 10,
   'Explique cada conceito e apresente ao menos um exemplo para cada.',
   'Condição = O QUE testar (ex: "sistema deve rejeitar IDs negativos"). Caso = O COMO testar, com pré-condição, passos detalhados e resultado esperado. ✗ Achar que são a mesma coisa ou inverter os conceitos.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Um bug trava o sistema, mas só aparece num cenário que 0,1% dos usuários usa. Qual seria sua severidade e prioridade? Por quê?',
   'ABERTA'::"TipoPergunta", 10,
   'Justifique a classificação considerando impacto técnico e contexto de negócio.',
   'Severidade ALTA (trava o sistema) + Prioridade BAIXA (poucos afetados). Severidade = impacto técnico. Prioridade = urgência de correção dependente do negócio. ✗ Achar que severidade alta = prioridade alta sempre.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Explique com suas palavras o que são testes exploratórios e quando você os usaria.',
   'ABERTA'::"TipoPergunta", 10,
   'Use suas próprias palavras; exemplos de quando aplicar são bem-vindos.',
   'Aprendizado, design e execução simultâneos, sem script fixo. Usado para descobrir problemas desconhecidos. ✓ Distinção checking/testing. ✗ Confundir com "testar sem planejamento".',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é a pirâmide de testes e por que ela importa para a estratégia de qualidade?',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva os três níveis e explique a implicação prática de cada um.',
   'Base = testes de unidade (muitos, rápidos, baratos). Meio = integração. Topo = E2E/UI (poucos, lentos, caros). ✓ Entender que inverter a pirâmide é problema de custo e velocidade de feedback.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é um smoke test e em qual momento ele é executado?',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva o objetivo e o momento de execução no ciclo de desenvolvimento.',
   'Conjunto mínimo de testes para verificar se o build básico está funcional antes de testes mais completos. Executado logo após novo deploy ou build. ✗ Confundir com teste de performance ou sanidade.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são heurísticas de teste? Dê dois exemplos práticos.',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o conceito e forneça exemplos concretos do que você testaria.',
   'Atalhos de raciocínio baseados em experiência que guiam o que testar (ex: valores-limite, campos obrigatórios vazios, usuário sem permissão). Não garantem encontrar todos os bugs.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é data-driven testing e qual o benefício dessa abordagem?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o conceito e diga quando faria sentido usá-lo.',
   'Mesmo caso de teste executado múltiplas vezes com dados diferentes (de planilha ou fonte externa). Permite testar muitas combinações sem duplicar código. Aceitável não conhecer o termo se descrever o conceito.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Quando você usaria uma tabela de decisão nos seus testes?',
   'ABERTA'::"TipoPergunta", 10,
   'Dê um exemplo de situação onde uma tabela de decisão seria útil.',
   'Quando há combinação de condições que levam a resultados diferentes. Ex: admin + produto disponível = ação X; usuário comum + produto esgotado = ação Y. Ajuda a garantir cobertura de todas as combinações.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- CATEGORIA 2 — API REST
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Me explique o que é uma API como se eu não soubesse nada de tecnologia.',
   'ABERTA'::"TipoPergunta", 10,
   'Use uma analogia do cotidiano. Evite jargões técnicos na explicação principal.',
   'Interface que permite que dois sistemas se comuniquem. ✓ Analogia simples (ex: pagamento com cartão → API do banco). ✗ Explicação exclusivamente técnica sem conseguir simplificar.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Qual a diferença entre frontend e backend? Por que um QA precisa entender isso?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique ambos os conceitos e relacione com o trabalho de QA.',
   'Frontend = o que o usuário vê. Backend = lógica e dados por trás. QA precisa entender porque um bug pode estar em qualquer camada. ✓ Mencionar que testar a tela não garante que o backend está correto.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Quais são os principais verbos HTTP e quando cada um é usado?',
   'ABERTA'::"TipoPergunta", 10,
   'Liste os verbos principais e descreva o propósito de cada um.',
   'GET = buscar. POST = criar. PUT = atualizar (substituição total). DELETE = deletar. PATCH = atualização parcial. ✓ Diferenciar PUT de PATCH. ✗ Não saber que GET não tem body ou confundir POST com PUT.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que significam os seguintes códigos de status HTTP: 200, 201, 400, 401, 403, 404, 500?',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva o significado de cada código listado.',
   '200 OK. 201 Created. 400 Bad Request. 401 Unauthorized (não autenticado). 403 Forbidden (autenticado sem permissão). 404 Not Found. 500 Internal Server Error. ✗ Não saber a diferença entre 401 e 403.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é JSON e por que ele é usado em APIs REST?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o formato e por que ele é preferido em APIs modernas.',
   'Formato leve de texto para estruturar e trocar dados. Fácil de ler por humanos e máquinas. Alternativa ao XML. Ex: {"nome": "João", "idade": 30}. ✗ Confundir JSON com JavaScript.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Para que servem os headers (cabeçalhos) numa requisição HTTP? Dê dois exemplos.',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o papel dos headers e forneça dois exemplos concretos.',
   'Headers carregam metadados: Content-Type (tipo do conteúdo), Authorization (autenticação), Accept-Language (idioma). São separados do body. ✗ Achar que headers são opcionais ou não saber para que servem.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é JWT e como você testaria uma API que usa autenticação JWT?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o que é JWT e liste ao menos três cenários de teste para autenticação.',
   'JWT = token assinado que carrega informações do usuário. Cenários: sem token, token expirado, token inválido, token de outro usuário. ✓ Mencionar token expirado especificamente. ✗ Não saber que JWT é token de autenticação.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é um mock em testes? Quando e por que você usaria?',
   'ABERTA'::"TipoPergunta", 10,
   'Defina mock e forneça um exemplo de quando faria sentido usá-lo.',
   'Simulação de componente real (ex: banco de pagamentos) para isolar o que está sendo testado. Útil para cenários difíceis de reproduzir (timeout, erro 500 do serviço externo). ✗ Confundir mock com dado de teste (fixture).',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são testes de contrato de API e qual problema eles resolvem?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o conceito e o problema prático que esses testes previnem.',
   'Verificam que o contrato entre consumidor e provedor (tipos, campos obrigatórios, estrutura da resposta) é respeitado. Garante que mudança no backend não quebra quem consome a API. ✓ Mencionar JSON Schema.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- CATEGORIA 3 — FERRAMENTAS
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Como você usaria o Postman para testar um endpoint POST que cria um usuário? Descreva o passo a passo.',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva os passos práticos, incluindo configuração do body e verificação da resposta.',
   'Criar requisição POST, body JSON com os campos, header Content-Type: application/json, enviar e verificar status 201 e campos da resposta. ✓ Testar também com campos faltando ou inválidos. ✗ Só saber fazer GET.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é o Swagger e como ele ajuda o trabalho de um QA?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o que é o Swagger e como o QA pode usá-lo no seu dia a dia.',
   'Documentação interativa da API: descreve endpoints, parâmetros, tipos e exemplos. Permite ao QA entender o contrato e testar direto pela interface. ✓ Usar como fonte de verdade para criar condições de teste.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Como você registraria um bug no Jira? Quais informações não podem faltar?',
   'ABERTA'::"TipoPergunta", 10,
   'Liste os campos essenciais de um bom registro de bug.',
   'Issue tipo Bug com: título claro, passos para reproduzir, resultado esperado vs obtido, ambiente/versão, evidências (screenshot/log), severidade e prioridade. ✓ Bug precisa ser reproduzível. ✗ Bug sem detalhes de reprodução.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Para que serve o Git no contexto de QA? Um QA precisa saber usar Git?',
   'ABERTA'::"TipoPergunta", 10,
   'Relacione Git com o trabalho prático de um QA.',
   'Controle de versão: rastrear mudanças, colaborar em equipe, criar branches, reverter. QA usa para versionar scripts de teste automatizados e alinhar com a versão do código testado. ✗ Achar que Git é só para devs.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Você conhece o Zephyr Scale? Para que ele serve dentro do Jira?',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva a ferramenta e sua integração com o Jira.',
   'Plugin do Jira para gestão de testes: criar planos, casos, ciclos de execução e relatórios de cobertura, integrado com as issues. ✓ Ter usado em estudo ou projeto prático.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é o Cypress e em que contexto você o usaria?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique o que o Cypress faz e qual é o seu papel numa estratégia de qualidade.',
   'Ferramenta de automação E2E para aplicações web. Simula ações do usuário no browser. ✓ Entender que automação complementa o teste manual. ✗ Achar que automação elimina a necessidade de testes exploratórios.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- CATEGORIA 4 — METODOLOGIAS E CULTURA
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'O que é BDD? Escreva um cenário de exemplo usando a estrutura Gherkin.',
   'ABERTA'::"TipoPergunta", 10,
   'Explique BDD e escreva um cenário real no formato Dado que / Quando / Então.',
   'Behavior Driven Development — testes em linguagem natural (Dado que / Quando / Então). Ex: "Dado que o usuário está autenticado / Quando faz GET /posts / Então retorna 200 e lista de posts". ✗ Descrever BDD como ferramenta.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é uma sprint e como o QA participa dela no contexto do Scrum?',
   'ABERTA'::"TipoPergunta", 10,
   'Descreva o que é uma sprint e em quais momentos o QA deve estar envolvido.',
   'Ciclo fixo (1–4 semanas). QA participa do refinamento (levantando riscos), testa durante a sprint e na review. ✓ QA deve estar envolvido desde o início. ✗ Achar que QA só entra depois que o dev termina.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que é uma User Story e como você a utiliza para criar seus casos de teste?',
   'ABERTA'::"TipoPergunta", 10,
   'Explique User Story e descreva como deriva casos de teste a partir dela.',
   '"Como [quem], quero [o quê], para [por quê]". QA usa os critérios de aceite para derivar condições de teste. ✗ Não saber o que são critérios de aceite.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'O que são fixtures em testes automatizados? Dê um exemplo.',
   'ABERTA'::"TipoPergunta", 10,
   'Defina fixtures e forneça um exemplo de uso prático.',
   'Dados fixos e pré-configurados inseridos no banco antes dos testes para garantir estado consistente. Ex: criar usuário admin antes de testar rota de admin. ✗ Confundir fixture com mock.',
   true, NOW()),

  (gen_random_uuid(), vid,
   'Por que o QA deve participar do refinamento de requisitos, e não só do final do desenvolvimento?',
   'ABERTA'::"TipoPergunta", 10,
   'Argumente sobre a importância do QA nas etapas iniciais do ciclo de desenvolvimento.',
   'Levantar ambiguidades, identificar cenários de erro não previstos, entender regras de negócio antes do desenvolvimento e planejar testes com antecedência. QA que entra só no final encontra bugs quando o custo de correção é maior.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- CATEGORIA 5 — BANCO DE DADOS E SQL
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Escreva uma query SQL para buscar todos os usuários com nome "João" na tabela usuarios.',
   'ABERTA'::"TipoPergunta", 10,
   'Escreva a query SQL. Sinta-se à vontade para comentar sobre variações.',
   'SELECT * FROM usuarios WHERE nome = ''João''; ✓ Mencionar que a comparação pode ser case-sensitive (usar ILIKE no PostgreSQL para busca insensível a maiúsculas). ✗ Não saber o que é SELECT ou WHERE.',
   true, NOW()),

  -- ══════════════════════════════════════════════════════
  -- CATEGORIA 6 — IA E FERRAMENTAS MODERNAS
  -- ══════════════════════════════════════════════════════

  (gen_random_uuid(), vid,
   'Como você usaria Inteligência Artificial no seu dia a dia como QA? Dê exemplos práticos.',
   'ABERTA'::"TipoPergunta", 10,
   'Liste ao menos dois exemplos práticos de como usaria IA no trabalho de QA.',
   'Gerar casos de teste a partir de User Stories, criar dados de teste variados, sugerir cenários de borda, revisar documentação, entender erros de log. ✓ Entender que IA é auxiliar e que o raciocínio do QA precisa validar o output. ✗ Delegar tudo para a IA sem validar.',
   true, NOW());

  RAISE NOTICE '31 questões inseridas com sucesso para o avaliador %.', vid;

END $$;
