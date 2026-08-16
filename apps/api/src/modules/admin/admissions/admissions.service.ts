import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateDirectAdmissionDto } from './dto/create-direct-admission.dto';
import {
  PaymentMode,
  FeePlanStatus,
  InstallmentStatus,
  StudentLifecycleStatus,
} from '@prisma/client';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(institutionId: string) {
    const [
      totalApplications,
      pendingReview,
      admittedStudents,
      feeOutstandingResult,
      availableSeats, // Can be calculated from Section capacity vs enrollment later
    ] = await Promise.all([
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: 'APPLICANT' },
      }),
      this.prisma.student.count({
        // Assuming profileCompletion or some internal flag marks it pending. For now just use APPLICANT.
        where: { institutionId, lifecycleStatus: 'APPLICANT' },
      }),
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: { in: ['ADMITTED', 'ENROLLED'] } },
      }),
      this.prisma.studentFeePlan.aggregate({
        where: { institutionId, status: { in: ['ACTIVE', 'OVERDUE'] } },
        _sum: { totalAmount: true },
      }),
      Promise.resolve(0),
    ]);

    // calculate paid amount via installments
    const paidResult = await this.prisma.feeInstallment.aggregate({
      where: { studentFeePlan: { institutionId } },
      _sum: { amountPaid: true },
    });

    const feeOutstanding =
      (feeOutstandingResult._sum.totalAmount || 0) - (paidResult._sum.amountPaid || 0);

    return {
      applications: totalApplications,
      pendingReview,
      readyForEnrollment: admittedStudents, // Simplify mapping
      admittedStudents,
      feeOutstanding,
      availableSeats,
    };
  }

  async getRecentAdmissions(institutionId: string) {
    return this.prisma.student.findMany({
      where: { institutionId, lifecycleStatus: { in: ['ADMITTED', 'ENROLLED'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        program: { select: { name: true } },
        feePlans: {
          select: {
            totalAmount: true,
            paymentMode: true,
            installments: { select: { amountPaid: true } },
          },
        },
      },
    });
  }

  async createDirectAdmission(
    institutionId: string,
    authUserId: string,
    data: CreateDirectAdmissionDto,
  ) {
    // Basic duplicate check
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { institutionId, email: data.email },
      });
      if (existingUser) {
        throw new BadRequestException('A user with this email already exists.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          institutionId,
          authUserId: data.email || `tmp_${Date.now()}`, // Usually auth system handles this. For direct, maybe they don't have auth yet, so generate a temporary authUserId if none
          email: data.email || `student_${Date.now()}@example.com`,
          firstName: data.firstName,
          lastName: data.lastName || '',
          phone: data.phone,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });

      // 2. Create Student
      const student = await tx.student.create({
        data: {
          institutionId,
          userId: user.id,
          lifecycleStatus: 'ENROLLED', // Direct admission directly enrolls
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          fatherName: data.fatherName,
          motherName: data.motherName,
          fatherPhone: data.fatherPhone,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          programId: data.programId,
          sectionId: data.sectionId,
        },
      });

      // 3. Create Enrollment
      await tx.enrollment.create({
        data: {
          institutionId,
          studentId: student.id,
          academicYearId: data.academicYearId,
          programId: data.programId,
          batchId: data.batchId,
          sectionId: data.sectionId,
          status: 'ACTIVE',
        },
      });

      // 4. Create Fee Plan & Installments if provided
      if (data.feePlan) {
        const feePlan = await tx.studentFeePlan.create({
          data: {
            institutionId,
            studentId: student.id,
            academicYearId: data.academicYearId,
            totalAmount: data.feePlan.totalAmount,
            currency: data.feePlan.currency || 'INR',
            paymentMode: data.feePlan.paymentMode,
            status: 'ACTIVE',
          },
        });

        if (data.feePlan.paymentMode === 'INSTALLMENTS') {
          // 4 equal installments
          const instAmount = data.feePlan.totalAmount / 4;
          const installments = [];
          for (let i = 1; i <= 4; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i * 2); // Example spacing
            installments.push({
              studentFeePlanId: feePlan.id,
              installmentNumber: i,
              amount: instAmount,
              amountPaid: 0,
              dueDate: dueDate,
              status: 'PENDING' as InstallmentStatus,
            });
          }
          await tx.feeInstallment.createMany({ data: installments });
        } else {
          // Annual - 1 installment
          await tx.feeInstallment.create({
            data: {
              studentFeePlanId: feePlan.id,
              installmentNumber: 1,
              amount: data.feePlan.totalAmount,
              amountPaid: 0,
              dueDate: new Date(),
              status: 'PENDING',
            },
          });
        }
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId,
          actorUserId: authUserId,
          action: 'DIRECT_ADMISSION_CREATED',
          entityType: 'STUDENT',
          entityId: student.id,
          afterData: JSON.parse(JSON.stringify(student)),
        },
      });

      return student;
    });
  }
}
