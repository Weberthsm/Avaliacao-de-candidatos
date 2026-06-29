import { Injectable } from '@nestjs/common';
import { ModoAprovacao, TipoPergunta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ResultadoCalculo {
  scoreParcial: number;
  scoreTotal: number | null;
  somaPesos: number;
  percentual: number | null;
  abertasPendentes: number;
}

/**
 * Regras de pontuação e aprovação (US-23, US-25, US-26).
 */
@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Corrige automaticamente as questões fechadas de uma tentativa (US-23).
   * RN-23.1 — compara com o gabarito | RN-23.2 — acerto = peso, erro = 0
   */
  async corrigirFechadas(tentativaId: string): Promise<void> {
    const respostas = await this.prisma.resposta.findMany({
      where: { tentativaId, pergunta: { tipo: TipoPergunta.FECHADA } },
      include: { pergunta: true, alternativa: true },
    });

    for (const r of respostas) {
      const acertou = r.alternativa?.correta === true;
      await this.prisma.resposta.update({
        where: { id: r.id },
        data: { pontosObtidos: acertou ? r.pergunta.peso : 0 },
      });
    }
  }

  /**
   * Recalcula scores parcial/total de uma tentativa (US-25).
   * RN-25.1 — soma fechadas + abertas
   * RN-25.2 — percentual sobre soma dos pesos
   * RN-25.3 — total só quando não há abertas pendentes
   */
  async calcular(tentativaId: string): Promise<ResultadoCalculo> {
    const respostas = await this.prisma.resposta.findMany({
      where: { tentativaId },
      include: { pergunta: true },
    });

    const processoPerguntas = await this.prisma.processoPergunta.findMany({
      where: { processo: { tentativas: { some: { id: tentativaId } } } },
      include: { pergunta: true },
    });

    const somaPesos = processoPerguntas.reduce(
      (acc, pp) => acc + pp.pergunta.peso,
      0,
    );

    let scoreParcial = 0;
    for (const r of respostas) {
      if (
        r.pergunta.tipo === TipoPergunta.FECHADA &&
        r.pontosObtidos !== null
      ) {
        scoreParcial += Number(r.pontosObtidos);
      }
    }

    // Abertas que ainda não receberam pontuação
    const abertasTotais = processoPerguntas.filter(
      (pp) => pp.pergunta.tipo === TipoPergunta.ABERTA,
    ).length;
    const abertasCorrigidas = respostas.filter(
      (r) =>
        r.pergunta.tipo === TipoPergunta.ABERTA && r.pontosObtidos !== null,
    ).length;
    const abertasPendentes = abertasTotais - abertasCorrigidas;

    let scoreTotal: number | null = null;
    let percentual: number | null = null;

    if (abertasPendentes === 0) {
      const pontosAbertas = respostas
        .filter(
          (r) =>
            r.pergunta.tipo === TipoPergunta.ABERTA &&
            r.pontosObtidos !== null,
        )
        .reduce((acc, r) => acc + Number(r.pontosObtidos), 0);
      scoreTotal = scoreParcial + pontosAbertas;
      percentual = somaPesos > 0 ? (scoreTotal / somaPesos) * 100 : 0;
    }

    return { scoreParcial, scoreTotal, somaPesos, percentual, abertasPendentes };
  }

  /**
   * Define aprovação automática (US-26).
   * RN-26.1 — só após abertas corrigidas
   * RN-26.2 — percentual >= nota mínima
   * RN-26.3 — apenas em modo automático/ambos
   */
  definirAprovacaoAutomatica(
    modo: ModoAprovacao,
    percentual: number | null,
    notaMinima: number,
  ): boolean | null {
    if (modo === ModoAprovacao.MANUAL) return null;
    if (percentual === null) return null;
    return percentual >= notaMinima;
  }
}
