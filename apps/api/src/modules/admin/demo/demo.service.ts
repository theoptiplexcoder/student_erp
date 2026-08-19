import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  StudentLifecycleStatus,
  PaymentMode,
  FeePlanStatus,
  InstallmentStatus,
} from '@prisma/client';

@Injectable()
export class DemoService {
  constructor(private readonly prisma: PrismaService) {}

  async seedAdmissionsData(institutionId: string) {
    const existingAdmissions = await this.prisma.student.count({
      where: { institutionId, lifecycleStatus: { in: ['ADMITTED', 'ENROLLED'] } },
    });

    if (existingAdmissions > 0) {
      return { message: 'Mock admissions data already exists.', count: existingAdmissions };
    }

    const program = await this.prisma.program.findFirst({ where: { institutionId } });
    if (!program) {
      return { message: 'No program found. Create a program first.' };
    }

    const academicYear = await this.prisma.academicYear.findFirst({
      where: { institutionId, isActive: true },
    });
    if (!academicYear) {
      return { message: 'No active academic year found. Create one first.' };
    }

    const mockStudents = [
      {
        firstName: 'Aarav',
        lastName: 'Patel',
        email: 'aarav.patel@demo.test',
        status: 'ENROLLED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026001',
        feeAmount: 125000,
        paymentMode: 'ANNUAL' as PaymentMode,
      },
      {
        firstName: 'Diya',
        lastName: 'Sharma',
        email: 'diya.sharma@demo.test',
        status: 'ENROLLED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026002',
        feeAmount: 125000,
        paymentMode: 'INSTALLMENTS' as PaymentMode,
      },
      {
        firstName: 'Rohan',
        lastName: 'Gupta',
        email: 'rohan.gupta@demo.test',
        status: 'ADMITTED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026003',
        feeAmount: 110000,
        paymentMode: 'ANNUAL' as PaymentMode,
      },
      {
        firstName: 'Ananya',
        lastName: 'Reddy',
        email: 'ananya.reddy@demo.test',
        status: 'ENROLLED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026004',
        feeAmount: 130000,
        paymentMode: 'INSTALLMENTS' as PaymentMode,
      },
      {
        firstName: 'Kiran',
        lastName: 'Desai',
        email: 'kiran.desai@demo.test',
        status: 'ADMITTED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026005',
        feeAmount: 115000,
        paymentMode: 'ANNUAL' as PaymentMode,
      },
      {
        firstName: 'Priya',
        lastName: 'Nair',
        email: 'priya.nair@demo.test',
        status: 'ENROLLED' as StudentLifecycleStatus,
        admissionNumber: 'ADM2026006',
        feeAmount: 120000,
        paymentMode: 'INSTALLMENTS' as PaymentMode,
      },
    ];

    const created = [];

    for (const mock of mockStudents) {
      const user = await this.prisma.user.create({
        data: {
          institutionId,
          authUserId: `mock_${mock.email}`,
          email: mock.email,
          firstName: mock.firstName,
          lastName: mock.lastName,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });

      const student = await this.prisma.student.create({
        data: {
          institutionId,
          userId: user.id,
          lifecycleStatus: mock.status,
          admissionNumber: mock.admissionNumber,
          admissionDate: new Date(),
          programId: program.id,
        },
      });

      const feePlan = await this.prisma.studentFeePlan.create({
        data: {
          institutionId,
          studentId: student.id,
          academicYearId: academicYear.id,
          totalAmount: mock.feeAmount,
          paymentMode: mock.paymentMode,
          status: 'ACTIVE',
        },
      });

      if (mock.paymentMode === 'INSTALLMENTS') {
        const installmentAmount = mock.feeAmount / 4;
        await this.prisma.feeInstallment.createMany({
          data: Array.from({ length: 4 }, (_, i) => ({
            studentFeePlanId: feePlan.id,
            installmentNumber: i + 1,
            amount: installmentAmount,
            amountPaid: i === 0 ? installmentAmount : 0,
            dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
            status: i === 0 ? ('PAID' as InstallmentStatus) : ('PENDING' as InstallmentStatus),
          })),
        });
      } else {
        await this.prisma.feeInstallment.create({
          data: {
            studentFeePlanId: feePlan.id,
            installmentNumber: 1,
            amount: mock.feeAmount,
            amountPaid: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
          },
        });
      }

      created.push({
        studentId: student.id,
        name: `${mock.firstName} ${mock.lastName}`,
        status: mock.status,
      });
    }

    return { message: 'Mock admissions data seeded successfully.', students: created };
  }

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
