import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoNotificacao } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: TipoNotificacao })
  tipo: TipoNotificacao;

  @ApiProperty()
  mensagem: string;

  @ApiPropertyOptional({ nullable: true })
  link: string | null;

  @ApiProperty()
  lida: boolean;

  @ApiProperty({ format: 'date-time' })
  criadoEm: Date;
}
