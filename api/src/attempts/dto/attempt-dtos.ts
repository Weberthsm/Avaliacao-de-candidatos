import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  IsBoolean,
  Max,
  Min,
} from 'class-validator';

export class StartAttemptDto {
  @ApiProperty({ format: 'uuid', description: 'Processo a ser respondido' })
  @IsUUID()
  processoId: string;
}

export class ExtraTimeDto {
  @ApiProperty({ example: 10, description: 'Minutos extras a conceder' })
  @IsInt()
  @IsPositive({ message: 'Informe minutos extras maiores que zero' })
  minutos: number;
}

export class GradeAnswerDto {
  @ApiProperty({ example: 8, description: 'Pontos atribuídos (0 até o peso da questão)' })
  @IsInt()
  @Min(0, { message: 'A pontuação não pode ser negativa' })
  pontos: number;

  @ApiPropertyOptional({ example: 'Boa resposta, faltou citar exemplos.' })
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class ApproveDto {
  @ApiProperty({ example: true, description: 'true = aprovado, false = reprovado' })
  @IsBoolean()
  aprovado: boolean;
}

export class FeedbackDto {
  @ApiProperty({ example: 'Desempenho consistente nas questões de API.' })
  @IsString()
  feedbackGeral: string;
}

export class SaveAnswerDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tentativaId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  perguntaId: string;

  @ApiPropertyOptional({ description: 'Resposta de pergunta aberta' })
  @IsOptional()
  @IsString()
  textoResposta?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Alternativa escolhida (pergunta fechada)' })
  @IsOptional()
  @IsUUID()
  alternativaId?: string;
}
