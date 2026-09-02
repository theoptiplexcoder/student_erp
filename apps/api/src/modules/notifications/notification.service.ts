import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('fee.overdue')
  async handleFeeOverdue(payload: { institutionId: string; userId: string; amountDue: number }) {
    try {
      await this.prisma.notification.create({
        data: {
          institutionId: payload.institutionId,
          userId: payload.userId,
          title: 'Fee Payment Overdue',
          message: `You have overdue fee installments totaling ₹${payload.amountDue.toLocaleString()}. Please make payment to avoid service restrictions.`,
          type: 'SYSTEM',
        },
      });
      this.logger.log(`Overdue notification sent to user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send overdue notification to user ${payload.userId}`, error);
    }
  }
}
