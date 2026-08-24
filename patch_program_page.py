import re

with open("apps/web/src/app/admin/academics/programs/[programId]/page.tsx", "r") as f:
    content = f.read()

content = content.replace("import { useAdminProgram } from '@/hooks/api/admin/usePrograms';", "import { useAdminProgram } from '@/hooks/api/admin/usePrograms';\nimport { ImportCurriculumButton } from './import-curriculum-button';")

buttons = """          <div className="flex gap-2">
            <ImportCurriculumButton programId={program.id} />
            <Link href={`/admin/academics/programs/${program.id}/curriculums/new`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Create Curriculum
              </Button>
            </Link>
          </div>"""

content = content.replace("""          <Link href={`/admin/academics/programs/${program.id}/curriculums/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Create Curriculum
            </Button>
          </Link>""", buttons)

with open("apps/web/src/app/admin/academics/programs/[programId]/page.tsx", "w") as f:
    f.write(content)
