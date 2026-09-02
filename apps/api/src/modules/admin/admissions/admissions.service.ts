import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateDirectAdmissionDto } from './dto/create-direct-admission.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  PaymentMode,
  FeePlanStatus,
  InstallmentStatus,
  StudentLifecycleStatus,
} from '@prisma/client';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentAdmittedEvent } from './events/student-admitted.event';

@Injectable()
export class AdmissionsService {
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    );
  }

  @OnEvent('payment.success')
  async handlePaymentSuccess(payment: any) {
    if (!payment || !payment.studentId) return;

    const student = await this.prisma.student.findUnique({
      where: { id: payment.studentId },
    });

    if (student && student.lifecycleStatus === 'APPLICANT') {
      await this.prisma.student.update({
        where: { id: student.id },
        data: {
          lifecycleStatus: 'ENROLLED',
          admissionDate: new Date(),
        },
      });

      // Update Application status if it exists
      await this.prisma.application.updateMany({
        where: { studentId: student.id },
        data: {
          status: 'ENROLLED',
          enrolledAt: new Date(),
        },
      });
    }
  }

  async getDrafts(institutionId: string, userId: string) {
    return this.prisma.admissionDraft.findMany({
      where: { institutionId, userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDraft(institutionId: string, userId: string, id: string) {
    const draft = await this.prisma.admissionDraft.findFirst({
      where: { id, institutionId, userId },
    });
    if (!draft) {
      throw new BadRequestException('Draft not found');
    }
    return draft;
  }

  async upsertDraft(institutionId: string, userId: string, id: string, data: any) {
    const existing = await this.prisma.admissionDraft.findUnique({ where: { id } });
    if (existing) {
      if (existing.institutionId !== institutionId || existing.userId !== userId) {
        throw new BadRequestException('Draft not found or access denied');
      }
      return this.prisma.admissionDraft.update({
        where: { id },
        data: { data },
      });
    }
    return this.prisma.admissionDraft.create({
      data: { id, institutionId, userId, data },
    });
  }

  async deleteDraft(institutionId: string, userId: string, id: string) {
    const draft = await this.prisma.admissionDraft.findFirst({
      where: { id, institutionId, userId },
    });
    if (!draft) {
      throw new BadRequestException('Draft not found');
    }
    return this.prisma.admissionDraft.delete({
      where: { id },
    });
  }

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

  async createApplication(institutionId: string, data: CreateApplicationDto) {
    const [program, academicYear] = await Promise.all([
      this.prisma.program.findUnique({ where: { id: data.programId } }),
      this.prisma.academicYear.findUnique({ where: { id: data.academicYearId } }),
    ]);

    if (!program || program.institutionId !== institutionId)
      throw new BadRequestException('Program not found in this institution');
    if (!academicYear || academicYear.institutionId !== institutionId)
      throw new BadRequestException('Academic Year not found in this institution');

    return this.prisma.application.create({
      data: {
        institutionId,
        programId: data.programId,
        academicYearId: data.academicYearId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        status: 'SUBMITTED',
      },
    });
  }

  async getApplications(institutionId: string) {
    return this.prisma.application.findMany({
      where: { institutionId },
      include: {
        program: true,
        academicYear: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateApplicationStatus(institutionId: string, id: string, data: UpdateApplicationDto) {
    if (data.status === 'ENROLLED') {
      throw new BadRequestException(
        'Cannot manually set status to ENROLLED. Use conversion endpoint instead.',
      );
    }

    const updateData: any = { ...data };
    const now = new Date();

    if (data.status === 'UNDER_REVIEW') updateData.reviewedAt = now;
    if (data.status === 'OFFERED') updateData.offeredAt = now;
    if (data.status === 'ACCEPTED') updateData.acceptedAt = now;
    if (data.status === 'REJECTED') updateData.rejectedAt = now;

    return this.prisma.application.update({
      where: { id, institutionId },
      data: updateData,
    });
  }

  async convertApplicantToStudent(
    institutionId: string,
    authUserId: string,
    applicationId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.application.findUnique({
        where: { id: applicationId, institutionId },
      });

      if (!app) {
        throw new BadRequestException('Application not found');
      }

      if (app.status !== 'ACCEPTED') {
        throw new BadRequestException('Application must be ACCEPTED before conversion');
      }

      if (app.studentId) {
        throw new BadRequestException('Application already converted');
      }

      const existingUser = await tx.user.findFirst({
        where: { institutionId, email: app.email },
      });
      if (existingUser) {
        throw new BadRequestException('A user with this email already exists.');
      }

      // 1. Create Auth User & Postgres User
      const email = app.email || `student_${Date.now()}@example.com`;
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!',
        email_confirm: !!app.email,
        user_metadata: {
          first_name: app.firstName,
          last_name: app.lastName,
          role: 'STUDENT',
        },
      });

      if (authError) {
        throw new BadRequestException(`Failed to create auth user: ${authError.message}`);
      }

      const user = await tx.user.create({
        data: {
          institutionId,
          authUserId: authData.user.id,
          email: email,
          firstName: app.firstName,
          lastName: app.lastName,
          phone: app.phone,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });

      // 2. Create Student
      const student = await tx.student.create({
        data: {
          institutionId,
          userId: user.id,
          lifecycleStatus: 'ENROLLED',
          programId: app.programId,
          admissionDate: new Date(),
        },
      });

      // 3. Create Enrollment
      await tx.enrollment.create({
        data: {
          institutionId,
          studentId: student.id,
          academicYearId: app.academicYearId,
          programId: app.programId,
          status: 'ACTIVE',
        },
      });

      // 4. Update Application
      await tx.application.update({
        where: { id: app.id },
        data: {
          status: 'ENROLLED',
          enrolledAt: new Date(),
          studentId: student.id,
        },
      });

      this.eventEmitter.emit(
        'student.admitted',
        new StudentAdmittedEvent(institutionId, student.id, app.academicYearId, app.programId),
      );

      return student;
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
      // 0. Auto-generate Registration No. (usn) with atomic counter
      const academicYear = await tx.academicYear.findUnique({
        where: { id: data.academicYearId },
      });
      if (!academicYear) {
        throw new BadRequestException('Academic Year not found');
      }
      const yearOfAdmission = academicYear.startDate.getFullYear();

      const counterKey = `enrollment_${data.academicYearId}`;
      const counter = await tx.institutionCounter.upsert({
        where: {
          institutionId_key: {
            institutionId,
            key: counterKey,
          },
        },
        update: {
          value: { increment: 1 },
        },
        create: {
          institutionId,
          key: counterKey,
          value: 1,
        },
      });

      const generatedUsn = `${counter.value}/${yearOfAdmission}`;

      // 1. Create Auth User & Postgres User
      const email = data.email || `student_${Date.now()}@example.com`;
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!',
        email_confirm: !!data.email,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName || '',
          role: 'STUDENT',
        },
      });

      if (authError) {
        throw new BadRequestException(`Failed to create auth user: ${authError.message}`);
      }

      const user = await tx.user.create({
        data: {
          institutionId,
          authUserId: authData.user.id,
          email: email,
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
          rollNumber: generatedUsn,
          admissionNumber: generatedUsn,
          studentCode: generatedUsn,
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
          data: data.previousEducation.map((edu, index) => ({
            institutionId,
            studentId: student.id,
            institutionName: edu.institutionName,
            academicYear: edu.academicYear,
            sequence: index + 1,
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
          rollNumber: generatedUsn,
          status: 'ACTIVE',
        },
      });

      // 4. Decoupled async tasks via event
      this.eventEmitter.emit(
        'student.admitted',
        new StudentAdmittedEvent(
          institutionId,
          student.id,
          data.academicYearId,
          data.programId,
          authUserId,
          data.feePlan,
          student,
        ),
      );

      return student;
    });
  }
}
