import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseScheduleDto {
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @IsDateString()
  examDate!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string; // HH:mm

  @IsNumber()
  durationMinutes!: number;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxMarks?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  passingMarks?: number;
}

export class ScheduleExamDto {
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @IsString()
  @IsNotEmpty()
  termId!: string;

  @IsString()
  @IsNotEmpty()
  examType!: string;

  @IsString()
  @IsOptional()
  examinationTypeId?: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  curriculumId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseScheduleDto)
  courses!: CourseScheduleDto[];
}
