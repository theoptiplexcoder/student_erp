import { Test, TestingModule } from '@nestjs/testing';
import { FeeStructureService } from './fee-structure.service';
import { FeePlanService } from './fee-plan.service';
import { PaymentService } from './payment.service';
import { DefaultersService } from './defaulters.service';
import { PrismaService } from '../../../../database/prisma.service';
import {
  FeeComponentType,
  PaymentMethod,
  PaymentMode,
  InstallmentStatus,
  PaymentStatus,
} from '@prisma/client';

describe('Finance Services', () => {
  let feeStructureService: FeeStructureService;
  let feePlanService: FeePlanService;
  let paymentService: PaymentService;
  let defaultersService: DefaultersService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((cb) => cb(prismaMock)),
      feeStructure: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      feeComponent: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      studentFeePlan: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      feeInstallment: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      feeWaiver: {
        create: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      paymentAllocation: {
        create: jest.fn(),
      },
      student: {
        findFirst: jest.fn(),
      },
      academicYear: {
        findFirst: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeStructureService,
        FeePlanService,
        PaymentService,
        DefaultersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    feeStructureService = module.get<FeeStructureService>(FeeStructureService);
    feePlanService = module.get<FeePlanService>(FeePlanService);
    paymentService = module.get<PaymentService>(PaymentService);
    defaultersService = module.get<DefaultersService>(DefaultersService);
  });

  describe('FeeStructureService', () => {
    it('should create fee structure with components', async () => {
      const mockStructure = {
        id: 'struct-1',
        institutionId: 'inst-1',
        name: 'B.Tech Tuition 2026',
        totalAmount: 100000,
        components: [
          { name: 'Tuition', type: FeeComponentType.TUITION, amount: 90000, isOptional: false },
          { name: 'Hostel', type: FeeComponentType.HOSTEL, amount: 10000, isOptional: true },
        ],
      };
      prismaMock.feeStructure.create.mockResolvedValue(mockStructure);

      const result = await feeStructureService.create('inst-1', {
        name: 'B.Tech Tuition 2026',
        academicYearId: 'ay-1',
        totalAmount: 100000,
        components: mockStructure.components,
      });

      expect(prismaMock.feeStructure.create).toHaveBeenCalled();
      expect(result.id).toBe('struct-1');
    });
  });

  describe('FeePlanService', () => {
    it('should generate fee plan with multiple installments for INSTALLMENTS mode', async () => {
      prismaMock.student.findFirst.mockResolvedValue({
        id: 'student-1',
        institutionId: 'inst-1',
      });
      prismaMock.academicYear.findFirst.mockResolvedValue({
        id: 'ay-1',
        startDate: new Date('2026-08-01'),
      });
      prismaMock.studentFeePlan.findFirst.mockResolvedValue(null);
      prismaMock.feeStructure.findFirst.mockResolvedValue({
        id: 'struct-1',
        currency: 'INR',
        components: [
          { id: 'c1', name: 'Tuition', amount: 60000, isOptional: false },
          { id: 'c2', name: 'Lab', amount: 20000, isOptional: false },
        ],
      });

      prismaMock.studentFeePlan.create.mockImplementation(({ data }: any) => ({
        id: 'plan-1',
        ...data,
        installments: data.installments.create,
      }));

      const plan = await feePlanService.generateStudentFeePlan('inst-1', {
        studentId: 'student-1',
        academicYearId: 'ay-1',
        feeStructureId: 'struct-1',
        paymentMode: PaymentMode.INSTALLMENTS,
        installmentCount: 2,
      });

      expect(prismaMock.studentFeePlan.create).toHaveBeenCalled();
      expect(plan.id).toBe('plan-1');
      expect(plan.totalAmount).toBe(80000);
      expect(plan.installments.length).toBe(2);
      expect(plan.installments[0].amount).toBe(40000);
    });
  });

  describe('PaymentService', () => {
    it('should record offline payment and allocate FIFO to installments', async () => {
      prismaMock.student.findFirst.mockResolvedValue({
        id: 'student-1',
        institutionId: 'inst-1',
      });

      const mockPayment = {
        id: 'pay-1',
        institutionId: 'inst-1',
        studentId: 'student-1',
        amount: 25000,
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'REC-20260901-1234',
        status: PaymentStatus.SUCCESS,
      };
      prismaMock.payment.create.mockResolvedValue(mockPayment);

      const pendingInstallments = [
        {
          id: 'inst-1',
          studentFeePlanId: 'plan-1',
          installmentNumber: 1,
          amount: 20000,
          amountPaid: 0,
          status: InstallmentStatus.PENDING,
          dueDate: new Date('2026-09-15'),
        },
        {
          id: 'inst-2',
          studentFeePlanId: 'plan-1',
          installmentNumber: 2,
          amount: 20000,
          amountPaid: 0,
          status: InstallmentStatus.PENDING,
          dueDate: new Date('2026-12-15'),
        },
      ];
      prismaMock.feeInstallment.findMany.mockResolvedValue(pendingInstallments);
      prismaMock.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        allocations: [
          { installmentId: 'inst-1', amount: 20000 },
          { installmentId: 'inst-2', amount: 5000 },
        ],
      });

      const result = await paymentService.recordOfflinePayment('inst-1', 'user-1', {
        studentId: 'student-1',
        amount: 25000,
        paymentMethod: PaymentMethod.CASH,
      });

      expect(prismaMock.payment.create).toHaveBeenCalled();
      expect(prismaMock.paymentAllocation.create).toHaveBeenCalledTimes(2);
      expect(prismaMock.feeInstallment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inst-1' },
          data: { amountPaid: 20000, status: InstallmentStatus.PAID },
        }),
      );
      expect(prismaMock.feeInstallment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inst-2' },
          data: { amountPaid: 5000, status: InstallmentStatus.PARTIAL },
        }),
      );
    });
  });

  describe('DefaultersService', () => {
    it('should retrieve defaulters with computed overdue amounts and days', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);

      prismaMock.studentFeePlan.findMany.mockResolvedValue([
        {
          id: 'plan-1',
          studentId: 'student-1',
          totalAmount: 50000,
          student: {
            id: 'student-1',
            rollNumber: 'CS-001',
            user: {
              firstName: 'Alice',
              lastName: 'Smith',
              email: 'alice@test.com',
              phone: '1234567890',
            },
            program: { name: 'Computer Science', code: 'CS' },
            section: { name: 'A' },
          },
          academicYear: { name: '2026-2027' },
          installments: [
            {
              id: 'inst-1',
              amount: 25000,
              amountPaid: 5000,
              dueDate: pastDate,
              status: InstallmentStatus.PENDING,
            },
          ],
        },
      ]);

      const defaulters = await defaultersService.getDefaulters('inst-1');
      expect(defaulters.length).toBe(1);
      expect(defaulters[0].studentId).toBe('student-1');
      expect(defaulters[0].overdueAmount).toBe(20000);
      expect(defaulters[0].daysOverdue).toBeGreaterThanOrEqual(14);
    });
  });
});
