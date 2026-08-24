import re

with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/new/page.tsx", "r") as f:
    content = f.read()

# Make sure we import the elective group hooks
content = content.replace("useActivateCurriculum \n}", "useActivateCurriculum,\n  useCreateElectiveGroup,\n  useDeleteElectiveGroup\n}")

# Inject ElectiveGroupsManager inside TermCoursesManager
elective_group_manager = """
function ElectiveGroupsManager({ curriculumId, term }: { curriculumId: string, term: any }) {
  const createGroup = useCreateElectiveGroup();
  const deleteGroup = useDeleteElectiveGroup();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createGroup.mutateAsync({
      curriculumId,
      data: {
        curriculumTermId: term.id,
        name: formData.get('name'),
        requiredCredits: parseFloat(formData.get('requiredCredits') as string) || 0,
        requiredCourses: parseInt(formData.get('requiredCourses') as string, 10) || 0,
      }
    });
    e.currentTarget.reset();
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-sm font-semibold mb-3">Elective Groups</h4>
      
      <form onSubmit={handleAdd} className="flex gap-2 items-end mb-4 bg-muted/20 p-3 rounded-md">
        <div className="space-y-1 flex-1">
          <Label className="text-xs">Group Name</Label>
          <Input name="name" required placeholder="e.g. Science Electives" className="h-8" />
        </div>
        <div className="space-y-1 w-24">
          <Label className="text-xs">Req. Credits</Label>
          <Input name="requiredCredits" type="number" step="0.5" defaultValue={0} className="h-8" />
        </div>
        <div className="space-y-1 w-24">
          <Label className="text-xs">Req. Courses</Label>
          <Input name="requiredCourses" type="number" defaultValue={0} className="h-8" />
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={createGroup.isPending}>Add Group</Button>
      </form>

      <div className="space-y-2">
        {term.electiveGroups?.map((eg: any) => (
          <div key={eg.id} className="flex justify-between items-center p-2 border rounded text-sm">
            <div>
              <span className="font-semibold">{eg.name}</span>
              <span className="ml-2 text-muted-foreground">
                (Req: {eg.requiredCredits > 0 ? `${eg.requiredCredits} credits` : ''} 
                {eg.requiredCredits > 0 && eg.requiredCourses > 0 ? ' / ' : ''}
                {eg.requiredCourses > 0 ? `${eg.requiredCourses} courses` : ''})
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => deleteGroup.mutate({ id: eg.id, curriculumId })}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

content = content.replace("function TermCoursesManager", elective_group_manager + "\nfunction TermCoursesManager")

# Inject ElectiveGroupsManager render and electiveGroup select in TermCoursesManager
select_elective_group = """
            <div className="space-y-1">
              <Label className="text-xs">Elective Group (Optional)</Label>
              <select name="electiveGroupId" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="">-- None (Mandatory / Standalone) --</option>
                {term.electiveGroups?.map((eg: any) => (
                  <option key={eg.id} value={eg.id}>{eg.name}</option>
                ))}
              </select>
            </div>
"""

content = content.replace("<Button type=\"submit\"", select_elective_group + "\n            <Button type=\"submit\"")

# Add electiveGroupId to payload
payload_update = """        isMandatory: formData.get('isMandatory') === 'on',
        electiveGroupId: formData.get('electiveGroupId') || undefined,
"""
content = content.replace("isMandatory: formData.get('isMandatory') === 'on',", payload_update)


# Add ElectiveGroupsManager at the end of TermCoursesManager return
content = content.replace("</div>\n  );\n}", "</div>\n\n      <ElectiveGroupsManager curriculumId={curriculumId} term={term} />\n    </div>\n  );\n}")


with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/new/page.tsx", "w") as f:
    f.write(content)

