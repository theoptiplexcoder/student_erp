import { IsString, IsDateString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { TermType, AcademicTermStatus } from '@prisma/client';

export class CreateAcademicTermDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsInt()
  @IsOptional()
  semester?: number;

  @IsEnum(TermType)
  @IsOptional()
  termType?: TermType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsEnum(AcademicTermStatus)
  @IsOptional()
  status?: AcademicTermStatus;
}

export class UpdateAcademicTermDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @IsOptional()
  semester?: number;

  @IsEnum(TermType)
  @IsOptional()
  termType?: TermType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(AcademicTermStatus)
  @IsOptional()
  status?: AcademicTermStatus;
}
