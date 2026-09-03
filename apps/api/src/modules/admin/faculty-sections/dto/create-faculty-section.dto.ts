import { IsUUID, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateFacultySectionDto {
  @IsUUID()
  facultyId!: string;

  @IsUUID()
  sectionId!: string;

  @IsString()
  @MaxLength(100)
  role!: string; // "TEACHER" | "CLASS_TEACHER" | custom role name

  @IsUUID()
  academicYearId!: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
