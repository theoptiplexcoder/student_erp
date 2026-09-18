import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOnboardingDto {
  @IsString()
  @IsNotEmpty({ message: 'Reason for rejection is required' })
  reason!: string;
}
