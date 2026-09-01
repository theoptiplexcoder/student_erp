import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { Roles } from '../../../../decorators/roles.decorator';
import { FeeStructureService } from '../services/fee-structure.service';
import { FeePlanService } from '../services/fee-plan.service';
import { PaymentService } from '../services/payment.service';
import { DefaultersService } from '../services/defaulters.service';
import { CreateFeeStructureDto } from '../dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from '../dto/update-fee-structure.dto';
import { GenerateFeePlanDto } from '../dto/generate-fee-plan.dto';
import { RecordOfflinePaymentDto } from '../dto/record-offline-payment.dto';
import { ApplyWaiverDto } from '../dto/apply-waiver.dto';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Controller('admin/finance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FinanceController {
  constructor(
    private readonly feeStructureService: FeeStructureService,
    private readonly feePlanService: FeePlanService,
    private readonly paymentService: PaymentService,
    private readonly defaultersService: DefaultersService,
  ) {}

  // 1. Dashboard Stats
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.defaultersService.getFinanceStats(req.user.institutionId);
  }

  // 2. Fee Structures CRUD
  @Post('fee-structures')
  async createFeeStructure(@Request() req: any, @Body() dto: CreateFeeStructureDto) {
    return this.feeStructureService.create(req.user.institutionId, dto);
  }

  @Get('fee-structures')
  async getFeeStructures(
    @Request() req: any,
    @Query('programId') programId?: string,
    @Query('batchId') batchId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.feeStructureService.findAll(req.user.institutionId, {
      programId,
      batchId,
      academicYearId,
      isActive: activeBool,
    });
  }

  @Get('fee-structures/:id')
  async getFeeStructure(@Request() req: any, @Param('id') id: string) {
    return this.feeStructureService.findOne(req.user.institutionId, id);
  }

  @Put('fee-structures/:id')
  async updateFeeStructure(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.feeStructureService.update(req.user.institutionId, id, dto);
  }

  @Delete('fee-structures/:id')
  async deleteFeeStructure(@Request() req: any, @Param('id') id: string) {
    return this.feeStructureService.remove(req.user.institutionId, id);
  }

  // 3. Fee Plans
  @Post('fee-plans/generate')
  async generateFeePlan(@Request() req: any, @Body() dto: GenerateFeePlanDto) {
    return this.feePlanService.generateStudentFeePlan(req.user.institutionId, dto);
  }

  @Get('fee-plans')
  async getFeePlans(
    @Request() req: any,
    @Query('studentId') studentId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('programId') programId?: string,
    @Query('batchId') batchId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.feePlanService.findAll(req.user.institutionId, {
      studentId,
      academicYearId,
      programId,
      batchId,
      status,
      search,
    });
  }

  @Get('fee-plans/:id')
  async getFeePlan(@Request() req: any, @Param('id') id: string) {
    return this.feePlanService.findOne(req.user.institutionId, id);
  }

  // 4. Waivers
  @Post('waivers')
  async applyWaiver(@Request() req: any, @Body() dto: ApplyWaiverDto) {
    return this.feePlanService.applyWaiver(req.user.institutionId, req.user.id, dto);
  }

  // 5. Payments
  @Post('payments/offline')
  async recordOfflinePayment(@Request() req: any, @Body() dto: RecordOfflinePaymentDto) {
    return this.paymentService.recordOfflinePayment(req.user.institutionId, req.user.id, dto);
  }

  @Get('payments')
  async getPayments(
    @Request() req: any,
    @Query('studentId') studentId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentService.getPaymentsList(req.user.institutionId, {
      studentId,
      status,
      paymentMethod,
      startDate,
      endDate,
    });
  }

  @Get('payments/:id/receipt')
  async getPaymentReceipt(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.getPaymentReceipt(req.user.institutionId, id);
  }

  // 6. Defaulters
  @Get('defaulters')
  async getDefaulters(
    @Request() req: any,
    @Query('programId') programId?: string,
    @Query('batchId') batchId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('search') search?: string,
  ) {
    return this.defaultersService.getDefaulters(req.user.institutionId, {
      programId,
      batchId,
      academicYearId,
      search,
    });
  }

  @Post('defaulters/action')
  async applyDefaulterAction(
    @Request() req: any,
    @Body()
    dto: { studentId: string; action: 'SEND_REMINDER' | 'RESTRICT_PORTAL' | 'MARK_OVERDUE' },
  ) {
    return this.defaultersService.applyDefaulterAction(req.user.institutionId, dto);
  }

  @Post('defaulters/process-overdue')
  async processOverdue(@Request() req: any) {
    return this.defaultersService.processOverdueInstallments(req.user.institutionId);
  }
}
