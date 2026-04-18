import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListBranchesQueryDto } from './dto/list-branches.query.dto';
import { BranchesService } from './branches.service';

@Controller('v1/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll(@Query() query: ListBranchesQueryDto) {
    return this.branchesService.findAll(query);
  }

  @Get('organization/:organizationId/active-count')
  countActiveByOrganization(@Param('organizationId') organizationId: string) {
    return this.branchesService.countActiveByOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOneById(id);
  }
}
