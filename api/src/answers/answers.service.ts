import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusTentativa, TipoPergunta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptsService } from '../attempts/attempts.service';
import { GradeAnswerDto, SaveAnswerDto } from '../attempts/dto/attempt-dtos';

@Injectable()
export class AnswersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attempts: AttemptsService,
  ) {}

  /**
   * Salvamento automático de resposta (US-16/US-15/US-17).
   * RN-15.3 / RN-17.3 — só enquanto a avaliação está em andamento.
   */
  async save(avaliadoId: string, dto: SaveAnswerDto) {
    const tentativa = await this.prisma.tentativa.findUnique({
      where: { id: dto.tentativaId },
      include: { processo: true },
    });
    if (!tentativa) throw new NotFoundException('Tentativa não encontrada');
    if (tentativa.avaliadoId !== avaliadoId) {
      throw new ForbiddenException('Esta avaliação pertence a outro candidato');
    }
    if (tentativa.status !== StatusTentativa.EM_ANDAMENTO) {
      throw new BadRequestException('A avaliação já foi finalizada');
    }

    // Tempo encerrado (US-20) — bloqueia novas respostas
    const prazo =
      tentativa.iniciadoEm.getTime() +
      (tentativa.processo.tempoMinutos + tentativa.tempoExtraMin) * 60 * 1000;
    if (Date.now() > prazo) {
      throw new BadRequestException('O tempo da avaliação foi encerrado');
    }

    // Pergunta precisa pertencer ao processo
    const processoPergunta = await this.prisma.processoPergunta.findFirst({
      where: { processoId: tentativa.processoId, perguntaId: dto.perguntaId },
      include: { pergunta: { include: { alternativas: true } } },
    });
    if (!processoPergunta) {
      throw new BadRequestException('Pergunta não pertence a este processo');
    }

    const pergunta = processoPergunta.pergunta;

    if (pergunta.tipo === TipoPergunta.FECHADA) {
      if (!dto.alternativaId) {
        throw new BadRequestException('Selecione uma alternativa');
      }
      const pertence = pergunta.alternativas.some(
        (a) => a.id === dto.alternativaId,
      );
      if (!pertence) {
        throw new BadRequestException('Alternativa inválida para esta pergunta');
      }
    }

    const resposta = await this.prisma.resposta.upsert({
      where: {
        tentativaId_perguntaId: {
          tentativaId: dto.tentativaId,
          perguntaId: dto.perguntaId,
        },
      },
      create: {
        tentativaId: dto.tentativaId,
        perguntaId: dto.perguntaId,
        textoResposta:
          pergunta.tipo === TipoPergunta.ABERTA ? dto.textoResposta ?? null : null,
        alternativaId:
          pergunta.tipo === TipoPergunta.FECHADA ? dto.alternativaId ?? null : null,
      },
      update: {
        textoResposta:
          pergunta.tipo === TipoPergunta.ABERTA ? dto.textoResposta ?? null : null,
        alternativaId:
          pergunta.tipo === TipoPergunta.FECHADA ? dto.alternativaId ?? null : null,
      },
    });

    return { mensagem: 'Resposta salva', salvoEm: resposta.salvoEm };
  }

  /**
   * Correção de questão aberta (US-24).
   * RN-24.1 — pontos entre 0 e o peso | RN-24.2 — observação opcional
   */
  async grade(avaliadorId: string, respostaId: string, dto: GradeAnswerDto) {
    const resposta = await this.prisma.resposta.findUnique({
      where: { id: respostaId },
      include: { pergunta: true, tentativa: { include: { processo: true } } },
    });
    if (!resposta) throw new NotFoundException('Resposta não encontrada');
    if (resposta.tentativa.processo.avaliadorId !== avaliadorId) {
      throw new ForbiddenException('Esta resposta pertence a outro avaliador');
    }
    if (resposta.pergunta.tipo !== TipoPergunta.ABERTA) {
      throw new BadRequestException(
        'Apenas questões abertas são corrigidas manualmente',
      );
    }
    if (dto.pontos > resposta.pergunta.peso) {
      throw new BadRequestException(
        'A pontuação não pode exceder o peso da questão',
      );
    }

    await this.prisma.resposta.update({
      where: { id: respostaId },
      data: {
        pontosObtidos: dto.pontos,
        observacaoAvaliador: dto.observacao ?? null,
      },
    });

    // US-25/US-26/US-34 — consolida resultado se todas as abertas foram corrigidas
    await this.attempts.recalcularAposCorrecao(resposta.tentativaId);

    return { mensagem: 'Correção registrada' };
  }
}
