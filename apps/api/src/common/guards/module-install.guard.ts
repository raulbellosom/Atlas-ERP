import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { MODULE_INSTALL_KEY } from '../constants/authorization.constants';
import { PUBLIC_ROUTE_KEY } from '../constants/auth.constants';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: { sub?: string; organizationId?: string };
}

@Injectable()
export class ModuleInstallGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.DISABLE_AUTH_GUARDS === 'true') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredModuleKey = this.reflector.getAllAndOverride<string>(MODULE_INSTALL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredModuleKey) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const organizationId = request.user?.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('No se puede verificar módulo: organización no identificada.');
    }

    const installation = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey: requiredModuleKey, status: 'INSTALLED' },
      select: { id: true },
    });

    if (!installation) {
      throw new ForbiddenException(
        `El módulo '${requiredModuleKey}' no está instalado en esta organización.`,
      );
    }

    return true;
  }
}
