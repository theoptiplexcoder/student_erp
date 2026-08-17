import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DemoService {
  constructor(private readonly prisma: PrismaService) {}

  async seedData(institutionId: string) {
    // 1. Get first student in the institution to attach data to
    const studentUser = await this.prisma.user.findFirst({
      where: {
        institutionId,
        role: 'STUDENT',
      },
    });

    if (!studentUser) {
      return { message: 'No student found to seed data for.' };
    }

    const student = await this.prisma.student.findUnique({
      where: { userId: studentUser.id },
    });

    if (!student) {
      return { message: 'Student record not found.' };
    }

    // 2. Create unread notifications
    await this.prisma.notification.create({
      data: {
        institutionId,
        userId: studentUser.id,
        title: 'Fee Reminder',
        message: 'Your tuition fee for the current semester is due next week.',
        type: 'GENERAL',
        isRead: false,
      },
    });

    await this.prisma.notification.create({
      data: {
        institutionId,
        userId: studentUser.id,
        title: 'Exam Schedule Published',
        message: 'The mid-term examination schedule has been published.',
        type: 'EXAM',
        isRead: false,
      },
    });

    // 3. Create read notifications
    await this.prisma.notification.create({
      data: {
        institutionId,
        userId: studentUser.id,
        title: 'Welcome to Student Portal',
        message: 'Explore your new dashboard and features.',
        type: 'GENERAL',
        isRead: true,
        readAt: new Date(),
      },
    });

    // 4. Create Certificate Requests
    await this.prisma.certificateRequest.create({
      data: {
        institutionId,
        studentId: student.id,
        certificateType: 'BONAFIDE',
        purpose: 'For opening a bank account',
        status: 'REQUESTED',
      },
    });

    await this.prisma.certificateRequest.create({
      data: {
        institutionId,
        studentId: student.id,
        certificateType: 'STUDY',
        purpose: 'For scholarship application',
        status: 'ISSUED',
        issuedAt: new Date(),
        documentUrl: 'https://example.com/cert.pdf',
      },
    });

    // 5. Create Grievances
    await this.prisma.grievance.create({
      data: {
        institutionId,
        studentId: student.id,
        category: 'HOSTEL',
        subject: 'WiFi in Hostel Block B is very slow',
        description: 'We have been experiencing slow internet speeds for the past week.',
        status: 'OPEN',
        isAnonymous: false,
      },
    });

    await this.prisma.grievance.create({
      data: {
        institutionId,
        studentId: student.id,
        category: 'LIBRARY',
        subject: 'Need more copies of Cloud Computing textbook',
        description: 'All copies are currently borrowed.',
        status: 'RESOLVED',
        isAnonymous: true,
      },
    });

    return { message: 'Seed data successfully created for student.', studentId: student.id };
  }
}
