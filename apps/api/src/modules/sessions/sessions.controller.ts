import { Controller, Delete, Get, Param, Req } from '@nestjs/common';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';

@Controller('v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async listActiveSessions(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      return [];
    }
    const sessions = await this.sessionsService.findSessionsByUser(
      req.user.sub,
      req.user.organizationId,
    );
    return sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      status: s.status,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }));
  }

  @Delete(':id')
  async revokeSession(
    @Param('id') sessionId: string,
    @Req() _req: AuthenticatedRequest,
  ) {
    await this.sessionsService.revokeSession(sessionId);
    return { message: 'Sesión revocada correctamente.' };
  }
}
