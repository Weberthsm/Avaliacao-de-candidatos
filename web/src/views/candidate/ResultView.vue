<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { attemptsService } from '@/services/attempts.service';
import type { AttemptResult } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';
import InfoTip from '@/components/InfoTip.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const r = ref<AttemptResult | null>(null);

const situacao = computed(() => {
  if (!r.value) return '';
  if (r.value.status !== 'CORRIGIDA') return 'Aguardando correção';
  return r.value.aprovado === true ? 'Aprovado' : r.value.aprovado === false ? 'Reprovado' : 'Avaliada';
});

async function carregar() {
  r.value = await attemptsService.resultado(id);
}

onMounted(carregar);
</script>

<template>
  <div v-if="r" class="space-y-6">
    <div>
      <button class="mb-2 text-sm text-brand-600 hover:underline" @click="router.push('/avaliado/minhas')">
        ← Minhas avaliações
      </button>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold text-slate-800">Resultado</h1>
        <StatusBadge :texto="situacao" />
      </div>
    </div>

    <!-- Resumo -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div class="card p-4">
        <div class="text-xs text-slate-400">
          Score (fechadas)
          <InfoTip texto="Pontos das questões de múltipla escolha, somados automaticamente assim que você envia a prova." />
        </div>
        <div class="text-2xl font-semibold text-slate-800">{{ r.scoreParcial ?? '—' }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-slate-400">
          Score total
          <InfoTip texto="Soma de todas as questões (fechadas + dissertativas). Só aparece depois que o avaliador corrige as dissertativas." />
        </div>
        <div class="text-2xl font-semibold text-slate-800">{{ r.scoreTotal ?? '—' }}</div>
      </div>
    </div>

    <div v-if="r.status !== 'CORRIGIDA'" class="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
      Algumas questões ainda estão aguardando correção do avaliador. O resultado final e o feedback aparecerão aqui quando concluído.
    </div>

    <!-- Feedback geral -->
    <div v-if="r.feedbackGeral" class="card p-5">
      <h2 class="mb-1 text-sm font-medium text-slate-500">Feedback do avaliador</h2>
      <p class="whitespace-pre-wrap text-slate-700">{{ r.feedbackGeral }}</p>
    </div>

    <!-- Por questão -->
    <div v-for="(q, i) in r.questoes" :key="q.perguntaId" class="card p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">
          Questão {{ i + 1 }} · {{ q.tipo === 'ABERTA' ? 'Dissertativa' : 'Múltipla escolha' }}
        </span>
        <span class="text-sm font-medium text-slate-600">
          {{ q.pontosObtidos != null ? `${q.pontosObtidos}/${q.peso}` : `—/${q.peso}` }} pts
        </span>
      </div>
      <p class="mt-2 font-medium text-slate-800">{{ q.enunciado }}</p>

      <div class="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <span class="text-xs text-slate-400">Sua resposta:</span>
        <p class="mt-1 whitespace-pre-wrap">{{ q.respostaTexto || q.alternativaEscolhida || '(em branco)' }}</p>
      </div>

      <p v-if="q.alternativaCorreta" class="mt-2 text-xs text-green-600">
        Alternativa correta destacada no gabarito (id: {{ q.alternativaCorreta }})
      </p>

      <div v-if="q.observacao" class="mt-2 text-sm">
        <span class="text-xs text-slate-400">Observação do avaliador:</span>
        <p class="text-slate-600">{{ q.observacao }}</p>
      </div>
    </div>
  </div>
</template>
