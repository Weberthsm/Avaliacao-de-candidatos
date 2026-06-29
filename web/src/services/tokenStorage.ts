import type { Usuario } from '@/types';

const ACCESS = 'av_access';
const REFRESH = 'av_refresh';
const USER = 'av_user';

export const tokenStorage = {
  get access(): string | null {
    return localStorage.getItem(ACCESS);
  },
  set access(token: string | null) {
    if (token) localStorage.setItem(ACCESS, token);
    else localStorage.removeItem(ACCESS);
  },
  get refresh(): string | null {
    return localStorage.getItem(REFRESH);
  },
  set refresh(token: string | null) {
    if (token) localStorage.setItem(REFRESH, token);
    else localStorage.removeItem(REFRESH);
  },
  get usuario(): Usuario | null {
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  },
  set usuario(u: Usuario | null) {
    if (u) localStorage.setItem(USER, JSON.stringify(u));
    else localStorage.removeItem(USER);
  },
  limpar() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
  },
};
