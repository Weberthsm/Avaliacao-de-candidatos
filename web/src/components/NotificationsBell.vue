<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { notificationsService } from '@/services/notifications.service';
import type { Notificacao } from '@/types';

const router = useRouter();
const aberta = ref(false);
const itens = ref<Notificacao[]>([]);
const naoLidas = ref(0);
let timer: number | undefined;

async function carregar() {
  try {
    itens.value = await notificationsService.listar(false);
    naoLidas.value = itens.value.filter((n) => !n.lida).length;
  } catch {
    /* silencioso — polling */
  }
}

async function abrir(n: Notificacao) {
  if (!n.lida) {
    await notificationsService.marcarLida(n.id);
    n.lida = true;
    naoLidas.value = itens.value.filter((x) => !x.lida).length;
  }
  aberta.value = false;
  if (n.link) router.push(n.link);
}

onMounted(() => {
  carregar();
  // Polling (ADR-006): atualiza os avisos periodicamente
  timer = window.setInterval(carregar, 20000);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="relative">
    <button
      class="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
      @click="aberta = !aberta"
      aria-label="Notificações"
    >
      <span class="text-xl">🔔</span>
      <span
        v-if="naoLidas > 0"
        class="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
      >
        {{ naoLidas > 9 ? '9+' : naoLidas }}
      </span>
    </button>

    <div
      v-if="aberta"
      class="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div class="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
        Notificações
      </div>
      <div v-if="itens.length === 0" class="px-4 py-6 text-center text-sm text-slate-400">
        Nenhuma notificação.
      </div>
      <ul v-else class="max-h-80 overflow-y-auto">
        <li
          v-for="n in itens"
          :key="n.id"
          class="cursor-pointer border-b border-slate-50 px-4 py-3 text-sm hover:bg-slate-50"
          :class="n.lida ? 'text-slate-500' : 'font-medium text-slate-800'"
          @click="abrir(n)"
        >
          <span v-if="!n.lida" class="mr-1 inline-block h-2 w-2 rounded-full bg-brand-500"></span>
          {{ n.mensagem }}
        </li>
      </ul>
    </div>
  </div>
</template>
