import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  buildingId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  number!: string;

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
