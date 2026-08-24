import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DuplicateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  versionNumber!: string;

  @IsDateString()
  @IsNotEmpty()
  effectiveFrom!: string;
}

export class ImportElectiveGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  requiredCredits?: number;

  @IsOptional()
  @IsNumber()
  requiredCourses?: number;
}

export class ImportCourseDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  sequence!: number;

  @IsOptional()
  @IsNumber()
  creditValue?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsString()
  electiveGroupName?: string;
}

export class ImportTermDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  sequence!: number;

  @IsOptional()
  @IsNumber()
  creditRequirement?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportCourseDto)
  courses!: ImportCourseDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportElectiveGroupDto)
  electiveGroups?: ImportElectiveGroupDto[];
}

export class ImportCurriculumDto {
  @IsString()
  @IsNotEmpty()
  programId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  versionNumber!: string;

  @IsDateString()
  effectiveFrom!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTermDto)
  terms!: ImportTermDto[];
}
