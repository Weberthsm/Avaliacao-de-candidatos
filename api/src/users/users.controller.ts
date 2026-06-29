import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Perfil.ADMIN)
  @ApiOperation({ summary: 'Cadastrar usuário (US-03)' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas administrador)' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Perfil.ADMIN, Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiQuery({ name: 'perfil', enum: Perfil, required: false })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll(@Query('perfil') perfil?: Perfil): Promise<UserResponseDto[]> {
    return this.usersService.findAll(perfil);
  }

  @Get(':id')
  @Roles(Perfil.ADMIN, Perfil.AVALIADOR)
  @ApiOperation({ summary: 'Detalhar usuário' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }
}
