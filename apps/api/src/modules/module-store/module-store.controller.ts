import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import {
  CurrentOrganizationId,
  RequireOrganizationScope,
} from '../../common/decorators/scope.decorator';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { InstallModuleDto } from './dto/install.dto';
import { UninstallModuleDto } from './dto/uninstall.dto';
import { UpgradeModuleDto } from './dto/upgrade.dto';
import { ModuleStoreService } from './module-store.service';

@Controller('v1/module-store')
export class ModuleStoreController {
  constructor(private readonly moduleStoreService: ModuleStoreService) {}

  @Public()
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('catalog')
  @RequireAllPermissions('module_store:read')
  getCatalog(@Query() query: CatalogQueryDto) {
    return this.moduleStoreService.getCatalog(query);
  }

  @Get('installed')
  @RequireOrganizationScope()
  @RequireAllPermissions('module_store:read')
  getInstalled(@CurrentOrganizationId() organizationId: string | undefined) {
    if (!organizationId) throw new NotFoundException('Organización requerida.');
    return this.moduleStoreService.getInstalled(organizationId);
  }

  @Post('install')
  @RequireOrganizationScope()
  @RequireAllPermissions('module_store:install')
  install(
    @Body() dto: InstallModuleDto,
    @CurrentOrganizationId() organizationId: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!organizationId) throw new NotFoundException('Organización requerida.');
    const actorUserId = req.user?.sub ?? 'system';
    return this.moduleStoreService.install({ ...dto, organizationId }, actorUserId);
  }

  @Post('uninstall')
  @RequireOrganizationScope()
  @RequireAllPermissions('module_store:uninstall')
  uninstall(
    @Body() dto: UninstallModuleDto,
    @CurrentOrganizationId() organizationId: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!organizationId) throw new NotFoundException('Organización requerida.');
    const actorUserId = req.user?.sub ?? 'system';
    return this.moduleStoreService.uninstall({ ...dto, organizationId }, actorUserId);
  }

  @Post('upgrade')
  @RequireOrganizationScope()
  @RequireAllPermissions('module_store:upgrade')
  upgrade(
    @Body() dto: UpgradeModuleDto,
    @CurrentOrganizationId() organizationId: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!organizationId) throw new NotFoundException('Organización requerida.');
    const actorUserId = req.user?.sub ?? 'system';
    return this.moduleStoreService.upgrade({ ...dto, organizationId }, actorUserId);
  }

  @Get('jobs/:jobId')
  @RequireOrganizationScope()
  @RequireAllPermissions('module_store:read')
  getJob(
    @Param('jobId') jobId: string,
    @CurrentOrganizationId() organizationId: string | undefined,
  ) {
    if (!organizationId) throw new NotFoundException('Organización requerida.');
    return this.moduleStoreService.getJob(jobId, organizationId);
  }
}
