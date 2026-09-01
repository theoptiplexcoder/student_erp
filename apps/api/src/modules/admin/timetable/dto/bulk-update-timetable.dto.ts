import { IsNotEmpty, IsUUID, IsOptional, ArrayMinSize, ValidateNested, IsString, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { TimetableDay } from '@prisma/client';

export class TimetableUpdatesDto {
  @IsOptional()
  @IsIn([
    TimetableDay.MONDAY,
    TimetableDay.TUESDAY,
    TimetableDay.WEDNESDAY,
    TimetableDay.THURSDAY,
    TimetableDay.FRIDAY,
    TimetableDay.SATURDAY,
    TimetableDay.SUNDAY,
  ])
  dayOfWeek?: TimetableDay;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;
}

export class BulkUpdateTimetableDto {
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  entryIds!: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TimetableUpdatesDto)
  updates!: TimetableUpdatesDto;
}
