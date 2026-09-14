import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateInstitutionSettingsDto {
  @IsObject()
  @IsOptional()
  branding?: Record<string, any>;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  closingTime?: string;

  @IsBoolean()
  @IsOptional()
  enableAdmissions?: boolean;

  @IsBoolean()
  @IsOptional()
  autoApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}
