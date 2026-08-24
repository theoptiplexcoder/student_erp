import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCurriculumElectiveGroupDto {
  @IsString()
  @IsNotEmpty()
  curriculumTermId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredCredits?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredCourses?: number;
}

export class UpdateCurriculumElectiveGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredCredits?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredCourses?: number;
}
