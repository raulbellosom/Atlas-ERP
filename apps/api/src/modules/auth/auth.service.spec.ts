import { UnauthorizedException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthorizationService } from '../../common/security/authorization.service';
import { JwtTokenService } from '../../common/security/jwt-token.service';
import { PasswordService } from '../../common/security/password.service';
import { AuditService } from '../audit/audit.service';
import { SessionsService } from '../sessions/sessions.service';
import { UserInvitationsService } from '../users/user-invitations.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findForAuth: jest.fn(),
    countActiveAuthCandidatesByEmail: jest.fn(),
    touchLastLogin: jest.fn(),
    findOneById: jest.fn(),
  };

  const sessionsServiceMock = {
    createSession: jest.fn(),
    createRefreshToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    findValidRefreshToken: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    revokeSession: jest.fn(),
  };

  const jwtTokenServiceMock = {
    getAccessTokenTtlSeconds: jest.fn(),
    getRefreshTokenTtlSeconds: jest.fn(),
    generateRefreshTokenRaw: jest.fn(),
    hashRefreshToken: jest.fn(),
    signAccessToken: jest.fn(),
  };

  const passwordServiceMock = {
    verify: jest.fn(),
  };

  const auditServiceMock = {
    auditAction: jest.fn(),
  };

  const authorizationServiceMock = {
    resolveAccessContext: jest.fn(),
  };

  const userInvitationsServiceMock = {
    validateInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SessionsService, useValue: sessionsServiceMock },
        { provide: JwtTokenService, useValue: jwtTokenServiceMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: AuthorizationService, useValue: authorizationServiceMock },
        { provide: UserInvitationsService, useValue: userInvitationsServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login returns user payload with role, roleIds and permissions', async () => {
    usersServiceMock.findForAuth.mockResolvedValue({
      id: 'user-1',
      organizationId: 'org-1',
      branchId: null,
      email: 'owner@example.com',
      displayName: 'Owner',
      passwordHash: 'hash',
      isActive: true,
      isLocked: false,
    });
    passwordServiceMock.verify.mockResolvedValue(true);
    sessionsServiceMock.createSession.mockResolvedValue({ id: 'session-1' });
    jwtTokenServiceMock.getAccessTokenTtlSeconds.mockReturnValue(900);
    jwtTokenServiceMock.getRefreshTokenTtlSeconds.mockReturnValue(604_800);
    jwtTokenServiceMock.generateRefreshTokenRaw.mockReturnValue('refresh-raw');
    jwtTokenServiceMock.hashRefreshToken.mockReturnValue('refresh-hash');
    jwtTokenServiceMock.signAccessToken.mockReturnValue('access-token');
    authorizationServiceMock.resolveAccessContext.mockResolvedValue({
      role: 'owner',
      roleIds: ['role-owner'],
      roles: ['owner'],
      permissions: ['tasks:catalog:read', 'finops:bank_account:write'],
    });

    const result = await service.login({
      email: 'owner@example.com',
      password: 'secret123',
      organizationId: 'org-1',
    });

    expect(result.user).toMatchObject({
      id: 'user-1',
      role: 'owner',
      roleIds: ['role-owner'],
      permissions: ['tasks:catalog:read', 'finops:bank_account:write'],
    });
    expect(authorizationServiceMock.resolveAccessContext).toHaveBeenCalledWith('user-1');
  });

  it('getProfile includes role metadata and permissions', async () => {
    usersServiceMock.findOneById.mockResolvedValue({
      id: 'user-2',
      organizationId: 'org-1',
      branchId: 'branch-1',
      email: 'admin@example.com',
      displayName: 'Admin',
      isActive: true,
      isLocked: false,
    });
    authorizationServiceMock.resolveAccessContext.mockResolvedValue({
      role: 'admin',
      roleIds: ['role-admin'],
      roles: ['admin'],
      permissions: ['tasks:catalog:read', 'tasks:catalog:write'],
    });

    const result = await service.getProfile({
      sub: 'user-2',
      organizationId: 'org-1',
      branchId: 'branch-1',
    });

    expect(result.role).toBe('admin');
    expect(result.roleIds).toEqual(['role-admin']);
    expect(result.permissions).toEqual(['tasks:catalog:read', 'tasks:catalog:write']);
  });

  it('login throws unauthorized when password is invalid', async () => {
    usersServiceMock.findForAuth.mockResolvedValue({
      id: 'user-3',
      organizationId: 'org-1',
      branchId: null,
      email: 'user@example.com',
      displayName: 'User',
      passwordHash: 'hash',
      isActive: true,
      isLocked: false,
    });
    passwordServiceMock.verify.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'invalid',
        organizationId: 'org-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
