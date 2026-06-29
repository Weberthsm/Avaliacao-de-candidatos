import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil, StatusProcesso } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import {
  AddCandidatesDto,
  AddQuestionsDto,
} from './dto/process-operations.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Injectable()
export class ProcessesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Criar processo (US-08). RN-08.5 — nasce como rascunho. */
  async create(
    avaliadorId: string,
    dto: CreateProcessDto,
  ): Promise<ProcessResponseDto> {
    if (dto.dataInicio && dto.dataFim && dto.dataInicio > dto.dataFim) {
      throw new BadRequestException(
        'A data de início não pode ser posterior à data de fim',
      );
    }

    const processo = await this.prisma.processo.create({
      data: {
        avaliadorId,
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        tempoMinutos: dto.tempoMinutos,
        notaMinima: dto.notaMinima,
        modoAprovacao: dto.modoAprovacao,
        exibirGabarito: dto.exibirGabarito ?? false,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : null,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        status: StatusProcesso.RASCUNHO,
      },
    });
    return this.toResponse(processo, 0, 0);
  }

  async findAll(avaliadorId: string): Promise<ProcessResponseDto[]> {
    const processos = await this.prisma.processo.findMany({
      where: { avaliadorId },
      include: { _count: { select: { perguntas: true, candidatos: true } } },
      orderBy: { criadoEm: 'desc' },
    });
    return processos.map((p) =>
      this.toResponse(p, p._count.perguntas, p._count.candidatos),
    );
  }

  async findOne(
    avaliadorId: string,
    id: string,
  ): Promise<ProcessResponseDto> {
    const processo = await this.buscarDoAvaliador(avaliadorId, id);
    const count = await this.prisma.processo.findUnique({
      where: { id },
      include: { _count: { select: { perguntas: true, candidatos: true } } },
    });
    return this.toResponse(
      processo,
      count!._count.perguntas,
      count!._count.candidatos,
    );
  }

  /** Perguntas já vinculadas ao processo, em ordem. */
  async listarPerguntas(avaliadorId: string, id: string) {
    await this.buscarDoAvaliador(avaliadorId, id);
    const itens = await this.prisma.processoPergunta.findMany({
      where: { processoId: id },
      include: { pergunta: true },
      orderBy: { ordem: 'asc' },
    });
    return itens.map((pp) => ({
      perguntaId: pp.perguntaId,
      ordem: pp.ordem,
      enunciado: pp.pergunta.enunciado,
      tipo: pp.pergunta.tipo,
      peso: pp.pergunta.peso,
    }));
  }

  /** Candidatos já vinculados ao processo. */
  async listarCandidatos(avaliadorId: string, id: string) {
    await this.buscarDoAvaliador(avaliadorId, id);
    const itens = await this.prisma.processoCandidato.findMany({
      where: { processoId: id },
      include: { avaliado: true },
      orderBy: { avaliado: { nome: 'asc' } },
    });
    return itens.map((pc) => ({
      candidatoId: pc.avaliadoId,
      nome: pc.avaliado.nome,
      email: pc.avaliado.email,
    }));
  }

  async update(
    avaliadorId: string,
    id: string,
    dto: UpdateProcessDto,
  ): Promise<ProcessResponseDto> {
    const processo = await this.buscarDoAvaliador(avaliadorId, id);
    if (processo.status !== StatusProcesso.RASCUNHO) {
      throw new ForbiddenException(
        'Apenas processos em rascunho podem ser alterados',
      );
    }
    const atualizado = await this.prisma.processo.update({
      where: { id },
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        tempoMinutos: dto.tempoMinutos,
        notaMinima: dto.notaMinima,
        modoAprovacao: dto.modoAprovacao,
        exibirGabarito: dto.exibirGabarito,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
    return this.findOne(avaliadorId, atualizado.id);
  }

  /** Selecionar perguntas (US-09). RN-09.1 — só perguntas ativas. */
  async addQuestions(
    avaliadorId: string,
    id: string,
    dto: AddQuestionsDto,
  ): Promise<{ mensagem: string }> {
    await this.buscarDoAvaliador(avaliadorId, id);

    const ids = dto.perguntas.map((p) => p.perguntaId);
    const perguntas = await this.prisma.pergunta.findMany({
      where: { id: { in: ids }, avaliadorId },
    });

    if (perguntas.length !== ids.length) {
      throw new BadRequestException(
        'Uma ou mais perguntas não foram encontradas',
      );
    }
    if (perguntas.some((p) => !p.ativa)) {
      throw new BadRequestException(
        'Perguntas arquivadas não podem ser adicionadas',
      );
    }

    await this.prisma.$transaction(
      dto.perguntas.map((item) =>
        this.prisma.processoPergunta.upsert({
          where: {
            processoId_perguntaId: {
              processoId: id,
              perguntaId: item.perguntaId,
            },
          },
          create: {
            processoId: id,
            perguntaId: item.perguntaId,
            ordem: item.ordem,
          },
          update: { ordem: item.ordem },
        }),
      ),
    );

    return { mensagem: 'Perguntas adicionadas ao processo' };
  }

  /** Adicionar candidatos (US-10). RN-10.1 — apenas avaliados. RN-10.2 — sem duplicar. */
  async addCandidates(
    avaliadorId: string,
    id: string,
    dto: AddCandidatesDto,
  ): Promise<{ mensagem: string }> {
    await this.buscarDoAvaliador(avaliadorId, id);

    const candidatos = await this.prisma.usuario.findMany({
      where: { id: { in: dto.candidatoIds } },
    });

    if (candidatos.length !== dto.candidatoIds.length) {
      throw new BadRequestException('Um ou mais candidatos não foram encontrados');
    }
    if (candidatos.some((c) => c.perfil !== Perfil.AVALIADO)) {
      throw new BadRequestException(
        'Apenas usuários avaliados podem ser adicionados como candidatos',
      );
    }

    const existentes = await this.prisma.processoCandidato.findMany({
      where: { processoId: id, avaliadoId: { in: dto.candidatoIds } },
    });
    if (existentes.length > 0) {
      throw new BadRequestException('Candidato já adicionado a este processo');
    }

    await this.prisma.processoCandidato.createMany({
      data: dto.candidatoIds.map((avaliadoId) => ({
        processoId: id,
        avaliadoId,
      })),
    });

    return { mensagem: 'Candidatos adicionados ao processo' };
  }

  /** Publicar processo (US-11). RN-11.1 — exige pergunta e candidato. */
  async publish(
    avaliadorId: string,
    id: string,
  ): Promise<ProcessResponseDto> {
    await this.buscarDoAvaliador(avaliadorId, id);

    const count = await this.prisma.processo.findUnique({
      where: { id },
      include: { _count: { select: { perguntas: true, candidatos: true } } },
    });

    if (count!._count.perguntas < 1) {
      throw new BadRequestException(
        'Adicione ao menos uma pergunta antes de publicar',
      );
    }
    if (count!._count.candidatos < 1) {
      throw new BadRequestException(
        'Adicione ao menos um candidato antes de publicar',
      );
    }

    await this.prisma.processo.update({
      where: { id },
      data: { status: StatusProcesso.ATIVO },
    });

    return this.findOne(avaliadorId, id);
  }

  async close(avaliadorId: string, id: string): Promise<ProcessResponseDto> {
    await this.buscarDoAvaliador(avaliadorId, id);
    await this.prisma.processo.update({
      where: { id },
      data: { status: StatusProcesso.ENCERRADO },
    });
    return this.findOne(avaliadorId, id);
  }

  // ── auxiliares ────────────────────────────────

  async buscarDoAvaliador(avaliadorId: string, id: string) {
    const processo = await this.prisma.processo.findUnique({ where: { id } });
    if (!processo) {
      throw new NotFoundException('Processo não encontrado');
    }
    if (processo.avaliadorId !== avaliadorId) {
      throw new ForbiddenException('Processo pertence a outro avaliador');
    }
    return processo;
  }

  private toResponse(
    p: any,
    totalPerguntas: number,
    totalCandidatos: number,
  ): ProcessResponseDto {
    return {
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      tempoMinutos: p.tempoMinutos,
      notaMinima: Number(p.notaMinima),
      modoAprovacao: p.modoAprovacao,
      exibirGabarito: p.exibirGabarito,
      dataInicio: p.dataInicio,
      dataFim: p.dataFim,
      status: p.status,
      totalPerguntas,
      totalCandidatos,
      criadoEm: p.criadoEm,
    };
  }
}
