import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/services/tokenStorage';
import type { Perfil, Usuario } from '@/types';

interface State {
  usuario: Usuario | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    usuario: tokenStorage.usuario,
  }),
  getters: {
    autenticado: (s) => !!s.usuario && !!tokenStorage.access,
    perfil: (s): Perfil | null => s.usuario?.perfil ?? null,
    nome: (s) => s.usuario?.nome ?? '',
    // Rota inicial conforme o perfil (US-01 RN-01.3)
    rotaInicial(): string {
      switch (this.usuario?.perfil) {
        case 'ADMIN':
          return '/admin/usuarios';
        case 'AVALIADOR':
          return '/avaliador/processos';
        case 'AVALIADO':
          return '/avaliado/disponiveis';
        default:
          return '/login';
      }
    },
  },
  actions: {
    async login(email: string, senha: string) {
      const resp = await authService.login(email, senha);
      tokenStorage.access = resp.accessToken;
      tokenStorage.refresh = resp.refreshToken;
      tokenStorage.usuario = resp.usuario;
      this.usuario = resp.usuario;
    },
    logout() {
      tokenStorage.limpar();
      this.usuario = null;
    },
  },
});
