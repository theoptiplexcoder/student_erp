import { Controller, Get, Patch, Param, Request } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.prisma.notification.findMany({
      where: {
        institutionId,
        userId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/read')
  async markNotificationAsRead(@Param('id') id: string, @Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        institutionId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  @Patch('read-all')
  async markAllNotificationsAsRead(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.prisma.notification.updateMany({
      where: {
        userId,
        institutionId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
