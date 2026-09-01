import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class BulkDeleteTimetableDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  entryIds!: string[];
}
