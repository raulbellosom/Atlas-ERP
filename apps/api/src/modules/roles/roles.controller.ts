import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListRolesQueryDto } from './dto/list-roles.query.dto';
import { RolesService } from './roles.service';

@Controller('v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Query() query: ListRolesQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneById(id);
  }

  @Get(':id/permissions')
  findPermissions(@Param('id') id: string) {
    return this.rolesService.findPermissionsByRoleId(id);
  }
}
