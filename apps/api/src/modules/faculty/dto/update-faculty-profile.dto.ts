import { IsOptional, IsString } from 'class-validator';

export class UpdateFacultyProfileDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
