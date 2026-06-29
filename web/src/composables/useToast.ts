import { reactive } from 'vue';

export type ToastTipo = 'erro' | 'sucesso' | 'info';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
}

const state = reactive<{ toasts: Toast[] }>({ toasts: [] });
let seq = 0;

function push(tipo: ToastTipo, mensagem: string, duracaoMs = 5000) {
  const id = ++seq;
  state.toasts.push({ id, tipo, mensagem });
  if (duracaoMs > 0) {
    setTimeout(() => remover(id), duracaoMs);
  }
}

function remover(id: number) {
  const i = state.toasts.findIndex((t) => t.id === id);
  if (i >= 0) state.toasts.splice(i, 1);
}

export function useToast() {
  return {
    toasts: state.toasts,
    erro: (m: string) => push('erro', m, 7000),
    sucesso: (m: string) => push('sucesso', m),
    info: (m: string) => push('info', m),
    remover,
  };
}
