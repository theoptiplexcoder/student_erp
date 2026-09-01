import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsArray, Min } from 'class-validator';
import { PaymentMode } from '@prisma/client';

export class GenerateFeePlanDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  academicYearId!: string;

  @IsUUID()
  @IsOptional()
  feeStructureId?: string;

  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;

  @IsNumber()
  @Min(1)
  @IsOptional()
  installmentCount?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  optionalComponentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customDueDates?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  customTotalAmount?: number;
}
