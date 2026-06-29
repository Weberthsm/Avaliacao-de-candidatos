import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResumoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'AVALIADOR', 'AVALIADO'] })
  perfil: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Token de atualização JWT' })
  refreshToken: string;

  @ApiProperty({ type: UsuarioResumoDto })
  usuario: UsuarioResumoDto;
}
