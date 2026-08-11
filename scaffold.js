const fs = require('fs');
const path = require('path');

const frontendRoutes = [
  'dashboard',
  'institution',
  'institution/profile',
  'institution/settings',
  'institution/academic-year',
  'institution/calendar',
  'students',
  'students/new',
  'students/[studentId]',
  'students/[studentId]/profile',
  'students/[studentId]/academics',
  'students/[studentId]/attendance',
  'students/[studentId]/examinations',
  'students/[studentId]/documents',
  'students/[studentId]/history',
  'admissions',
  'admissions/applications',
  'admissions/applications/[applicationId]',
  'admissions/forms',
  'admissions/settings',
  'faculty',
  'faculty/new',
  'faculty/[facultyId]',
  'faculty/[facultyId]/profile',
  'faculty/[facultyId]/academics',
  'faculty/[facultyId]/courses',
  'faculty/[facultyId]/timetable',
  'faculty/[facultyId]/history',
  'departments',
  'departments/new',
  'departments/[departmentId]',
  'programs',
  'programs/new',
  'programs/[programId]',
  'courses',
  'courses/new',
  'courses/[courseId]',
  'batches',
  'batches/new',
  'batches/[batchId]',
  'sections',
  'sections/[sectionId]',
  'subjects',
  'subjects/[subjectId]',
  'timetable',
  'timetable/weekly',
  'timetable/faculty',
  'timetable/rooms',
  'attendance',
  'attendance/students',
  'attendance/courses',
  'attendance/reports',
  'examinations',
  'examinations/exams',
  'examinations/exams/new',
  'examinations/exams/[examId]',
  'examinations/timetable',
  'examinations/marks',
  'examinations/results',
  'examinations/grading',
  'promotions',
  'promotions/pending',
  'promotions/promoted',
  'promotions/rules',
  'certificates',
  'certificates/generate',
  'certificates/[certificateId]',
  'alumni',
  'alumni/[alumniId]',
  'users',
  'users/invite',
  'users/[userId]',
  'roles',
  'roles/[roleId]',
  'permissions',
  'announcements',
  'announcements/new',
  'reports',
  'reports/students',
  'reports/faculty',
  'reports/attendance',
  'reports/examinations',
  'reports/admissions',
  'settings',
  'settings/general',
  'settings/academic',
  'settings/notifications',
];

const backendModules = {
  dashboard: [],
  institution: ['update-institution', 'update-institution-settings'],
  students: ['create-student', 'update-student', 'student-query'],
  admissions: ['admission-query', 'update-application', 'convert-applicant'],
  faculty: ['create-faculty', 'update-faculty', 'faculty-query'],
  departments: ['create-department', 'update-department'],
  programs: ['create-program', 'update-program'],
  courses: ['create-course', 'update-course'],
  batches: ['create-batch', 'update-batch'],
  sections: ['create-section', 'update-section'],
  subjects: ['create-subject', 'update-subject'],
  timetable: ['create-timetable-entry', 'update-timetable-entry'],
  attendance: ['attendance-query', 'attendance-report'],
  examinations: ['create-exam', 'update-exam', 'marks-entry', 'publish-result'],
  promotions: ['promotion-query', 'promote-student', 'promotion-rule'],
  certificates: ['generate-certificate', 'certificate-query'],
  alumni: [],
  users: ['invite-user', 'update-user'],
  roles: ['create-role', 'update-role'],
  permissions: [],
  announcements: [],
  reports: [],
  settings: [],
};

const pageContent = `export default function Page() {\n  return null;\n}\n`;

const getControllerContent = (name, className) => `import { Controller } from '@nestjs/common';

@Controller('admin/${name}')
export class ${className}Controller {}
`;

const getServiceContent = (className) => `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {}
`;

const getModuleContent = (className, name) => `import { Module } from '@nestjs/common';
import { ${className}Controller } from './${name}.controller';
import { ${className}Service } from './${name}.service';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
})
export class ${className}Module {}
`;

const getDtoContent = (className) => `export class ${className}Dto {}
`;

const getAdminModuleContent = (modules) => {
  const imports = modules.map(m => `import { ${m.className}Module } from './${m.name}/${m.name}.module';`).join('\n');
  const moduleList = modules.map(m => `${m.className}Module`).join(',\n    ');
  return `import { Module } from '@nestjs/common';
${imports}

@Module({
  imports: [
    ${moduleList}
  ],
})
export class AdminModule {}
`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toClassName(s) {
  return s.split('-').map(capitalize).join('');
}

// Scaffold Frontend
const frontendBase = path.join(__dirname, 'apps', 'web', 'src', 'app', 'admin');
if (!fs.existsSync(frontendBase)) {
  fs.mkdirSync(frontendBase, { recursive: true });
}
fs.writeFileSync(path.join(frontendBase, 'page.tsx'), pageContent);

for (const route of frontendRoutes) {
  const routePath = path.join(frontendBase, route);
  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath, { recursive: true });
  }
  fs.writeFileSync(path.join(routePath, 'page.tsx'), pageContent);
}

// Scaffold Backend
const backendBase = path.join(__dirname, 'apps', 'api', 'src', 'modules', 'admin');
if (!fs.existsSync(backendBase)) {
  fs.mkdirSync(backendBase, { recursive: true });
}

const moduleObjects = [];

for (const [mod, dtos] of Object.entries(backendModules)) {
  const modPath = path.join(backendBase, mod);
  if (!fs.existsSync(modPath)) {
    fs.mkdirSync(modPath, { recursive: true });
  }

  const className = toClassName(mod);
  moduleObjects.push({ name: mod, className });

  fs.writeFileSync(path.join(modPath, `${mod}.controller.ts`), getControllerContent(mod, className));
  fs.writeFileSync(path.join(modPath, `${mod}.service.ts`), getServiceContent(className));
  fs.writeFileSync(path.join(modPath, `${mod}.module.ts`), getModuleContent(className, mod));

  if (dtos && dtos.length > 0) {
    const dtoPath = path.join(modPath, 'dto');
    if (!fs.existsSync(dtoPath)) {
      fs.mkdirSync(dtoPath, { recursive: true });
    }
    for (const dto of dtos) {
      const dtoClassName = toClassName(dto);
      fs.writeFileSync(path.join(dtoPath, `${dto}.dto.ts`), getDtoContent(dtoClassName));
    }
  }
}

fs.writeFileSync(path.join(backendBase, 'admin.module.ts'), getAdminModuleContent(moduleObjects));

console.log('Scaffolding complete.');
