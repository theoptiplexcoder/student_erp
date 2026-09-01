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
// ─── Helpers ────────────────────────────────────────────
const d = (s: string) => new Date(s); // date helper
const time = (h: number, m: number) =>
  new Date(`1970-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);

// ─── Cleanup (reverse FK order) ────────────────────────
async function cleanup() {
  console.log('🧹 Cleaning up existing data...');
  const tables = [
    'timetable_entries',
    'timetables',
    'faculty_availability',
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

  const I: any = {};
  const now = new Date();

  console.log('🌱 Seeding institution...');

  // 1. Institution
  await await (async () => {
    const _created = await prisma.institution.create({
      data: {
        institutionType: 'UNIVERSITY',
        legalName: 'Ellipsonic Institute of Technology',
        displayName: 'EIT',
        branding: { primaryColor: '#1a365d', accentColor: '#e53e3e' },
      },
    });
    I.institution = _created.id;
    return _created;
  })();

  // 2. Departments
  await await (async () => {
    const _modelData = [
      {
        idKey: 'deptCS',
        data: { institutionId: I.institution, name: 'Computer Science', code: 'CS' },
      },
      {
        idKey: 'deptMath',
        data: { institutionId: I.institution, name: 'Mathematics', code: 'MA' },
      },
    ];
    const _created = await prisma.department.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 3. Academic Year
  await await (async () => {
    const _created = await prisma.academicYear.create({
      data: {
        institutionId: I.institution,
        name: '2025-2026',
        startDate: d('2025-08-01'),
        endDate: d('2026-07-31'),
        isActive: true,
      },
    });
    I.ay2025 = _created.id;
    return _created;
  })();

  // 4. Class Levels
  await await (async () => {
    const _modelData = [
      {
        idKey: 'clsYr1',
        data: { institutionId: I.institution, name: 'Year 1', code: 'Y1', sequence: 1 },
      },
      {
        idKey: 'clsYr2',
        data: { institutionId: I.institution, name: 'Year 2', code: 'Y2', sequence: 2 },
      },
      {
        idKey: 'clsYr3',
        data: { institutionId: I.institution, name: 'Year 3', code: 'Y3', sequence: 3 },
      },
    ];
    const _created = await prisma.classLevel.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 5. Building & Rooms
  await await (async () => {
    const _created = await prisma.building.create({
      data: {
        institutionId: I.institution,
        name: 'Main Building',
        code: 'MB',
        address: 'EIT Campus, Sector 15, Noida, UP',
        floors: 4,
      },
    });
    I.building = _created.id;
    return _created;
  })();

  await await (async () => {
    const _modelData = [
      {
        idKey: 'roomA101',
        data: {
          institutionId: I.institution,
          buildingId: I.building,
          name: 'Lecture Hall A',
          number: 'A-101',
          floor: 1,
          capacity: 120,
          roomType: 'LECTURE_HALL',
        },
      },
      {
        idKey: 'roomB201',
        data: {
          institutionId: I.institution,
          buildingId: I.building,
          name: 'CS Lab B',
          number: 'B-201',
          floor: 2,
          capacity: 60,
          roomType: 'LAB',
        },
      },
      {
        idKey: 'roomC301',
        data: {
          institutionId: I.institution,
          buildingId: I.building,
          name: 'Faculty Office C',
          number: 'C-301',
          floor: 3,
          capacity: 4,
          roomType: 'OFFICE',
        },
      },
    ];
    const _created = await prisma.room.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 6. Programs
  await await (async () => {
    const _modelData = [
      {
        idKey: 'progBTechCS',
        data: {
          institutionId: I.institution,
          departmentId: I.deptCS,
          name: 'B.Tech Computer Science',
          code: 'BTCS',
          level: 'UNDERGRADUATE',
          durationYears: 4,
        },
      },
      {
        idKey: 'progBTechMath',
        data: {
          institutionId: I.institution,
          departmentId: I.deptMath,
          name: 'B.Tech Mathematics',
          code: 'BTMA',
          level: 'UNDERGRADUATE',
          durationYears: 3,
        },
      },
    ];
    const _created = await prisma.program.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 7. Custom Role & Permissions
  await await (async () => {
    const _created = await prisma.customRole.create({
      data: {
        institutionId: I.institution,
        name: 'Department Head',
        description: 'Head of department with full department management access',
      },
    });
    I.customRole = _created.id;
    return _created;
  })();

  await await (async () => {
    const _modelData = [
      {
        idKey: 'perm1',
        data: { customRoleId: I.customRole, resource: 'faculty', action: 'MANAGE' },
      },
      {
        idKey: 'perm2',
        data: { customRoleId: I.customRole, resource: 'course', action: 'MANAGE' },
      },
    ];
    const _created = await prisma.rolePermission.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 8. Curriculums
  await await (async () => {
    const _modelData = [
      {
        idKey: 'currCS',
        data: {
          institutionId: I.institution,
          programId: I.progBTechCS,
          versionNumber: '1.0',
          name: 'B.Tech CS Curriculum 2025',
          status: 'ACTIVE',
          effectiveFrom: d('2025-08-01'),
        },
      },
      {
        idKey: 'currMath',
        data: {
          institutionId: I.institution,
          programId: I.progBTechMath,
          versionNumber: '1.0',
          name: 'B.Tech Math Curriculum 2025',
          status: 'ACTIVE',
          effectiveFrom: d('2025-08-01'),
        },
      },
    ];
    const _created = await prisma.curriculum.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 9. Academic Terms
  await await (async () => {
    const _modelData = [
      {
        idKey: 'termSem1',
        data: {
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
      },
      {
        idKey: 'termSem2',
        data: {
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
      },
    ];
    const _created = await prisma.academicTerm.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 10. Curriculum Terms
  await await (async () => {
    const _modelData = [
      {
        idKey: 'currTermCS1',
        data: {
          institutionId: I.institution,
          curriculumId: I.currCS,
          name: 'Semester 1',
          sequence: 1,
          creditRequirement: 20,
        },
      },
      {
        idKey: 'currTermMath1',
        data: {
          institutionId: I.institution,
          curriculumId: I.currMath,
          name: 'Semester 1',
          sequence: 1,
          creditRequirement: 18,
        },
      },
    ];
    const _created = await prisma.curriculumTerm.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 11. Curriculum Elective Groups
  await await (async () => {
    const _modelData = [
      {
        idKey: 'electiveGrpCS',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermCS1,
          name: 'CS Electives',
          requiredCredits: 6,
          requiredCourses: 2,
        },
      },
      {
        idKey: 'electiveGrpMath',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermMath1,
          name: 'Math Electives',
          requiredCredits: 4,
          requiredCourses: 1,
        },
      },
    ];
    const _created = await prisma.curriculumElectiveGroup.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 12. Batches
  await await (async () => {
    const _modelData = [
      {
        idKey: 'batchCS2025',
        data: {
          institutionId: I.institution,
          programId: I.progBTechCS,
          name: 'CS Batch 2025',
          admissionYear: 2025,
          startDate: d('2025-08-01'),
          expectedEndDate: d('2029-06-30'),
        },
      },
      {
        idKey: 'batchMath2025',
        data: {
          institutionId: I.institution,
          programId: I.progBTechMath,
          name: 'Math Batch 2025',
          admissionYear: 2025,
          startDate: d('2025-08-01'),
          expectedEndDate: d('2028-06-30'),
        },
      },
    ];
    const _created = await prisma.batch.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 13. Sections
  await await (async () => {
    const _modelData = [
      {
        idKey: 'sectionCS',
        data: {
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
      },
      {
        idKey: 'sectionMath',
        data: {
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
      },
    ];
    const _created = await prisma.section.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 14. Courses
  await await (async () => {
    const _modelData = [
      {
        idKey: 'cs101',
        data: {
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
      },
      {
        idKey: 'cs201',
        data: {
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
      },
      {
        idKey: 'cs301',
        data: {
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
      },
      {
        idKey: 'ma101',
        data: {
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
      },
      {
        idKey: 'ma201',
        data: {
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
      },
      {
        idKey: 'ma301',
        data: {
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
      },
    ];
    const _created = await prisma.course.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 15. Curriculum Courses
  await await (async () => {
    const _modelData = [
      {
        idKey: 'ccCS1',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermCS1,
          courseId: I.cs101,
          sequence: 1,
          creditValue: 4,
          isMandatory: true,
        },
      },
      {
        idKey: 'ccCS2',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermCS1,
          courseId: I.cs201,
          sequence: 2,
          creditValue: 4,
          isMandatory: true,
        },
      },
      {
        idKey: 'ccCS3',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermCS1,
          courseId: I.cs301,
          sequence: 3,
          creditValue: 4,
          isMandatory: false,
          electiveGroupId: I.electiveGrpCS,
        },
      },
      {
        idKey: 'ccMA1',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermMath1,
          courseId: I.ma101,
          sequence: 1,
          creditValue: 3,
          isMandatory: true,
        },
      },
      {
        idKey: 'ccMA2',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermMath1,
          courseId: I.ma201,
          sequence: 2,
          creditValue: 3,
          isMandatory: true,
        },
      },
      {
        idKey: 'ccMA3',
        data: {
          institutionId: I.institution,
          curriculumTermId: I.currTermMath1,
          courseId: I.ma301,
          sequence: 3,
          creditValue: 3,
          isMandatory: false,
          electiveGroupId: I.electiveGrpMath,
        },
      },
    ];
    const _created = await prisma.curriculumCourse.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 16. Course Prerequisites
  await await (async () => {
    const _created = await prisma.coursePrerequisite.create({
      data: {
        institutionId: I.institution,
        courseId: I.cs201,
        prerequisiteCourseId: I.cs101,
      },
    });
    I.prereq1 = _created.id;
    return _created;
  })();

  // 17. Users
  const usersToCreate = [
    {
      idKey: 'userAdmin',
      institutionId: I.institution,
      email: 'admin@eit.edu',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-98765-43210',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      idKey: 'userFac1',
      institutionId: I.institution,
      email: 'priya.sharma@eit.edu',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-98765-43211',
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    {
      idKey: 'userFac2',
      institutionId: I.institution,
      email: 'amit.patel@eit.edu',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91-98765-43212',
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    {
      idKey: 'userStu1',
      institutionId: I.institution,
      email: 'rahul.verma@student.eit.edu',
      firstName: 'Rahul',
      lastName: 'Verma',
      phone: '+91-98765-43213',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      idKey: 'userStu2',
      institutionId: I.institution,
      email: 'sneha.gupta@student.eit.edu',
      firstName: 'Sneha',
      lastName: 'Gupta',
      phone: '+91-98765-43214',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      idKey: 'userStu3',
      institutionId: I.institution,
      email: 'vikram.singh@student.eit.edu',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-98765-43215',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      idKey: 'userStu4',
      institutionId: I.institution,
      email: 'ananya.reddy@student.eit.edu',
      firstName: 'Ananya',
      lastName: 'Reddy',
      phone: '+91-98765-43216',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    {
      idKey: 'userGuard1',
      institutionId: I.institution,
      email: 'suresh.verma@gmail.com',
      firstName: 'Suresh',
      lastName: 'Verma',
      phone: '+91-98765-43217',
      role: 'GUARDIAN',
      status: 'ACTIVE',
    },
    {
      idKey: 'userGuard2',
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

    const createdUser = await prisma.user.create({
      data: {
        ...(u as any),
        idKey: undefined,
        authUserId: authUserId,
      },
    });
    if ((u as any).idKey) {
      I[(u as any).idKey] = createdUser.id;
    }
  }

  // 18. Faculty
  await await (async () => {
    const _modelData = [
      {
        idKey: 'fac1',
        data: {
          institutionId: I.institution,
          userId: I.userFac1,
          departmentId: I.deptCS,
          teacherCode: 'FAC-001',
          employmentType: 'FULL_TIME',
          hireDate: d('2018-07-01'),
          status: 'ACTIVE',
        },
      },
      {
        idKey: 'fac2',
        data: {
          institutionId: I.institution,
          userId: I.userFac2,
          departmentId: I.deptMath,
          teacherCode: 'FAC-002',
          employmentType: 'FULL_TIME',
          hireDate: d('2019-01-15'),
          status: 'ACTIVE',
        },
      },
    ];
    const _created = await prisma.faculty.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 19. Guardians
  await await (async () => {
    const _modelData = [
      {
        idKey: 'guard1',
        data: {
          institutionId: I.institution,
          userId: I.userGuard1,
          occupation: 'Engineer',
          relationship: 'Father',
        },
      },
      {
        idKey: 'guard2',
        data: {
          institutionId: I.institution,
          userId: I.userGuard2,
          occupation: 'Teacher',
          relationship: 'Mother',
        },
      },
    ];
    const _created = await prisma.guardian.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 20. Students
  await await (async () => {
    const _modelData = [
      {
        idKey: 'stu1',
        data: {
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
      },
      {
        idKey: 'stu2',
        data: {
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
      },
      {
        idKey: 'stu3',
        data: {
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
      },
      {
        idKey: 'stu4',
        data: {
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
      },
    ];
    const _created = await prisma.student.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 21. Course Offerings
  await await (async () => {
    const _modelData = [
      {
        idKey: 'offCS101',
        data: {
          institutionId: I.institution,
          courseId: I.cs101,
          termId: I.termSem1,
          programId: I.progBTechCS,
          batchId: I.batchCS2025,
          sectionId: I.sectionCS,
          capacity: 60,
        },
      },
      {
        idKey: 'offCS201',
        data: {
          institutionId: I.institution,
          courseId: I.cs201,
          termId: I.termSem1,
          programId: I.progBTechCS,
          batchId: I.batchCS2025,
          sectionId: I.sectionCS,
          capacity: 60,
        },
      },
      {
        idKey: 'offCS301',
        data: {
          institutionId: I.institution,
          courseId: I.cs301,
          termId: I.termSem1,
          programId: I.progBTechCS,
          batchId: I.batchCS2025,
          sectionId: I.sectionCS,
          capacity: 60,
        },
      },
      {
        idKey: 'offMA101',
        data: {
          institutionId: I.institution,
          courseId: I.ma101,
          termId: I.termSem1,
          programId: I.progBTechMath,
          batchId: I.batchMath2025,
          sectionId: I.sectionMath,
          capacity: 40,
        },
      },
      {
        idKey: 'offMA201',
        data: {
          institutionId: I.institution,
          courseId: I.ma201,
          termId: I.termSem1,
          programId: I.progBTechMath,
          batchId: I.batchMath2025,
          sectionId: I.sectionMath,
          capacity: 40,
        },
      },
      {
        idKey: 'offMA301',
        data: {
          institutionId: I.institution,
          courseId: I.ma301,
          termId: I.termSem1,
          programId: I.progBTechMath,
          batchId: I.batchMath2025,
          sectionId: I.sectionMath,
          capacity: 40,
        },
      },
    ];
    const _created = await prisma.courseOffering.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 22. Course Assignments
  await await (async () => {
    const _modelData = [
      {
        idKey: 'ca1',
        data: {
          institutionId: I.institution,
          facultyId: I.fac1,
          courseId: I.cs101,
          sectionId: I.sectionCS,
          termId: I.termSem1,
          isPrimary: true,
        },
      },
      {
        idKey: 'ca2',
        data: {
          institutionId: I.institution,
          facultyId: I.fac2,
          courseId: I.ma101,
          sectionId: I.sectionMath,
          termId: I.termSem1,
          isPrimary: true,
        },
      },
    ];
    const _created = await prisma.courseAssignment.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 23. Enrollments
  await await (async () => {
    const _modelData = [
      {
        idKey: 'enr1',
        data: {
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
      },
      {
        idKey: 'enr2',
        data: {
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
      },
      {
        idKey: 'enr3',
        data: {
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
      },
      {
        idKey: 'enr4',
        data: {
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
      },
      {
        idKey: 'enr5',
        data: {
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
      },
      {
        idKey: 'enr6',
        data: {
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
      },
      {
        idKey: 'enr7',
        data: {
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
      },
      {
        idKey: 'enr8',
        data: {
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
      },
    ];
    const _created = await prisma.enrollment.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 24. Timetable & Timetable Entries
  await await (async () => {
    const _timetable = await prisma.timetable.create({
      data: {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.termSem1,
        name: 'Fall 2025 Regular Schedule',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    I.timetable1 = _timetable.id;

    const _modelData = [
      {
        idKey: 'tt1',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.cs101,
          facultyId: I.fac1,
          sectionId: I.sectionCS,
          dayOfWeek: 'MONDAY',
          startTime: time(9, 0),
          endTime: time(10, 30),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt2',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.ma101,
          facultyId: I.fac2,
          sectionId: I.sectionMath,
          dayOfWeek: 'MONDAY',
          startTime: time(11, 0),
          endTime: time(12, 30),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt3',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.cs201,
          facultyId: I.fac1,
          sectionId: I.sectionCS,
          dayOfWeek: 'TUESDAY',
          startTime: time(9, 0),
          endTime: time(10, 30),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt4',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.cs301,
          facultyId: I.fac1,
          sectionId: I.sectionCS,
          dayOfWeek: 'WEDNESDAY',
          startTime: time(13, 0),
          endTime: time(16, 0),
          roomId: I.roomB201,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt5',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.cs101,
          facultyId: I.fac1,
          sectionId: I.sectionCS,
          dayOfWeek: 'THURSDAY',
          startTime: time(10, 0),
          endTime: time(11, 30),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt6',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.ma101,
          facultyId: I.fac2,
          sectionId: I.sectionMath,
          dayOfWeek: 'THURSDAY',
          startTime: time(11, 30),
          endTime: time(13, 0),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
      {
        idKey: 'tt7',
        data: {
          institutionId: I.institution,
          academicYearId: I.ay2025,
          termId: I.termSem1,
          timetableId: I.timetable1,
          courseId: I.ma201,
          facultyId: I.fac2,
          sectionId: I.sectionMath,
          dayOfWeek: 'FRIDAY',
          startTime: time(14, 0),
          endTime: time(15, 30),
          roomId: I.roomA101,
          buildingId: I.building,
        },
      },
    ];
    const _created = await prisma.timetableEntry.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 25. Attendance Sessions
  await await (async () => {
    const _modelData = [
      {
        idKey: 'attSess1',
        data: {
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
      },
      {
        idKey: 'attSess2',
        data: {
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
      },
    ];
    const _created = await prisma.attendanceSession.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 26. Attendance Records
  await await (async () => {
    const _modelData = [
      {
        idKey: 'attRec1',
        data: {
          institutionId: I.institution,
          attendanceSessionId: I.attSess1,
          studentId: I.stu1,
          status: 'PRESENT',
          remarks: null,
        },
      },
      {
        idKey: 'attRec2',
        data: {
          institutionId: I.institution,
          attendanceSessionId: I.attSess1,
          studentId: I.stu2,
          status: 'LATE',
          remarks: 'Arrived 10 minutes late',
        },
      },
      {
        idKey: 'attRec3',
        data: {
          institutionId: I.institution,
          attendanceSessionId: I.attSess2,
          studentId: I.stu3,
          status: 'PRESENT',
          remarks: null,
        },
      },
      {
        idKey: 'attRec4',
        data: {
          institutionId: I.institution,
          attendanceSessionId: I.attSess2,
          studentId: I.stu4,
          status: 'ABSENT',
          remarks: 'Medical leave',
        },
      },
    ];
    const _created = await prisma.attendanceRecord.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 27. Course Resources
  await await (async () => {
    const _modelData = [
      {
        idKey: 'res1',
        data: {
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
      },
      {
        idKey: 'res2',
        data: {
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
      },
    ];
    const _created = await prisma.courseResource.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 28. Assignments
  await await (async () => {
    const _modelData = [
      {
        idKey: 'assign1',
        data: {
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
      },
      {
        idKey: 'assign2',
        data: {
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
      },
    ];
    const _created = await prisma.assignment.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 29. Assignment Submissions
  await await (async () => {
    const _modelData = [
      {
        idKey: 'sub1',
        data: {
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
      },
      {
        idKey: 'sub2',
        data: {
          institutionId: I.institution,
          assignmentId: I.assign1,
          studentId: I.stu2,
          submissionUrl: '/submissions/stu2/assign1.zip',
          submittedAt: d('2025-09-11'),
          status: 'SUBMITTED',
          marks: null,
          feedback: null,
        },
      },
    ];
    const _created = await prisma.assignmentSubmission.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 30. Exams
  await await (async () => {
    const _created = await prisma.exam.create({
      data: {
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
    I.exam1 = _created.id;
    return _created;
  })();

  // 31. Exam Courses
  await await (async () => {
    const _created = await prisma.examCourse.create({
      data: {
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
    I.examCourse1 = _created.id;
    return _created;
  })();

  // 32. Marks
  await await (async () => {
    const _modelData = [
      {
        idKey: 'mark1',
        data: {
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
      },
      {
        idKey: 'mark2',
        data: {
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
      },
    ];
    const _created = await prisma.mark.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 33. Calendar Events
  await await (async () => {
    const _modelData = [
      {
        idKey: 'cal1',
        data: {
          institutionId: I.institution,
          title: 'Semester 1 Begins',
          description: 'First day of classes for Semester 1',
          eventType: 'ACADEMIC',
          startAt: d('2025-08-01'),
          endAt: d('2025-08-01'),
          isAllDay: true,
        },
      },
      {
        idKey: 'cal2',
        data: {
          institutionId: I.institution,
          title: 'Midterm Exams',
          description: 'Midterm examination period',
          eventType: 'EXAM',
          startAt: d('2025-10-15'),
          endAt: d('2025-10-25'),
          isAllDay: true,
        },
      },
    ];
    const _created = await prisma.calendarEvent.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 34. Announcements
  await await (async () => {
    const _modelData = [
      {
        idKey: 'ann1',
        data: {
          institutionId: I.institution,
          courseId: I.cs101,
          facultyId: I.fac1,
          title: 'CS101 Assignment 1 Released',
          content: 'The first assignment has been posted. Please check the course portal.',
          isPublished: true,
          publishedAt: d('2025-08-25'),
        },
      },
      {
        idKey: 'ann2',
        data: {
          institutionId: I.institution,
          title: 'Welcome to EIT 2025',
          content: 'Welcome all new students to Ellipsonic Institute of Technology!',
          isPublished: true,
          publishedAt: d('2025-08-01'),
        },
      },
    ];
    const _created = await prisma.announcement.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 35. Notifications
  await await (async () => {
    const _modelData = [
      {
        idKey: 'notif1',
        data: {
          institutionId: I.institution,
          userId: I.userStu1,
          title: 'Assignment Graded',
          message: 'Your CS101 assignment has been graded. Score: 18/20',
          type: 'GRADE',
          isRead: false,
        },
      },
      {
        idKey: 'notif2',
        data: {
          institutionId: I.institution,
          userId: I.userStu2,
          title: 'Assignment Reminder',
          message: 'CS101 Assignment 1 is due in 5 days',
          type: 'ASSIGNMENT',
          isRead: false,
        },
      },
    ];
    const _created = await prisma.notification.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 36. Certificate Request & Certificate
  await await (async () => {
    const _created = await prisma.certificateRequest.create({
      data: {
        institutionId: I.institution,
        studentId: I.stu1,
        certificateType: 'STUDY',
        purpose: 'Bank account opening',
        status: 'APPROVED',
        processedByUserId: I.userAdmin,
        processedAt: d('2025-09-10'),
      },
    });
    I.certReq1 = _created.id;
    return _created;
  })();

  await await (async () => {
    const _created = await prisma.certificate.create({
      data: {
        institutionId: I.institution,
        studentId: I.stu1,
        requestId: I.certReq1,
        certificateNumber: 'EIT-CERT-2025-001',
        certificateType: 'STUDY',
        issueDate: d('2025-09-12'),
        verificationCode: 'VER-2025-001-ABC',
      },
    });
    I.cert1 = _created.id;
    return _created;
  })();

  // 37. Student Documents
  await await (async () => {
    const _modelData = [
      {
        idKey: 'stDoc1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          documentType: 'IDENTITY',
          title: 'Aadhaar Card',
          fileUrl: '/documents/stu1/aadhaar.pdf',
          verificationStatus: 'VERIFIED',
          verifiedByUserId: I.userAdmin,
          verifiedAt: d('2025-07-20'),
        },
      },
      {
        idKey: 'stDoc2',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          documentType: 'ACADEMIC',
          title: '12th Marksheet',
          fileUrl: '/documents/stu1/marksheet12.pdf',
          verificationStatus: 'VERIFIED',
          verifiedByUserId: I.userAdmin,
          verifiedAt: d('2025-07-20'),
        },
      },
    ];
    const _created = await prisma.studentDocument.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 38. Feedback Form, Questions, Submissions, Answers
  await await (async () => {
    const _created = await prisma.feedbackForm.create({
      data: {
        institutionId: I.institution,
        title: 'Course Feedback - CS101',
        description: 'Please provide your feedback for the CS101 course',
        isActive: true,
      },
    });
    I.fbForm = _created.id;
    return _created;
  })();

  await await (async () => {
    const _modelData = [
      {
        idKey: 'fbQ1',
        data: {
          feedbackFormId: I.fbForm,
          question: 'How would you rate the course overall?',
          questionType: 'RATING',
          isRequired: true,
          options: { min: 1, max: 5 },
          order: 1,
        },
      },
      {
        idKey: 'fbQ2',
        data: {
          feedbackFormId: I.fbForm,
          question: 'Any suggestions for improvement?',
          questionType: 'TEXT',
          isRequired: false,
          order: 2,
        },
      },
    ];
    const _created = await prisma.feedbackQuestion.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  await await (async () => {
    const _created = await prisma.feedbackSubmission.create({
      data: {
        institutionId: I.institution,
        feedbackFormId: I.fbForm,
        studentId: I.stu1,
      },
    });
    I.fbSub = _created.id;
    return _created;
  })();

  await await (async () => {
    const _modelData = [
      { idKey: 'fbAns1', data: { submissionId: I.fbSub, questionId: I.fbQ1, answer: '4' } },
      {
        idKey: 'fbAns2',
        data: {
          submissionId: I.fbSub,
          questionId: I.fbQ2,
          answer: 'More hands-on projects would be great',
        },
      },
    ];
    const _created = await prisma.feedbackAnswer.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 39. Service Request
  await await (async () => {
    const _created = await prisma.serviceRequest.create({
      data: {
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
    I.srvReq = _created.id;
    return _created;
  })();

  // 40. Grievance
  await await (async () => {
    const _created = await prisma.grievance.create({
      data: {
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
    I.grievance = _created.id;
    return _created;
  })();

  // 41. Clubs
  await await (async () => {
    const _created = await prisma.club.create({
      data: {
        institutionId: I.institution,
        name: 'EIT Tech Club',
        description: 'Student-led technology and programming club',
        isActive: true,
      },
    });
    I.club = _created.id;
    return _created;
  })();

  await await (async () => {
    const _modelData = [
      {
        idKey: 'clubMem1',
        data: {
          institutionId: I.institution,
          clubId: I.club,
          studentId: I.stu1,
          role: 'President',
          status: 'ACTIVE',
        },
      },
      {
        idKey: 'clubMem2',
        data: {
          institutionId: I.institution,
          clubId: I.club,
          studentId: I.stu2,
          role: 'Member',
          status: 'ACTIVE',
        },
      },
    ];
    const _created = await prisma.clubMembership.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  await await (async () => {
    const _created = await prisma.clubEvent.create({
      data: {
        institutionId: I.institution,
        clubId: I.club,
        title: 'Hackathon 2025',
        description: '24-hour coding hackathon',
        startAt: d('2025-10-05T09:00:00'),
        endAt: d('2025-10-06T09:00:00'),
        location: 'CS Lab B-201',
      },
    });
    I.clubEvt = _created.id;
    return _created;
  })();

  await await (async () => {
    const _created = await prisma.clubEventRegistration.create({
      data: {
        institutionId: I.institution,
        clubEventId: I.clubEvt,
        studentId: I.stu1,
        status: 'REGISTERED',
      },
    });
    I.clubEvtReg = _created.id;
    return _created;
  })();

  // 42. Student Skills
  await await (async () => {
    const _modelData = [
      {
        idKey: 'skill1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          name: 'Python',
          level: 'ADVANCED',
        },
      },
      {
        idKey: 'skill2',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          name: 'JavaScript',
          level: 'INTERMEDIATE',
        },
      },
      {
        idKey: 'skill3',
        data: {
          institutionId: I.institution,
          studentId: I.stu2,
          name: 'Python',
          level: 'INTERMEDIATE',
        },
      },
      {
        idKey: 'skill4',
        data: {
          institutionId: I.institution,
          studentId: I.stu2,
          name: 'Machine Learning',
          level: 'BEGINNER',
        },
      },
      {
        idKey: 'skill5',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          name: 'MATLAB',
          level: 'ADVANCED',
        },
      },
      {
        idKey: 'skill6',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          name: 'R',
          level: 'INTERMEDIATE',
        },
      },
      {
        idKey: 'skill7',
        data: {
          institutionId: I.institution,
          studentId: I.stu4,
          name: 'Python',
          level: 'BEGINNER',
        },
      },
      {
        idKey: 'skill8',
        data: {
          institutionId: I.institution,
          studentId: I.stu4,
          name: 'Statistics',
          level: 'ADVANCED',
        },
      },
    ];
    const _created = await prisma.studentSkill.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 43. Student Languages
  await await (async () => {
    const _modelData = [
      {
        idKey: 'lang1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          language: 'English',
          proficiency: 'FLUENT',
        },
      },
      {
        idKey: 'lang2',
        data: {
          institutionId: I.institution,
          studentId: I.stu2,
          language: 'English',
          proficiency: 'FLUENT',
        },
      },
      {
        idKey: 'lang3',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          language: 'English',
          proficiency: 'CONVERSATIONAL',
        },
      },
      {
        idKey: 'lang4',
        data: {
          institutionId: I.institution,
          studentId: I.stu4,
          language: 'English',
          proficiency: 'FLUENT',
        },
      },
    ];
    const _created = await prisma.studentLanguage.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 44. Student Achievements
  await await (async () => {
    const _modelData = [
      {
        idKey: 'ach1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          title: 'State-level Coding Competition Winner',
          description: 'Won first place in state coding competition',
          achievementDate: d('2025-03-15'),
          issuer: 'State Education Board',
        },
      },
      {
        idKey: 'ach2',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          title: 'Math Olympiad Gold Medal',
          description: 'Gold medal in national math olympiad',
          achievementDate: d('2025-02-20'),
          issuer: 'National Math Foundation',
        },
      },
    ];
    const _created = await prisma.studentAchievement.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 45. Student Previous Education
  await await (async () => {
    const _modelData = [
      {
        idKey: 'prevEd1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          institutionName: 'Delhi Public School, Noida',
          academicYear: '2023-2024',
          sequence: 1,
        },
      },
      {
        idKey: 'prevEd2',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          institutionName: "St. Xavier's School, Jaipur",
          academicYear: '2023-2024',
          sequence: 1,
        },
      },
    ];
    const _created = await prisma.studentPreviousEducation.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 46. Student Projects
  await await (async () => {
    const _modelData = [
      {
        idKey: 'proj1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          title: 'Weather App',
          description: 'A React-based weather application using OpenWeather API',
          technologies: 'React, TypeScript, REST API',
          projectUrl: 'https://github.com/rahulverma/weather-app',
          startDate: d('2025-06-01'),
          endDate: d('2025-07-15'),
        },
      },
      {
        idKey: 'proj2',
        data: {
          institutionId: I.institution,
          studentId: I.stu2,
          title: 'Sentiment Analysis Tool',
          description: 'NLP-based sentiment analysis for social media posts',
          technologies: 'Python, NLTK, Flask',
          projectUrl: 'https://github.com/snehagupta/sentiment-nlp',
          startDate: d('2025-05-10'),
          endDate: d('2025-07-20'),
        },
      },
    ];
    const _created = await prisma.studentProject.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 47. Student Social Profiles
  await await (async () => {
    const _modelData = [
      {
        idKey: 'socProf1',
        data: {
          studentId: I.stu1,
          platform: 'GITHUB',
          profileUrl: 'https://github.com/rahulverma',
        },
      },
      {
        idKey: 'socProf2',
        data: {
          studentId: I.stu2,
          platform: 'LINKEDIN',
          profileUrl: 'https://linkedin.com/in/snehagupta',
        },
      },
    ];
    const _created = await prisma.studentSocialProfile.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 48. Student Terms
  await await (async () => {
    const _modelData = [
      {
        idKey: 'stTerm1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          academicTermId: I.termSem1,
          curriculumTermId: I.currTermCS1,
          status: 'ACTIVE',
          termGPA: null,
        },
      },
      {
        idKey: 'stTerm2',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          academicTermId: I.termSem1,
          curriculumTermId: I.currTermMath1,
          status: 'ACTIVE',
          termGPA: null,
        },
      },
    ];
    const _created = await prisma.studentTerm.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 49. Fee Plans & Installments
  await await (async () => {
    const _modelData = [
      {
        idKey: 'feePlan1',
        data: {
          institutionId: I.institution,
          studentId: I.stu1,
          academicYearId: I.ay2025,
          totalAmount: 150000,
          currency: 'INR',
          paymentMode: 'INSTALLMENTS',
          status: 'ACTIVE',
        },
      },
      {
        idKey: 'feePlan2',
        data: {
          institutionId: I.institution,
          studentId: I.stu3,
          academicYearId: I.ay2025,
          totalAmount: 120000,
          currency: 'INR',
          paymentMode: 'ANNUAL',
          status: 'ACTIVE',
        },
      },
    ];
    const _created = await prisma.studentFeePlan.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  await await (async () => {
    const _modelData = [
      {
        idKey: 'inst1',
        data: {
          studentFeePlanId: I.feePlan1,
          installmentNumber: 1,
          amount: 75000,
          amountPaid: 75000,
          dueDate: d('2025-08-01'),
          status: 'PAID',
        },
      },
      {
        idKey: 'inst2',
        data: {
          studentFeePlanId: I.feePlan1,
          installmentNumber: 2,
          amount: 75000,
          amountPaid: 0,
          dueDate: d('2026-01-05'),
          status: 'PENDING',
        },
      },
      {
        idKey: 'inst3',
        data: {
          studentFeePlanId: I.feePlan2,
          installmentNumber: 1,
          amount: 120000,
          amountPaid: 120000,
          dueDate: d('2025-08-01'),
          status: 'PAID',
        },
      },
      {
        idKey: 'inst4',
        data: {
          studentFeePlanId: I.feePlan2,
          installmentNumber: 2,
          amount: 0,
          amountPaid: 0,
          dueDate: d('2026-08-01'),
          status: 'PAID',
        },
      },
    ];
    const _created = await prisma.feeInstallment.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 50. Applications
  await await (async () => {
    const _modelData = [
      {
        idKey: 'app1',
        data: {
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
      },
      {
        idKey: 'app2',
        data: {
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
      },
    ];
    const _created = await prisma.application.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  // 51. Lesson Plans
  await await (async () => {
    const _modelData = [
      {
        idKey: 'lp1',
        data: {
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
      },
      {
        idKey: 'lp2',
        data: {
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
      },
    ];
    const _created = await prisma.lessonPlan.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

  await await (async () => {
    const _created = await prisma.lessonPlanSection.create({
      data: { lessonPlanId: I.lp1, sectionId: I.sectionCS },
    });
    I.lpSec1 = _created.id;
    return _created;
  })();

  await await (async () => {
    const _created = await prisma.lessonPlanResource.create({
      data: { lessonPlanId: I.lp1, resourceId: I.res1, sortOrder: 1 },
    });
    I.lpRes1 = _created.id;
    return _created;
  })();

  // 52. Admin Resources
  await await (async () => {
    const _created = await prisma.adminResource.create({
      data: {
        institutionId: I.institution,
        courseId: I.cs101,
        title: 'Course Syllabus CS101',
        description: 'Official syllabus for CS101',
        resourceType: 'PDF',
        fileUrl: '/admin/cs101/syllabus.pdf',
        uploadedBy: I.userAdmin,
      },
    });
    I.adminRes = _created.id;
    return _created;
  })();

  // 53. Audit Logs
  await await (async () => {
    const _modelData = [
      {
        idKey: 'audit1',
        data: {
          institutionId: I.institution,
          actorUserId: I.userAdmin,
          action: 'CREATE',
          entityType: 'Institution',
          entityId: I.institution,
          afterData: { name: 'Ellipsonic Institute of Technology' },
        },
      },
      {
        idKey: 'audit2',
        data: {
          institutionId: I.institution,
          actorUserId: I.userAdmin,
          action: 'ENROLL',
          entityType: 'Student',
          entityId: I.stu1,
          afterData: { studentId: I.stu1, courseId: I.cs101 },
        },
      },
    ];
    const _created = await prisma.auditLog.createManyAndReturn({
      data: _modelData.map((x) => x.data as any),
    });
    for (let i = 0; i < _modelData.length; i++) {
      if (_modelData[i].idKey !== null) {
        I[_modelData[i].idKey as string] = _created[i].id;
      }
    }
  })();

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
