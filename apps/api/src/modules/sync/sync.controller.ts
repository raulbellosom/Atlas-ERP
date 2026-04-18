import { SourceType } from '@prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { ListConflictsQueryDto } from './dto/list-conflicts.query.dto';
import { ListSyncSessionsQueryDto } from './dto/list-sync-sessions.query.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';
import { resolveSyncConflictSource } from './sync-resolution-source';
import { SyncBatchRequestDto } from './dto/sync-batch-request.dto';
import { SyncService } from './sync.service';

@Controller('v1/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('sessions')
  findSessions(@Query() query: ListSyncSessionsQueryDto) {
    return this.syncService.findSessions(query);
  }

  @Get('sessions/:id')
  findSessionById(@Param('id') id: string) {
    return this.syncService.findSessionById(id);
  }

  @Get('conflicts/open')
  findOpenConflicts(@Query('organizationId') organizationId?: string) {
    return this.syncService.findOpenConflicts(organizationId);
  }

  /**
   * GET /v1/sync/conflicts
   * T-1028: Lista todos los conflictos con paginación y filtros.
   */
  @Get('conflicts')
  findConflicts(@Query() query: ListConflictsQueryDto) {
    return this.syncService.findConflicts(query);
  }

  /**
   * GET /v1/sync/conflicts/:id
   * T-1028: Retorna un conflicto con payloads completos (para diff en UI).
   */
  @Get('conflicts/:id')
  async findConflictById(@Param('id') id: string) {
    const conflict = await this.syncService.findConflictById(id);
    if (!conflict) throw new NotFoundException('Conflicto no encontrado.');
    return conflict;
  }

  @Patch('conflicts/:id/resolve')
  resolveConflict(
    @Param('id') id: string,
    @Body() dto: ResolveConflictDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const source =
      resolveSyncConflictSource(
        req.headers as unknown as Record<string, string | string[] | undefined>,
      ) ?? SourceType.WEB;

    return this.syncService.resolveConflict(id, {
      action: dto.action,
      reason: dto.reason,
      resolvedById: req.user?.sub ?? '',
      organizationId: req.user?.organizationId ?? '',
      source,
    });
  }

  @Get('summary')
  getSummary(@Query('organizationId') organizationId?: string) {
    return this.syncService.getSummary(organizationId);
  }

  /**
   * POST /v1/sync/batch
   * Recibe un batch de items de un cliente desktop y los persiste.
   * Crea una SyncSession, valida cada item y retorna resultados por item.
   */
  @Post('batch')
  processBatch(
    @Body() dto: SyncBatchRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.syncService.processBatch({
      dto,
      organizationId: req.user?.organizationId ?? '',
      actorId: req.user?.sub ?? '',
    });
  }
}
