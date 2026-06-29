<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, remover } = useToast();

const estilo: Record<string, string> = {
  erro: 'border-red-200 bg-red-50 text-red-800',
  sucesso: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-slate-200 bg-white text-slate-700',
};
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-md"
      :class="estilo[t.tipo]"
    >
      <span>{{ t.mensagem }}</span>
      <button class="text-lg leading-none opacity-60 hover:opacity-100" @click="remover(t.id)">
        &times;
      </button>
    </div>
  </div>
</template>
