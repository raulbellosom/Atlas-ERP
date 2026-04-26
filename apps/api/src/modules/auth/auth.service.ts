import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCode } from '../../common/errors';
import { AuthorizationService } from '../../common/security/authorization.service';
import { JwtTokenService, type JwtPayload } from '../../common/security/jwt-token.service';
import { PasswordService } from '../../common/security/password.service';
import { AuditService } from '../audit/audit.service';
import { SessionsService } from '../sessions/sessions.service';
import { UserInvitationsService } from '../users/user-invitations.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

export interface AuthStatusResponse {
  module: 'auth';
  status: 'operational';
  authStrategy: 'jwt-hs256';
  sessionManagement: 'active';
  details: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserProfile;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  displayName: string;
  organizationId: string;
  branchId: string | null;
  role: string | null;
  roleIds: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly authorizationService: AuthorizationService,
    private readonly userInvitationsService: UserInvitationsService,
  ) {}

  getStatus(): AuthStatusResponse {
    return {
      module: 'auth',
      status: 'operational',
      authStrategy: 'jwt-hs256',
      sessionManagement: 'active',
      details:
        'Autenticación JWT HS256 operativa. Access token 15 min, refresh token 7 días con rotación.',
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const user = await this.usersService.findForAuth(dto.organizationId, dto.email);

    if (!user) {
      if (!dto.organizationId) {
        const candidates = await this.usersService.countActiveAuthCandidatesByEmail(dto.email);
        if (candidates > 1) {
          throw new BadRequestException({
            statusCode: 400,
            code: ErrorCode.SETUP_MULTI_TENANT_LOGIN_REQUIRED,
            message: 'Se requiere organizationId para este usuario en entorno multi-organización.',
            error: 'Bad Request',
          });
        }
      }

      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Credenciales inválidas.',
        error: 'Unauthorized',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Usuario inactivo.',
        error: 'Unauthorized',
      });
    }

    if (user.isLocked) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Cuenta bloqueada. Contacta al administrador.',
        error: 'Unauthorized',
      });
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Credenciales inválidas.',
        error: 'Unauthorized',
      });
    }

    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Credenciales inválidas.',
        error: 'Unauthorized',
      });
    }

    const expiresIn = this.jwtTokenService.getAccessTokenTtlSeconds();
    const refreshTtl = this.jwtTokenService.getRefreshTokenTtlSeconds();
    const now = new Date();

    const session = await this.sessionsService.createSession({
      organizationId: user.organizationId,
      userId: user.id,
      ipAddress,
      userAgent,
      expiresAt: new Date(now.getTime() + refreshTtl * 1000),
    });

    const rawRefreshToken = this.jwtTokenService.generateRefreshTokenRaw();
    const refreshTokenHash = this.jwtTokenService.hashRefreshToken(rawRefreshToken);

    await this.sessionsService.createRefreshToken({
      sessionId: session.id,
      organizationId: user.organizationId,
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(now.getTime() + refreshTtl * 1000),
    });

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: user.id,
      organizationId: user.organizationId,
      branchId: user.branchId,
    });

    await this.usersService.touchLastLogin(user.id);

    await this.auditService.auditAction({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: { sessionId: session.id, ipAddress, userAgent },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn,
      user: await this.buildAuthUserProfile({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        organizationId: user.organizationId,
        branchId: user.branchId,
      }),
    };
  }

  async logout(dto: LogoutDto, requestUser?: JwtPayload): Promise<{ message: string }> {
    if (!requestUser) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Contexto de usuario requerido para logout.',
        error: 'Unauthorized',
      });
    }

    if (dto.allSessions === 'true') {
      await this.sessionsService.revokeAllUserSessions(requestUser.sub, requestUser.organizationId);
      await this.auditService.auditAction({
        organizationId: requestUser.organizationId,
        actorId: requestUser.sub,
        action: 'USER_LOGOUT',
        entityType: 'Session',
        entityId: 'ALL',
        origin: 'WEB',
        result: 'SUCCESS',
        metadata: { scope: 'all_sessions' },
      });
      return { message: 'Todas las sesiones han sido cerradas.' };
    }

    if (dto.sessionId) {
      await this.sessionsService.revokeSession(dto.sessionId);
      await this.auditService.auditAction({
        organizationId: requestUser.organizationId,
        actorId: requestUser.sub,
        action: 'USER_LOGOUT',
        entityType: 'Session',
        entityId: dto.sessionId,
        origin: 'WEB',
        result: 'SUCCESS',
        metadata: { scope: 'single_session' },
      });
      return { message: 'Sesión cerrada correctamente.' };
    }

    return { message: 'Sin sesión específica indicada. Usa sessionId o allSessions=true.' };
  }

  async refresh(dto: RefreshTokenDto): Promise<RefreshResponse> {
    const tokenHash = this.jwtTokenService.hashRefreshToken(dto.refreshToken);
    const existingToken = await this.sessionsService.findValidRefreshToken(tokenHash);

    if (!existingToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Refresh token inválido o expirado.',
        error: 'Unauthorized',
      });
    }

    const userById = await this.usersService.findOneById(existingToken.userId);
    if (!userById || !userById.isActive) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Usuario inactivo o no encontrado.',
        error: 'Unauthorized',
      });
    }

    const now = new Date();
    const refreshTtl = this.jwtTokenService.getRefreshTokenTtlSeconds();
    const newRawToken = this.jwtTokenService.generateRefreshTokenRaw();
    const newTokenHash = this.jwtTokenService.hashRefreshToken(newRawToken);

    await this.sessionsService.rotateRefreshToken(tokenHash, {
      sessionId: existingToken.sessionId,
      organizationId: existingToken.organizationId,
      userId: existingToken.userId,
      tokenHash: newTokenHash,
      expiresAt: new Date(now.getTime() + refreshTtl * 1000),
    });

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: userById.id,
      organizationId: userById.organizationId,
      branchId: userById.branchId,
    });

    return {
      accessToken,
      refreshToken: newRawToken,
      expiresIn: this.jwtTokenService.getAccessTokenTtlSeconds(),
    };
  }

  async getProfile(requestUser?: JwtPayload): Promise<AuthUserProfile> {
    if (!requestUser) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Contexto de usuario autenticado requerido.',
        error: 'Unauthorized',
      });
    }

    const user = await this.usersService.findOneById(requestUser.sub);

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario autenticado no encontrado.',
        error: 'Not Found',
      });
    }

    return {
      ...(await this.buildAuthUserProfile({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        organizationId: user.organizationId,
        branchId: user.branchId,
      })),
    };
  }

  async validateInvitation(token: string) {
    return this.userInvitationsService.validateInvitation(token);
  }

  async acceptInvitation(token: string, password: string) {
    return this.userInvitationsService.acceptInvitation(token, password);
  }

  private async buildAuthUserProfile(base: {
    id: string;
    email: string;
    displayName: string;
    organizationId: string;
    branchId: string | null;
  }): Promise<AuthUserProfile> {
    const accessContext = await this.authorizationService.resolveAccessContext(base.id);

    return {
      ...base,
      role: accessContext.role,
      roleIds: accessContext.roleIds,
      permissions: accessContext.permissions,
    };
  }
}
