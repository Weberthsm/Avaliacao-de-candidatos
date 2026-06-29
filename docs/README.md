# Documentação de Decisões — Software de Processo Avaliativo

Esta pasta registra **todas as decisões** tomadas ao longo do planejamento e da construção do software, para consulta e revisão futura.

## Conteúdo

| Arquivo | O que contém |
|---|---|
| [registro-de-decisoes.md](registro-de-decisoes.md) | Registro de decisões no formato ADR (Architecture Decision Record), numeradas e datadas. É o documento principal. |
| [pendencias-de-refinamento.md](pendencias-de-refinamento.md) | Perguntas de refinamento — o que já foi decidido e o que ainda está em aberto. |

## Como usar

- **Antes de mudar algo estrutural**, consulte o ADR correspondente para entender *por que* a decisão foi tomada.
- **Ao tomar uma nova decisão**, adicione um novo ADR (nunca edite o histórico de um ADR aceito — em vez disso, crie um novo que o **substitui** e marque o antigo como "Substituída por ADR-NNN").
- **Ao decidir uma pendência**, mova-a de [pendencias-de-refinamento.md](pendencias-de-refinamento.md) para um novo ADR.

## Estrutura do projeto

```
Avaliacao/
├── README.md                       # visão geral + user stories (35)
├── METODOLOGIA-user-stories.md     # guia de escrita das histórias
├── docs/                           # ESTA PASTA — decisões do projeto
│   ├── README.md
│   ├── registro-de-decisoes.md
│   └── pendencias-de-refinamento.md
└── api/                            # API REST (NestJS + Prisma + PostgreSQL)
```

## Convenção de status dos ADRs

- **Aceita** — decisão vigente e implementada.
- **Aceita (implementação pendente)** — decisão tomada, ainda não construída.
- **Substituída por ADR-NNN** — não vale mais; ver o ADR indicado.
- **Proposta** — em discussão, ainda não decidida.
