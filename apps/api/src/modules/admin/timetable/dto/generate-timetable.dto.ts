import { IsNotEmpty, IsUUID, IsOptional, ArrayMinSize, IsString } from 'class-validator';

export class GenerateTimetableDto {
  @IsNotEmpty()
  @IsUUID()
  termId!: string;

  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  sectionIds!: string[];

  @IsOptional()
  @IsString()
  name?: string;
}
