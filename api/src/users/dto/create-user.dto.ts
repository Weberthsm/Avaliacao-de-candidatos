import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Avaliadora' })
  @IsString()
  @MinLength(1, { message: 'Informe o nome' })
  nome: string;

  @ApiProperty({ example: 'maria@avaliacao.local' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter ao menos 6 caracteres' })
  senha: string;

  @ApiProperty({ enum: Perfil, example: Perfil.AVALIADO })
  @IsEnum(Perfil, { message: 'Perfil inválido' })
  perfil: Perfil;

  @ApiPropertyOptional({ example: '+5511999998888', description: 'Celular do avaliado (opcional)' })
  @IsOptional()
  @IsString()
  telefone?: string;
}
