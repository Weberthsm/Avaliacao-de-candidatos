import { SetMetadata } from '@nestjs/common';
import { Perfil } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restringe o acesso de uma rota aos perfis informados.
 * Ex.: @Roles(Perfil.AVALIADOR)
 */
export const Roles = (...roles: Perfil[]) => SetMetadata(ROLES_KEY, roles);
