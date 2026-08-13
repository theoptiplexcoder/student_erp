import { IsObject, IsOptional } from 'class-validator';

export class UpdateInstitutionSettingsDto {
  @IsObject()
  @IsOptional()
  branding?: Record<string, any>;
}
