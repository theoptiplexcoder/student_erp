import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { StudentAdmittedEvent } from './events/student-admitted.event';
import { InstallmentStatus } from '@prisma/client';

@Injectable()
export class AdmissionsEventListener {
  private readonly logger = new Logger(AdmissionsEventListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('student.admitted', { async: true })
  async handleStudentAdmittedEvent(event: StudentAdmittedEvent) {
    this.logger.log(`Handling student.admitted for student ${event.studentId}`);

    try {
      if (event.feePlanData) {
        // From createDirectAdmission
        const data = event.feePlanData;
        const feePlan = await this.prisma.studentFeePlan.create({
          data: {
            institutionId: event.institutionId,
            studentId: event.studentId,
            academicYearId: event.academicYearId,
            feeStructureId: data.feeStructureId,
            totalAmount: data.totalAmount,
            currency: data.currency || 'INR',
            paymentMode: data.paymentMode,
            status: 'ACTIVE',
          },
        });

        if (
          data.paymentMode === 'INSTALLMENTS' &&
          data.installments &&
          data.installments.length > 0
        ) {
          const installments = data.installments.map((inst: any, idx: number) => ({
            studentFeePlanId: feePlan.id,
            installmentNumber: idx + 1,
            amount: inst.amount,
            amountPaid: 0,
            dueDate: inst.dueDate ? new Date(inst.dueDate) : new Date(),
            status: 'PENDING' as InstallmentStatus,
          }));
          await this.prisma.feeInstallment.createMany({ data: installments });
        } else if (data.paymentMode === 'INSTALLMENTS') {
          const count = data.installmentsCount || 4;
          const instAmount = data.totalAmount / count;
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
          await this.prisma.feeInstallment.createMany({ data: installments });
        } else {
          await this.prisma.feeInstallment.create({
            data: {
              studentFeePlanId: feePlan.id,
              installmentNumber: 1,
              amount: data.totalAmount,
              amountPaid: 0,
              dueDate: new Date(),
              status: 'PENDING',
            },
          });
        }
      } else {
        // From convertApplicantToStudent - Auto-assign from fee structure
        const activeFeeStructure = await this.prisma.feeStructure.findFirst({
          where: {
            institutionId: event.institutionId,
            academicYearId: event.academicYearId,
            programId: event.programId,
            isActive: true,
          },
          include: { components: true },
        });

        if (activeFeeStructure) {
          const mandatorySum = activeFeeStructure.components
            .filter((c) => !c.isOptional)
            .reduce((sum, c) => sum + c.amount, 0);

          const planTotal = mandatorySum > 0 ? mandatorySum : activeFeeStructure.totalAmount;

          const feePlan = await this.prisma.studentFeePlan.create({
            data: {
              institutionId: event.institutionId,
              studentId: event.studentId,
              academicYearId: event.academicYearId,
              feeStructureId: activeFeeStructure.id,
              totalAmount: planTotal,
              currency: activeFeeStructure.currency,
              paymentMode: 'ANNUAL',
              status: 'ACTIVE',
            },
          });

          await this.prisma.feeInstallment.create({
            data: {
              studentFeePlanId: feePlan.id,
              installmentNumber: 1,
              amount: planTotal,
              amountPaid: 0,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: 'PENDING',
            },
          });
        }
      }

      // Handle Audit Log if authUserId is present
      if (event.authUserId && event.studentData) {
        await this.prisma.auditLog.create({
          data: {
            institutionId: event.institutionId,
            actorUserId: event.authUserId,
            action: 'DIRECT_ADMISSION_CREATED',
            entityType: 'STUDENT',
            entityId: event.studentId,
            afterData: JSON.parse(JSON.stringify(event.studentData)),
          },
        });
      }
    } catch (error: any) {
      this.logger.error(`Error in handleStudentAdmittedEvent: ${error.message}`);
    }
  }
}
