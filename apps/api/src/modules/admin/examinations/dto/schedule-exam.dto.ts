import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsDateString,
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
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseScheduleDto)
  courses!: CourseScheduleDto[];
}
