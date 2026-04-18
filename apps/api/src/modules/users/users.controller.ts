import { Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('organization/:organizationId/active-count')
  countActiveByOrganization(@Param('organizationId') organizationId: string) {
    return this.usersService.countActiveByOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @RequireAllPermissions('auth:user:write')
  @Post(':id/lock')
  lockUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const organizationId = req.user?.organizationId ?? '';
    const actorId = req.user?.sub;
    return this.usersService.lockUser(id, organizationId, actorId);
  }

  @RequireAllPermissions('auth:user:write')
  @Post(':id/unlock')
  unlockUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const actorId = req.user?.sub;
    return this.usersService.unlockUser(id, actorId);
  }

  @RequireAllPermissions('auth:user:write')
  @Post(':id/activate')
  activateUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const actorId = req.user?.sub;
    return this.usersService.activateUser(id, actorId);
  }

  @RequireAllPermissions('auth:user:write')
  @Delete(':id/deactivate')
  deactivateUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const organizationId = req.user?.organizationId ?? '';
    const actorId = req.user?.sub;
    return this.usersService.deactivateUser(id, organizationId, actorId);
  }
}
