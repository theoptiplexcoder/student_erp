import { IsArray, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InitiatePaymentDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  installmentIds!: string[];

  @IsNumber()
  @Min(1)
  amount!: number;
}
