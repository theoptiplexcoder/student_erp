import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class InstallmentAllocationItemDto {
  @IsUUID()
  installmentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class RecordOfflinePaymentDto {
  @IsUUID()
  studentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstallmentAllocationItemDto)
  installmentAllocations?: InstallmentAllocationItemDto[];
}
