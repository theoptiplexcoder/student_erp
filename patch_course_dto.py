import re

with open("apps/api/src/modules/academic/dto/curriculum-course.dto.ts", "r") as f:
    content = f.read()

content = content.replace("prerequisiteCourseIds?: string[];\n}", "prerequisiteCourseIds?: string[];\n\n  @IsOptional()\n  @IsString()\n  electiveGroupId?: string;\n}")

with open("apps/api/src/modules/academic/dto/curriculum-course.dto.ts", "w") as f:
    f.write(content)
