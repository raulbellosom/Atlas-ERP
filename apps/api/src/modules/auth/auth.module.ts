import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AuditModule } from '../audit/audit.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [SecurityModule, SessionsModule, UsersModule, AuditModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService],
  exports: [PasswordResetService],
})
export class AuthModule {}
