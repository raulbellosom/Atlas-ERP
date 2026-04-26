import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { OutboundEmailService } from './outbound-email.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, OutboundEmailService],
  exports: [NotificationsService, OutboundEmailService],
})
export class NotificationsModule {}
