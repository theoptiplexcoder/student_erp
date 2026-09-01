import { IsNotEmpty, IsUUID, IsOptional, IsString, Matches, IsIn } from 'class-validator';
import { TimetableDay } from '@prisma/client';
import { IsAfterTimeConstraint } from './is-after-time.decorator';

export class CreateTimetableEntryDto {
  @IsNotEmpty()
  @IsUUID()
  termId!: string;

  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsUUID()
  facultyId!: string;

  @IsNotEmpty()
  @IsUUID()
  sectionId!: string;

  @IsNotEmpty()
  @IsIn([
    TimetableDay.MONDAY,
    TimetableDay.TUESDAY,
    TimetableDay.WEDNESDAY,
    TimetableDay.THURSDAY,
    TimetableDay.FRIDAY,
    TimetableDay.SATURDAY,
    TimetableDay.SUNDAY,
  ])
  dayOfWeek!: TimetableDay;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  @IsAfterTimeConstraint('startTime')
  endTime!: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsOptional()
  @IsUUID()
  lessonPlanId?: string;

  @IsOptional()
  @IsUUID()
  timetableId?: string;
}
