import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListOnboardingRequestsDto {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'ACTIVE', 'APPROVED', 'REJECTED', 'ALL'])
  status?: string;
}
