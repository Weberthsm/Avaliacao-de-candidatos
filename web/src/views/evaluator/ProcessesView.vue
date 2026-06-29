<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { processesService } from '@/services/processes.service';
import { useToast } from '@/composables/useToast';
import type { ModoAprovacao, Processo } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';
import InfoTip from '@/components/InfoTip.vue';

const router = useRouter();
const toast = useToast();
const processos = ref<Processo[]>([]);
const carregando = ref(false);
const salvando = ref(false);
const mostrarForm = ref(false);

const form = reactive({
  titulo: '',
  descricao: '',
  tempoMinutos: 60,
  notaMinima: 60,
  modoAprovacao: 'AUTOMATICO' as ModoAprovacao,
  exibirGabarito: false,
});

async function carregar() {
  carregando.value = true;
  try {
    processos.value = await processesService.listar();
  } finally {
    carregando.value = false;
  }
}

async function criar() {
  if (!form.titulo.trim()) return toast.erro('Informe o título.');
  salvando.value = true;
  try {
    const p = await processesService.criar({
      titulo: form.titulo,
      descricao: form.descricao || undefined,
      tempoMinutos: Number(form.tempoMinutos),
      notaMinima: Number(form.notaMinima),
      modoAprovacao: form.modoAprovacao,
      exibirGabarito: form.exibirGabarito,
    });
    toast.sucesso('Processo criado.');
    router.push(`/avaliador/processos/${p.id}`);
  } catch {
    /* toast pelo interceptor */
  } finally {
    salvando.value = false;
  }
}

onMounted(carregar);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-slate-800">Processos avaliativos</h1>
      <button class="btn-primary" @click="mostrarForm = !mostrarForm">
        {{ mostrarForm ? 'Fechar' : 'Novo processo' }}
      </button>
    </div>

    <div v-if="mostrarForm" class="card p-6">
      <form class="space-y-4" @submit.prevent="criar">
        <div>
          <label class="label">Título</label>
          <input v-model="form.titulo" class="input" />
        </div>
        <div>
          <label class="label">Descrição (opcional)</label>
          <textarea v-model="form.descricao" class="input" rows="2"></textarea>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="label">
              Tempo (minutos)
              <InfoTip texto="Tempo total que o candidato terá para responder. O cronômetro começa quando ele inicia a prova e não pausa." />
            </label>
            <input v-model.number="form.tempoMinutos" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">
              Nota mínima (%)
              <InfoTip texto="Percentual mínimo da pontuação para aprovação. Ex.: 60 significa que o candidato precisa de 60% dos pontos." />
            </label>
            <input v-model.number="form.notaMinima" type="number" min="0" max="100" class="input" />
          </div>
          <div>
            <label class="label">
              Modo de aprovação
              <InfoTip texto="Automático: o sistema aprova/reprova pela nota mínima. Manual: você decide. Ambos: o sistema sugere e você pode sobrescrever." />
            </label>
            <select v-model="form.modoAprovacao" class="input">
              <option value="AUTOMATICO">Automático</option>
              <option value="MANUAL">Manual</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input v-model="form.exibirGabarito" type="checkbox" class="h-4 w-4" />
          Exibir gabarito ao candidato após a correção
          <InfoTip texto="Se marcado, o candidato verá quais eram as alternativas corretas das questões fechadas na tela de resultado." />
        </label>
        <button type="submit" class="btn-primary" :disabled="salvando">
          {{ salvando ? 'Criando...' : 'Criar processo' }}
        </button>
      </form>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div v-if="carregando" class="text-slate-400">Carregando...</div>
      <div v-else-if="processos.length === 0" class="text-slate-400">Nenhum processo ainda.</div>
      <RouterLink
        v-for="p in processos"
        :key="p.id"
        :to="`/avaliador/processos/${p.id}`"
        class="card p-5 transition hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-slate-800">{{ p.titulo }}</h3>
          <StatusBadge :texto="p.status" />
        </div>
        <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ p.descricao || 'Sem descrição' }}</p>
        <div class="mt-3 flex gap-4 text-xs text-slate-400">
          <span>{{ p.totalPerguntas }} perguntas</span>
          <span>{{ p.totalCandidatos }} candidatos</span>
          <span>{{ p.tempoMinutos }} min</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
