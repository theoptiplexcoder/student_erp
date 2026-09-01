import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReassignFacultyDto {
  @IsNotEmpty()
  @IsUUID()
  entryId!: string;

  @IsNotEmpty()
  @IsUUID()
  facultyId!: string;
}
