import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { BranchesService } from '../branches/branches.service';
import { ListBranchesQueryDto } from '../branches/dto/list-branches.query.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.query.dto';
import { PurgeOrganizationDto } from './dto/purge-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('v1/organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly branchesService: BranchesService,
  ) {}

  @Get()
  findAll(@Query() query: ListOrganizationsQueryDto) {
    return this.organizationsService.findAll(query);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findOneBySlug(slug);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.organizationsService.findOneById(id);
  }

  @RequireAllPermissions('core:organization:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @RequireAllPermissions('core:organization:update')
  @Delete(':id/purge')
  @HttpCode(HttpStatus.NO_CONTENT)
  async purge(
    @Param('id') id: string,
    @Body() dto: PurgeOrganizationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.organizationsService.purge(id, req.user!.sub, dto.password);
  }

  @Get(':id/branches')
  findBranches(@Param('id') id: string, @Query() query: ListBranchesQueryDto) {
    return this.branchesService.findAll({ ...query, organizationId: id });
  }
}
