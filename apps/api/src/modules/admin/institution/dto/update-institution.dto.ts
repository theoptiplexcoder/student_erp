import { IsString, IsOptional, IsEnum } from 'class-validator';
import { InstitutionType } from '@prisma/client';

export class UpdateInstitutionDto {
  @IsEnum(InstitutionType)
  @IsOptional()
  institutionType?: InstitutionType;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
