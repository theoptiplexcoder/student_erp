import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
    try {
      const [totalApplications, pendingReview, admittedStudents, feeOutstandingResult] =
        await Promise.all([
          this.prisma.student.count({
            where: { institutionId, lifecycleStatus: 'APPLICANT' },
          }),
          this.prisma.student.count({
            where: { institutionId, lifecycleStatus: 'APPLICANT' },
          }),
          this.prisma.student.count({
            where: { institutionId, lifecycleStatus: { in: ['ADMITTED', 'ENROLLED'] } },
          }),
          this.prisma.studentFeePlan.aggregate({
            where: { institutionId, status: { in: ['ACTIVE', 'OVERDUE'] } },
            _sum: { totalAmount: true },
          }),
        ]);

      const paidResult = await this.prisma.feeInstallment.aggregate({
        where: { studentFeePlan: { institutionId } },
        _sum: { amountPaid: true },
      });

      const feeOutstanding =
        (feeOutstandingResult._sum.totalAmount || 0) - (paidResult._sum.amountPaid || 0);

      return {
        applications: totalApplications,
        pendingReview,
        readyForEnrollment: admittedStudents,
        admittedStudents,
        feeOutstanding,
        availableSeats: 0,
      };
    } catch (error) {
      console.error('Error fetching admissions stats:', error);
      return {
        applications: 0,
        pendingReview: 0,
        readyForEnrollment: 0,
        admittedStudents: 0,
        feeOutstanding: 0,
        availableSeats: 0,
      };
    }
  }

  async getRecentAdmissions(institutionId: string) {
    try {
      return await this.prisma.student.findMany({
        where: { institutionId, lifecycleStatus: { in: ['ADMITTED', 'ENROLLED'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
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
    } catch (error) {
      console.error('Error fetching recent admissions:', error);
      return [];
    }
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
          authUserId: randomUUID(),
          email: data.email || `student_${Date.now()}@example.com`,
          firstName: data.firstName,
          lastName: data.lastName || '',
          phone: data.phone,
          photoUrl: data.photoUrl,
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
          bio: data.about,
          fatherName: data.fatherName,
          motherName: data.motherName,
          fatherPhone: data.fatherPhone,
          motherPhone: data.motherPhone,
          fatherEmail: data.fatherEmail,
          motherEmail: data.motherEmail,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          rollNumber: data.usn,
          admissionNumber: data.usn, // Might act as both or need specific generator
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          programId: data.programId,
          sectionId: data.sectionId,
        },
      });

      // 2a. Create Skills
      if (data.skills && data.skills.length > 0) {
        await tx.studentSkill.createMany({
          data: data.skills.map((skill) => ({
            institutionId,
            studentId: student.id,
            name: skill,
            level: 'BEGINNER', // Default enum
          })),
        });
      }

      // 2b. Create Accomplishments
      if (data.accomplishments && data.accomplishments.length > 0) {
        // We map PROJECTS to StudentProject, and others to StudentAchievement
        for (const acc of data.accomplishments) {
          if (acc.type === 'PROJECT') {
            await tx.studentProject.create({
              data: {
                institutionId,
                studentId: student.id,
                title: acc.title,
                description: acc.description,
              },
            });
          } else {
            // WORKSHOP, CERTIFICATE, PUBLICATION, PATENT map to StudentAchievement
            await tx.studentAchievement.create({
              data: {
                institutionId,
                studentId: student.id,
                title: acc.title,
                description: acc.description,
                issuer: acc.issuer,
                achievementDate: new Date(),
              },
            });
          }
        }
      }

      // 2c. Create Documents
      if (data.documents && data.documents.length > 0) {
        await tx.studentDocument.createMany({
          data: data.documents.map((doc) => ({
            institutionId,
            studentId: student.id,
            documentType: 'OTHER', // Default or parse
            title: doc.fileName,
            fileUrl: doc.fileUrl,
            verificationStatus: 'PENDING',
          })),
        });
      }

      // 2d. Create Previous Education
      if (data.previousEducation && data.previousEducation.length > 0) {
        await tx.studentPreviousEducation.createMany({
          data: data.previousEducation.map((edu) => ({
            institutionId,
            studentId: student.id,
            institutionName: edu.institutionName,
            academicYear: edu.academicYear,
          })),
        });
      }

      // 3. Create Enrollment
      await tx.enrollment.create({
        data: {
          institutionId,
          studentId: student.id,
          academicYearId: data.academicYearId,
          programId: data.programId,
          courseId: data.courseId,
          batchId: data.batchId,
          sectionId: data.sectionId,
          rollNumber: data.usn,
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

        if (
          data.feePlan.paymentMode === 'INSTALLMENTS' &&
          data.feePlan.installments &&
          data.feePlan.installments.length > 0
        ) {
          const installments = data.feePlan.installments.map((inst, idx) => ({
            studentFeePlanId: feePlan.id,
            installmentNumber: idx + 1,
            amount: inst.amount,
            amountPaid: 0,
            dueDate: inst.dueDate ? new Date(inst.dueDate) : new Date(),
            status: 'PENDING' as InstallmentStatus,
          }));
          await tx.feeInstallment.createMany({ data: installments });
        } else if (data.feePlan.paymentMode === 'INSTALLMENTS') {
          // Fallback to equal installments based on count
          const count = data.feePlan.installmentsCount || 4;
          const instAmount = data.feePlan.totalAmount / count;
          const installments = [];
          for (let i = 1; i <= count; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i * 2);
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
