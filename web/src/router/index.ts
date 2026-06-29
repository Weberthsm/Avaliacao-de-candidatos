import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Perfil } from '@/types';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { publica: true } },

  // Administrador
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('@/views/admin/UsersView.vue'),
    meta: { perfis: ['ADMIN'] },
  },

  // Avaliador
  {
    path: '/avaliador/perguntas',
    name: 'avaliador-perguntas',
    component: () => import('@/views/evaluator/QuestionsView.vue'),
    meta: { perfis: ['AVALIADOR'] },
  },
  {
    path: '/avaliador/processos',
    name: 'avaliador-processos',
    component: () => import('@/views/evaluator/ProcessesView.vue'),
    meta: { perfis: ['AVALIADOR'] },
  },
  {
    path: '/avaliador/processos/:id',
    name: 'avaliador-processo-detalhe',
    component: () => import('@/views/evaluator/ProcessDetailView.vue'),
    meta: { perfis: ['AVALIADOR'] },
  },
  {
    path: '/avaliador/correcao/:id',
    name: 'avaliador-correcao',
    component: () => import('@/views/evaluator/CorrectionView.vue'),
    meta: { perfis: ['AVALIADOR'] },
  },

  // Avaliado
  {
    path: '/avaliado/disponiveis',
    name: 'avaliado-disponiveis',
    component: () => import('@/views/candidate/AvailableView.vue'),
    meta: { perfis: ['AVALIADO'] },
  },
  {
    path: '/avaliado/minhas',
    name: 'avaliado-minhas',
    component: () => import('@/views/candidate/MyAttemptsView.vue'),
    meta: { perfis: ['AVALIADO'] },
  },
  {
    path: '/avaliado/prova/:id',
    name: 'avaliado-prova',
    component: () => import('@/views/candidate/ExamView.vue'),
    meta: { perfis: ['AVALIADO'] },
  },
  {
    path: '/avaliado/resultado/:id',
    name: 'avaliado-resultado',
    component: () => import('@/views/candidate/ResultView.vue'),
    meta: { perfis: ['AVALIADO'] },
  },

  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NotFoundView.vue'), meta: { publica: true } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.publica) {
    if (to.name === 'login' && auth.autenticado) return auth.rotaInicial;
    return true;
  }

  if (!auth.autenticado) {
    return { name: 'login' };
  }

  const perfis = to.meta.perfis as Perfil[] | undefined;
  if (perfis && auth.perfil && !perfis.includes(auth.perfil)) {
    // Perfil sem acesso à rota → manda para a área dele
    return auth.rotaInicial;
  }

  return true;
});
