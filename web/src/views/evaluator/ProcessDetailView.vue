<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { processesService } from '@/services/processes.service';
import { questionsService } from '@/services/questions.service';
import { usersService } from '@/services/users.service';
import { attemptsService } from '@/services/attempts.service';
import { useToast } from '@/composables/useToast';
import type {
  CandidatePanelItem,
  EnrolledCandidate,
  Pergunta,
  Processo,
  ProcessStats,
  SelectedQuestion,
  Usuario,
} from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';
import InfoTip from '@/components/InfoTip.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = route.params.id as string;

const processo = ref<Processo | null>(null);
const banco = ref<Pergunta[]>([]);
const avaliados = ref<Usuario[]>([]);
const painel = ref<CandidatePanelItem[]>([]);
const stats = ref<ProcessStats | null>(null);

// O que já está vinculado ao processo
const perguntasDoProcesso = ref<SelectedQuestion[]>([]);
const candidatosDoProcesso = ref<EnrolledCandidate[]>([]);

const selPerguntas = ref<Set<string>>(new Set());
const selCandidatos = ref<Set<string>>(new Set());

const ehRascunho = computed(() => processo.value?.status === 'RASCUNHO');

// Listas de seleção sem o que já foi adicionado
const bancoDisponivel = computed(() => {
  const jaUsadas = new Set(perguntasDoProcesso.value.map((p) => p.perguntaId));
  return banco.value.filter((q) => !jaUsadas.has(q.id));
});
const avaliadosDisponiveis = computed(() => {
  const jaAdd = new Set(candidatosDoProcesso.value.map((c) => c.candidatoId));
  return avaliados.value.filter((u) => !jaAdd.has(u.id));
});

async function carregarTudo() {
  processo.value = await processesService.detalhar(id);
  // Vinculados — úteis tanto no rascunho quanto depois
  perguntasDoProcesso.value = await processesService.perguntasDoProcesso(id);
  candidatosDoProcesso.value = await processesService.candidatosDoProcesso(id);
  if (ehRascunho.value) {
    banco.value = await questionsService.listar();
    avaliados.value = await usersService.listar('AVALIADO');
  } else {
    painel.value = await processesService.painel(id);
    stats.value = await processesService.estatisticas(id);
  }
}

function toggle(set: Set<string>, key: string) {
  set.has(key) ? set.delete(key) : set.add(key);
}

async function adicionarPerguntas() {
  const ids = [...selPerguntas.value];
  if (ids.length === 0) return toast.erro('Selecione ao menos uma pergunta.');
  const base = perguntasDoProcesso.value.length;
  const perguntas = ids.map((perguntaId, i) => ({ perguntaId, ordem: base + i + 1 }));
  try {
    await processesService.adicionarPerguntas(id, perguntas);
    toast.sucesso('Perguntas adicionadas.');
    selPerguntas.value = new Set();
    await carregarTudo();
  } catch {
    /* toast */
  }
}

async function adicionarCandidatos() {
  const ids = [...selCandidatos.value];
  if (ids.length === 0) return toast.erro('Selecione ao menos um candidato.');
  try {
    await processesService.adicionarCandidatos(id, ids);
    toast.sucesso('Candidatos adicionados.');
    selCandidatos.value = new Set();
    await carregarTudo();
  } catch {
    /* toast */
  }
}

async function publicar() {
  try {
    await processesService.publicar(id);
    toast.sucesso('Processo publicado.');
    await carregarTudo();
  } catch {
    /* toast */
  }
}

async function tempoExtra(c: CandidatePanelItem) {
  if (!c.tentativaId) return;
  const min = Number(prompt(`Minutos extras para ${c.candidatoNome}:`, '10'));
  if (!min || min <= 0) return;
  try {
    await attemptsService.tempoExtra(c.tentativaId, min);
    toast.sucesso(`+${min} min concedidos.`);
    await carregarTudo();
  } catch {
    /* toast */
  }
}

function tempo(seg: number | null) {
  if (seg == null) return '—';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}m ${s}s`;
}

onMounted(carregarTudo);
</script>

<template>
  <div v-if="processo" class="space-y-6">
    <div>
      <button class="mb-2 text-sm text-brand-600 hover:underline" @click="router.push('/avaliador/processos')">
        ← Processos
      </button>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-800">{{ processo.titulo }}</h1>
        <StatusBadge :texto="processo.status" />
      </div>
      <div class="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
        <span>{{ processo.tempoMinutos }} min</span>
        <span>Nota mínima: {{ processo.notaMinima }}%</span>
        <span>Aprovação: {{ processo.modoAprovacao }}</span>
        <span>{{ processo.totalPerguntas }} perguntas · {{ processo.totalCandidatos }} candidatos</span>
      </div>
    </div>

    <!-- RASCUNHO: montar a prova -->
    <template v-if="ehRascunho">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="card p-5">
          <h2 class="mb-3 font-medium text-slate-700">Selecionar perguntas</h2>
          <div class="max-h-72 space-y-2 overflow-y-auto">
            <label
              v-for="q in bancoDisponivel"
              :key="q.id"
              class="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-100 p-2 text-sm hover:bg-slate-50"
            >
              <input type="checkbox" class="mt-1" :checked="selPerguntas.has(q.id)" @change="toggle(selPerguntas, q.id)" />
              <span>
                <StatusBadge :texto="q.tipo === 'ABERTA' ? 'Aberta' : 'Fechada'" tom="info" />
                <span class="ml-1 text-slate-700">{{ q.enunciado }}</span>
                <span class="text-xs text-slate-400"> ({{ q.peso }} pts)</span>
              </span>
            </label>
            <p v-if="bancoDisponivel.length === 0" class="text-sm text-slate-400">
              Nenhuma pergunta disponível para adicionar.
            </p>
          </div>
          <button class="btn-secondary mt-3" @click="adicionarPerguntas">Adicionar selecionadas</button>

          <div v-if="perguntasDoProcesso.length" class="mt-4 border-t border-slate-100 pt-3">
            <p class="mb-2 text-xs font-medium uppercase text-slate-400">
              No processo ({{ perguntasDoProcesso.length }})
            </p>
            <ol class="space-y-1 text-sm">
              <li v-for="p in perguntasDoProcesso" :key="p.perguntaId" class="flex gap-2">
                <span class="text-slate-400">{{ p.ordem }}.</span>
                <StatusBadge :texto="p.tipo === 'ABERTA' ? 'Aberta' : 'Fechada'" tom="info" />
                <span class="text-slate-700">{{ p.enunciado }}</span>
              </li>
            </ol>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="mb-3 font-medium text-slate-700">Adicionar candidatos</h2>
          <div class="max-h-72 space-y-2 overflow-y-auto">
            <label
              v-for="u in avaliadosDisponiveis"
              :key="u.id"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-2 text-sm hover:bg-slate-50"
            >
              <input type="checkbox" :checked="selCandidatos.has(u.id)" @change="toggle(selCandidatos, u.id)" />
              <span class="text-slate-700">{{ u.nome }}</span>
              <span class="text-xs text-slate-400">{{ u.email }}</span>
            </label>
            <p v-if="avaliadosDisponiveis.length === 0" class="text-sm text-slate-400">
              Nenhum avaliado disponível para adicionar.
            </p>
          </div>
          <button class="btn-secondary mt-3" @click="adicionarCandidatos">Adicionar selecionados</button>

          <div v-if="candidatosDoProcesso.length" class="mt-4 border-t border-slate-100 pt-3">
            <p class="mb-2 text-xs font-medium uppercase text-slate-400">
              No processo ({{ candidatosDoProcesso.length }})
            </p>
            <ul class="space-y-1 text-sm">
              <li v-for="c in candidatosDoProcesso" :key="c.candidatoId" class="flex items-center gap-2">
                <span class="text-slate-700">{{ c.nome }}</span>
                <span class="text-xs text-slate-400">{{ c.email }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="btn-primary" @click="publicar">Publicar processo</button>
      </div>
    </template>

    <!-- ATIVO/ENCERRADO: acompanhamento -->
    <template v-else>
      <div v-if="stats" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="card p-4">
          <div class="text-xs text-slate-400">Candidatos</div>
          <div class="text-2xl font-semibold text-slate-800">{{ stats.totalCandidatos }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-slate-400">
            Finalizaram
            <InfoTip texto="Candidatos que enviaram a avaliação (manualmente ou por tempo esgotado)." />
          </div>
          <div class="text-2xl font-semibold text-slate-800">{{ stats.finalizados }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-slate-400">
            Tempo médio
            <InfoTip texto="Média de tempo entre o início e o envio, considerando apenas quem finalizou." />
          </div>
          <div class="text-2xl font-semibold text-slate-800">{{ tempo(stats.mediaTempoSegundos) }}</div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-600">
          Candidatos
        </div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th class="px-4 py-3">Candidato</th>
              <th class="px-4 py-3">Situação</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Abertas pend.</th>
              <th class="px-4 py-3">Saídas</th>
              <th class="px-4 py-3">Tempo</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="painel.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-slate-400">Nenhum candidato vinculado.</td>
            </tr>
            <tr v-for="c in painel" :key="c.candidatoId" class="border-t border-slate-50">
              <td class="px-4 py-3 font-medium text-slate-700">{{ c.candidatoNome }}</td>
              <td class="px-4 py-3">
                <StatusBadge
                  :texto="c.aprovado === true ? 'Aprovado' : c.aprovado === false ? 'Reprovado' : c.status === 'NAO_INICIADA' ? 'Não iniciou' : c.status"
                />
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ c.scoreTotal ?? c.scoreParcial ?? '—' }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ c.abertasPendentes }}</td>
              <td class="px-4 py-3 text-slate-600">{{ c.totalSaidas }}</td>
              <td class="px-4 py-3 text-slate-600">{{ tempo(c.tempoGastoSegundos) }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="c.status === 'EM_ANDAMENTO'"
                  class="mr-2 text-xs text-brand-600 hover:underline"
                  @click="tempoExtra(c)"
                >
                  + tempo
                </button>
                <button
                  v-if="c.tentativaId && c.status !== 'EM_ANDAMENTO'"
                  class="text-xs text-brand-600 hover:underline"
                  @click="router.push(`/avaliador/correcao/${c.tentativaId}`)"
                >
                  corrigir
                </button>
                <span v-if="c.status === 'NAO_INICIADA'" class="text-xs text-slate-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
