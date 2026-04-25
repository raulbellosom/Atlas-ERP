import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AuditModule } from '../audit/audit.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SessionsModule, AuditModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
