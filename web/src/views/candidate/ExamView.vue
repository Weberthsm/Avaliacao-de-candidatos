<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { attemptsService } from '@/services/attempts.service';
import { answersService } from '@/services/answers.service';
import { useToast } from '@/composables/useToast';
import type { AttemptDetail } from '@/types';
import InfoTip from '@/components/InfoTip.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = route.params.id as string;

const detalhe = ref<AttemptDetail | null>(null);
const restante = ref(0);
const salvando = ref<Record<string, boolean>>({});
const enviando = ref(false);

// Estado local das respostas (não é sobrescrito pelo heartbeat)
const respostas = reactive<Record<string, { textoResposta: string; alternativaId: string }>>({});
const debounces: Record<string, number> = {};

let tickTimer: number | undefined;
let heartbeatTimer: number | undefined;

const mmss = computed(() => {
  const m = Math.floor(restante.value / 60);
  const s = restante.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
const tempoCritico = computed(() => restante.value <= 60);

async function carregar() {
  const d = await attemptsService.detalhe(id);
  if (d.status !== 'EM_ANDAMENTO') {
    // US-20: já foi enviada (auto ou manualmente) → vai ao resultado
    router.replace(`/avaliado/resultado/${id}`);
    return;
  }
  detalhe.value = d;
  restante.value = d.tempoRestanteSegundos;
  for (const q of d.questoes) {
    respostas[q.perguntaId] = {
      textoResposta: q.respostaAtual?.textoResposta ?? '',
      alternativaId: q.respostaAtual?.alternativaId ?? '',
    };
  }
}

// US-16/US-17: salvamento automático
function agendarSalvar(perguntaId: string, imediato = false) {
  clearTimeout(debounces[perguntaId]);
  const exec = () => salvar(perguntaId);
  if (imediato) exec();
  else debounces[perguntaId] = window.setTimeout(exec, 800);
}

async function salvar(perguntaId: string) {
  const r = respostas[perguntaId];
  const q = detalhe.value?.questoes.find((x) => x.perguntaId === perguntaId);
  if (!q) return;
  salvando.value = { ...salvando.value, [perguntaId]: true };
  try {
    await answersService.salvar({
      tentativaId: id,
      perguntaId,
      textoResposta: q.tipo === 'ABERTA' ? r.textoResposta : undefined,
      alternativaId: q.tipo === 'FECHADA' ? r.alternativaId || undefined : undefined,
    });
  } catch {
    /* toast pelo interceptor */
  } finally {
    salvando.value = { ...salvando.value, [perguntaId]: false };
  }
}

// US-19: finalizar com confirmação
async function finalizar() {
  if (!confirm('Finalizar e enviar a avaliação? Você não poderá alterar as respostas depois.')) return;
  enviando.value = true;
  try {
    await attemptsService.finalizar(id);
    toast.sucesso('Avaliação enviada.');
    router.replace(`/avaliado/resultado/${id}`);
  } catch {
    enviando.value = false;
  }
}

// US-18/US-20: contagem regressiva; ao zerar, força o envio automático
function iniciarTimer() {
  tickTimer = window.setInterval(async () => {
    restante.value = Math.max(0, restante.value - 1);
    if (restante.value === 0) {
      clearInterval(tickTimer);
      toast.info('Tempo esgotado. Enviando suas respostas...');
      await attemptsService.detalhe(id); // dispara o envio automático no servidor
      router.replace(`/avaliado/resultado/${id}`);
    }
  }, 1000);
}

// US-35: heartbeat mantém a sessão viva e ressincroniza o tempo (ex.: tempo extra)
function iniciarHeartbeat() {
  heartbeatTimer = window.setInterval(async () => {
    try {
      const d = await attemptsService.detalhe(id);
      if (d.status !== 'EM_ANDAMENTO') {
        router.replace(`/avaliado/resultado/${id}`);
        return;
      }
      restante.value = d.tempoRestanteSegundos; // reflete tempo extra (US-12/RN-18.2)
    } catch {
      /* silencioso */
    }
  }, 30000);
}

// US-21: registra saída de aba (sem pausar o tempo)
function aoTrocarVisibilidade() {
  if (document.hidden && detalhe.value?.status === 'EM_ANDAMENTO') {
    attemptsService.registrarSaida(id).catch(() => {});
  }
}

onMounted(async () => {
  await carregar();
  if (!detalhe.value) return;
  iniciarTimer();
  iniciarHeartbeat();
  document.addEventListener('visibilitychange', aoTrocarVisibilidade);
});

onUnmounted(() => {
  clearInterval(tickTimer);
  clearInterval(heartbeatTimer);
  document.removeEventListener('visibilitychange', aoTrocarVisibilidade);
});
</script>

<template>
  <!-- US-22: bloqueio de copiar/colar/recortar em toda a área da prova -->
  <div
    v-if="detalhe"
    class="space-y-6"
    @copy.prevent
    @paste.prevent
    @cut.prevent
    @contextmenu.prevent
  >
    <!-- Barra fixa com o tempo -->
    <div class="sticky top-0 z-10 -mx-6 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
      <span class="text-sm text-slate-500">
        Avaliação em andamento
        <InfoTip texto="Suas respostas são salvas automaticamente a cada alteração. Você pode revisá-las até finalizar." lado="baixo" />
      </span>
      <div class="flex items-center gap-1">
        <div
          class="rounded-lg px-4 py-1.5 font-mono text-lg font-semibold"
          :class="tempoCritico ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'"
        >
          ⏱ {{ mmss }}
        </div>
        <InfoTip texto="Tempo restante da prova. Quando chegar a zero, suas respostas são enviadas automaticamente." lado="baixo" />
      </div>
    </div>

    <div
      v-for="(q, i) in detalhe.questoes"
      :key="q.perguntaId"
      class="card p-5"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">
          Questão {{ i + 1 }} · {{ q.peso }} pts · {{ q.tipo === 'ABERTA' ? 'Dissertativa' : 'Múltipla escolha' }}
        </span>
        <span v-if="salvando[q.perguntaId]" class="text-xs text-slate-400">salvando…</span>
      </div>
      <p class="mt-2 font-medium text-slate-800">{{ q.enunciado }}</p>
      <p v-if="q.instrucoes" class="mt-1 text-sm text-slate-400">{{ q.instrucoes }}</p>

      <!-- Aberta -->
      <textarea
        v-if="q.tipo === 'ABERTA'"
        v-model="respostas[q.perguntaId].textoResposta"
        class="input mt-3"
        rows="4"
        placeholder="Sua resposta..."
        @input="agendarSalvar(q.perguntaId)"
      ></textarea>

      <!-- Fechada -->
      <div v-else class="mt-3 space-y-2">
        <label
          v-for="alt in q.alternativas"
          :key="alt.id"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"
          :class="{ 'border-brand-400 bg-brand-50': respostas[q.perguntaId].alternativaId === alt.id }"
        >
          <input
            type="radio"
            :name="q.perguntaId"
            :value="alt.id"
            v-model="respostas[q.perguntaId].alternativaId"
            @change="agendarSalvar(q.perguntaId, true)"
          />
          <span class="text-slate-700">{{ alt.texto }}</span>
        </label>
      </div>
    </div>

    <div class="flex justify-end pb-10">
      <button class="btn-primary" :disabled="enviando" @click="finalizar">
        {{ enviando ? 'Enviando...' : 'Finalizar e enviar' }}
      </button>
    </div>
  </div>
</template>
