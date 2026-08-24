import re

with open("libs/database/prisma/schema.prisma", "r") as f:
    content = f.read()

# Add to Institution
content = content.replace("curriculumTerms        CurriculumTerm[]", "curriculumTerms        CurriculumTerm[]\n  curriculumElectiveGroups CurriculumElectiveGroup[]")

# Add to CurriculumTerm
content = content.replace("curriculumCourses CurriculumCourse[]", "curriculumCourses CurriculumCourse[]\n  electiveGroups    CurriculumElectiveGroup[]")

# Add to CurriculumCourse
course_model_regex = r"(model CurriculumCourse \{[\s\S]*?)(createdAt)"
new_course_fields = r"\1electiveGroupId  String?  @map(\"elective_group_id\") @db.Uuid\n  electiveGroup    CurriculumElectiveGroup? @relation(fields: [electiveGroupId], references: [id], onDelete: SetNull)\n\n  createdAt"
content = re.sub(course_model_regex, new_course_fields, content)

# Add CurriculumElectiveGroup model
new_model = """
model CurriculumElectiveGroup {
  id               String   @id @default(uuid()) @db.Uuid
  institutionId    String   @map("institution_id") @db.Uuid
  curriculumTermId String   @map("curriculum_term_id") @db.Uuid
  name             String
  requiredCredits  Float?   @map("required_credits")
  requiredCourses  Int?     @map("required_courses")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  institution      Institution      @relation(fields: [institutionId], references: [id])
  curriculumTerm   CurriculumTerm   @relation(fields: [curriculumTermId], references: [id], onDelete: Cascade)
  courses          CurriculumCourse[]

  @@unique([curriculumTermId, name])
  @@index([institutionId])
  @@map("curriculum_elective_groups")
}
"""

content = content.replace('model CurriculumCourse {', new_model + '\nmodel CurriculumCourse {')

with open("libs/database/prisma/schema.prisma", "w") as f:
    f.write(content)
