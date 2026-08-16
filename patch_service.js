const fs = require('fs');
const file = 'apps/api/src/modules/admin/faculty/faculty.service.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('getFacultyById')) {
  const insertIndex = code.lastIndexOf('}');
  const methodCode = `
  async getFacultyById(institutionId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, institutionId },
      include: {
        user: true,
        department: true,
      },
    });
    
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    return faculty;
  }
`;
  code = code.slice(0, insertIndex) + methodCode + code.slice(insertIndex);
  fs.writeFileSync(file, code);
}
