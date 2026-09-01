import { Module } from '@nestjs/common';
import { FinanceController } from './controllers/finance.controller';
import { StudentFinanceController } from './controllers/student-finance.controller';
import { FeeStructureService } from './services/fee-structure.service';
import { FeePlanService } from './services/fee-plan.service';
import { PaymentService } from './services/payment.service';
import { DefaultersService } from './services/defaulters.service';

@Module({
  controllers: [FinanceController, StudentFinanceController],
  providers: [FeeStructureService, FeePlanService, PaymentService, DefaultersService],
  exports: [FeeStructureService, FeePlanService, PaymentService, DefaultersService],
})
export class FinanceModule {}
