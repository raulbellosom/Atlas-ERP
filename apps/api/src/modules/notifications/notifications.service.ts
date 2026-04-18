import { Injectable } from '@nestjs/common';
import { NotificationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications.query.dto';

const NOTIFICATION_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  source: true,
  channel: true,
  status: true,
  type: true,
  title: true,
  body: true,
  payload: true,
  readAt: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.NotificationSelect;

type NotificationSummary = Prisma.NotificationGetPayload<{
  select: typeof NOTIFICATION_SELECT;
}>;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListNotificationsQueryDto,
  ): Promise<NotificationSummary[]> {
    return this.prisma.notification.findMany({
      where: {
        ...(query.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.source ? { source: query.source } : {}),
        ...(query.channel ? { channel: query.channel } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.includeArchived
          ? {}
          : { status: { not: NotificationStatus.ARCHIVED } }),
        deletedAt: null,
      },
      select: NOTIFICATION_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<NotificationSummary | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      select: NOTIFICATION_SELECT,
    });
  }

  async countUnread(userId: string, organizationId?: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        ...(organizationId ? { organizationId } : {}),
        status: NotificationStatus.UNREAD,
        deletedAt: null,
      },
    });
  }
}
