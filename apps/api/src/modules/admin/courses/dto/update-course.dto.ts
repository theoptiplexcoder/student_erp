import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  creditValue?: number;

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  passingMarks?: number;

  @IsOptional()
  @IsBoolean()
  isPractical?: boolean;

  @IsOptional()
  @IsString()
  courseType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  classLevelId?: string;
}
