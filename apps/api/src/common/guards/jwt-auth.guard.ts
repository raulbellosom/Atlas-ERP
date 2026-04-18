import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtTokenService, type JwtPayload } from '../security/jwt-token.service';
import { PUBLIC_ROUTE_KEY } from '../constants/auth.constants';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  authToken?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers['authorization'];

    if (!authorization || Array.isArray(authorization)) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Formato de autorización inválido. Usa Bearer <token>',
      );
    }

    try {
      const payload = this.jwtTokenService.verifyAccessToken(token);
      request.user = payload;
      request.authToken = token;
    } catch {
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }

    return true;
  }
}
