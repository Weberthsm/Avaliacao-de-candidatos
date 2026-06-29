import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { AttemptsService } from './attempts.service';
import {
  ApproveDto,
  ExtraTimeDto,
  FeedbackDto,
  StartAttemptDto,
} from './dto/attempt-dtos';
import {
  AttemptDetailDto,
  AttemptStatusDto,
  AvailableAssessmentDto,
} from './dto/attempt-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tentativas')
@ApiBearerAuth()
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Get('available')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Avaliações disponíveis para mim (US-13)' })
  @ApiResponse({ status: 200, type: [AvailableAssessmentDto] })
  available(
    @CurrentUser('id') avaliadoId: string,
  ): Promise<AvailableAssessmentDto[]> {
    return this.attemptsService.listAvailable(avaliadoId);
  }

  @Get('my')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Minhas avaliações e situação (US-29)' })
  @ApiResponse({ status: 200, type: [AttemptStatusDto] })
  my(@CurrentUser('id') avaliadoId: string): Promise<AttemptStatusDto[]> {
    return this.attemptsService.myAttempts(avaliadoId);
  }

  @Post()
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Iniciar avaliação (US-14)' })
  @ApiResponse({ status: 201, type: AttemptDetailDto })
  @ApiResponse({ status: 400, description: 'Processo indisponível ou fora da janela' })
  @ApiResponse({ status: 403, description: 'Não vinculado ao processo' })
  start(
    @CurrentUser('id') avaliadoId: string,
    @Body() dto: StartAttemptDto,
  ): Promise<AttemptDetailDto> {
    return this.attemptsService.start(avaliadoId, dto.processoId);
  }

  @Get(':id')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Responder avaliação — questões e tempo restante (US-14/15/18)' })
  @ApiResponse({ status: 200, type: AttemptDetailDto })
  @ApiResponse({ status: 403, description: 'Avaliação de outro candidato' })
  detail(
    @CurrentUser('id') avaliadoId: string,
    @Param('id') id: string,
  ): Promise<AttemptDetailDto> {
    return this.attemptsService.getDetail(avaliadoId, id);
  }

  @Patch(':id/submit')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Finalizar e enviar avaliação (US-19)' })
  @ApiResponse({ status: 200, type: AttemptStatusDto })
  @ApiResponse({ status: 400, description: 'Avaliação já finalizada' })
  submit(
    @CurrentUser('id') avaliadoId: string,
    @Param('id') id: string,
  ): Promise<AttemptStatusDto> {
    return this.attemptsService.submit(avaliadoId, id);
  }

  @Post(':id/tab-exit')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Registrar saída de janela durante a prova (US-21)' })
  @ApiResponse({ status: 201, description: 'Saída registrada' })
  tabExit(
    @CurrentUser('id') avaliadoId: string,
    @Param('id') id: string,
  ): Promise<{ totalSaidas: number }> {
    return this.attemptsService.logTabExit(avaliadoId, id);
  }

  @Get(':id/result')
  @Roles(Perfil.AVALIADO)
  @ApiOperation({ summary: 'Resultado detalhado da minha avaliação (US-30)' })
  @ApiResponse({ status: 200, description: 'Detalhe da avaliação corrigida' })
  result(@CurrentUser('id') avaliadoId: string, @Param('id') id: string) {
    return this.attemptsService.result(avaliadoId, id);
  }

  // ── Avaliador ──────────────────────────────

  @Patch(':id/extra-time')
  @Roles(Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Conceder tempo extra ao candidato (US-12)' })
  @ApiResponse({ status: 200, description: 'Tempo atualizado' })
  @ApiResponse({ status: 400, description: 'Avaliação já finalizada' })
  extraTime(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: ExtraTimeDto,
  ) {
    return this.attemptsService.addExtraTime(avaliadorId, id, dto.minutos);
  }

  @Patch(':id/approve')
  @Roles(Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Aprovar/reprovar manualmente (US-27)' })
  @ApiResponse({ status: 200, description: 'Decisão registrada' })
  approve(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: ApproveDto,
  ) {
    return this.attemptsService.approveManually(avaliadorId, id, dto.aprovado);
  }

  @Patch(':id/feedback')
  @Roles(Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Registrar feedback geral (US-28)' })
  @ApiResponse({ status: 200, description: 'Feedback registrado' })
  feedback(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: FeedbackDto,
  ) {
    return this.attemptsService.saveFeedback(avaliadorId, id, dto.feedbackGeral);
  }

  @Get(':id/correction')
  @Roles(Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Tentativa para correção — respostas e questões abertas' })
  @ApiResponse({ status: 200, description: 'Dados de correção' })
  correction(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ) {
    return this.attemptsService.correctionView(avaliadorId, id);
  }
}
