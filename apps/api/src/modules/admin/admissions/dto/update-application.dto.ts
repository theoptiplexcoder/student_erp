import { ApplicationStatus } from '@prisma/client';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsBoolean()
  @IsOptional()
  isFeePaid?: boolean;
}
