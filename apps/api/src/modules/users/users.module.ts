import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersController } from './users.controller';
import { UserInvitationsService } from './user-invitations.service';
import { UsersService } from './users.service';

@Module({
  imports: [SessionsModule, AuditModule, SecurityModule, NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, UserInvitationsService],
  exports: [UsersService, UserInvitationsService],
})
export class UsersModule {}
