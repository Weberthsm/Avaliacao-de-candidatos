import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPergunta } from '@prisma/client';

export class AlternativaResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  texto: string;

  @ApiProperty({
    description:
      'Indica se é a alternativa correta. Omitido para o avaliado durante a prova.',
  })
  correta?: boolean;
}

export class QuestionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  enunciado: string;

  @ApiProperty({ enum: TipoPergunta })
  tipo: TipoPergunta;

  @ApiProperty()
  peso: number;

  @ApiPropertyOptional({ nullable: true })
  instrucoes: string | null;

  @ApiProperty()
  ativa: boolean;

  @ApiProperty({ format: 'date-time' })
  criadoEm: Date;

  @ApiPropertyOptional({ type: [AlternativaResponseDto] })
  alternativas?: AlternativaResponseDto[];
}
