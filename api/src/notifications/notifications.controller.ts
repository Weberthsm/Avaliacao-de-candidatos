import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar meus avisos (US-33/US-34) — consumir via polling' })
  @ApiQuery({ name: 'naoLidas', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  listar(
    @CurrentUser('id') usuarioId: string,
    @Query('naoLidas') naoLidas?: string,
  ) {
    return this.notificationsService.listar(usuarioId, naoLidas === 'true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar aviso como lido' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  marcarComoLida(
    @CurrentUser('id') usuarioId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.marcarComoLida(usuarioId, id);
  }
}
