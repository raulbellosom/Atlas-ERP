import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { InviteUserDto } from './dto/invite-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserInvitationsService } from './user-invitations.service';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userInvitationsService: UserInvitationsService,
  ) {}

  @Get()
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.findOneById(req.user!.sub);
  }

  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateOwnProfile(req.user!.sub, dto);
  }

  @Get('organization/:organizationId/active-count')
  countActiveByOrganization(@Param('organizationId') organizationId: string) {
    return this.usersService.countActiveByOrganization(organizationId);
  }

  @RequireAllPermissions('auth:user:read')
  @Get('invitations')
  findInvitations(@Query('organizationId') organizationId: string) {
    return this.userInvitationsService.listInvitations(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @RequireAllPermissions('auth:user:write')
  @Post('invite')
  invite(@Body() dto: InviteUserDto, @Req() req: AuthenticatedRequest) {
    return this.userInvitationsService.createInvitation(dto, req.user?.sub);
  }

  @RequireAllPermissions('auth:user:write')
  @Post('invite/:id/resend')
  resendInvitation(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.userInvitationsService.resendInvitation(id, req.user?.sub);
  }

  @RequireAllPermissions('auth:user:write')
  @Post('invite/:id/revoke')
  revokeInvitation(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.userInvitationsService.revokeInvitation(id, req.user?.sub);
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
