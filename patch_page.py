import re

with open('apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx', 'r') as f:
    content = f.read()

# Add import for AddCourseDialog
if "import { AddCourseDialog } from './add-course-dialog';" not in content:
    content = content.replace("import { CurriculumActions } from './curriculum-actions';", "import { CurriculumActions } from './curriculum-actions';\nimport { AddCourseDialog } from './add-course-dialog';")

# Compute totals
total_logic = """
  let totalCourses = 0;
  let totalCredits = 0;

  curriculum.curriculumTerms?.forEach((term: any) => {
    term.curriculumCourses?.forEach((cc: any) => {
      totalCourses++;
      totalCredits += (cc.creditValue || cc.course?.creditValue || 0);
    });
  });
"""

# Insert total logic before return
content = content.replace("const isDraft = curriculum.status === 'DRAFT';", "const isDraft = curriculum.status === 'DRAFT';\n" + total_logic)

# Add totals to Header
header_totals = """
            <span className="text-muted-foreground text-sm">
              Effective: {new Date(curriculum.effectiveFrom).toLocaleDateString()}
            </span>
            <span className="text-muted-foreground text-sm border-l pl-2">
              Total Courses: {totalCourses}
            </span>
            <span className="text-muted-foreground text-sm border-l pl-2">
              Total Credits: {totalCredits}
            </span>
"""
content = content.replace("""<span className="text-muted-foreground text-sm">
              Effective: {new Date(curriculum.effectiveFrom).toLocaleDateString()}
            </span>""", header_totals.strip())


# Add "Add Course" dialog beside "Add Term"
add_term_button_code = """<Link
              href={`/admin/academics/programs/${params.programId}/curriculums/${curriculum.id}/terms/new`}
            >
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Term
              </Button>
            </Link>"""

new_buttons_code = """<div className="flex gap-2">
              <Link
                href={`/admin/academics/programs/${params.programId}/curriculums/${curriculum.id}/terms/new`}
              >
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Term
                </Button>
              </Link>
              <AddCourseDialog curriculumId={curriculum.id} curriculumTerms={curriculum.curriculumTerms || []} />
            </div>"""

content = content.replace(add_term_button_code, new_buttons_code)

# Compute term totals
term_totals = """
                    <div>
                      <h3 className="text-lg font-semibold">{term.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        Sequence: {term.sequence} • Required Credits: {term.creditRequirement || 0}
                        {' '}• Term Credits: {term.curriculumCourses?.reduce((sum: number, cc: any) => sum + (cc.creditValue || cc.course?.creditValue || 0), 0)}
                      </p>
                    </div>"""
content = re.sub(r'<div>\s*<h3 className="text-lg font-semibold">\{term\.name\}</h3>\s*<p className="text-muted-foreground text-sm">\s*Sequence: \{term\.sequence\} • Credits: \{term\.creditRequirement \|\| 0\}\s*</p>\s*</div>', term_totals.strip(), content)

# Also add course removal actions in TableCell if possible (Wait, the requirements mentioned "Remove from Curriculum" if supported. Let's see if we have `useDeleteCurriculumCourse`)
# For now, let's just make sure the totals are displayed.

with open('apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx', 'w') as f:
    f.write(content)

