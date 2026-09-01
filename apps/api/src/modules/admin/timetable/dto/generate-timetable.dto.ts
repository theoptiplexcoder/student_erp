import { IsNotEmpty, IsUUID, IsOptional, ArrayMinSize, IsString, IsNumber, Min, Max } from 'class-validator';

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
  defaultSessionDuration?: number; // minutes, default 60

  @IsOptional()
  sessionDurations?: Record<string, number>; // courseId -> minutes override
}
