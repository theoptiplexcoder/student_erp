import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseAssignmentDto {
  @IsUUID()
  facultyId!: string;

  @IsUUID()
  courseId!: string;

  @IsUUID()
  sectionId!: string;

  @IsUUID()
  termId!: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
