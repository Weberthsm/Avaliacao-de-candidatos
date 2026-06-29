import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusTentativa } from '@prisma/client';

export class AvailableAssessmentDto {
  @ApiProperty({ format: 'uuid' })
  processoId: string;

  @ApiProperty()
  titulo: string;

  @ApiPropertyOptional({ nullable: true })
  descricao: string | null;

  @ApiProperty()
  tempoMinutos: number;

  @ApiProperty()
  totalPerguntas: number;
}

export class QuestaoTentativaDto {
  @ApiProperty({ format: 'uuid' })
  perguntaId: string;

  @ApiProperty()
  enunciado: string;

  @ApiProperty({ enum: ['ABERTA', 'FECHADA'] })
  tipo: string;

  @ApiProperty()
  peso: number;

  @ApiPropertyOptional({ nullable: true })
  instrucoes: string | null;

  @ApiProperty()
  ordem: number;

  @ApiPropertyOptional({
    description: 'Alternativas (sem indicar a correta) para perguntas fechadas',
    type: 'array',
    items: { type: 'object', properties: { id: { type: 'string' }, texto: { type: 'string' } } },
  })
  alternativas?: { id: string; texto: string }[];

  @ApiPropertyOptional({ description: 'Resposta já salva pelo candidato' })
  respostaAtual?: { textoResposta: string | null; alternativaId: string | null };
}

export class AttemptDetailDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: StatusTentativa })
  status: StatusTentativa;

  @ApiProperty({ format: 'date-time' })
  iniciadoEm: Date;

  @ApiProperty({ description: 'Segundos restantes para o fim da prova' })
  tempoRestanteSegundos: number;

  @ApiProperty({ type: [QuestaoTentativaDto] })
  questoes: QuestaoTentativaDto[];
}

export class AttemptStatusDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  processoTitulo: string;

  @ApiProperty({ enum: StatusTentativa })
  status: StatusTentativa;

  @ApiProperty({ description: 'Situação visível ao candidato' })
  situacao: string;

  @ApiPropertyOptional({ nullable: true })
  scoreParcial: number | null;

  @ApiPropertyOptional({ nullable: true })
  scoreTotal: number | null;

  @ApiPropertyOptional({ nullable: true })
  aprovado: boolean | null;

  @ApiProperty()
  abertasPendentes: number;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  finalizadoEm: Date | null;
}

export class CandidatePanelDto {
  @ApiProperty({ format: 'uuid', nullable: true, description: 'Nulo se o candidato ainda não iniciou' })
  tentativaId: string | null;

  @ApiProperty({ format: 'uuid' })
  candidatoId: string;

  @ApiProperty()
  candidatoNome: string;

  @ApiProperty({
    description: 'Status da tentativa, ou NAO_INICIADA se o candidato ainda não começou',
    enum: [...Object.values(StatusTentativa), 'NAO_INICIADA'],
  })
  status: StatusTentativa | 'NAO_INICIADA';

  @ApiPropertyOptional({ nullable: true })
  scoreParcial: number | null;

  @ApiPropertyOptional({ nullable: true })
  scoreTotal: number | null;

  @ApiPropertyOptional({ nullable: true })
  aprovado: boolean | null;

  @ApiProperty()
  abertasPendentes: number;

  @ApiProperty({ description: 'Total de saídas de janela (anti-cola)' })
  totalSaidas: number;

  @ApiPropertyOptional({ nullable: true, description: 'Tempo gasto em segundos' })
  tempoGastoSegundos: number | null;
}

export class ProcessStatsDto {
  @ApiProperty()
  totalCandidatos: number;

  @ApiProperty()
  finalizados: number;

  @ApiPropertyOptional({ nullable: true, description: 'Média de tempo em segundos' })
  mediaTempoSegundos: number | null;
}
