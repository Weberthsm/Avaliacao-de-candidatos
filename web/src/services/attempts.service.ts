import { http } from './http';
import type {
  AttemptDetail,
  AttemptResult,
  AttemptStatus,
  AvailableAssessment,
  CorrectionView,
} from '@/types';

export const attemptsService = {
  // Avaliado
  async disponiveis(): Promise<AvailableAssessment[]> {
    return (await http.get('/attempts/available')).data;
  },
  async minhas(): Promise<AttemptStatus[]> {
    return (await http.get('/attempts/my')).data;
  },
  async iniciar(processoId: string): Promise<AttemptDetail> {
    return (await http.post('/attempts', { processoId })).data;
  },
  async detalhe(id: string): Promise<AttemptDetail> {
    return (await http.get(`/attempts/${id}`)).data;
  },
  async finalizar(id: string): Promise<AttemptStatus> {
    return (await http.patch(`/attempts/${id}/submit`)).data;
  },
  async registrarSaida(id: string): Promise<{ totalSaidas: number }> {
    return (await http.post(`/attempts/${id}/tab-exit`)).data;
  },
  async resultado(id: string): Promise<AttemptResult> {
    return (await http.get(`/attempts/${id}/result`)).data;
  },
  // Avaliador
  async tempoExtra(id: string, minutos: number): Promise<{ tempoRestanteSegundos: number }> {
    return (await http.patch(`/attempts/${id}/extra-time`, { minutos })).data;
  },
  async correcao(id: string): Promise<CorrectionView> {
    return (await http.get(`/attempts/${id}/correction`)).data;
  },
  async aprovar(id: string, aprovado: boolean): Promise<{ mensagem: string }> {
    return (await http.patch(`/attempts/${id}/approve`, { aprovado })).data;
  },
  async feedback(id: string, feedbackGeral: string): Promise<{ mensagem: string }> {
    return (await http.patch(`/attempts/${id}/feedback`, { feedbackGeral })).data;
  },
};
