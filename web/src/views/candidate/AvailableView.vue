<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { attemptsService } from '@/services/attempts.service';
import { useToast } from '@/composables/useToast';
import type { AvailableAssessment } from '@/types';

const router = useRouter();
const toast = useToast();
const itens = ref<AvailableAssessment[]>([]);
const carregando = ref(false);
const iniciando = ref<string | null>(null);

async function carregar() {
  carregando.value = true;
  try {
    itens.value = await attemptsService.disponiveis();
  } finally {
    carregando.value = false;
  }
}

async function iniciar(a: AvailableAssessment) {
  if (!confirm(`Iniciar "${a.titulo}"? O tempo de ${a.tempoMinutos} min começa a contar agora.`)) return;
  iniciando.value = a.processoId;
  try {
    const tentativa = await attemptsService.iniciar(a.processoId);
    router.push(`/avaliado/prova/${tentativa.id}`);
  } catch {
    /* toast */
  } finally {
    iniciando.value = null;
  }
}

onMounted(carregar);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-800">Avaliações disponíveis</h1>

    <div v-if="carregando" class="text-slate-400">Carregando...</div>
    <div v-else-if="itens.length === 0" class="card p-8 text-center text-slate-400">
      Nenhuma avaliação disponível no momento.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div v-for="a in itens" :key="a.processoId" class="card p-5">
        <h3 class="font-medium text-slate-800">{{ a.titulo }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ a.descricao || 'Sem descrição' }}</p>
        <div class="mt-3 flex gap-4 text-xs text-slate-400">
          <span>{{ a.totalPerguntas }} perguntas</span>
          <span>{{ a.tempoMinutos }} min</span>
        </div>
        <button class="btn-primary mt-4 w-full" :disabled="iniciando === a.processoId" @click="iniciar(a)">
          {{ iniciando === a.processoId ? 'Iniciando...' : 'Iniciar avaliação' }}
        </button>
      </div>
    </div>
  </div>
</template>
