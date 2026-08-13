import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsUUID } from 'class-validator';
import { CalendarEventType } from '@prisma/client';

export class CreateCalendarEventDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CalendarEventType)
  eventType!: CalendarEventType;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;
}

export class UpdateCalendarEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CalendarEventType)
  @IsOptional()
  eventType?: CalendarEventType;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;
}
