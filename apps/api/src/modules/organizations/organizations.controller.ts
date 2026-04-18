import { Controller, Get, Param, Query } from '@nestjs/common';
import { BranchesService } from '../branches/branches.service';
import { ListBranchesQueryDto } from '../branches/dto/list-branches.query.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.query.dto';
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

  @Get(':id/branches')
  findBranches(
    @Param('id') id: string,
    @Query() query: ListBranchesQueryDto,
  ) {
    return this.branchesService.findAll({ ...query, organizationId: id });
  }
}
