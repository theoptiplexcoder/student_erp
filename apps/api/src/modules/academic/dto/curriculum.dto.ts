import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { CurriculumStatus } from '@prisma/client';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  programId!: string;

  @IsString()
  @IsNotEmpty()
  versionNumber!: string;

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
}
