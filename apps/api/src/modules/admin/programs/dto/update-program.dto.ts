import { IsString, IsOptional, IsEnum, IsInt, Min, IsUUID, IsArray } from 'class-validator';
import { ProgramLevel } from '@prisma/client';

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(ProgramLevel)
  level?: ProgramLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationYears?: number;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds?: string[];
}
