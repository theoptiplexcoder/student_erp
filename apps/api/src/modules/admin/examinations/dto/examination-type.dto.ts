import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateExaminationTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0)
  totalMarks!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  passingMarks?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateExaminationTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalMarks?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  passingMarks?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
