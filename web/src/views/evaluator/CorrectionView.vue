<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { attemptsService } from '@/services/attempts.service';
import { answersService } from '@/services/answers.service';
import { useToast } from '@/composables/useToast';
import type { CorrectionView } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';
import InfoTip from '@/components/InfoTip.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = route.params.id as string;

const dados = ref<CorrectionView | null>(null);
const feedback = ref('');
const notas = reactive<Record<string, { pontos: number | null; observacao: string }>>({});

async function carregar() {
  dados.value = await attemptsService.correcao(id);
  feedback.value = dados.value.feedbackGeral ?? '';
  for (const r of dados.value.respostas) {
    notas[r.respostaId] = {
      pontos: r.pontosObtidos,
      observacao: r.observacao ?? '',
    };
  }
}

async function corrigir(respostaId: string, peso: number) {
  const n = notas[respostaId];
  if (n.pontos == null || n.pontos < 0) return toast.erro('Informe os pontos.');
  if (n.pontos > peso) return toast.erro(`Máximo ${peso} pontos nesta questão.`);
  try {
    await answersService.corrigir(respostaId, Number(n.pontos), n.observacao || undefined);
    toast.sucesso('Correção registrada.');
    await carregar();
  } catch {
    /* toast */
  }
}

async function salvarFeedback() {
  try {
    await attemptsService.feedback(id, feedback.value);
    toast.sucesso('Feedback salvo.');
  } catch {
    /* toast */
  }
}

async function decidir(aprovado: boolean) {
  try {
    await attemptsService.aprovar(id, aprovado);
    toast.sucesso(aprovado ? 'Candidato aprovado.' : 'Candidato reprovado.');
    await carregar();
  } catch {
    /* toast */
  }
}

onMounted(carregar);
</script>

<template>
  <div v-if="dados" class="space-y-6">
    <div>
      <button class="mb-2 text-sm text-brand-600 hover:underline" @click="router.back()">← Voltar</button>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold text-slate-800">Correção</h1>
        <StatusBadge :texto="dados.aprovado === true ? 'Aprovado' : dados.aprovado === false ? 'Reprovado' : dados.status" />
      </div>
    </div>

    <div v-for="r in dados.respostas" :key="r.respostaId" class="card p-5">
      <div class="flex items-center gap-2">
        <StatusBadge :texto="r.tipo === 'ABERTA' ? 'Aberta' : 'Fechada'" tom="info" />
        <span class="text-xs text-slate-400">{{ r.peso }} pts</span>
      </div>
      <p class="mt-2 font-medium text-slate-700">{{ r.enunciado }}</p>

      <!-- Fechada: mostra resposta x gabarito (corrigida automaticamente) -->
      <div v-if="r.tipo === 'FECHADA'" class="mt-3 text-sm">
        <p :class="r.alternativaEscolhida === r.alternativaCorreta ? 'text-green-600' : 'text-red-600'">
          {{ r.alternativaEscolhida === r.alternativaCorreta ? '✓ Acertou' : '✗ Errou' }}
          — {{ r.pontosObtidos ?? 0 }}/{{ r.peso }} pts (correção automática)
        </p>
      </div>

      <!-- Aberta: corrigir manualmente -->
      <div v-else class="mt-3 space-y-3">
        <div v-if="r.gabarito" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <span class="text-xs font-medium uppercase text-amber-600">Gabarito / notas do avaliador</span>
          <p class="mt-1 whitespace-pre-wrap">{{ r.gabarito }}</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <span class="text-xs text-slate-400">Resposta do candidato:</span>
          <p class="mt-1 whitespace-pre-wrap">{{ r.respostaTexto || '(em branco)' }}</p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <div>
            <label class="label">
              Pontos (0 a {{ r.peso }})
              <InfoTip texto="Atribua de 0 até o peso da questão. O score total e a aprovação só são calculados após todas as dissertativas serem corrigidas." />
            </label>
            <input v-model.number="notas[r.respostaId].pontos" type="number" min="0" :max="r.peso" class="input w-28" />
          </div>
          <div class="flex-1">
            <label class="label">Observação</label>
            <input v-model="notas[r.respostaId].observacao" class="input" />
          </div>
          <button class="btn-primary" @click="corrigir(r.respostaId, r.peso)">Salvar nota</button>
        </div>
      </div>
    </div>

    <!-- Feedback geral + aprovação manual -->
    <div class="card p-5">
      <label class="label">Feedback geral</label>
      <textarea v-model="feedback" class="input" rows="3"></textarea>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <button class="btn-secondary" @click="salvarFeedback">Salvar feedback</button>
        <span class="flex-1"></span>
        <button class="btn-danger" @click="decidir(false)">Reprovar</button>
        <button class="btn-primary" @click="decidir(true)">Aprovar</button>
      </div>
    </div>
  </div>
</template>
