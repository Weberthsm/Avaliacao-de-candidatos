import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModoAprovacao } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProcessDto {
  @ApiProperty({ example: 'Processo Seletivo QA Trainee 2026' })
  @IsString()
  @MinLength(1, { message: 'Informe o título' })
  titulo: string;

  @ApiPropertyOptional({ example: 'Avaliação de fundamentos de QA e API REST.' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 90, description: 'Tempo limite em minutos' })
  @IsInt()
  @IsPositive({ message: 'O tempo limite deve ser maior que zero' })
  tempoMinutos: number;

  @ApiProperty({ example: 70, description: 'Nota mínima de aprovação em %' })
  @IsNumber()
  @Min(0)
  @Max(100, { message: 'A nota mínima deve estar entre 0 e 100' })
  notaMinima: number;

  @ApiProperty({ enum: ModoAprovacao, example: ModoAprovacao.AUTOMATICO })
  @IsEnum(ModoAprovacao, { message: 'Modo de aprovação inválido' })
  modoAprovacao: ModoAprovacao;

  @ApiPropertyOptional({ example: false, description: 'Exibir gabarito ao candidato após correção' })
  @IsOptional()
  @IsBoolean()
  exibirGabarito?: boolean;

  @ApiPropertyOptional({ example: '2026-07-01T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-07-10T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
