import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cadastra um novo usuário (US-03).
   * RN-03.1 — campos obrigatórios (validados no DTO)
   * RN-03.2 — e-mail único
   * RN-03.3 — telefone opcional
   * RN-03.4 — papel único por usuário
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        perfil: dto.perfil,
        telefone: dto.telefone ?? null,
      },
    });

    return this.toResponse(usuario);
  }

  async findAll(perfil?: Perfil): Promise<UserResponseDto[]> {
    const usuarios = await this.prisma.usuario.findMany({
      where: perfil ? { perfil } : undefined,
      orderBy: { criadoEm: 'desc' },
    });
    return usuarios.map((u) => this.toResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.toResponse(usuario);
  }

  private toResponse(u: {
    id: string;
    nome: string;
    email: string;
    perfil: Perfil;
    telefone: string | null;
    criadoEm: Date;
  }): UserResponseDto {
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      telefone: u.telefone,
      criadoEm: u.criadoEm,
    };
  }
}
