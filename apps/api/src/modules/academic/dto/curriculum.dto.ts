import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { CurriculumStatus } from '@prisma/client';

export class CreateCurriculumDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  programIds?: string[];

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  versionNumber?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  effectiveFrom!: string;
}

export class UpdateCurriculumDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  versionNumber?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsEnum(CurriculumStatus)
  status?: CurriculumStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  programIds?: string[];
}
