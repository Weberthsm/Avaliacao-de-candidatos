<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ texto: string; lado?: 'cima' | 'baixo' }>();

const aberto = ref(false);
</script>

<template>
  <span
    class="relative ml-1 inline-flex align-middle"
    @mouseenter="aberto = true"
    @mouseleave="aberto = false"
  >
    <button
      type="button"
      class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-400 transition hover:border-brand-400 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      :aria-label="texto"
      @focus="aberto = true"
      @blur="aberto = false"
    >
      i
    </button>
    <span
      v-show="aberto"
      role="tooltip"
      class="pointer-events-none absolute left-1/2 z-50 w-56 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-normal normal-case leading-snug text-white shadow-lg"
      :class="lado === 'cima' ? 'bottom-6' : 'top-6'"
    >
      {{ texto }}
    </span>
  </span>
</template>
