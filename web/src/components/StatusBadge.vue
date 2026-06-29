<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ texto: string; tom?: string }>();

const classes = computed(() => {
  const t = (props.tom ?? props.texto).toLowerCase();
  if (/(aprovad|ativo|corrigid|sucesso)/.test(t)) return 'bg-green-100 text-green-700';
  if (/(reprovad|encerrad|erro)/.test(t)) return 'bg-red-100 text-red-700';
  if (/(aguardando|andamento|enviada|pendente)/.test(t)) return 'bg-amber-100 text-amber-700';
  if (/(rascunho)/.test(t)) return 'bg-slate-100 text-slate-600';
  return 'bg-brand-100 text-brand-700';
});
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="classes">
    {{ texto }}
  </span>
</template>
