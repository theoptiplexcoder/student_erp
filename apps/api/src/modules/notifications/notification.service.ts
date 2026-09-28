import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyAdmins(
    institutionId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    try {
      // Find all admins in the institution
      const admins = await this.prisma.user.findMany({
        where: {
          institutionId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (admins.length === 0) return;

      // Create a notification for each admin
      await this.prisma.notification.createMany({
        data: admins.map((admin) => ({
          institutionId,
          userId: admin.id,
          title,
          message,
          type,
        })),
      });

      this.logger.log(`Sent admin notification: ${title} to ${admins.length} admins.`);
    } catch (error) {
      this.logger.error(`Failed to send admin notification: ${title}`, error);
    }
  }

  @OnEvent('fee.overdue')
  async handleFeeOverdue(payload: { institutionId: string; userId: string; amountDue: number }) {
    try {
      await this.prisma.notification.create({
        data: {
          institutionId: payload.institutionId,
          userId: payload.userId,
          title: 'Fee Payment Overdue',
          message: `You have overdue fee installments totaling ₹${payload.amountDue.toLocaleString()}. Please make payment to avoid service restrictions.`,
          type: 'FEE',
        },
      });
      this.logger.log(`Overdue notification sent to user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send overdue notification to user ${payload.userId}`, error);
    }
  }

  // --- Example event handlers to trigger admin notifications ---
  @OnEvent('timetable.conflict_detected')
  async handleTimetableConflict(payload: { institutionId: string; termId: string; count: number }) {
    await this.notifyAdmins(
      payload.institutionId,
      'Timetable Conflicts Detected',
      `Detected ${payload.count} conflict(s) in the active timetable. Please resolve them to publish the schedule.`,
      'TIMETABLE',
    );
  }

  @OnEvent('grievance.created')
  async handleGrievanceCreated(payload: {
    institutionId: string;
    grievanceId: string;
    category: string;
    studentName: string;
  }) {
    await this.notifyAdmins(
      payload.institutionId,
      'New Grievance Submitted',
      `${payload.studentName} has submitted a new grievance regarding ${payload.category}.`,
      'GRIEVANCE',
    );
  }

  @OnEvent('payment.success')
  async handleFeePayment(payment: any) {
    if (!payment || !payment.institutionId || !payment.student || !payment.student.user) return;
    const studentName = `${payment.student.user.firstName} ${payment.student.user.lastName}`;
    await this.notifyAdmins(
      payment.institutionId,
      'Fee Payment Received',
      `Payment of ₹${payment.amount.toLocaleString()} received from ${studentName}.`,
      'FEE',
    );
  }

  @OnEvent('certificate.request_created')
  async handleCertificateRequest(payload: {
    institutionId: string;
    requestId: string;
    type: string;
    studentName: string;
  }) {
    await this.notifyAdmins(
      payload.institutionId,
      'New Certificate Request',
      `${payload.studentName} requested a ${payload.type} certificate.`,
      'CERTIFICATE',
    );
  }
}
