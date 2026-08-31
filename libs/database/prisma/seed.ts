import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const prisma = new PrismaClient();

// ─── Deterministic UUIDs ────────────────────────────────
// Using fixed UUIDs so the seed is deterministic and re-runnable.
const IDs = {
  institution: '00000000-0000-0000-0000-000000000001',

  // Departments
  deptCS: '00000000-0000-0000-0000-000000000002',
  deptMath: '00000000-0000-0000-0000-000000000003',

  // Academic Year
  ay2025: '00000000-0000-0000-0000-000000000004',

  // Academic Terms
  termSem1: '00000000-0000-0000-0000-000000000005',
  termSem2: '00000000-0000-0000-0000-000000000006',

  // Class Levels
  clsYr1: '00000000-0000-0000-0000-000000000007',
  clsYr2: '00000000-0000-0000-0000-000000000008',
  clsYr3: '00000000-0000-0000-0000-000000000009',

  // Building & Rooms
  building: '00000000-0000-0000-0000-00000000000a',
  roomA101: '00000000-0000-0000-0000-00000000000b',
  roomB201: '00000000-0000-0000-0000-00000000000c',
  roomC301: '00000000-0000-0000-0000-00000000000d',

  // Programs
  progBTechCS: '00000000-0000-0000-0000-00000000000e',
  progBTechMath: '00000000-0000-0000-0000-00000000000f',

  // Custom Role & Permissions
  customRole: '00000000-0000-0000-0000-000000000010',
  perm1: '00000000-0000-0000-0000-000000000011',
  perm2: '00000000-0000-0000-0000-000000000012',

  // Curriculums
  currCS: '00000000-0000-0000-0000-000000000013',
  currMath: '00000000-0000-0000-0000-000000000014',

  // Curriculum Terms
  currTermCS1: '00000000-0000-0000-0000-000000000015',
  currTermMath1: '00000000-0000-0000-0000-000000000016',

  // Curriculum Elective Groups
  electiveGrpCS: '00000000-0000-0000-0000-000000000017',
  electiveGrpMath: '00000000-0000-0000-0000-000000000018',

  // Batches
  batchCS2025: '00000000-0000-0000-0000-000000000019',
  batchMath2025: '00000000-0000-0000-0000-00000000001a',

  // Sections
  sectionCS: '00000000-0000-0000-0000-00000000001b',
  sectionMath: '00000000-0000-0000-0000-00000000001c',

  // Courses
  cs101: '00000000-0000-0000-0000-00000000001d',
  cs201: '00000000-0000-0000-0000-00000000001e',
  cs301: '00000000-0000-0000-0000-00000000001f',
  ma101: '00000000-0000-0000-0000-000000000020',
  ma201: '00000000-0000-0000-0000-000000000021',
  ma301: '00000000-0000-0000-0000-000000000022',

  // Curriculum Courses
  ccCS1: '00000000-0000-0000-0000-000000000023',
  ccCS2: '00000000-0000-0000-0000-000000000024',
  ccCS3: '00000000-0000-0000-0000-000000000025',
  ccMA1: '00000000-0000-0000-0000-000000000026',
  ccMA2: '00000000-0000-0000-0000-000000000027',
  ccMA3: '00000000-0000-0000-0000-000000000028',

  // Course Prerequisite
  prereq1: '00000000-0000-0000-0000-000000000029',

  // Users
  userAdmin: '00000000-0000-0000-0000-00000000002a',
  userFac1: '00000000-0000-0000-0000-00000000002b',
  userFac2: '00000000-0000-0000-0000-00000000002c',
  userStu1: '00000000-0000-0000-0000-00000000002d',
  userStu2: '00000000-0000-0000-0000-00000000002e',
  userStu3: '00000000-0000-0000-0000-00000000002f',
  userStu4: '00000000-0000-0000-0000-000000000030',
  userGuard1: '00000000-0000-0000-0000-000000000031',
  userGuard2: '00000000-0000-0000-0000-000000000032',

  // Faculty
  fac1: '00000000-0000-0000-0000-000000000033',
  fac2: '00000000-0000-0000-0000-000000000034',

  // Guardians
  guard1: '00000000-0000-0000-0000-000000000035',
  guard2: '00000000-0000-0000-0000-000000000036',

  // Students
  stu1: '00000000-0000-0000-0000-000000000037',
  stu2: '00000000-0000-0000-0000-000000000038',
  stu3: '00000000-0000-0000-0000-000000000039',
  stu4: '00000000-0000-0000-0000-00000000003a',

  // Course Offerings
  offCS101: '00000000-0000-0000-0000-00000000003b',
  offCS201: '00000000-0000-0000-0000-00000000003c',
  offCS301: '00000000-0000-0000-0000-00000000003d',
  offMA101: '00000000-0000-0000-0000-00000000003e',
  offMA201: '00000000-0000-0000-0000-00000000003f',
  offMA301: '00000000-0000-0000-0000-000000000040',

  // Course Assignments
  ca1: '00000000-0000-0000-0000-000000000041',
  ca2: '00000000-0000-0000-0000-000000000042',

  // Enrollments
  enr1: '00000000-0000-0000-0000-000000000043',
  enr2: '00000000-0000-0000-0000-000000000044',
  enr3: '00000000-0000-0000-0000-000000000045',
  enr4: '00000000-0000-0000-0000-000000000046',
  enr5: '00000000-0000-0000-0000-000000000047',
  enr6: '00000000-0000-0000-0000-000000000048',
  enr7: '00000000-0000-0000-0000-000000000049',
  enr8: '00000000-0000-0000-0000-00000000004a',

  // Timetable Entries
  tt1: '00000000-0000-0000-0000-00000000004b',
  tt2: '00000000-0000-0000-0000-00000000004c',

  // Attendance Sessions
  attSess1: '00000000-0000-0000-0000-00000000004d',
  attSess2: '00000000-0000-0000-0000-00000000004e',

  // Attendance Records
  attRec1: '00000000-0000-0000-0000-00000000004f',
  attRec2: '00000000-0000-0000-0000-000000000050',
  attRec3: '00000000-0000-0000-0000-000000000051',
  attRec4: '00000000-0000-0000-0000-000000000052',

  // Course Resources
  res1: '00000000-0000-0000-0000-000000000053',
  res2: '00000000-0000-0000-0000-000000000054',

  // Assignments
  assign1: '00000000-0000-0000-0000-000000000055',
  assign2: '00000000-0000-0000-0000-000000000056',

  // Assignment Submissions
  sub1: '00000000-0000-0000-0000-000000000057',
  sub2: '00000000-0000-0000-0000-000000000058',

  // Exams
  exam1: '00000000-0000-0000-0000-000000000059',

  // Exam Courses
  examCourse1: '00000000-0000-0000-0000-00000000005a',

  // Marks
  mark1: '00000000-0000-0000-0000-00000000005b',
  mark2: '00000000-0000-0000-0000-00000000005c',

  // Calendar Events
  cal1: '00000000-0000-0000-0000-00000000005d',
  cal2: '00000000-0000-0000-0000-00000000005e',

  // Announcements
  ann1: '00000000-0000-0000-0000-00000000005f',
  ann2: '00000000-0000-0000-0000-000000000060',

  // Notifications
  notif1: '00000000-0000-0000-0000-000000000061',
  notif2: '00000000-0000-0000-0000-000000000062',

  // Certificate Request & Certificate
  certReq1: '00000000-0000-0000-0000-000000000063',
  cert1: '00000000-0000-0000-0000-000000000064',

  // Student Documents
  stDoc1: '00000000-0000-0000-0000-000000000065',
  stDoc2: '00000000-0000-0000-0000-000000000066',

  // Feedback
  fbForm: '00000000-0000-0000-0000-000000000067',
  fbQ1: '00000000-0000-0000-0000-000000000068',
  fbQ2: '00000000-0000-0000-0000-000000000069',
  fbSub: '00000000-0000-0000-0000-00000000006a',
  fbAns1: '00000000-0000-0000-0000-00000000006b',
  fbAns2: '00000000-0000-0000-0000-00000000006c',

  // Service Request
  srvReq: '00000000-0000-0000-0000-00000000006d',

  // Grievance
  grievance: '00000000-0000-0000-0000-00000000006e',

  // Clubs
  club: '00000000-0000-0000-0000-00000000006f',
  clubMem1: '00000000-0000-0000-0000-000000000070',
  clubMem2: '00000000-0000-0000-0000-000000000071',
  clubEvt: '00000000-0000-0000-0000-000000000072',
  clubEvtReg: '00000000-0000-0000-0000-000000000073',

  // Student Skills
  skill1: '00000000-0000-0000-0000-000000000074',
  skill2: '00000000-0000-0000-0000-000000000075',
  skill3: '00000000-0000-0000-0000-000000000076',
  skill4: '00000000-0000-0000-0000-000000000077',
  skill5: '00000000-0000-0000-0000-000000000078',
  skill6: '00000000-0000-0000-0000-000000000079',
  skill7: '00000000-0000-0000-0000-00000000007a',
  skill8: '00000000-0000-0000-0000-00000000007b',

  // Student Languages
  lang1: '00000000-0000-0000-0000-00000000007c',
  lang2: '00000000-0000-0000-0000-00000000007d',
  lang3: '00000000-0000-0000-0000-00000000007e',
  lang4: '00000000-0000-0000-0000-00000000007f',

  // Student Achievements
  ach1: '00000000-0000-0000-0000-000000000080',
  ach2: '00000000-0000-0000-0000-000000000081',

  // Student Previous Education
  prevEd1: '00000000-0000-0000-0000-000000000082',
  prevEd2: '00000000-0000-0000-0000-000000000083',

  // Student Projects
  proj1: '00000000-0000-0000-0000-000000000084',
  proj2: '00000000-0000-0000-0000-000000000085',

  // Student Social Profiles
  socProf1: '00000000-0000-0000-0000-000000000086',
  socProf2: '00000000-0000-0000-0000-000000000087',

  // Student Terms
  stTerm1: '00000000-0000-0000-0000-000000000088',
  stTerm2: '00000000-0000-0000-0000-000000000089',

  // Fee Plans & Installments
  feePlan1: '00000000-0000-0000-0000-00000000008a',
  feePlan2: '00000000-0000-0000-0000-00000000008b',
  inst1: '00000000-0000-0000-0000-00000000008c',
  inst2: '00000000-0000-0000-0000-00000000008d',
  inst3: '00000000-0000-0000-0000-00000000008e',
  inst4: '00000000-0000-0000-0000-00000000008f',

  // Applications
  app1: '00000000-0000-0000-0000-000000000090',
  app2: '00000000-0000-0000-0000-000000000091',

  // Lesson Plans
  lp1: '00000000-0000-0000-0000-000000000092',
  lp2: '00000000-0000-0000-0000-000000000093',

  // Lesson Plan Sections
  lpSec1: '00000000-0000-0000-0000-000000000094',

  // Lesson Plan Resources
  lpRes1: '00000000-0000-0000-0000-000000000095',

  // Admin Resources
  adminRes: '00000000-0000-0000-0000-000000000096',

  // Audit Logs
  audit1: '00000000-0000-0000-0000-000000000097',
  audit2: '00000000-0000-0000-0000-000000000098',
};

// ─── Helpers ────────────────────────────────────────────
const d = (s: string) => new Date(s); // date helper
const time = (h: number, m: number) =>
  new Date(`1970-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);

// ─── Cleanup (reverse FK order) ────────────────────────
async function cleanup() {
  console.log('🧹 Cleaning up existing data...');
  const tables = [
    'audit_logs',
    'admin_resources',
    'lesson_plan_resources',
    'lesson_plan_sections',
    'lesson_plans',
    'applications',
    'fee_installments',
    'student_fee_plans',
    'student_terms',
    'student_social_profiles',
    'student_projects',
    'student_previous_education',
    'student_achievements',
    'student_languages',
    'student_skills',
    'club_event_registrations',
    'club_events',
    'club_memberships',
    'clubs',
    'grievances',
    'service_requests',
    'feedback_answers',
    'feedback_submissions',
    'feedback_questions',
    'feedback_forms',
    'student_documents',
    'certificates',
    'certificate_requests',
    'notifications',
    'announcements',
    'calendar_events',
    'marks',
    'exam_courses',
    'exams',
    'assignment_submissions',
    'assignments',
    'course_resources',
    'attendance_records',
    'attendance_sessions',
    'timetable_entries',
    'course_assignments',
    'enrollments',
    'course_offerings',
    'curriculum_courses',
    'course_prerequisites',
    'curriculum_elective_groups',
    'curriculum_terms',
    'curriculums',
    'courses',
    'sections',
    'batches',
    'academic_terms',
    'rooms',
    'buildings',
    'class_levels',
    'academic_years',
    'programs',
    'role_permissions',
    'custom_roles',
    'students',
    'guardians',
    'faculty',
    'users',
    'departments',
    'institutions',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
  console.log('✅ Cleanup done.');
}

// ─── Seed ───────────────────────────────────────────────
async function main() {
  await cleanup();

  const I = IDs;
  const now = new Date();

  console.log('🌱 Seeding institution...');

  // 1. Institution
  await prisma.institution.create({
    data: {
      id: I.institution,
      institutionType: 'UNIVERSITY',
      legalName: 'Ellipsonic Institute of Technology',
      displayName: 'EIT',
      branding: { primaryColor: '#1a365d', accentColor: '#e53e3e' },
    },
  });

  // 2. Departments
  await prisma.department.createMany({
    data: [
      { id: I.deptCS, institutionId: I.institution, name: 'Computer Science', code: 'CS' },
      { id: I.deptMath, institutionId: I.institution, name: 'Mathematics', code: 'MA' },
    ],
  });

  // 3. Academic Year
  await prisma.academicYear.create({
    data: {
      id: I.ay2025,
      institutionId: I.institution,
      name: '2025-2026',
      startDate: d('2025-08-01'),
      endDate: d('2026-07-31'),
      isActive: true,
    },
  });

  // 4. Class Levels
  await prisma.classLevel.createMany({
    data: [
      { id: I.clsYr1, institutionId: I.institution, name: 'Year 1', code: 'Y1', sequence: 1 },
      { id: I.clsYr2, institutionId: I.institution, name: 'Year 2', code: 'Y2', sequence: 2 },
      { id: I.clsYr3, institutionId: I.institution, name: 'Year 3', code: 'Y3', sequence: 3 },
    ],
  });

  // 5. Building & Rooms
  await prisma.building.create({
    data: {
      id: I.building,
      institutionId: I.institution,
      name: 'Main Building',
      code: 'MB',
      address: 'EIT Campus, Sector 15, Noida, UP',
      floors: 4,
    },
  });

  await prisma.room.createMany({
    data: [
      {
        id: I.roomA101,
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Lecture Hall A',
        number: 'A-101',
        floor: 1,
        capacity: 120,
        roomType: 'LECTURE_HALL',
      },
      {
        id: I.roomB201,
        institutionId: I.institution,
        buildingId: I.building,
        name: 'CS Lab B',
        number: 'B-201',
        floor: 2,
        capacity: 60,
        roomType: 'LAB',
      },
      {
        id: I.roomC301,
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Faculty Office C',
        number: 'C-301',
        floor: 3,
        capacity: 4,
        roomType: 'OFFICE',
      },
    ],
  });

  // 6. Programs
  await prisma.program.createMany({
    data: [
      {
        id: I.progBTechCS,
        institutionId: I.institution,
        departmentId: I.deptCS,
        name: 'B.Tech Computer Science',
        code: 'BTCS',
        level: 'UNDERGRADUATE',
        durationYears: 4,
      },
      {
        id: I.progBTechMath,
        institutionId: I.institution,
        departmentId: I.deptMath,
        name: 'B.Tech Mathematics',
        code: 'BTMA',
        level: 'UNDERGRADUATE',
        durationYears: 3,
      },
    ],
  });

  // 7. Custom Role & Permissions
  await prisma.customRole.create({
    data: {
      id: I.customRole,
      institutionId: I.institution,
      name: 'Department Head',
      description: 'Head of department with full department management access',
    },
  });

  await prisma.rolePermission.createMany({
    data: [
      { id: I.perm1, customRoleId: I.customRole, resource: 'faculty', action: 'MANAGE' },
      { id: I.perm2, customRoleId: I.customRole, resource: 'course', action: 'MANAGE' },
    ],
  });

  // 8. Curriculums
  await prisma.curriculum.createMany({
    data: [
      {
        id: I.currCS,
        institutionId: I.institution,
        programId: I.progBTechCS,
        versionNumber: '1.0',
        name: 'B.Tech CS Curriculum 2025',
        status: 'ACTIVE',
        effectiveFrom: d('2025-08-01'),
      },
      {
        id: I.currMath,
        institutionId: I.institution,
        programId: I.progBTechMath,
        versionNumber: '1.0',
        name: 'B.Tech Math Curriculum 2025',
        status: 'ACTIVE',
        effectiveFrom: d('2025-08-01'),
      },
    ],
  });

  // 9. Academic Terms
  await prisma.academicTerm.createMany({
    data: [
      {
        id: I.termSem1,
        institutionId: I.institution,
        academicYearId: I.ay2025,
        name: 'Semester 1',
        code: 'SEM1',
        semester: 1,
        termType: 'SEMESTER',
        startDate: d('2025-08-01'),
        endDate: d('2025-12-15'),
        status: 'ACTIVE',
      },
      {
        id: I.termSem2,
        institutionId: I.institution,
        academicYearId: I.ay2025,
        name: 'Semester 2',
        code: 'SEM2',
        semester: 2,
        termType: 'SEMESTER',
        startDate: d('2026-01-05'),
        endDate: d('2026-05-20'),
        status: 'UPCOMING',
      },
    ],
  });

  // 10. Curriculum Terms
  await prisma.curriculumTerm.createMany({
    data: [
      {
        id: I.currTermCS1,
        institutionId: I.institution,
        curriculumId: I.currCS,
        name: 'Semester 1',
        sequence: 1,
        creditRequirement: 20,
      },
      {
        id: I.currTermMath1,
        institutionId: I.institution,
        curriculumId: I.currMath,
        name: 'Semester 1',
        sequence: 1,
        creditRequirement: 18,
      },
    ],
  });

  // 11. Curriculum Elective Groups
  await prisma.curriculumElectiveGroup.createMany({
    data: [
      {
        id: I.electiveGrpCS,
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        name: 'CS Electives',
        requiredCredits: 6,
        requiredCourses: 2,
      },
      {
        id: I.electiveGrpMath,
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        name: 'Math Electives',
        requiredCredits: 4,
        requiredCourses: 1,
      },
    ],
  });

  // 12. Batches
  await prisma.batch.createMany({
    data: [
      {
        id: I.batchCS2025,
        institutionId: I.institution,
        programId: I.progBTechCS,
        name: 'CS Batch 2025',
        admissionYear: 2025,
        startDate: d('2025-08-01'),
        expectedEndDate: d('2029-06-30'),
      },
      {
        id: I.batchMath2025,
        institutionId: I.institution,
        programId: I.progBTechMath,
        name: 'Math Batch 2025',
        admissionYear: 2025,
        startDate: d('2025-08-01'),
        expectedEndDate: d('2028-06-30'),
      },
    ],
  });

  // 13. Sections
  await prisma.section.createMany({
    data: [
      {
        id: I.sectionCS,
        institutionId: I.institution,
        programId: I.progBTechCS,
        classLevelId: I.clsYr1,
        batchId: I.batchCS2025,
        academicYearId: I.ay2025,
        name: 'CS-A',
        code: 'CS-A',
        semester: 1,
        capacity: 60,
      },
      {
        id: I.sectionMath,
        institutionId: I.institution,
        programId: I.progBTechMath,
        classLevelId: I.clsYr1,
        batchId: I.batchMath2025,
        academicYearId: I.ay2025,
        name: 'Math-A',
        code: 'MA-A',
        semester: 1,
        capacity: 40,
      },
    ],
  });

  // 14. Courses
  await prisma.course.createMany({
    data: [
      {
        id: I.cs101,
        institutionId: I.institution,
        departmentId: I.deptCS,
        programId: I.progBTechCS,
        classLevelId: I.clsYr1,
        code: 'CS101',
        name: 'Introduction to Programming',
        description: 'Fundamentals of programming using C and Python',
        creditValue: 4,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
      {
        id: I.cs201,
        institutionId: I.institution,
        departmentId: I.deptCS,
        programId: I.progBTechCS,
        classLevelId: I.clsYr2,
        code: 'CS201',
        name: 'Data Structures',
        description: 'Arrays, linked lists, trees, graphs, and algorithm analysis',
        creditValue: 4,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
      {
        id: I.cs301,
        institutionId: I.institution,
        departmentId: I.deptCS,
        programId: I.progBTechCS,
        classLevelId: I.clsYr3,
        code: 'CS301',
        name: 'Operating Systems',
        description: 'Process management, memory management, file systems',
        creditValue: 4,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
      {
        id: I.ma101,
        institutionId: I.institution,
        departmentId: I.deptMath,
        programId: I.progBTechMath,
        classLevelId: I.clsYr1,
        code: 'MA101',
        name: 'Linear Algebra',
        description: 'Vectors, matrices, eigenvalues, and linear transformations',
        creditValue: 3,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
      {
        id: I.ma201,
        institutionId: I.institution,
        departmentId: I.deptMath,
        programId: I.progBTechMath,
        classLevelId: I.clsYr2,
        code: 'MA201',
        name: 'Calculus II',
        description: 'Multivariable calculus, sequences, and series',
        creditValue: 3,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
      {
        id: I.ma301,
        institutionId: I.institution,
        departmentId: I.deptMath,
        programId: I.progBTechMath,
        classLevelId: I.clsYr3,
        code: 'MA301',
        name: 'Discrete Mathematics',
        description: 'Logic, sets, combinatorics, graph theory',
        creditValue: 3,
        maxMarks: 100,
        passingMarks: 40,
        isPractical: false,
        courseType: 'THEORY',
      },
    ],
  });

  // 15. Curriculum Courses
  await prisma.curriculumCourse.createMany({
    data: [
      {
        id: I.ccCS1,
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs101,
        sequence: 1,
        creditValue: 4,
        isMandatory: true,
      },
      {
        id: I.ccCS2,
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs201,
        sequence: 2,
        creditValue: 4,
        isMandatory: true,
      },
      {
        id: I.ccCS3,
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs301,
        sequence: 3,
        creditValue: 4,
        isMandatory: false,
        electiveGroupId: I.electiveGrpCS,
      },
      {
        id: I.ccMA1,
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        courseId: I.ma101,
        sequence: 1,
        creditValue: 3,
        isMandatory: true,
      },
      {
        id: I.ccMA2,
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        courseId: I.ma201,
        sequence: 2,
        creditValue: 3,
        isMandatory: true,
      },
      {
        id: I.ccMA3,
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        courseId: I.ma301,
        sequence: 3,
        creditValue: 3,
        isMandatory: false,
        electiveGroupId: I.electiveGrpMath,
      },
    ],
  });

  // 16. Course Prerequisites
  await prisma.coursePrerequisite.create({
    data: {
      id: I.prereq1,
      institutionId: I.institution,
      courseId: I.cs201,
      prerequisiteCourseId: I.cs101,
    },
  });

  // 17. Users
  const usersToCreate = [
    {
      id: I.userAdmin,
      institutionId: I.institution,
      email: 'admin@eit.edu',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-98765-43210',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      id: I.userFac1,
      institutionId: I.institution,
      email: 'priya.sharma@eit.edu',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-98765-43211',
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    {
      id: I.userFac2,
      institutionId: I.institution,
      email: 'amit.patel@eit.edu',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91-98765-43212',
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    {
      id: I.userStu1,
      institutionId: I.institution,
      email: 'rahul.verma@student.eit.edu',
      firstName: 'Rahul',
      lastName: 'Verma',
      phone: '+91-98765-43213',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      id: I.userStu2,
      institutionId: I.institution,
      email: 'sneha.gupta@student.eit.edu',
      firstName: 'Sneha',
      lastName: 'Gupta',
      phone: '+91-98765-43214',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      id: I.userStu3,
      institutionId: I.institution,
      email: 'vikram.singh@student.eit.edu',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-98765-43215',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      id: I.userStu4,
      institutionId: I.institution,
      email: 'ananya.reddy@student.eit.edu',
      firstName: 'Ananya',
      lastName: 'Reddy',
      phone: '+91-98765-43216',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      id: I.userGuard1,
      institutionId: I.institution,
      email: 'suresh.verma@gmail.com',
      firstName: 'Suresh',
      lastName: 'Verma',
      phone: '+91-98765-43217',
      role: 'GUARDIAN',
      status: 'ACTIVE',
    },
    {
      id: I.userGuard2,
      institutionId: I.institution,
      email: 'meena.gupta@gmail.com',
      firstName: 'Meena',
      lastName: 'Gupta',
      phone: '+91-98765-43218',
      role: 'GUARDIAN',
      status: 'ACTIVE',
    },
  ];

  for (const u of usersToCreate) {
    // Check if user exists in Supabase
    let authUserId = null;
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const sbUser = existingUser?.users.find((x) => x.email === u.email);

    if (sbUser) {
      // Update password
      await supabase.auth.admin.updateUserById(sbUser.id, { password: 'Password123!' });
      authUserId = sbUser.id;
    } else {
      // Create user
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'Password123!',
        email_confirm: true,
      });
      if (error) {
        console.error('Supabase user creation failed for', u.email, error);
      } else {
        authUserId = newUser.user.id;
      }
    }

    await prisma.user.create({
      data: {
        ...(u as any),
        authUserId: authUserId,
      },
    });
  }

  // 18. Faculty
  await prisma.faculty.createMany({
    data: [
      {
        id: I.fac1,
        institutionId: I.institution,
        userId: I.userFac1,
        departmentId: I.deptCS,
        teacherCode: 'FAC-001',
        employmentType: 'FULL_TIME',
        hireDate: d('2018-07-01'),
        status: 'ACTIVE',
      },
      {
        id: I.fac2,
        institutionId: I.institution,
        userId: I.userFac2,
        departmentId: I.deptMath,
        teacherCode: 'FAC-002',
        employmentType: 'FULL_TIME',
        hireDate: d('2019-01-15'),
        status: 'ACTIVE',
      },
    ],
  });

  // 19. Guardians
  await prisma.guardian.createMany({
    data: [
      {
        id: I.guard1,
        institutionId: I.institution,
        userId: I.userGuard1,
        occupation: 'Engineer',
        relationship: 'Father',
      },
      {
        id: I.guard2,
        institutionId: I.institution,
        userId: I.userGuard2,
        occupation: 'Teacher',
        relationship: 'Mother',
      },
    ],
  });

  // 20. Students
  await prisma.student.createMany({
    data: [
      {
        id: I.stu1,
        institutionId: I.institution,
        userId: I.userStu1,
        admissionNumber: 'ADM-2025-001',
        studentCode: 'STU-001',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2004-05-15'),
        gender: 'MALE',
        bloodGroup: 'B+',
        address: '12, MG Road',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201301',
        fatherName: 'Suresh Verma',
        motherName: 'Kavita Verma',
        fatherPhone: '+91-98765-43217',
        motherPhone: '+91-98765-43219',
        fatherEmail: 'suresh.verma@gmail.com',
        motherEmail: 'kavita.verma@gmail.com',
        guardianName: 'Suresh Verma',
        guardianPhone: '+91-98765-43217',
        admissionDate: d('2025-07-15'),
        rollNumber: 'CS-25-001',
        bio: 'Passionate about algorithms and competitive programming',
        profileCompletion: 85,
        guardianId: I.guard1,
        programId: I.progBTechCS,
        sectionId: I.sectionCS,
        curriculumId: I.currCS,
      },
      {
        id: I.stu2,
        institutionId: I.institution,
        userId: I.userStu2,
        admissionNumber: 'ADM-2025-002',
        studentCode: 'STU-002',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2004-08-22'),
        gender: 'FEMALE',
        bloodGroup: 'A+',
        address: '45, Park Street',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001',
        fatherName: 'Rajesh Gupta',
        motherName: 'Sunita Gupta',
        fatherPhone: '+91-98765-43220',
        motherPhone: '+91-98765-43221',
        fatherEmail: 'rajesh.gupta@gmail.com',
        motherEmail: 'sunita.gupta@gmail.com',
        guardianName: 'Meena Gupta',
        guardianPhone: '+91-98765-43218',
        admissionDate: d('2025-07-15'),
        rollNumber: 'CS-25-002',
        bio: 'Interested in AI and machine learning',
        profileCompletion: 90,
        guardianId: I.guard2,
        programId: I.progBTechCS,
        sectionId: I.sectionCS,
        curriculumId: I.currCS,
      },
      {
        id: I.stu3,
        institutionId: I.institution,
        userId: I.userStu3,
        admissionNumber: 'ADM-2025-003',
        studentCode: 'STU-003',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2004-02-10'),
        gender: 'MALE',
        bloodGroup: 'O+',
        address: '78, Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        postalCode: '302001',
        fatherName: 'Harpreet Singh',
        motherName: 'Navneet Kaur',
        fatherPhone: '+91-98765-43222',
        motherPhone: '+91-98765-43223',
        fatherEmail: 'harpreet.singh@gmail.com',
        motherEmail: 'navneet.kaur@gmail.com',
        guardianName: 'Harpreet Singh',
        guardianPhone: '+91-98765-43222',
        admissionDate: d('2025-07-15'),
        rollNumber: 'MA-25-001',
        bio: 'Aspiring mathematician and researcher',
        profileCompletion: 75,
        programId: I.progBTechMath,
        sectionId: I.sectionMath,
        curriculumId: I.currMath,
      },
      {
        id: I.stu4,
        institutionId: I.institution,
        userId: I.userStu4,
        admissionNumber: 'ADM-2025-004',
        studentCode: 'STU-004',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2004-11-05'),
        gender: 'FEMALE',
        bloodGroup: 'AB+',
        address: '23, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500033',
        fatherName: 'Krishna Reddy',
        motherName: 'Lakshmi Reddy',
        fatherPhone: '+91-98765-43224',
        motherPhone: '+91-98765-43225',
        fatherEmail: 'krishna.reddy@gmail.com',
        motherEmail: 'lakshmi.reddy@gmail.com',
        guardianName: 'Krishna Reddy',
        guardianPhone: '+91-98765-43224',
        admissionDate: d('2025-07-15'),
        rollNumber: 'MA-25-002',
        bio: 'Love calculus and number theory',
        profileCompletion: 80,
        programId: I.progBTechMath,
        sectionId: I.sectionMath,
        curriculumId: I.currMath,
      },
    ],
  });

  // 21. Course Offerings
  await prisma.courseOffering.createMany({
    data: [
      {
        id: I.offCS101,
        institutionId: I.institution,
        courseId: I.cs101,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        id: I.offCS201,
        institutionId: I.institution,
        courseId: I.cs201,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        id: I.offCS301,
        institutionId: I.institution,
        courseId: I.cs301,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        id: I.offMA101,
        institutionId: I.institution,
        courseId: I.ma101,
        termId: I.termSem1,
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        capacity: 40,
      },
      {
        id: I.offMA201,
        institutionId: I.institution,
        courseId: I.ma201,
        termId: I.termSem1,
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        capacity: 40,
      },
      {
        id: I.offMA301,
        institutionId: I.institution,
        courseId: I.ma301,
        termId: I.termSem1,
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        capacity: 40,
      },
    ],
  });

  // 22. Course Assignments
  await prisma.courseAssignment.createMany({
    data: [
      {
        id: I.ca1,
        institutionId: I.institution,
        facultyId: I.fac1,
        courseId: I.cs101,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        isPrimary: true,
      },
      {
        id: I.ca2,
        institutionId: I.institution,
        facultyId: I.fac2,
        courseId: I.ma101,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        isPrimary: true,
      },
    ],
  });

  // 23. Enrollments
  await prisma.enrollment.createMany({
    data: [
      // CS students in CS courses
      {
        id: I.enr1,
        institutionId: I.institution,
        studentId: I.stu1,
        academicYearId: I.ay2025,
        courseId: I.cs101,
        courseOfferingId: I.offCS101,
        programId: I.progBTechCS,
        curriculumId: I.currCS,
        classLevelId: I.clsYr1,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        rollNumber: 'CS-25-001',
        status: 'ACTIVE',
      },
      {
        id: I.enr2,
        institutionId: I.institution,
        studentId: I.stu1,
        academicYearId: I.ay2025,
        courseId: I.cs201,
        courseOfferingId: I.offCS201,
        programId: I.progBTechCS,
        curriculumId: I.currCS,
        classLevelId: I.clsYr1,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        rollNumber: 'CS-25-001',
        status: 'ACTIVE',
      },
      {
        id: I.enr3,
        institutionId: I.institution,
        studentId: I.stu2,
        academicYearId: I.ay2025,
        courseId: I.cs101,
        courseOfferingId: I.offCS101,
        programId: I.progBTechCS,
        curriculumId: I.currCS,
        classLevelId: I.clsYr1,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        rollNumber: 'CS-25-002',
        status: 'ACTIVE',
      },
      {
        id: I.enr4,
        institutionId: I.institution,
        studentId: I.stu2,
        academicYearId: I.ay2025,
        courseId: I.cs201,
        courseOfferingId: I.offCS201,
        programId: I.progBTechCS,
        curriculumId: I.currCS,
        classLevelId: I.clsYr1,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        rollNumber: 'CS-25-002',
        status: 'ACTIVE',
      },
      // Math students in Math courses
      {
        id: I.enr5,
        institutionId: I.institution,
        studentId: I.stu3,
        academicYearId: I.ay2025,
        courseId: I.ma101,
        courseOfferingId: I.offMA101,
        programId: I.progBTechMath,
        curriculumId: I.currMath,
        classLevelId: I.clsYr1,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        rollNumber: 'MA-25-001',
        status: 'ACTIVE',
      },
      {
        id: I.enr6,
        institutionId: I.institution,
        studentId: I.stu3,
        academicYearId: I.ay2025,
        courseId: I.ma201,
        courseOfferingId: I.offMA201,
        programId: I.progBTechMath,
        curriculumId: I.currMath,
        classLevelId: I.clsYr1,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        rollNumber: 'MA-25-001',
        status: 'ACTIVE',
      },
      {
        id: I.enr7,
        institutionId: I.institution,
        studentId: I.stu4,
        academicYearId: I.ay2025,
        courseId: I.ma101,
        courseOfferingId: I.offMA101,
        programId: I.progBTechMath,
        curriculumId: I.currMath,
        classLevelId: I.clsYr1,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        rollNumber: 'MA-25-002',
        status: 'ACTIVE',
      },
      {
        id: I.enr8,
        institutionId: I.institution,
        studentId: I.stu4,
        academicYearId: I.ay2025,
        courseId: I.ma201,
        courseOfferingId: I.offMA201,
        programId: I.progBTechMath,
        curriculumId: I.currMath,
        classLevelId: I.clsYr1,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        rollNumber: 'MA-25-002',
        status: 'ACTIVE',
      },
    ],
  });

  // 24. Timetable Entries
  await prisma.timetableEntry.createMany({
    data: [
      {
        id: I.tt1,
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.termSem1,
        courseId: I.cs101,
        facultyId: I.fac1,
        sectionId: I.sectionCS,
        dayOfWeek: 'MONDAY',
        startTime: time(9, 0),
        endTime: time(10, 30),
        room: 'A-101',
        building: 'Main Building',
      },
      {
        id: I.tt2,
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.termSem1,
        courseId: I.ma101,
        facultyId: I.fac2,
        sectionId: I.sectionMath,
        dayOfWeek: 'TUESDAY',
        startTime: time(11, 0),
        endTime: time(12, 30),
        room: 'A-101',
        building: 'Main Building',
      },
    ],
  });

  // 25. Attendance Sessions
  await prisma.attendanceSession.createMany({
    data: [
      {
        id: I.attSess1,
        institutionId: I.institution,
        courseId: I.cs101,
        sectionId: I.sectionCS,
        facultyId: I.fac1,
        termId: I.termSem1,
        date: d('2025-09-01'),
        startTime: time(9, 0),
        endTime: time(10, 30),
        topic: 'Introduction to C Programming',
      },
      {
        id: I.attSess2,
        institutionId: I.institution,
        courseId: I.ma101,
        sectionId: I.sectionMath,
        facultyId: I.fac2,
        termId: I.termSem1,
        date: d('2025-09-02'),
        startTime: time(11, 0),
        endTime: time(12, 30),
        topic: 'Vector Spaces',
      },
    ],
  });

  // 26. Attendance Records
  await prisma.attendanceRecord.createMany({
    data: [
      {
        id: I.attRec1,
        institutionId: I.institution,
        attendanceSessionId: I.attSess1,
        studentId: I.stu1,
        status: 'PRESENT',
        remarks: null,
      },
      {
        id: I.attRec2,
        institutionId: I.institution,
        attendanceSessionId: I.attSess1,
        studentId: I.stu2,
        status: 'LATE',
        remarks: 'Arrived 10 minutes late',
      },
      {
        id: I.attRec3,
        institutionId: I.institution,
        attendanceSessionId: I.attSess2,
        studentId: I.stu3,
        status: 'PRESENT',
        remarks: null,
      },
      {
        id: I.attRec4,
        institutionId: I.institution,
        attendanceSessionId: I.attSess2,
        studentId: I.stu4,
        status: 'ABSENT',
        remarks: 'Medical leave',
      },
    ],
  });

  // 27. Course Resources
  await prisma.courseResource.createMany({
    data: [
      {
        id: I.res1,
        institutionId: I.institution,
        courseId: I.cs101,
        facultyId: I.fac1,
        title: 'C Programming Notes',
        description: 'Comprehensive notes on C programming basics',
        owner: 'FACULTY',
        resourceType: 'PDF',
        fileUrl: '/resources/cs101/notes.pdf',
        isPublished: true,
        publishedAt: d('2025-08-20'),
      },
      {
        id: I.res2,
        institutionId: I.institution,
        courseId: I.ma101,
        facultyId: I.fac2,
        title: 'Linear Algebra Video Lectures',
        description: 'Video lecture series on linear algebra',
        owner: 'FACULTY',
        resourceType: 'VIDEO',
        externalUrl: 'https://youtube.com/watch?v=example',
        isPublished: true,
        publishedAt: d('2025-08-22'),
      },
    ],
  });

  // 28. Assignments
  await prisma.assignment.createMany({
    data: [
      {
        id: I.assign1,
        institutionId: I.institution,
        courseId: I.cs101,
        facultyId: I.fac1,
        termId: I.termSem1,
        title: 'Hello World Programs',
        description: 'Write 5 basic C programs',
        dueDate: d('2025-09-15'),
        maxMarks: 20,
        status: 'PUBLISHED',
      },
      {
        id: I.assign2,
        institutionId: I.institution,
        courseId: I.ma101,
        facultyId: I.fac2,
        termId: I.termSem1,
        title: 'Matrix Operations',
        description: 'Solve 10 matrix operation problems',
        dueDate: d('2025-09-20'),
        maxMarks: 30,
        status: 'PUBLISHED',
      },
    ],
  });

  // 29. Assignment Submissions
  await prisma.assignmentSubmission.createMany({
    data: [
      {
        id: I.sub1,
        institutionId: I.institution,
        assignmentId: I.assign1,
        studentId: I.stu1,
        submissionUrl: '/submissions/stu1/assign1.zip',
        submittedAt: d('2025-09-10'),
        status: 'GRADED',
        marks: 18,
        feedback: 'Good work!',
        gradedAt: d('2025-09-12'),
      },
      {
        id: I.sub2,
        institutionId: I.institution,
        assignmentId: I.assign1,
        studentId: I.stu2,
        submissionUrl: '/submissions/stu2/assign1.zip',
        submittedAt: d('2025-09-11'),
        status: 'SUBMITTED',
        marks: null,
        feedback: null,
      },
    ],
  });

  // 30. Exams
  await prisma.exam.create({
    data: {
      id: I.exam1,
      institutionId: I.institution,
      academicYearId: I.ay2025,
      termId: I.termSem1,
      name: 'Midterm Examination 2025',
      code: 'MID-2025',
      examType: 'MIDTERM',
      status: 'SCHEDULED',
      startDate: d('2025-10-15'),
      endDate: d('2025-10-25'),
    },
  });

  // 31. Exam Courses
  await prisma.examCourse.create({
    data: {
      id: I.examCourse1,
      institutionId: I.institution,
      examId: I.exam1,
      courseId: I.cs101,
      examDate: d('2025-10-16'),
      startTime: time(9, 0),
      endTime: time(12, 0),
      roomId: I.roomA101,
      maxMarks: 100,
      passingMarks: 40,
    },
  });

  // 32. Marks
  await prisma.mark.createMany({
    data: [
      {
        id: I.mark1,
        institutionId: I.institution,
        examCourseId: I.examCourse1,
        studentId: I.stu1,
        enrollmentId: I.enr1,
        marksObtained: 85,
        percentage: 85,
        grade: 'A',
        gradePoint: 9,
        resultStatus: 'PASS',
        remarks: null,
      },
      {
        id: I.mark2,
        institutionId: I.institution,
        examCourseId: I.examCourse1,
        studentId: I.stu2,
        enrollmentId: I.enr3,
        marksObtained: 72,
        percentage: 72,
        grade: 'B+',
        gradePoint: 8,
        resultStatus: 'PASS',
        remarks: null,
      },
    ],
  });

  // 33. Calendar Events
  await prisma.calendarEvent.createMany({
    data: [
      {
        id: I.cal1,
        institutionId: I.institution,
        title: 'Semester 1 Begins',
        description: 'First day of classes for Semester 1',
        eventType: 'ACADEMIC',
        startAt: d('2025-08-01'),
        endAt: d('2025-08-01'),
        isAllDay: true,
      },
      {
        id: I.cal2,
        institutionId: I.institution,
        title: 'Midterm Exams',
        description: 'Midterm examination period',
        eventType: 'EXAM',
        startAt: d('2025-10-15'),
        endAt: d('2025-10-25'),
        isAllDay: true,
      },
    ],
  });

  // 34. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        id: I.ann1,
        institutionId: I.institution,
        courseId: I.cs101,
        facultyId: I.fac1,
        title: 'CS101 Assignment 1 Released',
        content: 'The first assignment has been posted. Please check the course portal.',
        isPublished: true,
        publishedAt: d('2025-08-25'),
      },
      {
        id: I.ann2,
        institutionId: I.institution,
        title: 'Welcome to EIT 2025',
        content: 'Welcome all new students to Ellipsonic Institute of Technology!',
        isPublished: true,
        publishedAt: d('2025-08-01'),
      },
    ],
  });

  // 35. Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: I.notif1,
        institutionId: I.institution,
        userId: I.userStu1,
        title: 'Assignment Graded',
        message: 'Your CS101 assignment has been graded. Score: 18/20',
        type: 'GRADE',
        isRead: false,
      },
      {
        id: I.notif2,
        institutionId: I.institution,
        userId: I.userStu2,
        title: 'Assignment Reminder',
        message: 'CS101 Assignment 1 is due in 5 days',
        type: 'ASSIGNMENT',
        isRead: false,
      },
    ],
  });

  // 36. Certificate Request & Certificate
  await prisma.certificateRequest.create({
    data: {
      id: I.certReq1,
      institutionId: I.institution,
      studentId: I.stu1,
      certificateType: 'STUDY',
      purpose: 'Bank account opening',
      status: 'APPROVED',
      processedByUserId: I.userAdmin,
      processedAt: d('2025-09-10'),
    },
  });

  await prisma.certificate.create({
    data: {
      id: I.cert1,
      institutionId: I.institution,
      studentId: I.stu1,
      requestId: I.certReq1,
      certificateNumber: 'EIT-CERT-2025-001',
      certificateType: 'STUDY',
      issueDate: d('2025-09-12'),
      verificationCode: 'VER-2025-001-ABC',
    },
  });

  // 37. Student Documents
  await prisma.studentDocument.createMany({
    data: [
      {
        id: I.stDoc1,
        institutionId: I.institution,
        studentId: I.stu1,
        documentType: 'IDENTITY',
        title: 'Aadhaar Card',
        fileUrl: '/documents/stu1/aadhaar.pdf',
        verificationStatus: 'VERIFIED',
        verifiedByUserId: I.userAdmin,
        verifiedAt: d('2025-07-20'),
      },
      {
        id: I.stDoc2,
        institutionId: I.institution,
        studentId: I.stu1,
        documentType: 'ACADEMIC',
        title: '12th Marksheet',
        fileUrl: '/documents/stu1/marksheet12.pdf',
        verificationStatus: 'VERIFIED',
        verifiedByUserId: I.userAdmin,
        verifiedAt: d('2025-07-20'),
      },
    ],
  });

  // 38. Feedback Form, Questions, Submissions, Answers
  await prisma.feedbackForm.create({
    data: {
      id: I.fbForm,
      institutionId: I.institution,
      title: 'Course Feedback - CS101',
      description: 'Please provide your feedback for the CS101 course',
      isActive: true,
    },
  });

  await prisma.feedbackQuestion.createMany({
    data: [
      {
        id: I.fbQ1,
        feedbackFormId: I.fbForm,
        question: 'How would you rate the course overall?',
        questionType: 'RATING',
        isRequired: true,
        options: { min: 1, max: 5 },
        order: 1,
      },
      {
        id: I.fbQ2,
        feedbackFormId: I.fbForm,
        question: 'Any suggestions for improvement?',
        questionType: 'TEXT',
        isRequired: false,
        order: 2,
      },
    ],
  });

  await prisma.feedbackSubmission.create({
    data: {
      id: I.fbSub,
      institutionId: I.institution,
      feedbackFormId: I.fbForm,
      studentId: I.stu1,
    },
  });

  await prisma.feedbackAnswer.createMany({
    data: [
      { id: I.fbAns1, submissionId: I.fbSub, questionId: I.fbQ1, answer: '4' },
      {
        id: I.fbAns2,
        submissionId: I.fbSub,
        questionId: I.fbQ2,
        answer: 'More hands-on projects would be great',
      },
    ],
  });

  // 39. Service Request
  await prisma.serviceRequest.create({
    data: {
      id: I.srvReq,
      institutionId: I.institution,
      studentId: I.stu1,
      category: 'Academic',
      subject: 'Course Transfer Request',
      description:
        'I would like to request a transfer from Section CS-A to CS-B due to schedule conflicts.',
      status: 'OPEN',
      priority: 'MEDIUM',
      assignedToUserId: I.userAdmin,
    },
  });

  // 40. Grievance
  await prisma.grievance.create({
    data: {
      id: I.grievance,
      institutionId: I.institution,
      studentId: I.stu2,
      source: 'STUDENT',
      category: 'ATTENDANCE',
      subject: 'Attendance Marking Issue',
      description: 'I was present in the class on Sept 2 but my attendance was not marked.',
      relatedType: 'ATTENDANCE',
      isAnonymous: false,
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  });

  // 41. Clubs
  await prisma.club.create({
    data: {
      id: I.club,
      institutionId: I.institution,
      name: 'EIT Tech Club',
      description: 'Student-led technology and programming club',
      isActive: true,
    },
  });

  await prisma.clubMembership.createMany({
    data: [
      {
        id: I.clubMem1,
        institutionId: I.institution,
        clubId: I.club,
        studentId: I.stu1,
        role: 'President',
        status: 'ACTIVE',
      },
      {
        id: I.clubMem2,
        institutionId: I.institution,
        clubId: I.club,
        studentId: I.stu2,
        role: 'Member',
        status: 'ACTIVE',
      },
    ],
  });

  await prisma.clubEvent.create({
    data: {
      id: I.clubEvt,
      institutionId: I.institution,
      clubId: I.club,
      title: 'Hackathon 2025',
      description: '24-hour coding hackathon',
      startAt: d('2025-10-05T09:00:00'),
      endAt: d('2025-10-06T09:00:00'),
      location: 'CS Lab B-201',
    },
  });

  await prisma.clubEventRegistration.create({
    data: {
      id: I.clubEvtReg,
      institutionId: I.institution,
      clubEventId: I.clubEvt,
      studentId: I.stu1,
      status: 'REGISTERED',
    },
  });

  // 42. Student Skills
  await prisma.studentSkill.createMany({
    data: [
      {
        id: I.skill1,
        institutionId: I.institution,
        studentId: I.stu1,
        name: 'Python',
        level: 'ADVANCED',
      },
      {
        id: I.skill2,
        institutionId: I.institution,
        studentId: I.stu1,
        name: 'JavaScript',
        level: 'INTERMEDIATE',
      },
      {
        id: I.skill3,
        institutionId: I.institution,
        studentId: I.stu2,
        name: 'Python',
        level: 'INTERMEDIATE',
      },
      {
        id: I.skill4,
        institutionId: I.institution,
        studentId: I.stu2,
        name: 'Machine Learning',
        level: 'BEGINNER',
      },
      {
        id: I.skill5,
        institutionId: I.institution,
        studentId: I.stu3,
        name: 'MATLAB',
        level: 'ADVANCED',
      },
      {
        id: I.skill6,
        institutionId: I.institution,
        studentId: I.stu3,
        name: 'R',
        level: 'INTERMEDIATE',
      },
      {
        id: I.skill7,
        institutionId: I.institution,
        studentId: I.stu4,
        name: 'Python',
        level: 'BEGINNER',
      },
      {
        id: I.skill8,
        institutionId: I.institution,
        studentId: I.stu4,
        name: 'Statistics',
        level: 'ADVANCED',
      },
    ],
  });

  // 43. Student Languages
  await prisma.studentLanguage.createMany({
    data: [
      {
        id: I.lang1,
        institutionId: I.institution,
        studentId: I.stu1,
        language: 'English',
        proficiency: 'FLUENT',
      },
      {
        id: I.lang2,
        institutionId: I.institution,
        studentId: I.stu2,
        language: 'English',
        proficiency: 'FLUENT',
      },
      {
        id: I.lang3,
        institutionId: I.institution,
        studentId: I.stu3,
        language: 'English',
        proficiency: 'CONVERSATIONAL',
      },
      {
        id: I.lang4,
        institutionId: I.institution,
        studentId: I.stu4,
        language: 'English',
        proficiency: 'FLUENT',
      },
    ],
  });

  // 44. Student Achievements
  await prisma.studentAchievement.createMany({
    data: [
      {
        id: I.ach1,
        institutionId: I.institution,
        studentId: I.stu1,
        title: 'State-level Coding Competition Winner',
        description: 'Won first place in state coding competition',
        achievementDate: d('2025-03-15'),
        issuer: 'State Education Board',
      },
      {
        id: I.ach2,
        institutionId: I.institution,
        studentId: I.stu3,
        title: 'Math Olympiad Gold Medal',
        description: 'Gold medal in national math olympiad',
        achievementDate: d('2025-02-20'),
        issuer: 'National Math Foundation',
      },
    ],
  });

  // 45. Student Previous Education
  await prisma.studentPreviousEducation.createMany({
    data: [
      {
        id: I.prevEd1,
        institutionId: I.institution,
        studentId: I.stu1,
        institutionName: 'Delhi Public School, Noida',
        academicYear: '2023-2024',
        sequence: 1,
      },
      {
        id: I.prevEd2,
        institutionId: I.institution,
        studentId: I.stu3,
        institutionName: "St. Xavier's School, Jaipur",
        academicYear: '2023-2024',
        sequence: 1,
      },
    ],
  });

  // 46. Student Projects
  await prisma.studentProject.createMany({
    data: [
      {
        id: I.proj1,
        institutionId: I.institution,
        studentId: I.stu1,
        title: 'Weather App',
        description: 'A React-based weather application using OpenWeather API',
        technologies: 'React, TypeScript, REST API',
        projectUrl: 'https://github.com/rahulverma/weather-app',
        startDate: d('2025-06-01'),
        endDate: d('2025-07-15'),
      },
      {
        id: I.proj2,
        institutionId: I.institution,
        studentId: I.stu2,
        title: 'Sentiment Analysis Tool',
        description: 'NLP-based sentiment analysis for social media posts',
        technologies: 'Python, NLTK, Flask',
        projectUrl: 'https://github.com/snehagupta/sentiment-nlp',
        startDate: d('2025-05-10'),
        endDate: d('2025-07-20'),
      },
    ],
  });

  // 47. Student Social Profiles
  await prisma.studentSocialProfile.createMany({
    data: [
      {
        id: I.socProf1,
        studentId: I.stu1,
        platform: 'GITHUB',
        profileUrl: 'https://github.com/rahulverma',
      },
      {
        id: I.socProf2,
        studentId: I.stu2,
        platform: 'LINKEDIN',
        profileUrl: 'https://linkedin.com/in/snehagupta',
      },
    ],
  });

  // 48. Student Terms
  await prisma.studentTerm.createMany({
    data: [
      {
        id: I.stTerm1,
        institutionId: I.institution,
        studentId: I.stu1,
        academicTermId: I.termSem1,
        curriculumTermId: I.currTermCS1,
        status: 'ACTIVE',
        termGPA: null,
      },
      {
        id: I.stTerm2,
        institutionId: I.institution,
        studentId: I.stu3,
        academicTermId: I.termSem1,
        curriculumTermId: I.currTermMath1,
        status: 'ACTIVE',
        termGPA: null,
      },
    ],
  });

  // 49. Fee Plans & Installments
  await prisma.studentFeePlan.createMany({
    data: [
      {
        id: I.feePlan1,
        institutionId: I.institution,
        studentId: I.stu1,
        academicYearId: I.ay2025,
        totalAmount: 150000,
        currency: 'INR',
        paymentMode: 'INSTALLMENTS',
        status: 'ACTIVE',
      },
      {
        id: I.feePlan2,
        institutionId: I.institution,
        studentId: I.stu3,
        academicYearId: I.ay2025,
        totalAmount: 120000,
        currency: 'INR',
        paymentMode: 'ANNUAL',
        status: 'ACTIVE',
      },
    ],
  });

  await prisma.feeInstallment.createMany({
    data: [
      {
        id: I.inst1,
        studentFeePlanId: I.feePlan1,
        installmentNumber: 1,
        amount: 75000,
        amountPaid: 75000,
        dueDate: d('2025-08-01'),
        status: 'PAID',
      },
      {
        id: I.inst2,
        studentFeePlanId: I.feePlan1,
        installmentNumber: 2,
        amount: 75000,
        amountPaid: 0,
        dueDate: d('2026-01-05'),
        status: 'PENDING',
      },
      {
        id: I.inst3,
        studentFeePlanId: I.feePlan2,
        installmentNumber: 1,
        amount: 120000,
        amountPaid: 120000,
        dueDate: d('2025-08-01'),
        status: 'PAID',
      },
      {
        id: I.inst4,
        studentFeePlanId: I.feePlan2,
        installmentNumber: 2,
        amount: 0,
        amountPaid: 0,
        dueDate: d('2026-08-01'),
        status: 'PAID',
      },
    ],
  });

  // 50. Applications
  await prisma.application.createMany({
    data: [
      {
        id: I.app1,
        institutionId: I.institution,
        programId: I.progBTechCS,
        academicYearId: I.ay2025,
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul.verma@student.eit.edu',
        phone: '+91-98765-43213',
        status: 'ENROLLED',
        applicationFee: 1000,
        isFeePaid: true,
        submittedAt: d('2025-05-01'),
        acceptedAt: d('2025-06-15'),
        enrolledAt: d('2025-07-15'),
        studentId: I.stu1,
      },
      {
        id: I.app2,
        institutionId: I.institution,
        programId: I.progBTechMath,
        academicYearId: I.ay2025,
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@student.eit.edu',
        phone: '+91-98765-43215',
        status: 'SUBMITTED',
        applicationFee: 1000,
        isFeePaid: true,
        submittedAt: d('2025-05-10'),
        studentId: I.stu3,
      },
    ],
  });

  // 51. Lesson Plans
  await prisma.lessonPlan.createMany({
    data: [
      {
        id: I.lp1,
        institutionId: I.institution,
        courseId: I.cs101,
        facultyId: I.fac1,
        termId: I.termSem1,
        title: 'Introduction to C - Week 1',
        description: 'Basic syntax, variables, and data types',
        sequence: 1,
        plannedDate: d('2025-09-01'),
        durationMinutes: 90,
        teachingMethod: 'LECTURE',
        status: 'COMPLETED',
        learningObjectives: ['Understand C program structure', 'Declare and use variables'],
        teachingPlan: { activities: ['Lecture', 'Live coding', 'Q&A'] },
      },
      {
        id: I.lp2,
        institutionId: I.institution,
        courseId: I.ma101,
        facultyId: I.fac2,
        termId: I.termSem1,
        title: 'Vector Spaces - Week 1',
        description: 'Definition and properties of vector spaces',
        sequence: 1,
        plannedDate: d('2025-09-02'),
        durationMinutes: 60,
        teachingMethod: 'LECTURE',
        status: 'COMPLETED',
      },
    ],
  });

  await prisma.lessonPlanSection.create({
    data: { id: I.lpSec1, lessonPlanId: I.lp1, sectionId: I.sectionCS },
  });

  await prisma.lessonPlanResource.create({
    data: { id: I.lpRes1, lessonPlanId: I.lp1, resourceId: I.res1, sortOrder: 1 },
  });

  // 52. Admin Resources
  await prisma.adminResource.create({
    data: {
      id: I.adminRes,
      institutionId: I.institution,
      courseId: I.cs101,
      title: 'Course Syllabus CS101',
      description: 'Official syllabus for CS101',
      resourceType: 'PDF',
      fileUrl: '/admin/cs101/syllabus.pdf',
      uploadedBy: I.userAdmin,
    },
  });

  // 53. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: I.audit1,
        institutionId: I.institution,
        actorUserId: I.userAdmin,
        action: 'CREATE',
        entityType: 'Institution',
        entityId: I.institution,
        afterData: { name: 'Ellipsonic Institute of Technology' },
      },
      {
        id: I.audit2,
        institutionId: I.institution,
        actorUserId: I.userAdmin,
        action: 'ENROLL',
        entityType: 'Student',
        entityId: I.stu1,
        afterData: { studentId: I.stu1, courseId: I.cs101 },
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   Institution: Ellipsonic Institute of Technology`);
  console.log(`   Departments: 2 (CS, Mathematics)`);
  console.log(`   Programs: 2 (B.Tech CS, B.Tech Math)`);
  console.log(`   Courses: 6`);
  console.log(`   Users: 9 (1 admin, 2 faculty, 4 students, 2 guardians)`);
  console.log(`   Enrollments: 8`);
  console.log(`   ...and all related entities seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
