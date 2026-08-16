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

export class InstallmentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class FeePlanDto {
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsString()
  currency!: string;

  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;

  @IsNumber()
  @IsOptional()
  installmentsCount?: number;

  @ValidateNested({ each: true })
  @Type(() => InstallmentDto)
  @IsOptional()
  installments?: InstallmentDto[];
}

export class PreviousEducationDto {
  @IsString()
  @IsNotEmpty()
  institutionName!: string;

  @IsString()
  @IsNotEmpty()
  academicYear!: string;
}

export class DocumentDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  size?: number;
}

export class AccomplishmentDto {
  @IsString()
  @IsNotEmpty()
  type!: 'PROJECT' | 'WORKSHOP' | 'CERTIFICATE' | 'PUBLICATION' | 'PATENT';

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  issuer?: string;
}

export class CreateDirectAdmissionDto {
  // Student Info
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

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

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ValidateNested({ each: true })
  @Type(() => AccomplishmentDto)
  @IsOptional()
  accomplishments?: AccomplishmentDto[];

  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  @IsOptional()
  documents?: DocumentDto[];

  @ValidateNested({ each: true })
  @Type(() => PreviousEducationDto)
  @IsOptional()
  previousEducation?: PreviousEducationDto[];

  // Family Info
  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  fatherPhone?: string;

  @IsString()
  @IsOptional()
  motherPhone?: string;

  @IsEmail()
  @IsOptional()
  fatherEmail?: string;

  @IsEmail()
  @IsOptional()
  motherEmail?: string;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  // Academic
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  sectionId?: string;

  @IsString()
  @IsNotEmpty()
  usn!: string;

  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  // Fee
  @ValidateNested()
  @Type(() => FeePlanDto)
  @IsOptional()
  feePlan?: FeePlanDto;
}
