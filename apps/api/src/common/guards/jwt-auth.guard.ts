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
    if (process.env.DISABLE_AUTH_GUARDS === 'true') {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      request.user = request.user ?? {
        sub: 'integration-test-user',
        organizationId: 'integration-test-org',
        branchId: null,
      };
      request.authToken = 'integration-test-bypass';
      return true;
    }

    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers['authorization'];
    const queryToken =
      typeof request.query?.['access_token'] === 'string'
        ? request.query['access_token']
        : undefined;

    let token: string | undefined;
    if (authorization && !Array.isArray(authorization)) {
      const [scheme, authToken] = authorization.split(' ');
      if (scheme !== 'Bearer' || !authToken) {
        throw new UnauthorizedException(
          'Formato de autorizacion invalido. Usa Bearer <token>',
        );
      }
      token = authToken;
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      const payload = this.jwtTokenService.verifyAccessToken(token);
      request.user = payload;
      request.authToken = token;
    } catch {
      throw new UnauthorizedException('Token de acceso invalido o expirado');
    }

    return true;
  }
}
