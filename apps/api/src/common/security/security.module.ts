import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthorizationService } from './authorization.service';
import { JwtTokenService } from './jwt-token.service';
import { PasswordService } from './password.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { algorithm: 'HS256' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtTokenService, PasswordService, AuthorizationService],
  exports: [JwtTokenService, PasswordService, AuthorizationService],
})
export class SecurityModule {}
