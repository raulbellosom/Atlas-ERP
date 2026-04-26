import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { TaskEventsSubscriberService } from './tasks/task-events-subscriber.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [TaskEventsSubscriberService],
})
export class AppModule {}
