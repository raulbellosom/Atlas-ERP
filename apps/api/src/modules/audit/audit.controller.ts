import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { AuditService } from './audit.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.query.dto';

@Controller('v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @RequireAllPermissions('audit:read')
  @Get('logs')
  findAll(@Query() query: ListAuditLogsQueryDto) {
    return this.auditService.findAll(query);
  }

  @RequireAllPermissions('audit:read')
  @Get('logs/:id')
  findOne(@Param('id') id: string) {
    return this.auditService.findOneById(id);
  }
}
