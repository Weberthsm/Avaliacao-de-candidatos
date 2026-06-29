import axios from 'axios';
import type { AuthResponse } from '@/types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const authService = {
  // Usa axios puro: login não precisa (nem deve) passar pelos interceptors
  async login(email: string, senha: string): Promise<AuthResponse> {
    const resp = await axios.post(`${baseURL}/auth/login`, { email, senha });
    return resp.data;
  },
};
