import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { ListRolesQueryDto } from './dto/list-roles.query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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

  @RequireAllPermissions('auth:role:write')
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @RequireAllPermissions('auth:role:write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Get(':id/permissions')
  findPermissions(@Param('id') id: string) {
    return this.rolesService.findPermissionsByRoleId(id);
  }

  @RequireAllPermissions('auth:role:write')
  @Put(':id/permissions')
  setPermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.rolesService.setPermissions(id, body.permissionIds);
  }
}
