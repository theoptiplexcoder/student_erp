import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBuildingDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  floors?: number;
}
