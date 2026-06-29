<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import NotificationsBell from './NotificationsBell.vue';

const auth = useAuthStore();
const router = useRouter();

interface Link {
  rota: string;
  rotulo: string;
}

const links = computed<Link[]>(() => {
  switch (auth.perfil) {
    case 'ADMIN':
      return [{ rota: '/admin/usuarios', rotulo: 'Usuários' }];
    case 'AVALIADOR':
      return [
        { rota: '/avaliador/processos', rotulo: 'Processos' },
        { rota: '/avaliador/perguntas', rotulo: 'Banco de perguntas' },
      ];
    case 'AVALIADO':
      return [
        { rota: '/avaliado/disponiveis', rotulo: 'Disponíveis' },
        { rota: '/avaliado/minhas', rotulo: 'Minhas avaliações' },
      ];
    default:
      return [];
  }
});

const PAPEIS: Record<string, string> = {
  ADMIN: 'Administrador',
  AVALIADOR: 'Avaliador',
  AVALIADO: 'Avaliado',
};
const papelLabel = computed(() => (auth.perfil ? PAPEIS[auth.perfil] : ''));

function sair() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="flex min-h-full">
    <!-- Sidebar -->
    <aside class="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div class="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <span class="text-xl">📝</span>
        <span class="font-semibold text-slate-800">Avaliações</span>
      </div>
      <nav class="flex-1 space-y-1 p-3">
        <RouterLink
          v-for="l in links"
          :key="l.rota"
          :to="l.rota"
          class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          active-class="bg-brand-50 text-brand-700"
        >
          {{ l.rotulo }}
        </RouterLink>
      </nav>
      <div class="border-t border-slate-100 p-3 text-xs text-slate-400">
        {{ papelLabel }}
      </div>
    </aside>

    <!-- Conteúdo -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div class="md:hidden font-semibold text-slate-800">Avaliações</div>
        <div class="flex flex-1 items-center justify-end gap-4">
          <NotificationsBell />
          <div class="text-right">
            <div class="text-sm font-medium text-slate-700">{{ auth.nome }}</div>
            <div class="text-xs text-slate-400">{{ papelLabel }}</div>
          </div>
          <button class="btn-secondary" @click="sair">Sair</button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-5xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
