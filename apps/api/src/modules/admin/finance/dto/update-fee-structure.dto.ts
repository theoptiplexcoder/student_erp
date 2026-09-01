import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeeComponentDto } from './create-fee-structure.dto';

export class UpdateFeeStructureDto {
  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  academicYearId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFeeComponentDto)
  components?: CreateFeeComponentDto[];
}
