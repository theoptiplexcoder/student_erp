import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { InstitutionType } from '@prisma/client';

export class RegisterInstitutionDto {
  // Institution details
  @IsEnum(InstitutionType)
  @IsNotEmpty()
  institutionType!: InstitutionType;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // Admin / Tenant User details
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsOptional()
  adminPhone?: string;
}
