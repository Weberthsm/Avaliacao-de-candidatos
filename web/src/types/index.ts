export type Perfil = 'ADMIN' | 'AVALIADOR' | 'AVALIADO';
export type TipoPergunta = 'ABERTA' | 'FECHADA';
export type ModoAprovacao = 'AUTOMATICO' | 'MANUAL' | 'AMBOS';
export type StatusProcesso = 'RASCUNHO' | 'ATIVO' | 'ENCERRADO';
export type StatusTentativa = 'EM_ANDAMENTO' | 'ENVIADA' | 'CORRIGIDA';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  telefone?: string | null;
  criadoEm?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface Alternativa {
  id: string;
  texto: string;
  correta?: boolean;
}

export interface Pergunta {
  id: string;
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
  instrucoes: string | null;
  gabarito: string | null;
  ativa: boolean;
  criadoEm: string;
  alternativas?: Alternativa[];
}

export interface Processo {
  id: string;
  titulo: string;
  descricao: string | null;
  tempoMinutos: number;
  notaMinima: number;
  modoAprovacao: ModoAprovacao;
  exibirGabarito: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  status: StatusProcesso;
  totalPerguntas: number;
  totalCandidatos: number;
  criadoEm: string;
}

export interface AvailableAssessment {
  processoId: string;
  titulo: string;
  descricao: string | null;
  tempoMinutos: number;
  totalPerguntas: number;
}

export interface QuestaoTentativa {
  perguntaId: string;
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
  instrucoes: string | null;
  ordem: number;
  alternativas?: { id: string; texto: string }[];
  respostaAtual?: { textoResposta: string | null; alternativaId: string | null };
}

export interface AttemptDetail {
  id: string;
  status: StatusTentativa;
  iniciadoEm: string;
  tempoRestanteSegundos: number;
  questoes: QuestaoTentativa[];
}

export interface AttemptStatus {
  id: string;
  processoTitulo: string;
  status: StatusTentativa;
  situacao: string;
  scoreParcial: number | null;
  scoreTotal: number | null;
  aprovado: boolean | null;
  abertasPendentes: number;
  finalizadoEm: string | null;
}

export interface EnrolledCandidate {
  candidatoId: string;
  nome: string;
  email: string;
}

export interface SelectedQuestion {
  perguntaId: string;
  ordem: number;
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
}

export interface CandidatePanelItem {
  tentativaId: string | null;
  candidatoId: string;
  candidatoNome: string;
  status: StatusTentativa | 'NAO_INICIADA';
  scoreParcial: number | null;
  scoreTotal: number | null;
  aprovado: boolean | null;
  abertasPendentes: number;
  totalSaidas: number;
  tempoGastoSegundos: number | null;
}

export interface ProcessStats {
  totalCandidatos: number;
  finalizados: number;
  mediaTempoSegundos: number | null;
}

export interface CorrectionAnswer {
  respostaId: string;
  perguntaId: string;
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
  gabarito: string | null;
  respostaTexto: string | null;
  alternativaEscolhida: string | null;
  alternativaCorreta: string | null;
  pontosObtidos: number | null;
  observacao: string | null;
}

export interface CorrectionView {
  id: string;
  status: StatusTentativa;
  feedbackGeral: string | null;
  aprovado: boolean | null;
  respostas: CorrectionAnswer[];
}

export interface ResultQuestion {
  perguntaId: string;
  enunciado: string;
  tipo: TipoPergunta;
  peso: number;
  respostaTexto: string | null;
  alternativaEscolhida: string | null;
  pontosObtidos: number | null;
  observacao: string | null;
  alternativaCorreta?: string | null;
}

export interface AttemptResult {
  id: string;
  status: StatusTentativa;
  scoreParcial: number | null;
  scoreTotal: number | null;
  aprovado: boolean | null;
  feedbackGeral: string | null;
  questoes: ResultQuestion[];
}

export interface Notificacao {
  id: string;
  tipo: 'NOVO_ENVIO' | 'RESULTADO_DISPONIVEL';
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadoEm: string;
}
