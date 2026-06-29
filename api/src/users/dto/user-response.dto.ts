import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Perfil })
  perfil: Perfil;

  @ApiPropertyOptional({ nullable: true })
  telefone: string | null;

  @ApiProperty({ format: 'date-time' })
  criadoEm: Date;
}
