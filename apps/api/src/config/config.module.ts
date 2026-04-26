import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { validateEnv } from './env.validation';
import { resolveRootEnvPath } from './root-env-path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: resolveRootEnvPath(),
      load: [appConfig],
      validate: validateEnv,
    }),
  ],
})
export class ApiConfigModule {}
