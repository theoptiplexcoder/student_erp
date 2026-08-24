import re

with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx", "r") as f:
    content = f.read()

content = content.replace("import { notFound } from 'next/navigation';", "import { notFound } from 'next/navigation';\nimport { CurriculumActions } from './curriculum-actions';")

# Replace fetch URL to use academic instead of admin/academic
content = content.replace("`${API_URL}/admin/academic/curriculums", "`${API_URL}/academic/curriculums")

# Replace publish URL to activate URL
content = content.replace("`${API_URL}/academic/curriculums/${params.curriculumId}/publish`", "`${API_URL}/academic/curriculums/${params.curriculumId}/activate`")
content = content.replace("Publish Curriculum", "Activate Curriculum")

# Add CurriculumActions in the header
header_actions = """        </div>

        <div className="flex gap-2">
          <CurriculumActions curriculumId={curriculum.id} programId={params.programId} />
          {isDraft && (
"""
content = content.replace("        </div>\n\n        {isDraft && (", header_actions)
content = content.replace("          </form>\n        )}", "          </form>\n        )}\n        </div>")


with open("apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx", "w") as f:
    f.write(content)
