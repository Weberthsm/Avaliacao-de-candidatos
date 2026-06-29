import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Token de atualização emitido no login' })
  @IsString()
  refreshToken: string;
}
