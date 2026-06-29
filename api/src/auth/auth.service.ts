import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

interface JwtPayload {
  sub: string;
  email: string;
  perfil: string;
  nome: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Autentica o usuário (US-01).
   * RN-01.1 — credenciais válidas
   * RN-01.2 — bloqueio temporário após tentativas seguidas
   * RN-01.3 — identificação do perfil para direcionamento
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    const credenciaisInvalidas = () =>
      new UnauthorizedException('Credenciais inválidas');

    if (!usuario) {
      throw credenciaisInvalidas();
    }

    // RN-01.2 — conta temporariamente bloqueada
    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      throw new ForbiddenException(
        'Acesso bloqueado temporariamente. Tente mais tarde',
      );
    }

    const senhaConfere = await bcrypt.compare(dto.senha, usuario.senhaHash);

    if (!senhaConfere) {
      await this.registrarFalha(usuario.id, usuario.tentativasFalhas);
      throw credenciaisInvalidas();
    }

    // Acesso bem-sucedido: zera contadores
    if (usuario.tentativasFalhas > 0 || usuario.bloqueadoAte) {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { tentativasFalhas: 0, bloqueadoAte: null },
      });
    }

    return this.emitirTokens({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      nome: usuario.nome,
    });
  }

  /**
   * Gera novos tokens a partir de um refresh token válido (US-01).
   */
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario) {
        throw new UnauthorizedException('Sessão inválida');
      }

      return this.emitirTokens({
        sub: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        nome: usuario.nome,
      });
    } catch {
      throw new UnauthorizedException('Sessão expirada. Acesse novamente');
    }
  }

  private async registrarFalha(usuarioId: string, falhasAtuais: number) {
    const max = Number(this.config.get('MAX_LOGIN_ATTEMPTS') ?? 5);
    const lockoutMin = Number(this.config.get('LOCKOUT_MINUTES') ?? 15);
    const novasFalhas = falhasAtuais + 1;

    const data: { tentativasFalhas: number; bloqueadoAte?: Date } = {
      tentativasFalhas: novasFalhas,
    };

    if (novasFalhas >= max) {
      data.bloqueadoAte = new Date(Date.now() + lockoutMin * 60 * 1000);
      data.tentativasFalhas = 0;
    }

    await this.prisma.usuario.update({ where: { id: usuarioId }, data });
  }

  private async emitirTokens(payload: JwtPayload): Promise<AuthResponseDto> {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '30m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        perfil: payload.perfil,
      },
    };
  }
}
