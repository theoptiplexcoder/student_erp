import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsEnum,
  IsArray,
} from 'class-validator';
import { TeachingMethod, LessonPlanStatus } from '@prisma/client';

export class CreateLessonPlanDto {
  @IsUUID()
  termId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @IsDateString()
  plannedDate: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsEnum(TeachingMethod)
  teachingMethod: TeachingMethod;

  @IsOptional()
  @IsEnum(LessonPlanStatus)
  status?: LessonPlanStatus;

  @IsOptional()
  learningObjectives?: any;

  @IsOptional()
  teachingPlan?: any;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  resourceIds?: string[];
}

export class UpdateLessonPlanDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(TeachingMethod)
  teachingMethod?: TeachingMethod;

  @IsOptional()
  @IsEnum(LessonPlanStatus)
  status?: LessonPlanStatus;

  @IsOptional()
  learningObjectives?: any;

  @IsOptional()
  teachingPlan?: any;

  @IsOptional()
  @IsString()
  teachingNotes?: string;

  @IsOptional()
  @IsString()
  reflectionNotes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  resourceIds?: string[];
}
