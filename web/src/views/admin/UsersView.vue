<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { usersService } from '@/services/users.service';
import { useToast } from '@/composables/useToast';
import type { Perfil, Usuario } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';

const toast = useToast();
const usuarios = ref<Usuario[]>([]);
const carregando = ref(false);
const salvando = ref(false);

const form = reactive({
  nome: '',
  email: '',
  senha: '',
  perfil: 'AVALIADO' as Perfil,
  telefone: '',
});

async function carregar() {
  carregando.value = true;
  try {
    usuarios.value = await usersService.listar();
  } finally {
    carregando.value = false;
  }
}

async function criar() {
  if (!form.nome || !form.email || !form.senha) {
    toast.erro('Preencha nome, e-mail e senha.');
    return;
  }
  salvando.value = true;
  try {
    await usersService.criar({
      nome: form.nome,
      email: form.email,
      senha: form.senha,
      perfil: form.perfil,
      telefone: form.telefone || undefined,
    });
    toast.sucesso('Usuário cadastrado.');
    Object.assign(form, { nome: '', email: '', senha: '', telefone: '', perfil: 'AVALIADO' });
    await carregar();
  } catch {
    /* erro exibido pelo interceptor */
  } finally {
    salvando.value = false;
  }
}

onMounted(carregar);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-800">Usuários</h1>

    <div class="card p-6">
      <h2 class="mb-4 text-lg font-medium text-slate-700">Cadastrar usuário</h2>
      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="criar">
        <div>
          <label class="label">Nome</label>
          <input v-model="form.nome" class="input" />
        </div>
        <div>
          <label class="label">E-mail</label>
          <input v-model="form.email" type="email" class="input" />
        </div>
        <div>
          <label class="label">Senha</label>
          <input v-model="form.senha" type="password" class="input" />
        </div>
        <div>
          <label class="label">Perfil</label>
          <select v-model="form.perfil" class="input">
            <option value="AVALIADO">Avaliado</option>
            <option value="AVALIADOR">Avaliador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div v-if="form.perfil === 'AVALIADO'">
          <label class="label">Telefone (opcional)</label>
          <input v-model="form.telefone" class="input" placeholder="+55 11 99999-8888" />
        </div>
        <div class="flex items-end">
          <button type="submit" class="btn-primary" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Cadastrar' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card overflow-hidden">
      <div class="border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-600">
        {{ usuarios.length }} usuário(s)
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-400">
          <tr>
            <th class="px-6 py-3">Nome</th>
            <th class="px-6 py-3">E-mail</th>
            <th class="px-6 py-3">Perfil</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="carregando">
            <td colspan="3" class="px-6 py-6 text-center text-slate-400">Carregando...</td>
          </tr>
          <tr v-for="u in usuarios" :key="u.id" class="border-t border-slate-50">
            <td class="px-6 py-3 font-medium text-slate-700">{{ u.nome }}</td>
            <td class="px-6 py-3 text-slate-500">{{ u.email }}</td>
            <td class="px-6 py-3"><StatusBadge :texto="u.perfil" tom="info" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
