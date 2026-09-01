import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { RecordOfflinePaymentDto } from '../dto/record-offline-payment.dto';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { InstallmentStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private generateReceiptNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REC-${dateStr}-${rand}`;
  }

  async recordOfflinePayment(
    institutionId: string,
    collectedById: string | undefined,
    dto: RecordOfflinePaymentDto,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const receiptNumber = this.generateReceiptNumber();

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          institutionId,
          studentId: dto.studentId,
          amount: dto.amount,
          currency: 'INR',
          paymentDate: new Date(),
          paymentMethod: dto.paymentMethod,
          transactionReference: dto.transactionReference,
          receiptNumber,
          notes: dto.notes,
          status: PaymentStatus.SUCCESS,
          collectedById: collectedById || null,
        },
      });

      // 2. Perform Installment Allocation
      let remainingToAllocate = dto.amount;
      const feePlanIds = new Set<string>();

      if (dto.installmentAllocations && dto.installmentAllocations.length > 0) {
        for (const alloc of dto.installmentAllocations) {
          const installment = await tx.feeInstallment.findUnique({
            where: { id: alloc.installmentId },
            include: { studentFeePlan: true },
          });

          if (!installment || installment.studentFeePlan.institutionId !== institutionId) {
            throw new NotFoundException(`Installment ${alloc.installmentId} not found`);
          }

          feePlanIds.add(installment.studentFeePlanId);

          const allocAmount = Math.min(alloc.amount, remainingToAllocate);
          if (allocAmount <= 0) continue;

          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              installmentId: installment.id,
              amount: allocAmount,
            },
          });

          const newAmountPaid = installment.amountPaid + allocAmount;
          const newStatus =
            newAmountPaid >= installment.amount
              ? InstallmentStatus.PAID
              : InstallmentStatus.PARTIAL;

          await tx.feeInstallment.update({
            where: { id: installment.id },
            data: {
              amountPaid: newAmountPaid,
              status: newStatus,
            },
          });

          remainingToAllocate -= allocAmount;
        }
      } else {
        // Auto FIFO Allocation across all pending/partial installments for this student
        const pendingInstallments = await tx.feeInstallment.findMany({
          where: {
            studentFeePlan: {
              studentId: dto.studentId,
              institutionId,
            },
            status: {
              in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL, InstallmentStatus.OVERDUE],
            },
          },
          include: { studentFeePlan: true },
          orderBy: { dueDate: 'asc' },
        });

        for (const inst of pendingInstallments) {
          if (remainingToAllocate <= 0) break;

          feePlanIds.add(inst.studentFeePlanId);
          const dueOnThis = Math.max(0, inst.amount - inst.amountPaid);
          const allocAmount = Math.min(dueOnThis, remainingToAllocate);

          if (allocAmount > 0) {
            await tx.paymentAllocation.create({
              data: {
                paymentId: payment.id,
                installmentId: inst.id,
                amount: allocAmount,
              },
            });

            const newAmountPaid = inst.amountPaid + allocAmount;
            const newStatus =
              newAmountPaid >= inst.amount ? InstallmentStatus.PAID : InstallmentStatus.PARTIAL;

            await tx.feeInstallment.update({
              where: { id: inst.id },
              data: {
                amountPaid: newAmountPaid,
                status: newStatus,
              },
            });

            remainingToAllocate -= allocAmount;
          }
        }
      }

      // 3. Update Fee Plan statuses if all installments are paid
      for (const planId of feePlanIds) {
        const installments = await tx.feeInstallment.findMany({
          where: { studentFeePlanId: planId },
        });

        const allPaid = installments.every((i) => i.amountPaid >= i.amount);
        if (allPaid) {
          await tx.studentFeePlan.update({
            where: { id: planId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      const result = await tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              program: { select: { name: true, code: true } },
            },
          },
          allocations: {
            include: {
              installment: true,
            },
          },
          collectedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });

      this.eventEmitter.emit('payment.success', result);

      return result;
    });
  }

  async initiateOnlinePayment(institutionId: string, studentId: string, dto: InitiatePaymentDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student not found`);
    }

    const receiptNumber = this.generateReceiptNumber();
    const gatewayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payment = await this.prisma.payment.create({
      data: {
        institutionId,
        studentId,
        amount: dto.amount,
        currency: 'INR',
        paymentMethod: PaymentMethod.GATEWAY,
        gatewayOrderId,
        status: PaymentStatus.PENDING,
        receiptNumber,
        notes: `Online checkout for installments: ${dto.installmentIds.join(', ')}`,
      },
    });

    return {
      paymentId: payment.id,
      gatewayOrderId,
      amount: dto.amount,
      currency: 'INR',
      receiptNumber,
      student: {
        name: `${student.user.firstName} ${student.user.lastName}`.trim(),
        email: student.user.email,
        phone: student.user.phone,
      },
    };
  }

  async verifyOnlinePayment(institutionId: string, dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: dto.paymentId, institutionId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found`);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return this.getPaymentReceipt(institutionId, payment.id);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark payment SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          gatewayPaymentId: dto.gatewayPaymentId || `pay_${Date.now()}`,
          gatewaySignature: dto.gatewaySignature || 'sig_mock_verified',
          transactionReference: dto.gatewayPaymentId,
        },
      });

      // 2. FIFO Allocation across pending installments for the student
      let remainingToAllocate = payment.amount;
      const feePlanIds = new Set<string>();

      const pendingInstallments = await tx.feeInstallment.findMany({
        where: {
          studentFeePlan: {
            studentId: payment.studentId,
            institutionId,
          },
          status: {
            in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL, InstallmentStatus.OVERDUE],
          },
        },
        include: { studentFeePlan: true },
        orderBy: { dueDate: 'asc' },
      });

      for (const inst of pendingInstallments) {
        if (remainingToAllocate <= 0) break;

        feePlanIds.add(inst.studentFeePlanId);
        const dueOnThis = Math.max(0, inst.amount - inst.amountPaid);
        const allocAmount = Math.min(dueOnThis, remainingToAllocate);

        if (allocAmount > 0) {
          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              installmentId: inst.id,
              amount: allocAmount,
            },
          });

          const newAmountPaid = inst.amountPaid + allocAmount;
          const newStatus =
            newAmountPaid >= inst.amount ? InstallmentStatus.PAID : InstallmentStatus.PARTIAL;

          await tx.feeInstallment.update({
            where: { id: inst.id },
            data: {
              amountPaid: newAmountPaid,
              status: newStatus,
            },
          });

          remainingToAllocate -= allocAmount;
        }
      }

      // Update fee plans if complete
      for (const planId of feePlanIds) {
        const installments = await tx.feeInstallment.findMany({
          where: { studentFeePlanId: planId },
        });

        const allPaid = installments.every((i) => i.amountPaid >= i.amount);
        if (allPaid) {
          await tx.studentFeePlan.update({
            where: { id: planId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      const result = await tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              program: { select: { name: true, code: true } },
            },
          },
          allocations: {
            include: {
              installment: true,
            },
          },
        },
      });

      this.eventEmitter.emit('payment.success', result);

      return result;
    });
  }

  async getPaymentReceipt(institutionId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, institutionId },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            email: true,
            phone: true,
          },
        },
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
              },
            },
          },
        },
        collectedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        allocations: {
          include: {
            installment: {
              include: {
                studentFeePlan: {
                  include: {
                    academicYear: true,
                    feeStructure: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment receipt with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsList(
    institutionId: string,
    filters?: {
      studentId?: string;
      status?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = { institutionId };

    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.status) where.status = filters.status;
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;

    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {};
      if (filters.startDate) where.paymentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.paymentDate.lte = new Date(filters.endDate);
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            admissionNumber: true,
            program: { select: { id: true, name: true, code: true } },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        collectedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        allocations: {
          include: {
            installment: {
              select: {
                installmentNumber: true,
                amount: true,
                dueDate: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
