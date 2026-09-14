import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class GenerateSessionOccurrencesDto {
  @IsString()
  termId!: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsString()
  courseId?: string;
}

export class CancelSessionOccurrenceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RescheduleSessionOccurrenceDto {
  @IsString()
  newDate!: string;

  @IsOptional()
  @IsString()
  newStartTime?: string;

  @IsOptional()
  @IsString()
  newEndTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
