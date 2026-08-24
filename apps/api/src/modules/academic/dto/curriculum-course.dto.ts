import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCourseDto } from '../../admin/courses/dto/create-course.dto';

export class CreateCurriculumCourseDto {
  @IsString()
  @IsNotEmpty()
  curriculumTermId!: string;

  @IsOptional()
  @IsString()
  curriculumId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  // Either courseId must be provided OR newCourse must be provided
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCourseDto)
  newCourse?: CreateCourseDto;

  @IsNumber()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditValue?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisiteCourseIds?: string[];

  @IsOptional()
  @IsString()
  electiveGroupId?: string;
}

export class UpdateCurriculumCourseDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditValue?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisiteCourseIds?: string[];

  @IsOptional()
  @IsString()
  electiveGroupId?: string;
}
