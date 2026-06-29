import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoPergunta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cadastra pergunta aberta (US-04) ou fechada (US-05).
   * RN-04.2 / RN-05.4 — peso positivo (DTO)
   * RN-05.2 — mínimo 2 alternativas
   * RN-05.3 — exatamente uma correta
   */
  async create(
    avaliadorId: string,
    dto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    if (dto.tipo === TipoPergunta.FECHADA) {
      this.validarFechada(dto);
    }

    const pergunta = await this.prisma.pergunta.create({
      data: {
        avaliadorId,
        enunciado: dto.enunciado,
        tipo: dto.tipo,
        peso: dto.peso,
        instrucoes: dto.instrucoes ?? null,
        gabarito: dto.gabarito ?? null,
        alternativas:
          dto.tipo === TipoPergunta.FECHADA && dto.alternativas
            ? {
                create: dto.alternativas.map((a) => ({
                  texto: a.texto,
                  correta: a.correta,
                })),
              }
            : undefined,
      },
      include: { alternativas: true },
    });

    return this.toResponse(pergunta, true);
  }

  async findAll(
    avaliadorId: string,
    tipo?: TipoPergunta,
    busca?: string,
  ): Promise<QuestionResponseDto[]> {
    // RN-06.1 — apenas perguntas do avaliador | RN-06.4 — exclui arquivadas
    const where: Prisma.PerguntaWhereInput = {
      avaliadorId,
      ativa: true,
      ...(tipo ? { tipo } : {}),
      ...(busca
        ? { enunciado: { contains: busca, mode: 'insensitive' } }
        : {}),
    };

    const perguntas = await this.prisma.pergunta.findMany({
      where,
      include: { alternativas: true },
      orderBy: { criadoEm: 'desc' },
    });

    return perguntas.map((p) => this.toResponse(p, true));
  }

  async findOne(
    avaliadorId: string,
    id: string,
  ): Promise<QuestionResponseDto> {
    const pergunta = await this.buscarDoAvaliador(avaliadorId, id);
    return this.toResponse(pergunta, true);
  }

  /**
   * Edita pergunta (US-07).
   * RN-07.1 — pergunta vinculada a uma avaliação não pode ser editada.
   */
  async update(
    avaliadorId: string,
    id: string,
    dto: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    await this.buscarDoAvaliador(avaliadorId, id);
    await this.garantirNaoVinculada(id, 'editada');

    const tipoFinal = dto.tipo;
    if (tipoFinal === TipoPergunta.FECHADA && dto.alternativas) {
      this.validarFechada(dto as CreateQuestionDto);
    }

    const pergunta = await this.prisma.$transaction(async (tx) => {
      // Se vierem alternativas, substitui o conjunto atual
      if (dto.alternativas) {
        await tx.alternativa.deleteMany({ where: { perguntaId: id } });
      }

      return tx.pergunta.update({
        where: { id },
        data: {
          enunciado: dto.enunciado,
          tipo: dto.tipo,
          peso: dto.peso,
          instrucoes: dto.instrucoes,
          gabarito: dto.gabarito,
          alternativas: dto.alternativas
            ? {
                create: dto.alternativas.map((a) => ({
                  texto: a.texto,
                  correta: a.correta,
                })),
              }
            : undefined,
        },
        include: { alternativas: true },
      });
    });

    return this.toResponse(pergunta, true);
  }

  /**
   * Exclui pergunta (US-07). RN-07.2 — só é possível excluir uma pergunta que
   * ainda não esteja vinculada a nenhuma avaliação (processo).
   */
  async remover(avaliadorId: string, id: string): Promise<{ mensagem: string }> {
    await this.buscarDoAvaliador(avaliadorId, id);
    await this.garantirNaoVinculada(id, 'excluída');

    // Alternativas são removidas em cascata (onDelete: Cascade)
    await this.prisma.pergunta.delete({ where: { id } });
    return { mensagem: 'Pergunta excluída' };
  }

  // ── auxiliares ────────────────────────────────

  private validarFechada(dto: CreateQuestionDto) {
    if (!dto.alternativas || dto.alternativas.length < 2) {
      throw new BadRequestException('Informe ao menos duas alternativas');
    }
    const corretas = dto.alternativas.filter((a) => a.correta);
    if (corretas.length === 0) {
      throw new BadRequestException('Indique a alternativa correta');
    }
    if (corretas.length > 1) {
      throw new BadRequestException('Marque apenas uma alternativa correta');
    }
  }

  private async buscarDoAvaliador(avaliadorId: string, id: string) {
    const pergunta = await this.prisma.pergunta.findUnique({
      where: { id },
      include: { alternativas: true },
    });
    if (!pergunta) {
      throw new NotFoundException('Pergunta não encontrada');
    }
    if (pergunta.avaliadorId !== avaliadorId) {
      throw new ForbiddenException('Pergunta pertence a outro avaliador');
    }
    return pergunta;
  }

  private async garantirNaoVinculada(
    perguntaId: string,
    acao: 'editada' | 'excluída',
  ) {
    const vinculada = await this.prisma.processoPergunta.findFirst({
      where: { perguntaId },
    });
    if (vinculada) {
      throw new BadRequestException(
        `Pergunta vinculada a uma avaliação não pode ser ${acao}`,
      );
    }
  }

  private toResponse(
    pergunta: any,
    incluirGabarito: boolean,
  ): QuestionResponseDto {
    return {
      id: pergunta.id,
      enunciado: pergunta.enunciado,
      tipo: pergunta.tipo,
      peso: pergunta.peso,
      instrucoes: pergunta.instrucoes,
      gabarito: pergunta.gabarito,
      ativa: pergunta.ativa,
      criadoEm: pergunta.criadoEm,
      alternativas: pergunta.alternativas?.map((a: any) => ({
        id: a.id,
        texto: a.texto,
        ...(incluirGabarito ? { correta: a.correta } : {}),
      })),
    };
  }
}
