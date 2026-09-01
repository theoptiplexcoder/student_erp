import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { WaiverType } from '@prisma/client';

export class ApplyWaiverDto {
  @IsUUID()
  studentFeePlanId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(WaiverType)
  @IsOptional()
  waiverType?: WaiverType;

  @IsString()
  @IsOptional()
  reason?: string;
}
