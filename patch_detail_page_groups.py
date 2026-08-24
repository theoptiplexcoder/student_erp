import re

with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx", "r") as f:
    content = f.read()

elective_group_display = """
                  {term.electiveGroups?.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h4 className="text-sm font-semibold">Elective Groups</h4>
                      <div className="flex flex-wrap gap-2">
                        {term.electiveGroups.map((eg: any) => (
                          <Badge key={eg.id} variant="secondary">
                            {eg.name} 
                            {eg.requiredCredits > 0 ? ` (${eg.requiredCredits}cr)` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {term.curriculumCourses?.length > 0 ? (
"""
content = content.replace("{term.curriculumCourses?.length > 0 ? (", elective_group_display)

content = content.replace("<TableHead>Type</TableHead>", "<TableHead>Type</TableHead>\n                          <TableHead>Group</TableHead>")
content = content.replace("</Badge>\n                            </TableCell>", "</Badge>\n                            </TableCell>\n                            <TableCell>{cc.electiveGroupId ? term.electiveGroups?.find((g: any) => g.id === cc.electiveGroupId)?.name : '-'}</TableCell>")

with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx", "w") as f:
    f.write(content)
