import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { GenerateFeePlanDto } from '../dto/generate-fee-plan.dto';
import { ApplyWaiverDto } from '../dto/apply-waiver.dto';
import { InstallmentStatus, PaymentMode } from '@prisma/client';

@Injectable()
export class FeePlanService {
  constructor(private readonly prisma: PrismaService) {}

  async generateStudentFeePlan(institutionId: string, dto: GenerateFeePlanDto) {
    // ---------- Batch rollout: fan out to individual students ----------
    if (dto.batchId && !dto.studentId) {
      const students = await this.prisma.student.findMany({
        where: { institutionId, status: 'ACTIVE' },
        include: {
          enrollments: {
            where: { section: { batchId: dto.batchId } },
            take: 1,
          },
        },
      });

      const batchStudents = students.filter((s) => s.enrollments.length > 0);
      if (!batchStudents.length) {
        throw new NotFoundException('No active students found in that batch');
      }

      const results: any[] = [];
      for (const student of batchStudents) {
        try {
          const plan = await this._generateForOneStudent(institutionId, student.id, dto);
          results.push(plan);
        } catch {
          // skip students who already have a plan or hit a constraint
        }
      }
      return results;
    }

    // ---------- Single student ----------
    if (!dto.studentId) {
      throw new BadRequestException('Either studentId or batchId must be provided');
    }
    return this._generateForOneStudent(institutionId, dto.studentId, dto);
  }

  private async _generateForOneStudent(
    institutionId: string,
    studentId: string,
    dto: GenerateFeePlanDto,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
      include: { user: true, program: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id: dto.academicYearId, institutionId },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${dto.academicYearId} not found`);
    }

    // Return existing plan if already generated
    const existingPlan = await this.prisma.studentFeePlan.findFirst({
      where: { institutionId, studentId, academicYearId: dto.academicYearId },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
          include: { allocations: { include: { payment: true } } },
        },
        feeStructure: { include: { components: true } },
        waivers: true,
      },
    });

    if (existingPlan) {
      return existingPlan;
    }

    // ---------- Resolve fee structure ----------
    let feeStructureId = dto.feeStructureId;

    // Auto-resolve from program if not explicitly provided
    if (!feeStructureId && student.programId) {
      const autoStructure = await this.prisma.feeStructure.findFirst({
        where: {
          institutionId,
          programId: student.programId,
          academicYearId: dto.academicYearId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (autoStructure) {
        feeStructureId = autoStructure.id;
      }
    }

    let calculatedTotal = 0;
    let feeStructure = null;
    let currency = 'INR';
    const componentsData: { feeComponentId: string; amount: number }[] = [];

    if (feeStructureId) {
      feeStructure = await this.prisma.feeStructure.findFirst({
        where: { id: feeStructureId, institutionId },
        include: { components: true },
      });

      if (!feeStructure) {
        throw new NotFoundException(`Fee structure with ID ${feeStructureId} not found`);
      }

      currency = feeStructure.currency;
      const optionalIds = new Set(dto.optionalComponentIds || []);

      for (const comp of feeStructure.components) {
        if (!comp.isOptional) {
          calculatedTotal += comp.amount;
          componentsData.push({ feeComponentId: comp.id, amount: comp.amount });
        } else if (optionalIds.has(comp.id)) {
          calculatedTotal += comp.amount;
          componentsData.push({ feeComponentId: comp.id, amount: comp.amount });
        }
      }
    } else if (dto.customTotalAmount !== undefined) {
      calculatedTotal = dto.customTotalAmount;
    } else {
      throw new BadRequestException(
        'Cannot determine fee: no feeStructureId provided, no fee structure linked to this program, and no customTotalAmount supplied',
      );
    }

    // ---------- Build installment schedule ----------
    const isAnnual = dto.paymentMode === PaymentMode.ANNUAL;
    // Accept either customInstallmentCount (new) or installmentCount (legacy)
    const resolvedCount = dto.customInstallmentCount ?? dto.installmentCount ?? 2;
    const count = isAnnual ? 1 : Math.max(1, resolvedCount);

    const baseAmt = Math.floor((calculatedTotal / count) * 100) / 100;
    const remainder = Math.round((calculatedTotal - baseAmt * count) * 100) / 100;

    const now = new Date();
    // customFirstDueDate wins, then first entry of customDueDates array, then academic year start
    const firstDueDateStr =
      dto.customFirstDueDate || (dto.customDueDates && dto.customDueDates[0]) || null;
    const firstDueDate = firstDueDateStr
      ? new Date(firstDueDateStr)
      : academicYear.startDate && new Date(academicYear.startDate) > now
        ? new Date(academicYear.startDate)
        : now;

    const installmentData: {
      installmentNumber: number;
      amount: number;
      amountPaid: number;
      dueDate: Date;
      status: InstallmentStatus;
    }[] = [];

    for (let i = 1; i <= count; i++) {
      let dueDate: Date;

      if (dto.customDueDates && dto.customDueDates[i - 1]) {
        dueDate = new Date(dto.customDueDates[i - 1]);
      } else {
        dueDate = new Date(firstDueDate);
        // Space subsequent installments every 3 months
        if (i > 1) dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
      }

      const isLast = i === count;
      const amount = isLast ? baseAmt + remainder : baseAmt;

      installmentData.push({
        installmentNumber: i,
        amount: Math.round(amount * 100) / 100,
        amountPaid: 0,
        dueDate,
        status: InstallmentStatus.PENDING,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.studentFeePlan.create({
        data: {
          institutionId,
          studentId,
          academicYearId: dto.academicYearId,
          feeStructureId: feeStructureId || null,
          totalAmount: calculatedTotal,
          currency,
          paymentMode: dto.paymentMode,
          status: 'ACTIVE',
          ...(componentsData.length > 0 && {
            components: { create: componentsData },
          }),
          installments: { create: installmentData },
        },
        include: {
          installments: { orderBy: { installmentNumber: 'asc' } },
          components: { include: { feeComponent: true } },
          feeStructure: { include: { components: true } },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              program: { select: { name: true, code: true } },
            },
          },
          academicYear: true,
          waivers: true,
        },
      });

      // Apply initial discount/waiver if provided
      if (dto.discountAmount && dto.discountAmount > 0) {
        await tx.feeWaiver.create({
          data: {
            studentFeePlanId: plan.id,
            name: dto.discountReason || 'Initial Discount',
            amount: dto.discountAmount,
            waiverType: 'SCHOLARSHIP',
            status: 'APPROVED',
          },
        });
      }

      return plan;
    });
  }

  async findAll(
    institutionId: string,
    filters?: {
      studentId?: string;
      academicYearId?: string;
      programId?: string;
      batchId?: string;
      status?: string;
      search?: string;
    },
  ) {
    const where: any = { institutionId };

    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.academicYearId) where.academicYearId = filters.academicYearId;
    if (filters?.status) where.status = filters.status;

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

    const plans = await this.prisma.studentFeePlan.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            admissionNumber: true,
            program: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                photoUrl: true,
              },
            },
          },
        },
        academicYear: { select: { id: true, name: true } },
        feeStructure: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        components: {
          include: { feeComponent: true },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
          include: {
            allocations: {
              include: {
                payment: {
                  select: {
                    id: true,
                    receiptNumber: true,
                    paymentDate: true,
                    paymentMethod: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        waivers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute summary metrics per plan
    return plans.map((plan) => {
      const totalPaid = plan.installments.reduce((sum, inst) => sum + inst.amountPaid, 0);
      const totalWaivers = plan.waivers.reduce((sum, w) => sum + w.amount, 0);
      const remainingDue = Math.max(0, plan.totalAmount - totalPaid - totalWaivers);
      const overdueInstallments = plan.installments.filter(
        (inst) =>
          inst.status === InstallmentStatus.OVERDUE ||
          (inst.status !== InstallmentStatus.PAID && new Date(inst.dueDate) < new Date()),
      );

      return {
        ...plan,
        summary: {
          totalAmount: plan.totalAmount,
          totalPaid,
          totalWaivers,
          remainingDue,
          isOverdue: overdueInstallments.length > 0,
          overdueCount: overdueInstallments.length,
          overdueAmount: overdueInstallments.reduce(
            (sum, inst) => sum + (inst.amount - inst.amountPaid),
            0,
          ),
        },
      };
    });
  }

  async findOne(institutionId: string, id: string) {
    const plan = await this.prisma.studentFeePlan.findFirst({
      where: { id, institutionId },
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            admissionNumber: true,
            program: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
            guardianName: true,
            guardianPhone: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                photoUrl: true,
              },
            },
          },
        },
        academicYear: { select: { id: true, name: true, startDate: true, endDate: true } },
        feeStructure: {
          include: {
            components: true,
          },
        },
        components: {
          include: { feeComponent: true },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
          include: {
            allocations: {
              include: {
                payment: {
                  select: {
                    id: true,
                    receiptNumber: true,
                    paymentDate: true,
                    paymentMethod: true,
                    transactionReference: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        waivers: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Fee plan with ID ${id} not found`);
    }

    const totalPaid = plan.installments.reduce((sum, inst) => sum + inst.amountPaid, 0);
    const totalWaivers = plan.waivers.reduce((sum, w) => sum + w.amount, 0);
    const remainingDue = Math.max(0, plan.totalAmount - totalPaid - totalWaivers);

    return {
      ...plan,
      summary: {
        totalAmount: plan.totalAmount,
        totalPaid,
        totalWaivers,
        remainingDue,
      },
    };
  }

  async getStudentDues(institutionId: string, studentId: string) {
    // Fetch student info
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
      select: {
        id: true,
        rollNumber: true,
        admissionNumber: true,
        programId: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        program: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
      },
    });

    // Fetch plans with live feeStructure components (source of truth after updates)
    let rawPlans = await this.prisma.studentFeePlan.findMany({
      where: { institutionId, studentId },
      include: {
        academicYear: { select: { id: true, name: true } },
        feeStructure: {
          select: {
            id: true,
            name: true,
            code: true,
            components: true,
          },
        },
        components: { include: { feeComponent: true } },
        installments: {
          orderBy: { installmentNumber: 'asc' },
          include: {
            allocations: {
              include: {
                payment: {
                  select: {
                    id: true,
                    receiptNumber: true,
                    paymentDate: true,
                    paymentMethod: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        waivers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // -----------------------------------------------------------------------
    // AUTO-GENERATE: if the student has no plan yet, check whether an active
    // fee structure is linked to their program + the current active academic
    // year, and generate one automatically so they can see their dues.
    // -----------------------------------------------------------------------
    if (rawPlans.length === 0 && student?.programId) {
      const activeAcademicYear = await this.prisma.academicYear.findFirst({
        where: { institutionId, isActive: true },
        orderBy: { startDate: 'desc' },
      });

      if (activeAcademicYear) {
        const matchingStructure = await this.prisma.feeStructure.findFirst({
          where: {
            institutionId,
            programId: student.programId,
            academicYearId: activeAcademicYear.id,
            isActive: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (matchingStructure) {
          try {
            await this._generateForOneStudent(institutionId, studentId, {
              academicYearId: activeAcademicYear.id,
              feeStructureId: matchingStructure.id,
              paymentMode: PaymentMode.INSTALLMENTS,
              customInstallmentCount: 2,
            });

            // Re-fetch after generation
            rawPlans = await this.prisma.studentFeePlan.findMany({
              where: { institutionId, studentId },
              include: {
                academicYear: { select: { id: true, name: true } },
                feeStructure: {
                  select: { id: true, name: true, code: true, components: true },
                },
                components: { include: { feeComponent: true } },
                installments: {
                  orderBy: { installmentNumber: 'asc' },
                  include: {
                    allocations: {
                      include: {
                        payment: {
                          select: {
                            id: true,
                            receiptNumber: true,
                            paymentDate: true,
                            paymentMethod: true,
                            status: true,
                          },
                        },
                      },
                    },
                  },
                },
                waivers: true,
              },
              orderBy: { createdAt: 'desc' },
            });
          } catch {
            // Auto-generation is best-effort; proceed with empty plans if it fails
          }
        }
      }
    }

    const now = new Date();

    const feePlans = rawPlans.map((plan) => {
      const totalPaid = plan.installments.reduce((sum, inst) => sum + inst.amountPaid, 0);
      const totalWaivers = plan.waivers.reduce((sum, w) => sum + w.amount, 0);
      const balanceDue = Math.max(0, plan.totalAmount - totalPaid - totalWaivers);

      // Use live feeStructure.components as the source of truth for the breakdown.
      // StudentFeePlanComponent rows may reference stale FeeComponent IDs after a
      // structure update (old components are deleted + recreated), so we prefer the
      // live structure. Fall back to StudentFeePlanComponent data when there is no
      // linked structure (custom / ad-hoc plans).
      const components: { name: string; type: string; amount: number; isOptional: boolean }[] = plan
        .feeStructure?.components?.length
        ? plan.feeStructure.components.map((c) => ({
            name: c.name,
            type: c.type,
            amount: c.amount,
            isOptional: c.isOptional,
          }))
        : plan.components.map((c) => ({
            name: c.feeComponent?.name ?? 'Unknown',
            type: c.feeComponent?.type ?? 'MISC',
            amount: c.amount,
            isOptional: c.feeComponent?.isOptional ?? false,
          }));

      return {
        id: plan.id,
        academicYear: plan.academicYear,
        feeStructure: plan.feeStructure
          ? { id: plan.feeStructure.id, name: plan.feeStructure.name, code: plan.feeStructure.code }
          : undefined,
        totalAmount: plan.totalAmount,
        currency: plan.currency,
        paymentMode: plan.paymentMode,
        status: plan.status,
        totalPaid,
        balanceDue,
        components,
        installments: plan.installments,
        waivers: plan.waivers,
        payments: [] as any[],
      };
    });

    // Cross-plan summary
    const totalFee = feePlans.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaidAll = feePlans.reduce((sum, p) => sum + p.totalPaid, 0);
    const totalWaiversAll = rawPlans.reduce(
      (sum, p) => sum + p.waivers.reduce((ws, w) => ws + w.amount, 0),
      0,
    );
    const totalOutstanding = Math.max(0, totalFee - totalPaidAll - totalWaiversAll);

    const allPendingInstallments = feePlans
      .flatMap((p) =>
        p.installments
          .filter((inst) => inst.status !== InstallmentStatus.PAID)
          .map((inst) => ({ ...inst, academicYear: p.academicYear.name })),
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const hasOverdue = allPendingInstallments.some((inst) => new Date(inst.dueDate) < now);
    const nextUpcomingInstallment = allPendingInstallments[0] ?? null;

    // Payment history
    const payments = await this.prisma.payment.findMany({
      where: { institutionId, studentId },
      include: {
        allocations: { include: { installment: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return {
      student,
      feePlans,
      payments,
      summary: {
        totalFee,
        totalPaid: totalPaidAll,
        totalOutstanding,
        currency: feePlans[0]?.currency ?? 'INR',
        hasOverdue,
        nextUpcomingInstallment,
      },
    };
  }

  async appendComponentToPlan(
    institutionId: string,
    studentId: string,
    componentDto: {
      componentId?: string;
      name?: string;
      amount?: number;
      type?: any;
      dueDate?: Date;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the ACTIVE student fee plan for the student
      const plan = await tx.studentFeePlan.findFirst({
        where: { studentId, institutionId, status: 'ACTIVE' },
        include: { installments: { orderBy: { installmentNumber: 'desc' } } },
      });

      if (!plan) {
        throw new NotFoundException(`Active fee plan not found for student ${studentId}`);
      }

      let feeComponentId = componentDto.componentId;
      let amountToAdd = componentDto.amount || 0;

      // 2. Link or create FeeComponent
      if (!feeComponentId) {
        if (!plan.feeStructureId) {
          throw new BadRequestException(
            'Cannot create ad-hoc component because plan has no fee structure',
          );
        }
        if (!componentDto.name || !componentDto.amount) {
          throw new BadRequestException('Name and amount are required to create a new component');
        }
        const newComponent = await tx.feeComponent.create({
          data: {
            feeStructureId: plan.feeStructureId,
            name: componentDto.name,
            type: componentDto.type || 'MISC',
            amount: amountToAdd,
            isOptional: true,
          },
        });
        feeComponentId = newComponent.id;
      } else {
        const existingComponent = await tx.feeComponent.findUnique({
          where: { id: feeComponentId },
        });
        if (!existingComponent) {
          throw new NotFoundException(`Fee component with ID ${feeComponentId} not found`);
        }
        if (!amountToAdd) {
          amountToAdd = existingComponent.amount;
        }
      }

      // 3. Link via StudentFeePlanComponent
      await tx.studentFeePlanComponent.create({
        data: {
          studentFeePlanId: plan.id,
          feeComponentId: feeComponentId,
          amount: amountToAdd,
        },
      });

      // 4. Increase totalAmount on StudentFeePlan
      const updatedPlan = await tx.studentFeePlan.update({
        where: { id: plan.id },
        data: {
          totalAmount: { increment: amountToAdd },
        },
      });

      // 5. Update/Create FeeInstallment
      if (amountToAdd !== 0) {
        if (componentDto.dueDate) {
          // Create a new installment
          const nextInstallmentNumber =
            plan.installments.length > 0 ? plan.installments[0].installmentNumber + 1 : 1;
          await tx.feeInstallment.create({
            data: {
              studentFeePlanId: plan.id,
              installmentNumber: nextInstallmentNumber,
              amount: amountToAdd,
              amountPaid: 0,
              dueDate: new Date(componentDto.dueDate),
              status: InstallmentStatus.PENDING,
            },
          });
        } else {
          // Append to the last installment
          if (plan.installments.length > 0) {
            const lastInst = plan.installments[0]; // ordered desc
            const newAmount = lastInst.amount + amountToAdd;
            const newStatus =
              lastInst.amountPaid >= newAmount
                ? InstallmentStatus.PAID
                : lastInst.amountPaid > 0
                  ? InstallmentStatus.PARTIAL
                  : InstallmentStatus.PENDING;

            await tx.feeInstallment.update({
              where: { id: lastInst.id },
              data: {
                amount: { increment: amountToAdd },
                status: newStatus,
              },
            });
          } else {
            // No installments exist, create the first one
            await tx.feeInstallment.create({
              data: {
                studentFeePlanId: plan.id,
                installmentNumber: 1,
                amount: amountToAdd,
                amountPaid: 0,
                dueDate: new Date(),
                status: InstallmentStatus.PENDING,
              },
            });
          }
        }
      }

      return updatedPlan;
    });
  }

  async applyWaiver(institutionId: string, approvedById: string | undefined, dto: ApplyWaiverDto) {
    const plan = await this.prisma.studentFeePlan.findFirst({
      where: { id: dto.studentFeePlanId, institutionId },
      include: {
        installments: {
          orderBy: { installmentNumber: 'desc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Fee plan with ID ${dto.studentFeePlanId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create waiver record
      const waiver = await tx.feeWaiver.create({
        data: {
          studentFeePlanId: dto.studentFeePlanId,
          name: dto.name,
          amount: dto.amount,
          waiverType: dto.waiverType || 'SCHOLARSHIP',
          status: 'APPROVED',
          reason: dto.reason,
          approvedBy: approvedById,
        },
      });

      // 2. Adjust pending installments from last installment backwards
      let remainingWaiver = dto.amount;
      for (const inst of plan.installments) {
        if (remainingWaiver <= 0) break;
        const unpaidOnInst = Math.max(0, inst.amount - inst.amountPaid);
        if (unpaidOnInst > 0) {
          const discountOnThis = Math.min(unpaidOnInst, remainingWaiver);
          const newAmount = Math.max(inst.amountPaid, inst.amount - discountOnThis);

          await tx.feeInstallment.update({
            where: { id: inst.id },
            data: {
              amount: newAmount,
              status: inst.amountPaid >= newAmount ? InstallmentStatus.PAID : inst.status,
            },
          });

          remainingWaiver -= discountOnThis;
        }
      }

      // Check if all installments are now fully paid
      const updatedInstallments = await tx.feeInstallment.findMany({
        where: { studentFeePlanId: plan.id },
      });

      const allPaid = updatedInstallments.every((i) => i.amountPaid >= i.amount);
      if (allPaid) {
        await tx.studentFeePlan.update({
          where: { id: plan.id },
          data: { status: 'COMPLETED' },
        });
      }

      return waiver;
    });
  }
}
