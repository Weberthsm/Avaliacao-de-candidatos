import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { AnswersService } from './answers.service';
import { GradeAnswerDto, SaveAnswerDto } from '../attempts/dto/attempt-dtos';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Respostas')
@ApiBearerAuth()
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Put()
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Salvamento automático de resposta (US-16)' })
  @ApiResponse({ status: 200, description: 'Resposta salva' })
  @ApiResponse({ status: 400, description: 'Avaliação finalizada ou tempo encerrado' })
  @ApiResponse({ status: 403, description: 'Avaliação de outro candidato' })
  save(@CurrentUser('id') avaliadoId: string, @Body() dto: SaveAnswerDto) {
    return this.answersService.save(avaliadoId, dto);
  }

  @Put(':id/grade')
  @Roles(Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Corrigir questão aberta (US-24)' })
  @ApiResponse({ status: 200, description: 'Correção registrada' })
  @ApiResponse({ status: 400, description: 'Pontuação acima do peso ou questão não aberta' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  grade(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: GradeAnswerDto,
  ) {
    return this.answersService.grade(avaliadorId, id, dto);
  }
}
