import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceRecordDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAttendanceSessionDto {
  @IsString()
  date!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}

export class UpdateAttendanceSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}

export class MarkDto {
  @IsUUID()
  studentId!: string;

  @IsNumber()
  marksObtained!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class SaveMarksDto {
  @IsUUID()
  examCourseId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkDto)
  marks!: MarkDto[];
}
