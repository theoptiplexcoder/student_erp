import { IsString, IsOptional, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @IsUUID()
  paymentId!: string;

  @IsString()
  @IsOptional()
  gatewayOrderId?: string;

  @IsString()
  @IsOptional()
  gatewayPaymentId?: string;

  @IsString()
  @IsOptional()
  gatewaySignature?: string;
}
