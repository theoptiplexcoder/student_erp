import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { FacultyEmploymentType, FacultyStatus } from '@prisma/client';

export class CreateFacultyDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  departmentId!: string;

  @IsString()
  teacherCode!: string;

  @IsEnum(FacultyEmploymentType)
  employmentType!: FacultyEmploymentType;

  @IsDateString()
  hireDate!: string;

  @IsOptional()
  @IsEnum(FacultyStatus)
  status?: FacultyStatus;
}
