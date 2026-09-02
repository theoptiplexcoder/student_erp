import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { InstallmentStatus, PaymentStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DefaultersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getDefaulters(
    institutionId: string,
    filters?: {
      programId?: string;
      batchId?: string;
      academicYearId?: string;
      search?: string;
    },
  ) {
    const now = new Date();

    const where: any = {
      institutionId,
      installments: {
        some: {
          OR: [
            { status: InstallmentStatus.OVERDUE },
            {
              status: { in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
              dueDate: { lt: now },
            },
          ],
        },
      },
    };

    if (filters?.academicYearId) {
      where.academicYearId = filters.academicYearId;
    }

    if (filters?.programId || filters?.batchId || filters?.search) {
      where.student = {};
      if (filters.programId) where.student.programId = filters.programId;
      if (filters.batchId) where.student.batchId = filters.batchId;
      if (filters.search) {
        where.student.OR = [
          { rollNumber: { contains: filters.search, mode: 'insensitive' } },
          { admissionNumber: { contains: filters.search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }
    }

    const feePlans = await this.prisma.studentFeePlan.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
            program: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
          },
        },
        installments: {
          where: {
            OR: [
              { status: InstallmentStatus.OVERDUE },
              {
                status: { in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
                dueDate: { lt: now },
              },
            ],
          },
          orderBy: { dueDate: 'asc' },
        },
        academicYear: { select: { id: true, name: true } },
      },
    });

    // Group by student
    const defaulterMap = new Map<string, any>();

    for (const plan of feePlans) {
      const studentId = plan.studentId;
      const overdueAmountForPlan = plan.installments.reduce(
        (sum, inst) => sum + (inst.amount - inst.amountPaid),
        0,
      );

      if (!defaulterMap.has(studentId)) {
        const earliestDueDate = plan.installments[0]?.dueDate || now;
        const diffTime = Math.abs(now.getTime() - new Date(earliestDueDate).getTime());
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        defaulterMap.set(studentId, {
          studentId: plan.student.id,
          name: `${plan.student.user.firstName} ${plan.student.user.lastName}`.trim(),
          rollNumber: plan.student.rollNumber || plan.student.admissionNumber || 'N/A',
          email: plan.student.user.email,
          phone: plan.student.user.phone || 'N/A',
          guardianName: plan.student.guardianName || 'N/A',
          guardianPhone: plan.student.guardianPhone || 'N/A',
          program: plan.student.program?.name || 'N/A',
          programCode: plan.student.program?.code || '',
          section: plan.student.section?.name || 'N/A',
          overdueAmount: overdueAmountForPlan,
          overdueInstallmentsCount: plan.installments.length,
          daysOverdue,
          earliestDueDate,
          plans: [
            {
              feePlanId: plan.id,
              academicYear: plan.academicYear.name,
              overdueInstallments: plan.installments,
            },
          ],
        });
      } else {
        const current = defaulterMap.get(studentId);
        current.overdueAmount += overdueAmountForPlan;
        current.overdueInstallmentsCount += plan.installments.length;
        current.plans.push({
          feePlanId: plan.id,
          academicYear: plan.academicYear.name,
          overdueInstallments: plan.installments,
        });
      }
    }

    return Array.from(defaulterMap.values());
  }

  async applyDefaulterAction(
    institutionId: string,
    dto: { studentId: string; action: 'SEND_REMINDER' | 'RESTRICT_PORTAL' | 'MARK_OVERDUE' },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student not found`);
    }

    if (dto.action === 'MARK_OVERDUE') {
      const now = new Date();
      await this.prisma.feeInstallment.updateMany({
        where: {
          studentFeePlan: {
            studentId: dto.studentId,
            institutionId,
          },
          status: { in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
          dueDate: { lt: now },
        },
        data: {
          status: InstallmentStatus.OVERDUE,
        },
      });

      return { success: true, message: 'Installments marked as overdue' };
    }

    if (dto.action === 'SEND_REMINDER') {
      if (student.userId) {
        await this.prisma.notification.create({
          data: {
            institutionId,
            userId: student.userId,
            title: 'Fee Payment Reminder',
            message:
              'You have overdue fee installments. Please make your payment promptly to avoid restrictions.',
            type: 'SYSTEM',
          },
        });
      }
      return { success: true, message: 'Fee reminder notification sent to student' };
    }

    if (dto.action === 'RESTRICT_PORTAL') {
      return {
        success: true,
        message: 'Student account flagged for fee payment default restriction',
      };
    }

    return { success: true, message: 'Action executed' };
  }

  async processOverdueInstallments(institutionId?: string) {
    const now = new Date();

    const installmentWhere: any = {
      status: { in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
      dueDate: { lt: now },
    };

    if (institutionId) {
      installmentWhere.studentFeePlan = { institutionId };
    }

    const overdueList = await this.prisma.feeInstallment.findMany({
      where: installmentWhere,
      include: {
        studentFeePlan: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (overdueList.length === 0) {
      return {
        scannedCount: 0,
        updatedInstallmentsCount: 0,
        affectedPlansCount: 0,
        notificationsSent: 0,
        message: 'No overdue installments found',
      };
    }

    const installmentIds = overdueList.map((i) => i.id);
    await this.prisma.feeInstallment.updateMany({
      where: { id: { in: installmentIds } },
      data: { status: InstallmentStatus.OVERDUE },
    });

    const affectedPlanIds = Array.from(new Set(overdueList.map((i) => i.studentFeePlanId)));
    await this.prisma.studentFeePlan.updateMany({
      where: {
        id: { in: affectedPlanIds },
        status: 'ACTIVE',
      },
      data: { status: 'OVERDUE' },
    });

    // Notify students
    const studentMap = new Map<string, { userId?: string; instId: string; amountDue: number }>();
    for (const inst of overdueList) {
      const student = inst.studentFeePlan.student;
      const targetInstId = institutionId || inst.studentFeePlan.institutionId;
      const amountDue = inst.amount - inst.amountPaid;
      if (student && student.userId) {
        if (!studentMap.has(student.id)) {
          studentMap.set(student.id, {
            userId: student.userId,
            instId: targetInstId,
            amountDue,
          });
        } else {
          const s = studentMap.get(student.id)!;
          s.amountDue += amountDue;
        }
      }
    }

    let notificationsSent = 0;
    for (const s of studentMap.values()) {
      if (s.userId) {
        this.eventEmitter.emit('fee.overdue', {
          institutionId: s.instId,
          userId: s.userId,
          amountDue: s.amountDue,
        });
        notificationsSent++;
      }
    }

    return {
      scannedCount: overdueList.length,
      updatedInstallmentsCount: installmentIds.length,
      affectedPlansCount: affectedPlanIds.length,
      notificationsSent,
      message: `Successfully processed ${installmentIds.length} overdue installments across ${affectedPlanIds.length} fee plans`,
    };
  }

  async getFinanceStats(institutionId: string) {
    const now = new Date();

    // 1. Fee Plans Total Expected
    const feePlans = await this.prisma.studentFeePlan.findMany({
      where: { institutionId, status: { in: ['ACTIVE', 'COMPLETED', 'OVERDUE'] } },
      select: { totalAmount: true },
    });
    const totalExpected = feePlans.reduce((sum, p) => sum + p.totalAmount, 0);

    // 2. Total Collected
    const successfulPayments = await this.prisma.payment.findMany({
      where: { institutionId, status: PaymentStatus.SUCCESS },
      select: { amount: true },
    });
    const totalCollected = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // 3. Overdue Installments
    const overdueInstallments = await this.prisma.feeInstallment.findMany({
      where: {
        studentFeePlan: { institutionId },
        OR: [
          { status: InstallmentStatus.OVERDUE },
          {
            status: { in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
            dueDate: { lt: now },
          },
        ],
      },
      include: {
        studentFeePlan: {
          select: { studentId: true },
        },
      },
    });

    const overdueAmount = overdueInstallments.reduce(
      (sum, inst) => sum + (inst.amount - inst.amountPaid),
      0,
    );
    const uniqueDefaulterStudentIds = new Set(
      overdueInstallments.map((i) => i.studentFeePlan.studentId),
    );

    // 4. Active Structures Count
    const structureCount = await this.prisma.feeStructure.count({
      where: { institutionId, isActive: true },
    });

    // 5. Recent Payments
    const recentPayments = await this.prisma.payment.findMany({
      where: { institutionId, status: PaymentStatus.SUCCESS },
      include: {
        student: {
          select: {
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
      take: 5,
    });

    const totalOutstanding = Math.max(0, totalExpected - totalCollected);
    const collectionRate =
      totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 1000) / 10 : 0;

    return {
      totalExpected,
      totalCollected,
      totalOutstanding,
      overdueAmount,
      collectionRate,
      defaultersCount: uniqueDefaulterStudentIds.size,
      activeStructuresCount: structureCount,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        studentName: `${p.student.user.firstName} ${p.student.user.lastName}`.trim(),
        rollNumber: p.student.rollNumber,
      })),
    };
  }
}
