import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { Roles } from '../../../../decorators/roles.decorator';
import { PrismaService } from '../../../../database/prisma.service';
import { FeePlanService } from '../services/fee-plan.service';
import { PaymentService } from '../services/payment.service';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { UserRole } from '@prisma/client';

@Controller('student/finance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentFinanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feePlanService: FeePlanService,
    private readonly paymentService: PaymentService,
  ) {}

  private async getStudentForUser(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  @Get('my-dues')
  async getMyDues(@Request() req: any) {
    const student = await this.getStudentForUser(req.user.id, req.user.institutionId);
    return this.feePlanService.getStudentDues(req.user.institutionId, student.id);
  }

  @Post('payments/initiate')
  async initiatePayment(@Request() req: any, @Body() dto: InitiatePaymentDto) {
    const student = await this.getStudentForUser(req.user.id, req.user.institutionId);
    return this.paymentService.initiateOnlinePayment(req.user.institutionId, student.id, dto);
  }

  @Post('payments/verify')
  async verifyPayment(@Request() req: any, @Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyOnlinePayment(req.user.institutionId, dto);
  }

  @Get('my-payments')
  async getMyPayments(@Request() req: any) {
    const student = await this.getStudentForUser(req.user.id, req.user.institutionId);
    return this.paymentService.getPaymentsList(req.user.institutionId, {
      studentId: student.id,
    });
  }

  @Get('payments/:id/receipt')
  async getPaymentReceipt(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.getPaymentReceipt(req.user.institutionId, id);
  }
}
