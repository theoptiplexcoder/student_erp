import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteProgramDto {
  @IsOptional()
  @IsBoolean()
  deleteBatches?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteSections?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteCourses?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteCurriculums?: boolean;
}
