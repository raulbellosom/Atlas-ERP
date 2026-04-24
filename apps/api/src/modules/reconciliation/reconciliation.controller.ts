import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CloseReconciliationSessionDto } from './dto/close-reconciliation-session.dto';
import { ListReconciliationItemsQueryDto } from './dto/list-reconciliation-items.query.dto';
import { ListReconciliationSessionsQueryDto } from './dto/list-reconciliation-sessions.query.dto';
import { ReconcileSessionDto } from './dto/reconcile-session.dto';
import { ReconciliationService } from './reconciliation.service';
import { RequireModuleInstalled } from '../../common/decorators/module-install.decorator';

@RequireModuleInstalled('financial-operations')
@Controller('v1/reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @RequireAllPermissions('finops:reconciliation:read')
  @Get('sessions')
  findSessions(@Query() query: ListReconciliationSessionsQueryDto) {
    return this.reconciliationService.findSessions(query);
  }

  @RequireAllPermissions('finops:reconciliation:read')
  @Get('sessions/:id')
  findSessionById(@Param('id') id: string) {
    return this.reconciliationService.findSessionById(id);
  }

  @RequireAllPermissions('finops:reconciliation:read')
  @Get('sessions/:id/items')
  findSessionItems(
    @Param('id') sessionId: string,
    @Query() query: ListReconciliationItemsQueryDto,
  ) {
    return this.reconciliationService.findSessionItems(sessionId, query);
  }

  @RequireAllPermissions('finops:reconciliation:write')
  @Post('sessions/:id/reconcile')
  async reconcileSession(@Param('id') sessionId: string, @Body() dto: ReconcileSessionDto) {
    const result = await this.reconciliationService.reconcileSession(sessionId, dto);
    if (!result) {
      throw new NotFoundException('Sesión de conciliación no encontrada.');
    }
    return result;
  }

  @RequireAllPermissions('finops:reconciliation:write')
  @Post('sessions/:id/close')
  async closeSession(@Param('id') sessionId: string, @Body() dto: CloseReconciliationSessionDto) {
    const result = await this.reconciliationService.closeSession(sessionId, dto);
    if (!result) {
      throw new NotFoundException('Sesión de conciliación no encontrada.');
    }
    return result;
  }

  @RequireAllPermissions('finops:reconciliation:write')
  @Post('sessions/:id/approve')
  async approveSession(@Param('id') sessionId: string, @Body() dto: CloseReconciliationSessionDto) {
    const result = await this.reconciliationService.closeSession(sessionId, {
      ...dto,
      force: true,
    });
    if (!result) {
      throw new NotFoundException('Sesión de conciliación no encontrada.');
    }
    return result;
  }
}
