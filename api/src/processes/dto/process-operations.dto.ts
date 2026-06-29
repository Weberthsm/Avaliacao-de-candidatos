import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProcessoPerguntaItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  perguntaId: string;

  @ApiProperty({ example: 1, description: 'Ordem de exibição' })
  @IsInt()
  @Min(1)
  ordem: number;
}

export class AddQuestionsDto {
  @ApiProperty({ type: [ProcessoPerguntaItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos uma pergunta' })
  @ValidateNested({ each: true })
  @Type(() => ProcessoPerguntaItemDto)
  perguntas: ProcessoPerguntaItemDto[];
}

export class AddCandidatesDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'IDs dos avaliados' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos um candidato' })
  @IsUUID('4', { each: true })
  candidatoIds: string[];
}
