<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { attemptsService } from '@/services/attempts.service';
import type { AttemptStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';

const router = useRouter();
const itens = ref<AttemptStatus[]>([]);
const carregando = ref(false);

async function carregar() {
  carregando.value = true;
  try {
    itens.value = await attemptsService.minhas();
  } finally {
    carregando.value = false;
  }
}

function abrir(a: AttemptStatus) {
  if (a.status === 'EM_ANDAMENTO') router.push(`/avaliado/prova/${a.id}`);
  else router.push(`/avaliado/resultado/${a.id}`);
}

onMounted(carregar);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-800">Minhas avaliações</h1>

    <div v-if="carregando" class="text-slate-400">Carregando...</div>
    <div v-else-if="itens.length === 0" class="card p-8 text-center text-slate-400">
      Você ainda não iniciou nenhuma avaliação.
    </div>

    <div class="card divide-y divide-slate-50">
      <button
        v-for="a in itens"
        :key="a.id"
        class="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50"
        @click="abrir(a)"
      >
        <div>
          <div class="font-medium text-slate-700">{{ a.processoTitulo }}</div>
          <div class="text-xs text-slate-400">
            <span v-if="a.scoreTotal != null">Nota: {{ a.scoreTotal }}</span>
            <span v-else-if="a.abertasPendentes > 0">{{ a.abertasPendentes }} questão(ões) aguardando correção</span>
          </div>
        </div>
        <StatusBadge :texto="a.situacao" />
      </button>
    </div>
  </div>
</template>
