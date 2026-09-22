import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeStudentProgramDto {
  @IsNotEmpty()
  @IsString()
  programId!: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  usn?: string;
}
