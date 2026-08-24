import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCurriculumTermDto {
  @IsString()
  @IsNotEmpty()
  curriculumId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditRequirement?: number;
}

export class UpdateCurriculumTermDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditRequirement?: number;
}
