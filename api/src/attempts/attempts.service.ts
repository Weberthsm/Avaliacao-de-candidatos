import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ModoAprovacao,
  StatusProcesso,
  StatusTentativa,
  TipoNotificacao,
  TipoPergunta,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AttemptDetailDto,
  AttemptStatusDto,
  AvailableAssessmentDto,
  CandidatePanelDto,
  ProcessStatsDto,
} from './dto/attempt-response.dto';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // Lado do avaliado
  // ─────────────────────────────────────────────

  /** Avaliações disponíveis (US-13). */
  async listAvailable(avaliadoId: string): Promise<AvailableAssessmentDto[]> {
    const agora = new Date();
    const candidaturas = await this.prisma.processoCandidato.findMany({
      where: {
        avaliadoId,
        processo: { status: StatusProcesso.ATIVO },
      },
      include: {
        processo: { include: { _count: { select: { perguntas: true } } } },
      },
    });

    const tentativas = await this.prisma.tentativa.findMany({
      where: { avaliadoId },
      select: { processoId: true },
    });
    const jaIniciados = new Set(tentativas.map((t) => t.processoId));

    return candidaturas
      .filter((c) => {
        const p = c.processo;
        if (jaIniciados.has(p.id)) return false; // RN-13.2
        if (p.dataInicio && p.dataInicio > agora) return false; // RN-13.3
        if (p.dataFim && p.dataFim < agora) return false; // RN-13.3
        return true;
      })
      .map((c) => ({
        processoId: c.processo.id,
        titulo: c.processo.titulo,
        descricao: c.processo.descricao,
        tempoMinutos: c.processo.tempoMinutos,
        totalPerguntas: c.processo._count.perguntas,
      }));
  }

  /** Iniciar avaliação (US-14). RN-14.3 — tentativa única. */
  async start(avaliadoId: string, processoId: string): Promise<AttemptDetailDto> {
    const agora = new Date();
    const candidatura = await this.prisma.processoCandidato.findUnique({
      where: { processoId_avaliadoId: { processoId, avaliadoId } },
      include: { processo: true },
    });

    if (!candidatura) {
      throw new ForbiddenException('Você não está vinculado a este processo');
    }
    const processo = candidatura.processo;
    if (processo.status !== StatusProcesso.ATIVO) {
      throw new BadRequestException('Este processo não está disponível');
    }
    if (processo.dataInicio && processo.dataInicio > agora) {
      throw new BadRequestException('A avaliação ainda não está disponível');
    }
    if (processo.dataFim && processo.dataFim < agora) {
      throw new BadRequestException('O período da avaliação foi encerrado');
    }

    const existente = await this.prisma.tentativa.findUnique({
      where: { processoId_avaliadoId: { processoId, avaliadoId } },
    });
    if (existente) {
      // RN-14.4 — não reinicia; retoma onde parou
      return this.getDetail(avaliadoId, existente.id);
    }

    const tentativa = await this.prisma.tentativa.create({
      data: { processoId, avaliadoId },
    });
    return this.getDetail(avaliadoId, tentativa.id);
  }

  /** Detalhe da tentativa para responder (US-14/15/18), com auto-envio se expirado (US-20). */
  async getDetail(avaliadoId: string, id: string): Promise<AttemptDetailDto> {
    let tentativa = await this.carregarDoAvaliado(avaliadoId, id);

    // Auto-envio se o tempo já passou (abordagem por polling — US-20)
    if (
      tentativa.status === StatusTentativa.EM_ANDAMENTO &&
      this.tempoRestanteSegundos(tentativa) <= 0
    ) {
      await this.finalizar(tentativa.id, this.prazoFinal(tentativa));
      tentativa = await this.carregarDoAvaliado(avaliadoId, id);
    }

    const perguntas = await this.prisma.processoPergunta.findMany({
      where: { processoId: tentativa.processoId },
      include: { pergunta: { include: { alternativas: true } } },
      orderBy: { ordem: 'asc' },
    });

    const respostas = await this.prisma.resposta.findMany({
      where: { tentativaId: id },
    });
    const respostaPorPergunta = new Map(
      respostas.map((r) => [r.perguntaId, r]),
    );

    return {
      id: tentativa.id,
      status: tentativa.status,
      iniciadoEm: tentativa.iniciadoEm,
      tempoRestanteSegundos: this.tempoRestanteSegundos(tentativa),
      questoes: perguntas.map((pp) => {
        const r = respostaPorPergunta.get(pp.perguntaId);
        return {
          perguntaId: pp.pergunta.id,
          enunciado: pp.pergunta.enunciado,
          tipo: pp.pergunta.tipo,
          peso: pp.pergunta.peso,
          instrucoes: pp.pergunta.instrucoes,
          ordem: pp.ordem,
          // RN — gabarito nunca exposto durante a prova
          alternativas:
            pp.pergunta.tipo === TipoPergunta.FECHADA
              ? pp.pergunta.alternativas.map((a) => ({
                  id: a.id,
                  texto: a.texto,
                }))
              : undefined,
          respostaAtual: r
            ? { textoResposta: r.textoResposta, alternativaId: r.alternativaId }
            : undefined,
        };
      }),
    };
  }

  /** Finalizar/enviar avaliação (US-19). */
  async submit(avaliadoId: string, id: string): Promise<AttemptStatusDto> {
    const tentativa = await this.carregarDoAvaliado(avaliadoId, id);
    if (tentativa.status !== StatusTentativa.EM_ANDAMENTO) {
      throw new BadRequestException('A avaliação já foi finalizada');
    }
    await this.finalizar(id, new Date());
    return this.statusParaCandidato(avaliadoId, id);
  }

  /** Registrar saída de janela (US-21). RN-21.2 — tempo não pausa. */
  async logTabExit(avaliadoId: string, id: string): Promise<{ totalSaidas: number }> {
    const tentativa = await this.carregarDoAvaliado(avaliadoId, id);
    if (tentativa.status !== StatusTentativa.EM_ANDAMENTO) {
      throw new BadRequestException('A avaliação já foi finalizada');
    }
    await this.prisma.logAbaSaida.create({ data: { tentativaId: id } });
    const totalSaidas = await this.prisma.logAbaSaida.count({
      where: { tentativaId: id },
    });
    return { totalSaidas };
  }

  /** Minhas avaliações (US-29). */
  async myAttempts(avaliadoId: string): Promise<AttemptStatusDto[]> {
    const tentativas = await this.prisma.tentativa.findMany({
      where: { avaliadoId },
      include: { processo: true },
      orderBy: { iniciadoEm: 'desc' },
    });
    const resultado: AttemptStatusDto[] = [];
    for (const t of tentativas) {
      resultado.push(await this.montarStatus(t));
    }
    return resultado;
  }

  /** Resultado detalhado para o candidato (US-30). */
  async result(avaliadoId: string, id: string) {
    const tentativa = await this.carregarDoAvaliado(avaliadoId, id);
    const processo = await this.prisma.processo.findUnique({
      where: { id: tentativa.processoId },
    });

    const respostas = await this.prisma.resposta.findMany({
      where: { tentativaId: id },
      include: { pergunta: { include: { alternativas: true } }, alternativa: true },
    });

    const corrigida = tentativa.status === StatusTentativa.CORRIGIDA;

    return {
      id: tentativa.id,
      status: tentativa.status,
      scoreParcial: tentativa.scoreParcial ? Number(tentativa.scoreParcial) : null,
      scoreTotal: tentativa.scoreTotal ? Number(tentativa.scoreTotal) : null,
      aprovado: tentativa.aprovado,
      // RN-28.2 — feedback só após correção completa
      feedbackGeral: corrigida ? tentativa.feedbackGeral : null,
      questoes: respostas.map((r) => ({
        perguntaId: r.perguntaId,
        enunciado: r.pergunta.enunciado,
        tipo: r.pergunta.tipo,
        peso: r.pergunta.peso,
        respostaTexto: r.textoResposta,
        alternativaEscolhida: r.alternativaId,
        pontosObtidos: r.pontosObtidos ? Number(r.pontosObtidos) : null,
        observacao: corrigida ? r.observacaoAvaliador : null,
        // RN-30.2 — gabarito só se o processo permitir
        alternativaCorreta:
          corrigida &&
          processo?.exibirGabarito &&
          r.pergunta.tipo === TipoPergunta.FECHADA
            ? (r.pergunta.alternativas.find((a) => a.correta)?.id ?? null)
            : undefined,
      })),
    };
  }

  // ─────────────────────────────────────────────
  // Lado do avaliador
  // ─────────────────────────────────────────────

  /** Conceder tempo extra (US-12). RN-12.1 — só em andamento. */
  async addExtraTime(
    avaliadorId: string,
    id: string,
    minutos: number,
  ): Promise<{ tempoRestanteSegundos: number }> {
    const tentativa = await this.carregarParaAvaliador(avaliadorId, id);
    if (tentativa.status !== StatusTentativa.EM_ANDAMENTO) {
      throw new BadRequestException('A avaliação já foi finalizada');
    }
    const atualizada = await this.prisma.tentativa.update({
      where: { id },
      data: { tempoExtraMin: { increment: minutos } },
    });
    return { tempoRestanteSegundos: this.tempoRestanteSegundos(atualizada) };
  }

  /** Painel de candidatos do processo (US-31). */
  async candidatePanel(
    avaliadorId: string,
    processoId: string,
  ): Promise<CandidatePanelDto[]> {
    await this.garantirProcessoDoAvaliador(avaliadorId, processoId);

    // Parte de todos os candidatos VINCULADOS (US-31), não só dos que iniciaram
    const candidatos = await this.prisma.processoCandidato.findMany({
      where: { processoId },
      include: { avaliado: true },
      orderBy: { avaliado: { nome: 'asc' } },
    });

    const tentativas = await this.prisma.tentativa.findMany({
      where: { processoId },
      include: { _count: { select: { saidasAba: true } } },
    });
    const tentativaPorCandidato = new Map(
      tentativas.map((t) => [t.avaliadoId, t]),
    );

    const painel: CandidatePanelDto[] = [];
    for (const c of candidatos) {
      const t = tentativaPorCandidato.get(c.avaliadoId);

      if (!t) {
        // Candidato vinculado que ainda não iniciou
        painel.push({
          tentativaId: null,
          candidatoId: c.avaliadoId,
          candidatoNome: c.avaliado.nome,
          status: 'NAO_INICIADA',
          scoreParcial: null,
          scoreTotal: null,
          aprovado: null,
          abertasPendentes: 0,
          totalSaidas: 0,
          tempoGastoSegundos: null,
        });
        continue;
      }

      const calc = await this.scoring.calcular(t.id);
      painel.push({
        tentativaId: t.id,
        candidatoId: c.avaliadoId,
        candidatoNome: c.avaliado.nome,
        status: t.status,
        scoreParcial: t.scoreParcial ? Number(t.scoreParcial) : null,
        scoreTotal: t.scoreTotal ? Number(t.scoreTotal) : null,
        aprovado: t.aprovado,
        abertasPendentes: calc.abertasPendentes,
        totalSaidas: t._count.saidasAba,
        tempoGastoSegundos: t.finalizadoEm
          ? Math.round(
              (t.finalizadoEm.getTime() - t.iniciadoEm.getTime()) / 1000,
            )
          : null,
      });
    }
    return painel;
  }

  /** Tempo e média do processo (US-32). */
  async processStats(
    avaliadorId: string,
    processoId: string,
  ): Promise<ProcessStatsDto> {
    await this.garantirProcessoDoAvaliador(avaliadorId, processoId);

    const totalCandidatos = await this.prisma.processoCandidato.count({
      where: { processoId },
    });
    const finalizadas = await this.prisma.tentativa.findMany({
      where: { processoId, finalizadoEm: { not: null } },
    });

    let mediaTempoSegundos: number | null = null;
    if (finalizadas.length > 0) {
      const soma = finalizadas.reduce(
        (acc, t) =>
          acc + (t.finalizadoEm!.getTime() - t.iniciadoEm.getTime()) / 1000,
        0,
      );
      mediaTempoSegundos = Math.round(soma / finalizadas.length);
    }

    return {
      totalCandidatos,
      finalizados: finalizadas.length,
      mediaTempoSegundos,
    };
  }

  /** Aprovação/reprovação manual (US-27). RN-27.2 — prevalece sobre a automática. */
  async approveManually(
    avaliadorId: string,
    id: string,
    aprovado: boolean,
  ): Promise<{ mensagem: string }> {
    await this.carregarParaAvaliador(avaliadorId, id);
    await this.prisma.tentativa.update({
      where: { id },
      data: { aprovado, aprovadoManual: true },
    });
    return { mensagem: aprovado ? 'Candidato aprovado' : 'Candidato reprovado' };
  }

  /** Feedback geral (US-28). RN-28.2 — visível ao candidato só após correção. */
  async saveFeedback(
    avaliadorId: string,
    id: string,
    feedbackGeral: string,
  ): Promise<{ mensagem: string }> {
    await this.carregarParaAvaliador(avaliadorId, id);
    await this.prisma.tentativa.update({
      where: { id },
      data: { feedbackGeral },
    });
    return { mensagem: 'Feedback registrado' };
  }

  /** Visão de correção para o avaliador (US-24). */
  async correctionView(avaliadorId: string, id: string) {
    const tentativa = await this.carregarParaAvaliador(avaliadorId, id);
    const respostas = await this.prisma.resposta.findMany({
      where: { tentativaId: id },
      include: { pergunta: { include: { alternativas: true } }, alternativa: true },
    });

    return {
      id: tentativa.id,
      status: tentativa.status,
      feedbackGeral: tentativa.feedbackGeral,
      aprovado: tentativa.aprovado,
      respostas: respostas.map((r) => ({
        respostaId: r.id,
        perguntaId: r.perguntaId,
        enunciado: r.pergunta.enunciado,
        tipo: r.pergunta.tipo,
        peso: r.pergunta.peso,
        respostaTexto: r.textoResposta,
        alternativaEscolhida: r.alternativaId,
        alternativaCorreta:
          r.pergunta.tipo === TipoPergunta.FECHADA
            ? (r.pergunta.alternativas.find((a) => a.correta)?.id ?? null)
            : null,
        pontosObtidos: r.pontosObtidos ? Number(r.pontosObtidos) : null,
        observacao: r.observacaoAvaliador,
      })),
    };
  }

  /** Tentativa para correção (usado pelo módulo de respostas). */
  async carregarParaAvaliador(avaliadorId: string, id: string) {
    const tentativa = await this.prisma.tentativa.findUnique({
      where: { id },
      include: { processo: true },
    });
    if (!tentativa) {
      throw new NotFoundException('Tentativa não encontrada');
    }
    if (tentativa.processo.avaliadorId !== avaliadorId) {
      throw new ForbiddenException('Esta tentativa pertence a outro avaliador');
    }
    return tentativa;
  }

  /**
   * Recalcula após correção de aberta (US-25/US-26). Se não houver abertas
   * pendentes, consolida o resultado, define aprovação e avisa o candidato (US-34).
   */
  async recalcularAposCorrecao(tentativaId: string): Promise<void> {
    const tentativa = await this.prisma.tentativa.findUniqueOrThrow({
      where: { id: tentativaId },
      include: { processo: true },
    });
    const calc = await this.scoring.calcular(tentativaId);

    const data: any = { scoreParcial: calc.scoreParcial };

    if (calc.abertasPendentes === 0 && calc.scoreTotal !== null) {
      data.scoreTotal = calc.scoreTotal;
      data.status = StatusTentativa.CORRIGIDA;

      if (!tentativa.aprovadoManual) {
        const aprovado = this.scoring.definirAprovacaoAutomatica(
          tentativa.processo.modoAprovacao,
          calc.percentual,
          Number(tentativa.processo.notaMinima),
        );
        if (aprovado !== null) data.aprovado = aprovado;
      }
    }

    await this.prisma.tentativa.update({ where: { id: tentativaId }, data });

    if (data.status === StatusTentativa.CORRIGIDA) {
      await this.notifications.criar(
        tentativa.avaliadoId,
        TipoNotificacao.RESULTADO_DISPONIVEL,
        'Sua avaliação foi corrigida — veja o resultado',
        `/resultados/${tentativaId}`,
      );
    }
  }

  // ─────────────────────────────────────────────
  // Internos
  // ─────────────────────────────────────────────

  private async finalizar(tentativaId: string, finalizadoEm: Date) {
    const tentativa = await this.prisma.tentativa.findUniqueOrThrow({
      where: { id: tentativaId },
      include: { processo: true },
    });

    await this.scoring.corrigirFechadas(tentativaId); // US-23
    const calc = await this.scoring.calcular(tentativaId); // US-25

    const data: any = {
      status: StatusTentativa.ENVIADA,
      finalizadoEm,
      scoreParcial: calc.scoreParcial,
    };

    // Sem questões abertas: já consolida tudo
    if (calc.abertasPendentes === 0 && calc.scoreTotal !== null) {
      data.scoreTotal = calc.scoreTotal;
      data.status = StatusTentativa.CORRIGIDA;
      const aprovado = this.scoring.definirAprovacaoAutomatica(
        tentativa.processo.modoAprovacao,
        calc.percentual,
        Number(tentativa.processo.notaMinima),
      );
      if (aprovado !== null) data.aprovado = aprovado;
    }

    await this.prisma.tentativa.update({ where: { id: tentativaId }, data });

    // US-33 — avisa o avaliador sobre o novo envio
    await this.notifications.criar(
      tentativa.processo.avaliadorId,
      TipoNotificacao.NOVO_ENVIO,
      `${(await this.nomeCandidato(tentativa.avaliadoId))} enviou a avaliação — ${tentativa.processo.titulo}`,
      `/processos/${tentativa.processoId}/candidatos`,
    );

    // US-34 — se já corrigida (sem abertas), avisa o candidato
    if (data.status === StatusTentativa.CORRIGIDA) {
      await this.notifications.criar(
        tentativa.avaliadoId,
        TipoNotificacao.RESULTADO_DISPONIVEL,
        'Sua avaliação foi corrigida — veja o resultado',
        `/resultados/${tentativaId}`,
      );
    }
  }

  private prazoFinal(tentativa: {
    iniciadoEm: Date;
    tempoExtraMin: number;
    processo?: { tempoMinutos: number };
  }): Date {
    const minutos =
      (tentativa.processo?.tempoMinutos ?? 0) + tentativa.tempoExtraMin;
    return new Date(tentativa.iniciadoEm.getTime() + minutos * 60 * 1000);
  }

  private tempoRestanteSegundos(tentativa: any): number {
    if (!tentativa.processo) return 0;
    const restante =
      (this.prazoFinal(tentativa).getTime() - Date.now()) / 1000;
    return Math.max(0, Math.round(restante));
  }

  private async carregarDoAvaliado(avaliadoId: string, id: string) {
    const tentativa = await this.prisma.tentativa.findUnique({
      where: { id },
      include: { processo: true },
    });
    if (!tentativa) {
      throw new NotFoundException('Tentativa não encontrada');
    }
    if (tentativa.avaliadoId !== avaliadoId) {
      throw new ForbiddenException('Esta avaliação pertence a outro candidato');
    }
    return tentativa;
  }

  private async statusParaCandidato(
    avaliadoId: string,
    id: string,
  ): Promise<AttemptStatusDto> {
    const tentativa = await this.prisma.tentativa.findUniqueOrThrow({
      where: { id },
      include: { processo: true },
    });
    return this.montarStatus(tentativa);
  }

  private async montarStatus(tentativa: any): Promise<AttemptStatusDto> {
    const calc = await this.scoring.calcular(tentativa.id);
    const situacao =
      tentativa.status === StatusTentativa.EM_ANDAMENTO
        ? 'Em andamento'
        : tentativa.status === StatusTentativa.ENVIADA
          ? 'Aguardando correção'
          : tentativa.aprovado === true
            ? 'Aprovado'
            : tentativa.aprovado === false
              ? 'Reprovado'
              : 'Avaliada';

    return {
      id: tentativa.id,
      processoTitulo: tentativa.processo.titulo,
      status: tentativa.status,
      situacao,
      scoreParcial: tentativa.scoreParcial ? Number(tentativa.scoreParcial) : null,
      scoreTotal: tentativa.scoreTotal ? Number(tentativa.scoreTotal) : null,
      aprovado: tentativa.aprovado,
      abertasPendentes: calc.abertasPendentes,
      finalizadoEm: tentativa.finalizadoEm,
    };
  }

  private async nomeCandidato(id: string): Promise<string> {
    const u = await this.prisma.usuario.findUnique({ where: { id } });
    return u?.nome ?? 'Candidato';
  }

  private async garantirProcessoDoAvaliador(
    avaliadorId: string,
    processoId: string,
  ) {
    const processo = await this.prisma.processo.findUnique({
      where: { id: processoId },
    });
    if (!processo) throw new NotFoundException('Processo não encontrado');
    if (processo.avaliadorId !== avaliadorId) {
      throw new ForbiddenException('Processo pertence a outro avaliador');
    }
    return processo;
  }
}
