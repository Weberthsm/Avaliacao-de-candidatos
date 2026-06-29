import { http } from './http';
import type {
  CandidatePanelItem,
  EnrolledCandidate,
  ModoAprovacao,
  Processo,
  ProcessStats,
  SelectedQuestion,
} from '@/types';

export interface NovoProcesso {
  titulo: string;
  descricao?: string;
  tempoMinutos: number;
  notaMinima: number;
  modoAprovacao: ModoAprovacao;
  exibirGabarito?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export const processesService = {
  async criar(dados: NovoProcesso): Promise<Processo> {
    return (await http.post('/processes', dados)).data;
  },
  async listar(): Promise<Processo[]> {
    return (await http.get('/processes')).data;
  },
  async detalhar(id: string): Promise<Processo> {
    return (await http.get(`/processes/${id}`)).data;
  },
  async adicionarPerguntas(
    id: string,
    perguntas: { perguntaId: string; ordem: number }[],
  ): Promise<{ mensagem: string }> {
    return (await http.post(`/processes/${id}/questions`, { perguntas })).data;
  },
  async adicionarCandidatos(
    id: string,
    candidatoIds: string[],
  ): Promise<{ mensagem: string }> {
    return (await http.post(`/processes/${id}/candidates`, { candidatoIds })).data;
  },
  async publicar(id: string): Promise<Processo> {
    return (await http.patch(`/processes/${id}/publish`)).data;
  },
  async encerrar(id: string): Promise<Processo> {
    return (await http.patch(`/processes/${id}/close`)).data;
  },
  async perguntasDoProcesso(id: string): Promise<SelectedQuestion[]> {
    return (await http.get(`/processes/${id}/questions`)).data;
  },
  async candidatosDoProcesso(id: string): Promise<EnrolledCandidate[]> {
    return (await http.get(`/processes/${id}/candidates`)).data;
  },
  async painel(id: string): Promise<CandidatePanelItem[]> {
    return (await http.get(`/processes/${id}/candidates/panel`)).data;
  },
  async estatisticas(id: string): Promise<ProcessStats> {
    return (await http.get(`/processes/${id}/stats`)).data;
  },
};
