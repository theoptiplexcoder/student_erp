import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateFacultySectionDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
