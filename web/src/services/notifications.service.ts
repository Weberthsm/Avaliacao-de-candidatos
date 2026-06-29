import { http } from './http';
import type { Notificacao } from '@/types';

export const notificationsService = {
  async listar(naoLidas = false): Promise<Notificacao[]> {
    return (await http.get('/notifications', { params: { naoLidas } })).data;
  },
  async marcarLida(id: string): Promise<Notificacao> {
    return (await http.patch(`/notifications/${id}/read`)).data;
  },
};
