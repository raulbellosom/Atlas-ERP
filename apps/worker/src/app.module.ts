import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { resolveRootEnvPath } from './config/root-env-path';
import { PrismaService } from './infrastructure/prisma.service';
import { OutboundEmailWorkerService } from './tasks/outbound-email-worker.service';
import { TaskEventsSubscriberService } from './tasks/task-events-subscriber.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveRootEnvPath(),
      validate: validateEnv,
    }),
  ],
  providers: [PrismaService, TaskEventsSubscriberService, OutboundEmailWorkerService],
})
export class AppModule {}
