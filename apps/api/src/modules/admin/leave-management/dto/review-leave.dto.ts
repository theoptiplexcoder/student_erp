import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum LeaveReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewLeaveDto {
  @IsEnum(LeaveReviewAction)
  action!: LeaveReviewAction;

  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsOptional()
  @IsUUID()
  substituteFacultyId?: string;

  @IsOptional()
  @IsString()
  substituteNote?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  substituteSessionIds?: string[];
}
