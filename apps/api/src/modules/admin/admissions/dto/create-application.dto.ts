import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  programId!: string;

  @IsUUID()
  academicYearId!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
