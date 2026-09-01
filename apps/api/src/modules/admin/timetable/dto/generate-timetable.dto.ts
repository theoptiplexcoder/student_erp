import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  ArrayMinSize,
  IsString,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHoursDto {
  @IsString()
  start!: string;

  @IsString()
  end!: string;
}

export class GenerateTimetableDto {
  @IsNotEmpty()
  @IsUUID()
  termId!: string;

  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  sectionIds!: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  defaultSessionDuration?: number; // minutes, default 50

  @IsOptional()
  sessionDurations?: Record<string, number>; // courseId -> minutes override

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;
}
