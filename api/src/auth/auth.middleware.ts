import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

/** Header onde o token renovado é devolvido ao cliente. */
export const RENEWED_TOKEN_HEADER = 'X-Renewed-Token';

/**
 * Autenticação via middleware (requisito do projeto) com SESSÃO DESLIZANTE (ADR-017).
 *
 * A cada requisição autenticada válida:
 *  1. valida o token JWT do cabeçalho Authorization;
 *  2. anexa o usuário autenticado à requisição;
 *  3. RE-EMITE o token com o relógio de inatividade reiniciado e o devolve no
 *     header `X-Renewed-Token`, para o cliente substituir o token guardado.
 *
 * Assim, enquanto o usuário estiver ativo (incluindo o heartbeat do frontend
 * durante a prova), a sessão não expira. O encerramento da prova é governado
 * pelo cronômetro, não pela sessão (US-35).
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const header = req.headers['authorization'];

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    const token = header.substring(7);

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      (req as any).user = {
        id: payload.sub,
        email: payload.email,
        perfil: payload.perfil,
        nome: payload.nome,
      };

      // Renovação deslizante: token novo com a janela de inatividade reiniciada
      const renovado = await this.jwt.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          perfil: payload.perfil,
          nome: payload.nome,
        },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '30m',
        },
      );
      res.setHeader(RENEWED_TOKEN_HEADER, renovado);

      next();
    } catch {
      throw new UnauthorizedException('Sessão expirada. Acesse novamente');
    }
  }
}
