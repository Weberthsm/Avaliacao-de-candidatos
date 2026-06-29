import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoNotificacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Avisos in-app (US-33, US-34). Consumidos por polling do frontend.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(
    usuarioId: string,
    tipo: TipoNotificacao,
    mensagem: string,
    link?: string,
  ) {
    return this.prisma.notificacao.create({
      data: { usuarioId, tipo, mensagem, link: link ?? null },
    });
  }

  async listar(usuarioId: string, apenasNaoLidas = false) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId, ...(apenasNaoLidas ? { lida: false } : {}) },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async marcarComoLida(usuarioId: string, id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificacao || notificacao.usuarioId !== usuarioId) {
      throw new NotFoundException('Notificação não encontrada');
    }
    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }
}
