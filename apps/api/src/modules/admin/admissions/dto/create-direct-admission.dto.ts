import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, PaymentMode } from '@prisma/client';

export class FeePlanDto {
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsString()
  currency!: string;

  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;
}

export class CreateDirectAdmissionDto {
  // Student Info
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // Guardian
  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  fatherPhone?: string;

  // Academic
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  sectionId?: string;

  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  // Fee
  @ValidateNested()
  @Type(() => FeePlanDto)
  @IsOptional()
  feePlan?: FeePlanDto;
}
