import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Autorização por perfil (RN-02.1, RN-02.2, RN-02.3).
 * A autenticação já foi resolvida pelo AuthMiddleware; aqui validamos o papel.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Perfil[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.perfil)) {
      throw new ForbiddenException('Você não tem permissão para esta ação');
    }

    return true;
  }
}
