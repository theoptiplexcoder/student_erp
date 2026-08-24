import re

with open("apps/api/src/modules/academic/services/curriculums.service.ts", "r") as f:
    content = f.read()

# Add elective groups to export
content = content.replace("include: {\n            curriculumCourses: {", "include: {\n            electiveGroups: true,\n            curriculumCourses: {")
content = content.replace("terms: existing.curriculumTerms.map(term => ({\n        name: term.name,\n        sequence: term.sequence,\n        creditRequirement: term.creditRequirement,", "terms: existing.curriculumTerms.map(term => ({\n        name: term.name,\n        sequence: term.sequence,\n        creditRequirement: term.creditRequirement,\n        electiveGroups: term.electiveGroups.map(eg => ({\n          name: eg.name,\n          requiredCredits: eg.requiredCredits,\n          requiredCourses: eg.requiredCourses\n        })),")
content = content.replace("isMandatory: cc.isMandatory\n        }))", "isMandatory: cc.isMandatory,\n          electiveGroupName: cc.electiveGroupId ? term.electiveGroups.find(eg => eg.id === cc.electiveGroupId)?.name : null\n        }))")

# Add elective groups to import
import_term_logic = """
        const term = await tx.curriculumTerm.create({
          data: {
            institutionId,
            curriculumId: curriculum.id,
            name: termDto.name,
            sequence: termDto.sequence,
            creditRequirement: termDto.creditRequirement,
          }
        });

        const createdGroups: Record<string, string> = {};
        if (termDto.electiveGroups) {
          for (const eg of termDto.electiveGroups) {
            const group = await tx.curriculumElectiveGroup.create({
              data: {
                institutionId,
                curriculumTermId: term.id,
                name: eg.name,
                requiredCredits: eg.requiredCredits,
                requiredCourses: eg.requiredCourses,
              }
            });
            createdGroups[group.name] = group.id;
          }
        }
"""
content = re.sub(r"const term = await tx\.curriculumTerm\.create\(\{[\s\S]*?\}\);", import_term_logic, content)

content = content.replace("isMandatory: courseDto.isMandatory ?? true,", "isMandatory: courseDto.isMandatory ?? true,\n              electiveGroupId: courseDto.electiveGroupName ? createdGroups[courseDto.electiveGroupName] : null,")

with open("apps/api/src/modules/academic/services/curriculums.service.ts", "w") as f:
    f.write(content)

