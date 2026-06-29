import { http } from './http';

export const answersService = {
  // Salvamento automático (US-16)
  async salvar(dados: {
    tentativaId: string;
    perguntaId: string;
    textoResposta?: string;
    alternativaId?: string;
  }): Promise<{ mensagem: string; salvoEm: string }> {
    return (await http.put('/answers', dados)).data;
  },
  // Correção de questão aberta (US-24)
  async corrigir(
    respostaId: string,
    pontos: number,
    observacao?: string,
  ): Promise<{ mensagem: string }> {
    return (await http.put(`/answers/${respostaId}/grade`, { pontos, observacao })).data;
  },
};
