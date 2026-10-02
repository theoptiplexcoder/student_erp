import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BulkDepartmentDto {
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() name!: string;
}

export class BulkCourseDto {
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsNumber() credits!: number;
  @IsString() @IsNotEmpty() departmentCode!: string;
  @IsOptional() @IsString() type?: string;
}

export class BulkProgramDto {
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() level!: string;
  @IsInt() durationYears!: number;
  @IsString() @IsNotEmpty() departmentCode!: string;
}

export class BulkSectionDto {
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsInt() capacity!: number;
  @IsOptional() @IsString() academicYearCode?: string;
}

export class BulkTermCourseDto {
  @IsString() @IsNotEmpty() courseCode!: string;
  @IsBoolean() isMandatory!: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) prerequisites?: string[];
}

export class BulkTermDto {
  @IsInt() sequence!: number;
  @IsString() @IsNotEmpty() name!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTermCourseDto)
  courses!: BulkTermCourseDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSectionDto)
  sections!: BulkSectionDto[];
}

export class BulkCurriculumDto {
  @IsString() @IsNotEmpty() programCode!: string;
  @IsString() @IsNotEmpty() curriculumName!: string;
  @IsOptional() @IsString() versionNumber?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => BulkTermDto) terms!: BulkTermDto[];
}

export class BulkAcademicImportDto {
  @IsOptional() @IsString() academicYearCode?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkDepartmentDto)
  departments!: BulkDepartmentDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => BulkCourseDto) courses!: BulkCourseDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProgramDto)
  programs!: BulkProgramDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCurriculumDto)
  curriculums!: BulkCurriculumDto[];
}
