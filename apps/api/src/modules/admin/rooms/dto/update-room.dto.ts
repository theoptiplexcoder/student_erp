import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  buildingId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(['CLASSROOM', 'LAB', 'LECTURE_HALL', 'OFFICE', 'CONFERENCE', 'OTHER'])
  roomType?: string;
}
