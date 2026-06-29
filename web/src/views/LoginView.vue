<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const email = ref('');
const senha = ref('');
const carregando = ref(false);

async function entrar() {
  if (!email.value || !senha.value) {
    toast.erro('Informe e-mail e senha.');
    return;
  }
  carregando.value = true;
  try {
    await auth.login(email.value, senha.value);
    router.push(auth.rotaInicial);
  } catch {
    /* erro já tratado pelo serviço de auth via toast no http? login usa axios puro */
    toast.erro('Não foi possível entrar. Verifique suas credenciais.');
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-slate-100 px-4">
    <div class="card w-full max-w-sm p-8">
      <div class="mb-6 text-center">
        <div class="mb-2 text-3xl">📝</div>
        <h1 class="text-xl font-semibold text-slate-800">Processo Avaliativo</h1>
        <p class="text-sm text-slate-500">Acesse com suas credenciais</p>
      </div>

      <form class="space-y-4" @submit.prevent="entrar">
        <div>
          <label class="label">E-mail</label>
          <input v-model="email" type="email" class="input" placeholder="voce@exemplo.com" autocomplete="username" />
        </div>
        <div>
          <label class="label">Senha</label>
          <input v-model="senha" type="password" class="input" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>
