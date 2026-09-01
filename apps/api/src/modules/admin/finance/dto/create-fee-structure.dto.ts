import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeComponentType } from '@prisma/client';

export class CreateFeeComponentDto {
  @IsString()
  name!: string;

  @IsEnum(FeeComponentType)
  type!: FeeComponentType;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateFeeStructureDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsUUID()
  academicYearId!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeeComponentDto)
  components!: CreateFeeComponentDto[];
}
