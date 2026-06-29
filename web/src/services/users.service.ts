import { http } from './http';
import type { Perfil, Usuario } from '@/types';

export const usersService = {
  async criar(dados: {
    nome: string;
    email: string;
    senha: string;
    perfil: Perfil;
    telefone?: string;
  }): Promise<Usuario> {
    return (await http.post('/users', dados)).data;
  },
  async listar(perfil?: Perfil): Promise<Usuario[]> {
    return (await http.get('/users', { params: { perfil } })).data;
  },
};
