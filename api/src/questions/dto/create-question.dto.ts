import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPergunta } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateAlternativaDto {
  @ApiProperty({ example: 'Verdadeiro' })
  @IsString()
  @MinLength(1, { message: 'O texto da alternativa é obrigatório' })
  texto: string;

  @ApiProperty({ example: false, description: 'Indica se é a alternativa correta (gabarito)' })
  @IsBoolean()
  correta: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'Explique o conceito de testes exploratórios.' })
  @IsString()
  @MinLength(1, { message: 'Informe o enunciado' })
  enunciado: string;

  @ApiProperty({ enum: TipoPergunta, example: TipoPergunta.ABERTA })
  @IsEnum(TipoPergunta, { message: 'Tipo de pergunta inválido' })
  tipo: TipoPergunta;

  @ApiProperty({ example: 10, description: 'Peso em pontos (maior que zero)' })
  @IsInt()
  @IsPositive({ message: 'O peso deve ser maior que zero' })
  peso: number;

  @ApiPropertyOptional({ example: 'Responda em até 10 linhas.' })
  @IsOptional()
  @IsString()
  instrucoes?: string;

  @ApiPropertyOptional({ description: 'Gabarito / notas do avaliador — nunca exposto ao candidato.' })
  @IsOptional()
  @IsString()
  gabarito?: string;

  @ApiPropertyOptional({
    type: [CreateAlternativaDto],
    description: 'Obrigatório e com no mínimo 2 itens para perguntas fechadas',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2, { message: 'Informe ao menos duas alternativas' })
  @ValidateNested({ each: true })
  @Type(() => CreateAlternativaDto)
  alternativas?: CreateAlternativaDto[];
}
