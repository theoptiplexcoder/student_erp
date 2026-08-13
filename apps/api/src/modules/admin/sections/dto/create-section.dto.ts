import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsInt()
  semester?: number;

  @IsNotEmpty()
  @IsInt()
  capacity!: number;

  @IsOptional()
  @IsUUID()
  programId?: string;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsNotEmpty()
  @IsUUID()
  academicYearId!: string;
}
