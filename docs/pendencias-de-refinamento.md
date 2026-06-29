# Pendências de Refinamento

Perguntas de refinamento levantadas durante o planejamento. Quando uma pendência é decidida, ela vira um ADR em [registro-de-decisoes.md](registro-de-decisoes.md).

## Já decididas

| Pergunta | Decisão | Onde |
|---|---|---|
| Questões fechadas: uma ou múltiplas respostas corretas? | Uma única | ADR-011 |
| Candidato pode refazer a avaliação? | Não, tentativa única | ADR-012 |
| Candidato vê o gabarito após o envio? | Configurável por processo | ADR-013 |
| Tempo é por prova ou por questão? | Por prova inteira | ADR-009 / US-18 |
| Quando o tempo esgota, envia automático ou bloqueia? | Envia automático | ADR-015 / US-20 |
| Pesos podem ser diferentes por questão? | Sim | ADR-009 |
| Há janela de datas (início/fim) do processo? | Sim, opcional | US-08 |
| Editar pergunta de processo em andamento? | Não permitido | ADR-014 / US-07 |
| Avisar o avaliado quando a correção terminar? | Sim | US-34 |
| Detecção de saída de aba e bloqueio de cópia? | Sim (detecção no frontend) | US-21, US-22, ADR-021 |

## Em aberto (a decidir)

| # | Pergunta | Situação atual | Impacto |
|---|---|---|---|
| P-01 | Um processo pode ter **mais de um avaliador** corrigindo? | Hoje: um único avaliador dono do processo | Exigiria atribuição de questões por avaliador e controle de autoria da correção |
| P-02 | Notificações também por **e-mail**? | Hoje: apenas avisos in-app (polling) | Exigiria um serviço de envio de e-mail |
| P-03 | Suporte a questões fechadas de **múltipla escolha** (mais de uma correta)? | Hoje: resposta única (ADR-011) | Mudaria gabarito e regra de pontuação (parcial?) |
| P-04 | O candidato pode **gerenciar o próprio perfil** (trocar senha, dados)? | Não especificado/implementado | Novas histórias de autoatendimento |
| P-05 | **Forçar troca da senha** do admin no primeiro acesso? | Seed sugere, mas não força | Pequena história de segurança |
| P-06 | **Exportar resultados** de um processo (ex.: planilha/CSV)? | Não implementado (era baixa prioridade no plano) | Endpoint de exportação |
| P-07 | **Paginação** nas listagens (perguntas, usuários, candidatos)? | Hoje: listas sem paginação | Importante se o volume crescer |
| P-08 | Encerrar provas no **instante exato** do fim do tempo? | Hoje: envio preguiçoso ao acessar (ADR-015) | Exigiria um agendador em segundo plano |
| P-09 | **Embaralhar** ordem de questões/alternativas por candidato? | Não previsto | Reforço anti-cola; mudança na montagem da prova |

## Como decidir uma pendência

1. Discutir o contexto e as opções.
2. Registrar a escolha como um novo ADR em [registro-de-decisoes.md](registro-de-decisoes.md).
3. Remover (ou marcar como resolvida) a linha correspondente aqui.
4. Se afetar comportamento, criar/ajustar a user story no [README](../README.md).
