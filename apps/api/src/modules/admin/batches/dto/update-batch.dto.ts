import { IsDateString, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  admissionYear?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @IsOptional()
  @IsUUID()
  programId?: string;
}
