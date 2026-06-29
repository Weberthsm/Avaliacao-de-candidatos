import { http } from './http';
import type { Pergunta, TipoPergunta } from '@/types';

export interface NovaPergunta {
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
  instrucoes?: string;
  alternativas?: { texto: string; correta: boolean }[];
}

export const questionsService = {
  async criar(dados: NovaPergunta): Promise<Pergunta> {
    return (await http.post('/questions', dados)).data;
  },
  async listar(filtros?: { tipo?: TipoPergunta; busca?: string }): Promise<Pergunta[]> {
    return (await http.get('/questions', { params: filtros })).data;
  },
  async detalhar(id: string): Promise<Pergunta> {
    return (await http.get(`/questions/${id}`)).data;
  },
  async editar(id: string, dados: Partial<NovaPergunta>): Promise<Pergunta> {
    return (await http.patch(`/questions/${id}`, dados)).data;
  },
  async excluir(id: string): Promise<{ mensagem: string }> {
    return (await http.delete(`/questions/${id}`)).data;
  },
};
