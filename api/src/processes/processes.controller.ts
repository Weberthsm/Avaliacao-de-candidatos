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
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import {
  AddCandidatesDto,
  AddQuestionsDto,
} from './dto/process-operations.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AttemptsService } from '../attempts/attempts.service';
import {
  CandidatePanelDto,
  ProcessStatsDto,
} from '../attempts/dto/attempt-response.dto';

@ApiTags('Processos')
@ApiBearerAuth()
@Roles(Perfil.AVALIADOR)
@Controller('processes')
export class ProcessesController {
  constructor(
    private readonly processesService: ProcessesService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar processo avaliativo (US-08)' })
  @ApiResponse({ status: 201, type: ProcessResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @CurrentUser('id') avaliadorId: string,
    @Body() dto: CreateProcessDto,
  ): Promise<ProcessResponseDto> {
    return this.processesService.create(avaliadorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar meus processos' })
  @ApiResponse({ status: 200, type: [ProcessResponseDto] })
  findAll(
    @CurrentUser('id') avaliadorId: string,
  ): Promise<ProcessResponseDto[]> {
    return this.processesService.findAll(avaliadorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar processo' })
  @ApiResponse({ status: 200, type: ProcessResponseDto })
  @ApiResponse({ status: 404, description: 'Processo não encontrado' })
  findOne(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<ProcessResponseDto> {
    return this.processesService.findOne(avaliadorId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar processo (apenas rascunho)' })
  @ApiResponse({ status: 200, type: ProcessResponseDto })
  @ApiResponse({ status: 403, description: 'Processo não está em rascunho' })
  update(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProcessDto,
  ): Promise<ProcessResponseDto> {
    return this.processesService.update(avaliadorId, id, dto);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Selecionar perguntas do processo (US-09)' })
  @ApiResponse({ status: 201, description: 'Perguntas adicionadas' })
  @ApiResponse({ status: 400, description: 'Pergunta inválida ou arquivada' })
  addQuestions(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: AddQuestionsDto,
  ): Promise<{ mensagem: string }> {
    return this.processesService.addQuestions(avaliadorId, id, dto);
  }

  @Post(':id/candidates')
  @ApiOperation({ summary: 'Adicionar candidatos ao processo (US-10)' })
  @ApiResponse({ status: 201, description: 'Candidatos adicionados' })
  @ApiResponse({ status: 400, description: 'Candidato inválido ou duplicado' })
  addCandidates(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: AddCandidatesDto,
  ): Promise<{ mensagem: string }> {
    return this.processesService.addCandidates(avaliadorId, id, dto);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'Perguntas já vinculadas ao processo (US-09)' })
  @ApiResponse({ status: 200, description: 'Perguntas do processo, em ordem' })
  listQuestions(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ) {
    return this.processesService.listarPerguntas(avaliadorId, id);
  }

  @Get(':id/candidates')
  @ApiOperation({ summary: 'Candidatos já vinculados ao processo (US-10)' })
  @ApiResponse({ status: 200, description: 'Candidatos do processo' })
  listCandidates(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ) {
    return this.processesService.listarCandidatos(avaliadorId, id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publicar processo (US-11)' })
  @ApiResponse({ status: 200, type: ProcessResponseDto })
  @ApiResponse({ status: 400, description: 'Processo sem perguntas ou sem candidatos' })
  publish(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<ProcessResponseDto> {
    return this.processesService.publish(avaliadorId, id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Encerrar processo manualmente' })
  @ApiResponse({ status: 200, type: ProcessResponseDto })
  close(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<ProcessResponseDto> {
    return this.processesService.close(avaliadorId, id);
  }

  @Get(':id/candidates/panel')
  @ApiOperation({ summary: 'Painel de candidatos do processo (US-31)' })
  @ApiResponse({ status: 200, type: [CandidatePanelDto] })
  @ApiResponse({ status: 404, description: 'Processo não encontrado' })
  candidatePanel(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<CandidatePanelDto[]> {
    return this.attemptsService.candidatePanel(avaliadorId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Tempo de resposta e média do processo (US-32)' })
  @ApiResponse({ status: 200, type: ProcessStatsDto })
  @ApiResponse({ status: 404, description: 'Processo não encontrado' })
  stats(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<ProcessStatsDto> {
    return this.processesService.findOne(avaliadorId, id).then(() =>
      this.attemptsService.processStats(avaliadorId, id),
    );
  }
}
