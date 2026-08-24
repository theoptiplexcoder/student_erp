import re

with open("apps/api/src/modules/academic/dto/curriculum-operations.dto.ts", "r") as f:
    content = f.read()

elective_group_dto = """
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
"""

content = content.replace("export class ImportCourseDto {", elective_group_dto + "\nexport class ImportCourseDto {")
content = content.replace("isMandatory?: boolean;", "isMandatory?: boolean;\n\n  @IsOptional()\n  @IsString()\n  electiveGroupName?: string;")
content = content.replace("courses!: ImportCourseDto[];", "courses!: ImportCourseDto[];\n\n  @IsOptional()\n  @IsArray()\n  @ValidateNested({ each: true })\n  @Type(() => ImportElectiveGroupDto)\n  electiveGroups?: ImportElectiveGroupDto[];")

with open("apps/api/src/modules/academic/dto/curriculum-operations.dto.ts", "w") as f:
    f.write(content)
