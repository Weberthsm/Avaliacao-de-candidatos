# API — Software de Processo Avaliativo

API REST que implementa as funcionalidades e regras de negócio descritas nas [user stories](../README.md) do sistema de processo avaliativo (avaliador e avaliado).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 10 |
| Linguagem | TypeScript |
| Banco | PostgreSQL 16 |
| ORM | Prisma 5 |
| Autenticação | JWT (via middleware) |
| Documentação | Swagger / OpenAPI 3 |
| Validação | class-validator |

## Arquitetura

Organização modular por domínio — cada módulo isola controller, service e DTOs, favorecendo escalabilidade e testabilidade.

```
api/
├── prisma/
│   ├── schema.prisma        # modelo de dados (10 entidades + enums)
│   ├── seed.ts              # cria o usuário administrador inicial
│   └── migrations/          # migrations versionadas
├── resources/
│   ├── swagger.json         # especificação OpenAPI gerada no boot
│   └── swagger.yaml         # mesma especificação em YAML
├── src/
│   ├── main.ts              # bootstrap, CORS, validação, filtro de erros, geração do Swagger
│   ├── app.module.ts        # wiring dos módulos + middleware de autenticação
│   ├── prisma/              # PrismaService global
│   ├── common/              # guards, decorators, filtro de exceções
│   │   ├── decorators/      # @Roles, @Public, @CurrentUser
│   │   ├── guards/          # RolesGuard (autorização por perfil)
│   │   └── filters/         # padronização do corpo de erro
│   ├── auth/                # login, refresh, AuthMiddleware (JWT)
│   ├── users/               # cadastro e consulta de usuários (US-03)
│   ├── questions/           # banco de perguntas (US-04 a US-07)
│   ├── processes/           # processo avaliativo (US-08 a US-12, US-31, US-32)
│   ├── attempts/            # aplicação e correção (US-13 a US-30)
│   ├── answers/             # auto-save e correção de respostas (US-16, US-24)
│   ├── scoring/             # cálculo de pontuação e aprovação (US-23, US-25, US-26)
│   ├── notifications/       # avisos in-app (US-33, US-34)
│   └── health/              # verificação de disponibilidade
```

### Autenticação

A autenticação é um **middleware** (`AuthMiddleware`) aplicado a todas as rotas, exceto as públicas (`/auth/login`, `/auth/refresh`, `/health`, `/docs`). Ele valida o token JWT do cabeçalho `Authorization: Bearer <token>` e anexa o usuário autenticado à requisição. A **autorização por perfil** é feita pelo `RolesGuard` global, ativado pelo decorator `@Roles()`.

### Tratamento de erros

Um filtro global padroniza o corpo de toda resposta de erro:

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Você não tem permissão para esta ação",
  "timestamp": "2026-06-27T20:45:17.706Z",
  "path": "/questions"
}
```

Status codes usados: `200/201` (sucesso), `400` (validação/regra de negócio), `401` (não autenticado), `403` (sem permissão), `404` (não encontrado), `409` (conflito, ex. e-mail duplicado). Todos documentados no Swagger.

## Como rodar

### 1. Pré-requisitos
- Node.js 20+
- PostgreSQL 16 (local ou via Docker)

### 2. Subir o banco (opção Docker)
```bash
docker compose up -d
```
Ou use um PostgreSQL local e ajuste a `DATABASE_URL` no `.env`.

### 3. Configurar variáveis
```bash
cp .env.example .env
# edite o .env se necessário (DATABASE_URL, JWT_SECRET, credenciais do admin)
```

### 4. Instalar, migrar e semear
```bash
npm install
npx prisma migrate dev      # cria as tabelas
npm run prisma:seed         # cria o usuário administrador inicial
```

### 5. Rodar
```bash
npm run start:dev           # desenvolvimento (watch)
# ou
npm run build && npm run start:prod
```

A API sobe em `http://localhost:3000`. A documentação interativa fica em **`http://localhost:3000/docs`**.

### Usuário administrador inicial (seed)
- e-mail: `admin@avaliacao.local`
- senha: `Admin@123`

Use esse usuário para cadastrar avaliadores e avaliados (US-03).

## Documentação Swagger

- A especificação OpenAPI é **gerada automaticamente** a cada boot da aplicação em `resources/swagger.json` e `resources/swagger.yaml`.
- Ela descreve o modelo JSON da resposta de cada endpoint e os status codes de erro de cada operação.
- O endpoint **`/docs`** renderiza a interface Swagger UI; **`/docs-json`** serve a especificação crua.

## Principais endpoints

| Recurso | Método | Rota | User Story |
|---|---|---|---|
| Acesso | POST | `/auth/login` | US-01 |
| Renovar sessão | POST | `/auth/refresh` | US-01 |
| Cadastrar usuário | POST | `/users` | US-03 |
| Cadastrar pergunta | POST | `/questions` | US-04, US-05 |
| Listar/filtrar perguntas | GET | `/questions` | US-06 |
| Editar/arquivar pergunta | PATCH/DELETE | `/questions/:id` | US-07 |
| Criar processo | POST | `/processes` | US-08 |
| Selecionar perguntas | POST | `/processes/:id/questions` | US-09 |
| Adicionar candidatos | POST | `/processes/:id/candidates` | US-10 |
| Publicar processo | PATCH | `/processes/:id/publish` | US-11 |
| Painel de candidatos | GET | `/processes/:id/candidates/panel` | US-31 |
| Estatísticas/tempo | GET | `/processes/:id/stats` | US-32 |
| Avaliações disponíveis | GET | `/attempts/available` | US-13 |
| Iniciar avaliação | POST | `/attempts` | US-14 |
| Responder (detalhe + tempo) | GET | `/attempts/:id` | US-14, US-15, US-18 |
| Auto-save de resposta | PUT | `/answers` | US-16, US-17 |
| Registrar saída de aba | POST | `/attempts/:id/tab-exit` | US-21 |
| Finalizar avaliação | PATCH | `/attempts/:id/submit` | US-19 |
| Conceder tempo extra | PATCH | `/attempts/:id/extra-time` | US-12 |
| Corrigir questão aberta | PUT | `/answers/:id/grade` | US-24 |
| Aprovar/reprovar manual | PATCH | `/attempts/:id/approve` | US-27 |
| Feedback geral | PATCH | `/attempts/:id/feedback` | US-28 |
| Minhas avaliações | GET | `/attempts/my` | US-29 |
| Resultado detalhado | GET | `/attempts/:id/result` | US-30 |
| Notificações | GET | `/notifications` | US-33, US-34 |

## Notas de implementação

- **Tempo real por polling:** o tempo extra (US-12) e as notificações (US-33/US-34) são consultados pelo frontend periodicamente (`GET /attempts/:id` e `GET /notifications`). O timer (US-18) é client-side com base em `tempoRestanteSegundos`.
- **Envio automático (US-20):** como a abordagem é por polling, o esgotamento do tempo é resolvido de forma preguiçosa — ao consultar/responder uma tentativa expirada, ela é enviada automaticamente e bloqueada.
- **Pontuação:** fechadas corrigidas na hora do envio (US-23); o score total e a aprovação automática só são consolidados após todas as abertas serem corrigidas (US-25, US-26).
- **Continuidade da sessão (US-35):** o token JWT expira por inatividade fora da prova; durante a avaliação, quem governa o encerramento é o timer, não a sessão.
