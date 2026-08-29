import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { FacultyEmploymentType, FacultyStatus } from '@prisma/client';

export class UpdateFacultyDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  teacherCode?: string;

  @IsOptional()
  @IsEnum(FacultyEmploymentType)
  employmentType?: FacultyEmploymentType;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  exitDate?: string;

  @IsOptional()
  @IsEnum(FacultyStatus)
  status?: FacultyStatus;
}
