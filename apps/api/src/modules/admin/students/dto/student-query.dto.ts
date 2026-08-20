import { IsOptional, IsString, IsEnum, IsInt, Min, IsBoolean, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StudentLifecycleStatus, Gender } from '@prisma/client';

export class StudentQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsOptional()
  @IsEnum(StudentLifecycleStatus)
  status?: StudentLifecycleStatus;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  admissionDateFrom?: string;

  @IsOptional()
  @IsDateString()
  admissionDateTo?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  guardianLinked?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
