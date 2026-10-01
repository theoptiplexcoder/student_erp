import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsArray, Min } from 'class-validator';
import { PaymentMode } from '@prisma/client';

export class GenerateFeePlanDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  academicYearId!: string;

  @IsUUID()
  @IsOptional()
  feeStructureId?: string;

  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;

  /** Number of installments (preferred field from admin UI) */
  @IsNumber()
  @Min(1)
  @IsOptional()
  customInstallmentCount?: number;

  /** Legacy alias — kept for backward compatibility */
  @IsNumber()
  @Min(1)
  @IsOptional()
  installmentCount?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  optionalComponentIds?: string[];

  /** ISO date string for the first installment due date */
  @IsString()
  @IsOptional()
  customFirstDueDate?: string;

  /** Legacy alias — array of due-date strings, one per installment */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customDueDates?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  customTotalAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  discountReason?: string;
}
