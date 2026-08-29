import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseAssignmentDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  sectionId!: string;

  @IsUUID()
  termId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
