import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ProgramLevel } from '@prisma/client';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(ProgramLevel)
  level!: ProgramLevel;

  @IsInt()
  @Min(1)
  durationYears!: number;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds?: string[];
}
