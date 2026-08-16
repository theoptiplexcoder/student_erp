const fs = require('fs');
const file = 'apps/api/src/modules/admin/faculty/faculty.controller.ts';
let code = fs.readFileSync(file, 'utf8');
if (!code.includes('import { Controller, Get, Param')) {
  code = code.replace(
    'import { Controller, Get, Query, UseGuards }',
    'import { Controller, Get, Query, Param, UseGuards }',
  );
}

if (!code.includes('getFacultyById')) {
  const insertIndex = code.lastIndexOf('}');
  const methodCode = `
  @Get(':id')
  async getFacultyById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.facultyService.getFacultyById(user.institutionId, id);
  }
`;
  code = code.slice(0, insertIndex) + methodCode + code.slice(insertIndex);
  fs.writeFileSync(file, code);
}
