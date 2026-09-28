import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { FacultyNotificationsController } from './faculty-notifications.controller';

@Module({
  controllers: [
    NotificationsController,
    AdminNotificationsController,
    FacultyNotificationsController,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
