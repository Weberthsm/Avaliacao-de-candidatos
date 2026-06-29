import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from './tokenStorage';
import { useToast } from '@/composables/useToast';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const RENEWED_HEADER = 'x-renewed-token';

export const http = axios.create({ baseURL });

// ── Requisição: anexa o token de acesso ───────────────
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.access;
  if (token) {
    config.headers = config.headers ?? new AxiosHeaders();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

/** Renova a sessão via refresh token, sem novo login (ADR-017). */
async function renovarSessao(): Promise<string | null> {
  const refresh = tokenStorage.refresh;
  if (!refresh) return null;
  try {
    const resp = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken: refresh,
    });
    tokenStorage.access = resp.data.accessToken;
    tokenStorage.refresh = resp.data.refreshToken;
    tokenStorage.usuario = resp.data.usuario;
    return resp.data.accessToken;
  } catch {
    return null;
  }
}

function mensagemDeErro(error: AxiosError): string {
  const data = error.response?.data as any;
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join('. ') : data.message;
  }
  if (error.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar à API. Verifique se ela está rodando.';
  }
  return 'Ocorreu um erro inesperado.';
}

// ── Resposta: sessão deslizante + refresh no 401 + toast de erro ───────────────
http.interceptors.response.use(
  (response) => {
    // Sessão deslizante: substitui o token guardado pelo renovado (ADR-017)
    const renovado = response.headers?.[RENEWED_HEADER];
    if (renovado) tokenStorage.access = renovado as string;
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const toast = useToast();

    // 401: tenta renovar a sessão silenciosamente e repetir a requisição
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? renovarSessao();
      const novoToken = await refreshing;
      refreshing = null;

      if (novoToken) {
        original.headers = original.headers ?? new AxiosHeaders();
        (original.headers as AxiosHeaders).set(
          'Authorization',
          `Bearer ${novoToken}`,
        );
        return http(original);
      }

      // Sem refresh válido → encerra a sessão
      tokenStorage.limpar();
      toast.erro('Sessão expirada. Acesse novamente.');
      if (location.pathname !== '/login') location.assign('/login');
      return Promise.reject(error);
    }

    // Demais erros (fora da faixa 2xx): exibe mensagem
    toast.erro(mensagemDeErro(error));
    return Promise.reject(error);
  },
);
