import { IsString, IsNotEmpty } from 'class-validator';

export class SwapSlotsDto {
  @IsString()
  @IsNotEmpty()
  entryIdA!: string;

  @IsString()
  @IsNotEmpty()
  entryIdB!: string;
}
