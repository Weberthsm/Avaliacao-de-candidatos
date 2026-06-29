<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="flex min-h-full flex-col items-center justify-center gap-4 text-center">
    <div class="text-5xl">🤔</div>
    <h1 class="text-2xl font-semibold text-slate-700">Página não encontrada</h1>
    <button class="btn-primary" @click="router.push('/')">Voltar ao início</button>
  </div>
</template>
