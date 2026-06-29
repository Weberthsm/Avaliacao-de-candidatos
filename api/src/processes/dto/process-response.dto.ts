import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModoAprovacao, StatusProcesso } from '@prisma/client';

export class ProcessResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  titulo: string;

  @ApiPropertyOptional({ nullable: true })
  descricao: string | null;

  @ApiProperty()
  tempoMinutos: number;

  @ApiProperty({ description: 'Nota mínima de aprovação em %' })
  notaMinima: number;

  @ApiProperty({ enum: ModoAprovacao })
  modoAprovacao: ModoAprovacao;

  @ApiProperty()
  exibirGabarito: boolean;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  dataInicio: Date | null;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  dataFim: Date | null;

  @ApiProperty({ enum: StatusProcesso })
  status: StatusProcesso;

  @ApiProperty()
  totalPerguntas: number;

  @ApiProperty()
  totalCandidatos: number;

  @ApiProperty({ format: 'date-time' })
  criadoEm: Date;
}
