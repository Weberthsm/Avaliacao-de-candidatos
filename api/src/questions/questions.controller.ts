import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfil, TipoPergunta } from '@prisma/client';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Perguntas')
@ApiBearerAuth()
@Roles(Perfil.AVALIADOR)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar pergunta aberta ou fechada (US-04/US-05)' })
  @ApiResponse({ status: 201, type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos (peso, alternativas, gabarito)' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas avaliador)' })
  create(
    @CurrentUser('id') avaliadorId: string,
    @Body() dto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.create(avaliadorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar e filtrar perguntas (US-06)' })
  @ApiQuery({ name: 'tipo', enum: TipoPergunta, required: false })
  @ApiQuery({ name: 'busca', required: false, description: 'Palavra no enunciado' })
  @ApiResponse({ status: 200, type: [QuestionResponseDto] })
  findAll(
    @CurrentUser('id') avaliadorId: string,
    @Query('tipo') tipo?: TipoPergunta,
    @Query('busca') busca?: string,
  ): Promise<QuestionResponseDto[]> {
    return this.questionsService.findAll(avaliadorId, tipo, busca);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar pergunta' })
  @ApiResponse({ status: 200, type: QuestionResponseDto })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  findOne(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.findOne(avaliadorId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar pergunta (US-07)' })
  @ApiResponse({ status: 200, type: QuestionResponseDto })
  @ApiResponse({ status: 403, description: 'Pergunta em processo ativo não pode ser editada' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  update(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.update(avaliadorId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir pergunta não vinculada (US-07)' })
  @ApiResponse({ status: 200, description: 'Pergunta excluída' })
  @ApiResponse({ status: 400, description: 'Pergunta vinculada a uma avaliação' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  remover(
    @CurrentUser('id') avaliadorId: string,
    @Param('id') id: string,
  ): Promise<{ mensagem: string }> {
    return this.questionsService.remover(avaliadorId, id);
  }
}
