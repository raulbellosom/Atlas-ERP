import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListNotificationsQueryDto } from './dto/list-notifications.query.dto';
import { NotificationsService } from './notifications.service';

@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() query: ListNotificationsQueryDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('user/:userId/unread-count')
  countUnread(
    @Param('userId') userId: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.notificationsService.countUnread(userId, organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOneById(id);
  }
}
