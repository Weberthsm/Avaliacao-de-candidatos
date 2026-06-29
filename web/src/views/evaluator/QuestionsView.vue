<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { questionsService } from '@/services/questions.service';
import { useToast } from '@/composables/useToast';
import type { Pergunta, TipoPergunta } from '@/types';
import StatusBadge from '@/components/StatusBadge.vue';
import InfoTip from '@/components/InfoTip.vue';

const toast = useToast();
const perguntas = ref<Pergunta[]>([]);
const carregando = ref(false);
const salvando = ref(false);

const filtro = reactive({ tipo: '' as '' | TipoPergunta, busca: '' });

const form = reactive({
  enunciado: '',
  tipo: 'ABERTA' as TipoPergunta,
  peso: 10,
  instrucoes: '',
  gabarito: '',
  alternativas: [
    { texto: '', correta: true },
    { texto: '', correta: false },
  ],
});

// null = criando; id = editando aquela pergunta
const editandoId = ref<string | null>(null);

function resetForm() {
  editandoId.value = null;
  Object.assign(form, {
    enunciado: '',
    tipo: 'ABERTA',
    peso: 10,
    instrucoes: '',
    gabarito: '',
    alternativas: [
      { texto: '', correta: true },
      { texto: '', correta: false },
    ],
  });
}

async function carregar() {
  carregando.value = true;
  try {
    perguntas.value = await questionsService.listar({
      tipo: filtro.tipo || undefined,
      busca: filtro.busca || undefined,
    });
  } finally {
    carregando.value = false;
  }
}

function addAlternativa() {
  form.alternativas.push({ texto: '', correta: false });
}
function removerAlternativa(i: number) {
  form.alternativas.splice(i, 1);
}
function marcarCorreta(i: number) {
  form.alternativas.forEach((a, idx) => (a.correta = idx === i));
}

async function salvar() {
  if (!form.enunciado.trim()) return toast.erro('Informe o enunciado.');
  if (form.peso <= 0) return toast.erro('O peso deve ser maior que zero.');

  const payload: any = {
    enunciado: form.enunciado,
    tipo: form.tipo,
    peso: Number(form.peso),
    instrucoes: form.instrucoes || undefined,
    gabarito: form.gabarito || undefined,
  };
  if (form.tipo === 'FECHADA') {
    payload.alternativas = form.alternativas
      .filter((a) => a.texto.trim())
      .map((a) => ({ texto: a.texto, correta: a.correta }));
  }

  salvando.value = true;
  try {
    if (editandoId.value) {
      await questionsService.editar(editandoId.value, payload);
      toast.sucesso('Pergunta atualizada.');
    } else {
      await questionsService.criar(payload);
      toast.sucesso('Pergunta cadastrada.');
    }
    resetForm();
    await carregar();
  } catch {
    /* toast pelo interceptor (ex.: vinculada a uma avaliação) */
  } finally {
    salvando.value = false;
  }
}

function iniciarEdicao(p: Pergunta) {
  editandoId.value = p.id;
  Object.assign(form, {
    enunciado: p.enunciado,
    tipo: p.tipo,
    peso: p.peso,
    instrucoes: p.instrucoes ?? '',
    gabarito: p.gabarito ?? '',
    alternativas:
      p.tipo === 'FECHADA' && p.alternativas?.length
        ? p.alternativas.map((a) => ({ texto: a.texto, correta: !!a.correta }))
        : [
            { texto: '', correta: true },
            { texto: '', correta: false },
          ],
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const expandidas = ref<Set<string>>(new Set());
function alternarDetalhes(id: string) {
  const s = new Set(expandidas.value);
  s.has(id) ? s.delete(id) : s.add(id);
  expandidas.value = s;
}

async function excluir(p: Pergunta) {
  if (!confirm(`Excluir a pergunta "${p.enunciado.slice(0, 40)}..."? Esta ação não pode ser desfeita.`)) return;
  try {
    await questionsService.excluir(p.id);
    toast.sucesso('Pergunta excluída.');
    await carregar();
  } catch {
    /* mensagem de erro exibida pelo interceptor (ex.: vinculada a uma avaliação) */
  }
}

onMounted(carregar);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-800">Banco de perguntas</h1>

    <!-- Formulário -->
    <div class="card p-6" :class="editandoId ? 'ring-2 ring-brand-400' : ''">
      <h2 class="mb-4 text-lg font-medium text-slate-700">
        {{ editandoId ? 'Editar pergunta' : 'Nova pergunta' }}
      </h2>
      <form class="space-y-4" @submit.prevent="salvar">
        <div>
          <label class="label">Enunciado</label>
          <textarea v-model="form.enunciado" class="input" rows="2"></textarea>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="label">
              Tipo
              <InfoTip texto="Aberta: resposta dissertativa, corrigida manualmente por você. Fechada: múltipla escolha, corrigida automaticamente pelo gabarito." />
            </label>
            <select v-model="form.tipo" class="input">
              <option value="ABERTA">Aberta</option>
              <option value="FECHADA">Fechada</option>
            </select>
          </div>
          <div>
            <label class="label">
              Peso (pontos)
              <InfoTip texto="Quantos pontos a questão vale. A nota final é a soma dos pontos obtidos sobre a soma dos pesos." />
            </label>
            <input v-model.number="form.peso" type="number" min="1" class="input" />
          </div>
        </div>
        <div v-if="form.tipo === 'ABERTA'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="label">
              Instruções para o candidato (opcional)
              <InfoTip texto="Texto visível ao candidato durante a prova. Use para orientações sobre formato ou extensão da resposta." />
            </label>
            <input v-model="form.instrucoes" class="input" placeholder="Ex: Responda em até 5 linhas." />
          </div>
          <div>
            <label class="label">
              Gabarito / notas do avaliador (opcional)
              <InfoTip texto="Visível apenas para você durante a correção. Nunca é exibido ao candidato." />
            </label>
            <input v-model="form.gabarito" class="input" placeholder="Ex: Mencionar X, Y e Z." />
          </div>
        </div>

        <!-- Alternativas (fechada) -->
        <div v-if="form.tipo === 'FECHADA'" class="space-y-2">
          <label class="label">
            Alternativas (marque a correta)
            <InfoTip texto="Informe ao menos duas alternativas e marque exatamente uma como correta — é o gabarito usado na correção automática." />
          </label>
          <div v-for="(a, i) in form.alternativas" :key="i" class="flex items-center gap-2">
            <input
              type="radio"
              :checked="a.correta"
              name="correta"
              class="h-4 w-4 text-brand-600"
              @change="marcarCorreta(i)"
            />
            <input v-model="a.texto" class="input flex-1" :placeholder="`Alternativa ${i + 1}`" />
            <button
              type="button"
              class="text-slate-400 hover:text-red-500"
              :disabled="form.alternativas.length <= 2"
              @click="removerAlternativa(i)"
            >
              &times;
            </button>
          </div>
          <button type="button" class="text-sm text-brand-600 hover:underline" @click="addAlternativa">
            + adicionar alternativa
          </button>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn-primary" :disabled="salvando">
            {{ salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar pergunta' }}
          </button>
          <button v-if="editandoId" type="button" class="btn-secondary" @click="resetForm">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Filtros + lista -->
    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b border-slate-100 px-6 py-3">
        <div>
          <label class="label">Tipo</label>
          <select v-model="filtro.tipo" class="input" @change="carregar">
            <option value="">Todos</option>
            <option value="ABERTA">Aberta</option>
            <option value="FECHADA">Fechada</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="label">Buscar no enunciado</label>
          <input v-model="filtro.busca" class="input" @keyup.enter="carregar" />
        </div>
        <button class="btn-secondary" @click="carregar">Filtrar</button>
      </div>

      <ul>
        <li v-if="carregando" class="px-6 py-6 text-center text-slate-400">Carregando...</li>
        <li v-else-if="perguntas.length === 0" class="px-6 py-6 text-center text-slate-400">
          Nenhuma pergunta cadastrada.
        </li>
        <li v-for="p in perguntas" :key="p.id" class="border-t border-slate-50 px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <StatusBadge :texto="p.tipo === 'ABERTA' ? 'Aberta' : 'Fechada'" tom="info" />
                <span class="text-xs text-slate-400">{{ p.peso }} pts</span>
              </div>
              <p class="mt-1 text-sm text-slate-700">{{ p.enunciado }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button class="btn-secondary" @click="alternarDetalhes(p.id)">
                {{ expandidas.has(p.id) ? 'Ocultar' : 'Detalhes' }}
              </button>
              <button class="btn-secondary" @click="iniciarEdicao(p)">Editar</button>
              <button class="btn-danger" @click="excluir(p)">Excluir</button>
            </div>
          </div>

          <!-- Detalhes da questão -->
          <div v-if="expandidas.has(p.id)" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm space-y-2">
            <p v-if="p.instrucoes" class="text-slate-600">
              <span class="font-medium">Instruções ao candidato:</span> {{ p.instrucoes }}
            </p>
            <p v-if="p.gabarito" class="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
              <span class="font-medium">Gabarito (só você vê):</span> {{ p.gabarito }}
            </p>

            <template v-if="p.tipo === 'FECHADA'">
              <p class="mb-1 text-xs font-medium uppercase text-slate-400">Alternativas</p>
              <ul class="space-y-1">
                <li
                  v-for="alt in p.alternativas"
                  :key="alt.id"
                  class="flex items-center gap-2"
                  :class="alt.correta ? 'font-medium text-green-700' : 'text-slate-600'"
                >
                  <span>{{ alt.correta ? '✓' : '•' }}</span>
                  <span>{{ alt.texto }}</span>
                  <span v-if="alt.correta" class="text-xs text-green-600">(correta)</span>
                </li>
              </ul>
            </template>

            <p v-else class="text-slate-500">
              Questão dissertativa — corrigida manualmente pelo avaliador (sem alternativas).
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
