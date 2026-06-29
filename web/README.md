# Frontend Web — Software de Processo Avaliativo

Aplicação web (SPA) que consome a [API REST](../api/README.md) do sistema de processo avaliativo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Rotas | Vue Router |
| Estado | Pinia |
| HTTP | Axios (com interceptors) |

## Arquitetura

```
web/
├── index.html
├── vite.config.ts · tailwind.config.js · postcss.config.js
└── src/
    ├── main.ts                 # bootstrap (Pinia + Router)
    ├── App.vue                 # decide layout (público x autenticado)
    ├── style.css               # Tailwind + componentes utilitários (.btn, .card, .input)
    ├── types/                  # tipos espelhando os DTOs da API
    ├── services/
    │   ├── http.ts             # axios + interceptors (sessão deslizante, refresh no 401, toasts)
    │   ├── tokenStorage.ts     # tokens e usuário no localStorage
    │   ├── auth.service.ts · users.service.ts · questions.service.ts
    │   ├── processes.service.ts · attempts.service.ts · answers.service.ts
    │   └── notifications.service.ts
    ├── stores/auth.ts          # estado de autenticação + rota inicial por perfil
    ├── router/index.ts         # rotas + guard por perfil
    ├── composables/useToast.ts # mensagens de erro/sucesso
    ├── components/             # AppLayout, NotificationsBell, ToastContainer, StatusBadge
    └── views/
        ├── LoginView.vue · NotFoundView.vue
        ├── admin/UsersView.vue
        ├── evaluator/  QuestionsView · ProcessesView · ProcessDetailView · CorrectionView
        └── candidate/  AvailableView · ExamView · MyAttemptsView · ResultView
```

## Tratamento de sessão (ADR-017)

O `http.ts` implementa a parte de frontend da sessão deslizante:
- **Lê o header `X-Renewed-Token`** de cada resposta e substitui o token guardado — mantém a sessão viva enquanto há atividade.
- **Heartbeat:** durante a prova, a `ExamView` consulta a API a cada 30s, o que renova o token e ressincroniza o tempo (inclui tempo extra concedido).
- **Refresh silencioso:** ao receber `401`, tenta renovar via refresh token e repete a requisição, sem novo login. Só desloga se o refresh também falhar.

## Tratamento de erros

Toda resposta fora da faixa 2xx gera um **toast** com a mensagem da API (campo `message` do corpo padronizado de erro). Erros de rede também são informados.

## Como rodar

A API precisa estar rodando em `http://localhost:3000` (ver [api/README.md](../api/README.md)).

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

Configuração da URL da API em `.env` (`VITE_API_URL`).

### Acesso inicial
Use o administrador semeado pela API: `admin@avaliacao.local` / `Admin@123`. Pela área de usuários, cadastre avaliadores e avaliados.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run type-check` | Checagem de tipos (vue-tsc) |
| `npm run preview` | Pré-visualiza o build |
