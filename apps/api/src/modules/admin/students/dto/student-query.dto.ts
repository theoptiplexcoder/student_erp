import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentLifecycleStatus } from '@prisma/client';

export class StudentQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsEnum(StudentLifecycleStatus)
  status?: StudentLifecycleStatus;

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
