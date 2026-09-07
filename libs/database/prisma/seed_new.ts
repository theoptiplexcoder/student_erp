import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────
const d = (s: string) => new Date(s);
const time = (h: number, m: number) =>
  new Date(`1970-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);

const PASSWORD = 'Password@123';

// ─── Cleanup (reverse FK order) ────────────────────────
async function cleanup() {
  console.log('🗑️ Cleaning up existing data...');
  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE institutions CASCADE;');
    console.log('✅ TRUNCATE institutions CASCADE completed.');
  } catch (e: any) {
    console.warn('Falling back to individual table deletes:', e.message);
    const tables = [
      'admission_drafts',
      'institution_counters',
      'payment_allocations',
      'payments',
      'fee_waivers',
      'fee_installments',
      'student_fee_plan_components',
      'student_fee_plans',
      'fee_components',
      'fee_structures',
      'audit_logs',
      'admin_resources',
      'lesson_plan_resources',
      'lesson_plan_sections',
      'lesson_plans',
      'applications',
      'student_terms',
      'student_social_profiles',
      'student_projects',
      'student_previous_education',
      'student_achievements',
      'student_internships',
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
      'faculty_availability',
      'timetable_entries',
      'timetables',
      'course_assignments',
      'enrollments',
      'course_offerings',
      'curriculum_courses',
      'course_prerequisites',
      'curriculum_elective_groups',
      'curriculum_terms',
      'curriculums',
      'courses',
      'faculty_sections',
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
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      } catch (err: any) {
        // ignore
      }
    }
  }
  console.log('✅ Cleanup done.');
}

// ─── Seed ───────────────────────────────────────────────
async function main() {
  await cleanup();

  const I: any = {};

  console.log('🏫 Seeding school mock data...');

  // 1. Institution (School Type)
  const inst = await prisma.institution.create({
    data: {
      institutionType: 'SCHOOL',
      legalName: 'Delhi Public International School',
      displayName: 'DPIS',
      branding: { primaryColor: '#0f766e', accentColor: '#d97706' },
    },
  });
  I.institution = inst.id;

  // 2. Departments
  const depts = await prisma.department.createManyAndReturn({
    data: [
      { institutionId: I.institution, name: 'Middle School Department', code: 'DEPT-MS' },
      { institutionId: I.institution, name: 'Senior School Department', code: 'DEPT-SS' },
    ],
  });
  I.deptMS = depts[0].id;
  I.deptSS = depts[1].id;

  // 3. Academic Year
  const ay = await prisma.academicYear.create({
    data: {
      institutionId: I.institution,
      name: 'Academic Year 2025-2026',
      startDate: d('2025-04-01'),
      endDate: d('2026-03-31'),
      isActive: true,
    },
  });
  I.ay2025 = ay.id;

  // 4. Class Levels
  const clsLevels = await prisma.classLevel.createManyAndReturn({
    data: [
      { institutionId: I.institution, name: 'Grade 9', code: 'G9', sequence: 9 },
      { institutionId: I.institution, name: 'Grade 10', code: 'G10', sequence: 10 },
      { institutionId: I.institution, name: 'Grade 11', code: 'G11', sequence: 11 },
      { institutionId: I.institution, name: 'Grade 12', code: 'G12', sequence: 12 },
    ],
  });
  I.clsG9 = clsLevels[0].id;
  I.clsG10 = clsLevels[1].id;
  I.clsG11 = clsLevels[2].id;
  I.clsG12 = clsLevels[3].id;

  // 5. Building & Rooms
  const building = await prisma.building.create({
    data: {
      institutionId: I.institution,
      name: 'Main Academic Block',
      code: 'MAB',
      address: 'Plot 12, Knowledge Park, Noida, UP',
      floors: 3,
    },
  });
  I.building = building.id;

  const rooms = await prisma.room.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Classroom 101 (Secondary)',
        number: 'CR-101',
        floor: 1,
        capacity: 40,
        roomType: 'CLASSROOM',
      },
      {
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Classroom 201 (Higher Secondary)',
        number: 'CR-201',
        floor: 2,
        capacity: 40,
        roomType: 'CLASSROOM',
      },
      {
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Composite Science Laboratory',
        number: 'LAB-102',
        floor: 1,
        capacity: 35,
        roomType: 'LAB',
      },
    ],
  });
  I.room101 = rooms[0].id;
  I.room201 = rooms[1].id;
  I.roomLab = rooms[2].id;

  // 6. Programs (School Programs: Secondary & Higher Secondary)
  const progs = await prisma.program.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        name: 'Secondary School Education (Grades 9-10)',
        code: 'PROG-SEC',
        level: 'SECONDARY',
        durationYears: 2,
      },
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        name: 'Senior Secondary Science (Grades 11-12)',
        code: 'PROG-SR-SCI',
        level: 'HIGHER_SECONDARY',
        durationYears: 2,
      },
    ],
  });
  I.progSec = progs[0].id;
  I.progSrSci = progs[1].id;

  // 7. Custom Roles & Permissions
  const customRoles = await prisma.customRole.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        name: 'Academic Coordinator',
        description: 'Supervises school curriculum, term examinations, and faculty planning',
      },
      {
        institutionId: I.institution,
        name: 'Class Teacher Coordinator',
        description: 'Oversees section student attendance, report cards, and parent liaisons',
      },
    ],
  });
  I.roleCoord = customRoles[0].id;
  I.roleClassCoord = customRoles[1].id;

  await prisma.rolePermission.createManyAndReturn({
    data: [
      { customRoleId: I.roleCoord, resource: 'curriculum', action: 'MANAGE' },
      { customRoleId: I.roleCoord, resource: 'timetable', action: 'MANAGE' },
      { customRoleId: I.roleClassCoord, resource: 'attendance', action: 'MANAGE' },
      { customRoleId: I.roleClassCoord, resource: 'report_card', action: 'MANAGE' },
    ],
  });

  // 8. Curriculums
  const currs = await prisma.curriculum.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        versionNumber: '2025.1',
        name: 'CBSE Secondary Curriculum (Classes IX-X)',
        status: 'ACTIVE',
        effectiveFrom: d('2025-04-01'),
      },
      {
        institutionId: I.institution,
        versionNumber: '2025.1',
        name: 'CBSE Senior Secondary Science Curriculum (Classes XI-XII)',
        status: 'ACTIVE',
        effectiveFrom: d('2025-04-01'),
      },
    ],
  });
  I.currSec = currs[0].id;
  I.currSrSci = currs[1].id;

  await prisma.curriculum.update({
    where: { id: I.currSec },
    data: { programs: { connect: [{ id: I.progSec }] } },
  });
  await prisma.curriculum.update({
    where: { id: I.currSrSci },
    data: { programs: { connect: [{ id: I.progSrSci }] } },
  });

  // 9. Academic Terms (School Terms: Term 1 & Term 2)
  const terms = await prisma.academicTerm.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        name: 'Term 1 (Apr - Sep 2025)',
        code: 'TERM1-2025',
        semester: 1,
        termType: 'TERM',
        startDate: d('2025-04-01'),
        endDate: d('2025-09-30'),
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        name: 'Term 2 (Oct 2025 - Mar 2026)',
        code: 'TERM2-2025',
        semester: 2,
        termType: 'TERM',
        startDate: d('2025-10-01'),
        endDate: d('2026-03-31'),
        status: 'UPCOMING',
      },
    ],
  });
  I.term1 = terms[0].id;
  I.term2 = terms[1].id;

  // 10. Curriculum Terms
  const currTerms = await prisma.curriculumTerm.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        curriculumId: I.currSec,
        name: 'Grade 9 - Term 1',
        sequence: 1,
        creditRequirement: 25,
      },
      {
        institutionId: I.institution,
        curriculumId: I.currSec,
        name: 'Grade 9 - Term 2',
        sequence: 2,
        creditRequirement: 25,
      },
      {
        institutionId: I.institution,
        curriculumId: I.currSrSci,
        name: 'Grade 11 - Term 1',
        sequence: 1,
        creditRequirement: 26,
      },
      {
        institutionId: I.institution,
        curriculumId: I.currSrSci,
        name: 'Grade 11 - Term 2',
        sequence: 2,
        creditRequirement: 26,
      },
    ],
  });
  I.currTermSec1 = currTerms[0].id;
  I.currTermSec2 = currTerms[1].id;
  I.currTermSr1 = currTerms[2].id;
  I.currTermSr2 = currTerms[3].id;

  // 11. Curriculum Elective Groups
  const elecGroups = await prisma.curriculumElectiveGroup.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        name: 'Skill & Vocational Electives',
        requiredCredits: 4,
        requiredCourses: 1,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        name: 'Senior Science 5th Subject Electives',
        requiredCredits: 5,
        requiredCourses: 1,
      },
    ],
  });
  I.elecGrpSec = elecGroups[0].id;
  I.elecGrpSr = elecGroups[1].id;

  // 12. Batches
  const batches = await prisma.batch.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        programId: I.progSec,
        name: 'Batch 2025-2027 (Secondary)',
        admissionYear: 2025,
        startDate: d('2025-04-01'),
        expectedEndDate: d('2027-03-31'),
      },
      {
        institutionId: I.institution,
        programId: I.progSrSci,
        name: 'Batch 2025-2027 (Senior Science)',
        admissionYear: 2025,
        startDate: d('2025-04-01'),
        expectedEndDate: d('2027-03-31'),
      },
    ],
  });
  I.batchSec = batches[0].id;
  I.batchSrSci = batches[1].id;

  // 13. Sections
  const sections = await prisma.section.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        programId: I.progSec,
        classLevelId: I.clsG9,
        batchId: I.batchSec,
        academicYearId: I.ay2025,
        name: 'Grade 9 - Section A',
        code: 'G9-A',
        semester: 1,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        programId: I.progSrSci,
        classLevelId: I.clsG11,
        batchId: I.batchSrSci,
        academicYearId: I.ay2025,
        name: 'Grade 11 - Science A',
        code: 'G11-SCI-A',
        semester: 1,
        capacity: 40,
      },
    ],
  });
  I.secG9A = sections[0].id;
  I.secG11A = sections[1].id;

  // 14. Courses (At least 5 courses for each program!)
  // Program 1 (Secondary): 5 courses
  // Program 2 (Senior Secondary Science): 5 courses
  const courses = await prisma.course.createManyAndReturn({
    data: [
      // Program 1: Secondary School Courses
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        classLevelId: I.clsG9,
        code: 'ENG-09',
        name: 'English Language & Literature',
        description:
          'Comprehensive English reading, creative writing, grammar, and literary analysis',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: false,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        classLevelId: I.clsG9,
        code: 'MAT-09',
        name: 'Secondary Mathematics',
        description:
          'Number systems, polynomials, coordinate geometry, linear equations, and triangles',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: false,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        classLevelId: I.clsG9,
        code: 'SCI-09',
        name: 'General Science',
        description:
          'Integrated physical sciences, chemistry of matter, biology of cell life and tissues',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: true,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        classLevelId: I.clsG9,
        code: 'SST-09',
        name: 'Social Science & Humanities',
        description:
          'India and the contemporary world, contemporary India geography, democratic politics, and economics',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: false,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptMS,
        classLevelId: I.clsG9,
        code: 'IT-09',
        name: 'Information Technology & Coding',
        description:
          'Digital literacy, digital documentation, spreadsheets, and basic Python coding',
        creditValue: 4,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: true,
        courseType: 'ELECTIVE',
        status: 'ACTIVE',
      },

      // Program 2: Senior Secondary Science Courses
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        classLevelId: I.clsG11,
        code: 'PHY-11',
        name: 'Physics XI',
        description:
          'Kinematics, laws of motion, work, energy & power, gravitation, and thermodynamics',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: true,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        classLevelId: I.clsG11,
        code: 'CHM-11',
        name: 'Chemistry XI',
        description:
          'Structure of atom, chemical bonding, thermodynamics, equilibrium, and organic basics',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: true,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        classLevelId: I.clsG11,
        code: 'MAT-11',
        name: 'Senior Mathematics XI',
        description:
          'Sets and functions, algebra, calculus basics, coordinate geometry, and statistics',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: false,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        classLevelId: I.clsG11,
        code: 'ENG-11',
        name: 'English Core XI',
        description:
          'Reading comprehension, advanced note making, speech writing, literature and hornbill readings',
        creditValue: 4,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: false,
        courseType: 'CORE',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        departmentId: I.deptSS,
        classLevelId: I.clsG11,
        code: 'CS-11',
        name: 'Computer Science XI',
        description:
          'Computer systems organization, computational thinking and programming with Python, society & law',
        creditValue: 5,
        maxMarks: 100,
        passingMarks: 33,
        isPractical: true,
        courseType: 'ELECTIVE',
        status: 'ACTIVE',
      },
    ],
  });

  // Map courses
  I.cEng09 = courses[0].id;
  I.cMat09 = courses[1].id;
  I.cSci09 = courses[2].id;
  I.cSst09 = courses[3].id;
  I.cIt09 = courses[4].id;

  I.cPhy11 = courses[5].id;
  I.cChm11 = courses[6].id;
  I.cMat11 = courses[7].id;
  I.cEng11 = courses[8].id;
  I.cCs11 = courses[9].id;

  // 15. Curriculum Courses (Mapping 5 courses per program curriculum term)
  await prisma.curriculumCourse.createManyAndReturn({
    data: [
      // Curriculum 1 - Secondary (5 courses)
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        courseId: I.cEng09,
        sequence: 1,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        courseId: I.cMat09,
        sequence: 2,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        courseId: I.cSci09,
        sequence: 3,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        courseId: I.cSst09,
        sequence: 4,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSec1,
        courseId: I.cIt09,
        sequence: 5,
        creditValue: 4,
        isMandatory: false,
        electiveGroupId: I.elecGrpSec,
      },

      // Curriculum 2 - Senior Science (5 courses)
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        courseId: I.cPhy11,
        sequence: 1,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        courseId: I.cChm11,
        sequence: 2,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        courseId: I.cMat11,
        sequence: 3,
        creditValue: 5,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        courseId: I.cEng11,
        sequence: 4,
        creditValue: 4,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermSr1,
        courseId: I.cCs11,
        sequence: 5,
        creditValue: 5,
        isMandatory: false,
        electiveGroupId: I.elecGrpSr,
      },
    ],
  });

  // 16. Course Prerequisites
  await prisma.coursePrerequisite.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cMat11,
        prerequisiteCourseId: I.cMat09,
      },
      {
        institutionId: I.institution,
        courseId: I.cCs11,
        prerequisiteCourseId: I.cIt09,
      },
    ],
  });

  // 17. Users (with Supabase Auth & Prisma)
  const usersData = [
    {
      idKey: 'userPrincipal',
      email: 'principal@dpis.edu',
      firstName: 'Dr. Sunita',
      lastName: 'Narayanan',
      phone: '+91-98765-11000',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userVicePrincipal',
      email: 'vp.academic@dpis.edu',
      firstName: 'Arvind',
      lastName: 'Kapoor',
      phone: '+91-98765-11001',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userFac1',
      email: 'meenakshi.sundaram@dpis.edu',
      firstName: 'Meenakshi',
      lastName: 'Sundaram',
      phone: '+91-98765-11002',
      role: 'FACULTY' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userFac2',
      email: 'vikas.deshmukh@dpis.edu',
      firstName: 'Vikas',
      lastName: 'Deshmukh',
      phone: '+91-98765-11003',
      role: 'FACULTY' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu1',
      email: 'aarav.sharma@student.dpis.edu',
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+91-98765-11004',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu2',
      email: 'diya.nair@student.dpis.edu',
      firstName: 'Diya',
      lastName: 'Nair',
      phone: '+91-98765-11005',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu3',
      email: 'rohan.mehta@student.dpis.edu',
      firstName: 'Rohan',
      lastName: 'Mehta',
      phone: '+91-98765-11006',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu4',
      email: 'ananya.iyer@student.dpis.edu',
      firstName: 'Ananya',
      lastName: 'Iyer',
      phone: '+91-98765-11007',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userGuard1',
      email: 'sanjay.sharma@parent.dpis.edu',
      firstName: 'Sanjay',
      lastName: 'Sharma',
      phone: '+91-98765-11008',
      role: 'GUARDIAN' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userGuard2',
      email: 'deepa.nair@parent.dpis.edu',
      firstName: 'Deepa',
      lastName: 'Nair',
      phone: '+91-98765-11009',
      role: 'GUARDIAN' as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const u of usersData) {
    let authUserId = null;
    try {
      const { data: existingUser } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const sbUser = existingUser?.users.find((x) => x.email === u.email);

      if (sbUser) {
        await supabase.auth.admin.updateUserById(sbUser.id, { password: PASSWORD });
        authUserId = sbUser.id;
      } else {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: PASSWORD,
          email_confirm: true,
        });
        if (error) {
          console.error('Supabase user creation notice for', u.email, error.message);
        } else {
          authUserId = newUser.user.id;
        }
      }
    } catch (authErr: any) {
      console.warn('Supabase auth bypass/fallback for', u.email, authErr.message);
    }

    const createdUser = await prisma.user.create({
      data: {
        institutionId: I.institution,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        status: u.status,
        authUserId: authUserId,
      },
    });
    I[u.idKey] = createdUser.id;
  }

  // 18. Faculty
  const facs = await prisma.faculty.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userFac1,
        departmentId: I.deptMS,
        teacherCode: 'TCH-SEC-01',
        employmentType: 'FULL_TIME',
        hireDate: d('2019-06-01'),
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        userId: I.userFac2,
        departmentId: I.deptSS,
        teacherCode: 'TCH-SR-02',
        employmentType: 'FULL_TIME',
        hireDate: d('2020-04-15'),
        status: 'ACTIVE',
      },
    ],
  });
  I.fac1 = facs[0].id;
  I.fac2 = facs[1].id;

  // 19. Faculty Availability
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
  const availData: any[] = [];
  for (const day of days) {
    availData.push({
      institutionId: I.institution,
      facultyId: I.fac1,
      dayOfWeek: day,
      startTime: time(8, 0),
      endTime: time(15, 0),
      isAvailable: true,
    });
    availData.push({
      institutionId: I.institution,
      facultyId: I.fac2,
      dayOfWeek: day,
      startTime: time(8, 0),
      endTime: time(15, 0),
      isAvailable: true,
    });
  }
  await prisma.facultyAvailability.createManyAndReturn({ data: availData });

  // 20. Guardians
  const guards = await prisma.guardian.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userGuard1,
        occupation: 'Senior Software Architect',
        relationship: 'Father',
      },
      {
        institutionId: I.institution,
        userId: I.userGuard2,
        occupation: 'Chartered Accountant',
        relationship: 'Mother',
      },
    ],
  });
  I.guard1 = guards[0].id;
  I.guard2 = guards[1].id;

  // 21. Students (2 for Secondary, 2 for Senior Secondary)
  const stus = await prisma.student.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userStu1,
        admissionNumber: 'ADM-SEC-2025-01',
        studentCode: 'SCH-9001',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2010-06-12'),
        gender: 'MALE',
        bloodGroup: 'B+',
        address: 'B-44, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201309',
        fatherName: 'Sanjay Sharma',
        motherName: 'Ritu Sharma',
        fatherPhone: '+91-98765-11008',
        motherPhone: '+91-98765-11020',
        fatherEmail: 'sanjay.sharma@parent.dpis.edu',
        motherEmail: 'ritu.sharma@parent.dpis.edu',
        guardianName: 'Sanjay Sharma',
        guardianPhone: '+91-98765-11008',
        admissionDate: d('2025-04-01'),
        rollNumber: '09-A-01',
        bio: 'Interested in robotics, mathematics puzzles, and cricket',
        profileCompletion: 95,
        guardianId: I.guard1,
        programId: I.progSec,
        sectionId: I.secG9A,
        curriculumId: I.currSec,
      },
      {
        institutionId: I.institution,
        userId: I.userStu2,
        admissionNumber: 'ADM-SEC-2025-02',
        studentCode: 'SCH-9002',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2010-09-24'),
        gender: 'FEMALE',
        bloodGroup: 'O+',
        address: 'A-12, Sector 50',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201301',
        fatherName: 'Madhavan Nair',
        motherName: 'Deepa Nair',
        fatherPhone: '+91-98765-11021',
        motherPhone: '+91-98765-11009',
        fatherEmail: 'madhavan.nair@parent.dpis.edu',
        motherEmail: 'deepa.nair@parent.dpis.edu',
        guardianName: 'Deepa Nair',
        guardianPhone: '+91-98765-11009',
        admissionDate: d('2025-04-01'),
        rollNumber: '09-A-02',
        bio: 'Aspiring writer and science debate enthusiast',
        profileCompletion: 90,
        guardianId: I.guard2,
        programId: I.progSec,
        sectionId: I.secG9A,
        curriculumId: I.currSec,
      },
      {
        institutionId: I.institution,
        userId: I.userStu3,
        admissionNumber: 'ADM-SR-2025-01',
        studentCode: 'SCH-1101',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2008-03-18'),
        gender: 'MALE',
        bloodGroup: 'A+',
        address: 'Villa 18, Expressway Greens',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201310',
        fatherName: 'Praveen Mehta',
        motherName: 'Kavita Mehta',
        fatherPhone: '+91-98765-11022',
        motherPhone: '+91-98765-11023',
        fatherEmail: 'praveen.mehta@gmail.com',
        motherEmail: 'kavita.mehta@gmail.com',
        guardianName: 'Praveen Mehta',
        guardianPhone: '+91-98765-11022',
        admissionDate: d('2025-04-01'),
        rollNumber: '11-SCI-01',
        bio: 'Aspiring aerospace engineer and physics olympiad finalist',
        profileCompletion: 85,
        programId: I.progSrSci,
        sectionId: I.secG11A,
        curriculumId: I.currSrSci,
      },
      {
        institutionId: I.institution,
        userId: I.userStu4,
        admissionNumber: 'ADM-SR-2025-02',
        studentCode: 'SCH-1102',
        status: 'ACTIVE',
        lifecycleStatus: 'ACTIVE',
        dateOfBirth: d('2008-11-05'),
        gender: 'FEMALE',
        bloodGroup: 'AB+',
        address: 'Tower 4, Green View Apartments',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201304',
        fatherName: 'Ramesh Iyer',
        motherName: 'Malini Iyer',
        fatherPhone: '+91-98765-11024',
        motherPhone: '+91-98765-11025',
        fatherEmail: 'ramesh.iyer@gmail.com',
        motherEmail: 'malini.iyer@gmail.com',
        guardianName: 'Ramesh Iyer',
        guardianPhone: '+91-98765-11024',
        admissionDate: d('2025-04-01'),
        rollNumber: '11-SCI-02',
        bio: 'Passionate about algorithmic problem solving and biotechnology',
        profileCompletion: 88,
        programId: I.progSrSci,
        sectionId: I.secG11A,
        curriculumId: I.currSrSci,
      },
    ],
  });
  I.stu1 = stus[0].id;
  I.stu2 = stus[1].id;
  I.stu3 = stus[2].id;
  I.stu4 = stus[3].id;

  // 22. Faculty Section Assignment (Class Teachers)
  await prisma.facultySection.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        sectionId: I.secG9A,
        academicYearId: I.ay2025,
        role: 'CLASS_TEACHER',
        isPrimary: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        sectionId: I.secG11A,
        academicYearId: I.ay2025,
        role: 'CLASS_TEACHER',
        isPrimary: true,
      },
    ],
  });

  // 23. Course Offerings (All 10 courses offered for Term 1)
  const offerings = await prisma.courseOffering.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cEng09,
        termId: I.term1,
        programId: I.progSec,
        batchId: I.batchSec,
        sectionId: I.secG9A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cMat09,
        termId: I.term1,
        programId: I.progSec,
        batchId: I.batchSec,
        sectionId: I.secG9A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        termId: I.term1,
        programId: I.progSec,
        batchId: I.batchSec,
        sectionId: I.secG9A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cSst09,
        termId: I.term1,
        programId: I.progSec,
        batchId: I.batchSec,
        sectionId: I.secG9A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cIt09,
        termId: I.term1,
        programId: I.progSec,
        batchId: I.batchSec,
        sectionId: I.secG9A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cPhy11,
        termId: I.term1,
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        sectionId: I.secG11A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cChm11,
        termId: I.term1,
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        sectionId: I.secG11A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cMat11,
        termId: I.term1,
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        sectionId: I.secG11A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cEng11,
        termId: I.term1,
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        sectionId: I.secG11A,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.cCs11,
        termId: I.term1,
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        sectionId: I.secG11A,
        capacity: 40,
      },
    ],
  });
  I.offEng09 = offerings[0].id;
  I.offMat09 = offerings[1].id;
  I.offSci09 = offerings[2].id;
  I.offSst09 = offerings[3].id;
  I.offIt09 = offerings[4].id;

  I.offPhy11 = offerings[5].id;
  I.offChm11 = offerings[6].id;
  I.offMat11 = offerings[7].id;
  I.offEng11 = offerings[8].id;
  I.offCs11 = offerings[9].id;

  // 24. Course Assignments
  await prisma.courseAssignment.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        courseId: I.cSci09,
        sectionId: I.secG9A,
        termId: I.term1,
        isPrimary: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        courseId: I.cMat09,
        sectionId: I.secG9A,
        termId: I.term1,
        isPrimary: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        courseId: I.cPhy11,
        sectionId: I.secG11A,
        termId: I.term1,
        isPrimary: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        courseId: I.cCs11,
        sectionId: I.secG11A,
        termId: I.term1,
        isPrimary: true,
      },
    ],
  });

  // 25. Enrollments (Students enrolled into courses)
  const enrollmentsData: any[] = [
    // Stu 1 (Grade 9-A)
    {
      institutionId: I.institution,
      studentId: I.stu1,
      academicYearId: I.ay2025,
      courseId: I.cMat09,
      courseOfferingId: I.offMat09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-01',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu1,
      academicYearId: I.ay2025,
      courseId: I.cSci09,
      courseOfferingId: I.offSci09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-01',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu1,
      academicYearId: I.ay2025,
      courseId: I.cIt09,
      courseOfferingId: I.offIt09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-01',
      status: 'ACTIVE',
    },

    // Stu 2 (Grade 9-A)
    {
      institutionId: I.institution,
      studentId: I.stu2,
      academicYearId: I.ay2025,
      courseId: I.cEng09,
      courseOfferingId: I.offEng09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-02',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu2,
      academicYearId: I.ay2025,
      courseId: I.cSst09,
      courseOfferingId: I.offSst09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-02',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu2,
      academicYearId: I.ay2025,
      courseId: I.cSci09,
      courseOfferingId: I.offSci09,
      programId: I.progSec,
      curriculumId: I.currSec,
      classLevelId: I.clsG9,
      batchId: I.batchSec,
      sectionId: I.secG9A,
      termId: I.term1,
      rollNumber: '09-A-02',
      status: 'ACTIVE',
    },

    // Stu 3 (Grade 11-SCI)
    {
      institutionId: I.institution,
      studentId: I.stu3,
      academicYearId: I.ay2025,
      courseId: I.cPhy11,
      courseOfferingId: I.offPhy11,
      programId: I.progSrSci,
      curriculumId: I.currSrSci,
      classLevelId: I.clsG11,
      batchId: I.batchSrSci,
      sectionId: I.secG11A,
      termId: I.term1,
      rollNumber: '11-SCI-01',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu3,
      academicYearId: I.ay2025,
      courseId: I.cChm11,
      courseOfferingId: I.offChm11,
      programId: I.progSrSci,
      curriculumId: I.currSrSci,
      classLevelId: I.clsG11,
      batchId: I.batchSrSci,
      sectionId: I.secG11A,
      termId: I.term1,
      rollNumber: '11-SCI-01',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu3,
      academicYearId: I.ay2025,
      courseId: I.cMat11,
      courseOfferingId: I.offMat11,
      programId: I.progSrSci,
      curriculumId: I.currSrSci,
      classLevelId: I.clsG11,
      batchId: I.batchSrSci,
      sectionId: I.secG11A,
      termId: I.term1,
      rollNumber: '11-SCI-01',
      status: 'ACTIVE',
    },

    // Stu 4 (Grade 11-SCI)
    {
      institutionId: I.institution,
      studentId: I.stu4,
      academicYearId: I.ay2025,
      courseId: I.cPhy11,
      courseOfferingId: I.offPhy11,
      programId: I.progSrSci,
      curriculumId: I.currSrSci,
      classLevelId: I.clsG11,
      batchId: I.batchSrSci,
      sectionId: I.secG11A,
      termId: I.term1,
      rollNumber: '11-SCI-02',
      status: 'ACTIVE',
    },
    {
      institutionId: I.institution,
      studentId: I.stu4,
      academicYearId: I.ay2025,
      courseId: I.cCs11,
      courseOfferingId: I.offCs11,
      programId: I.progSrSci,
      curriculumId: I.currSrSci,
      classLevelId: I.clsG11,
      batchId: I.batchSrSci,
      sectionId: I.secG11A,
      termId: I.term1,
      rollNumber: '11-SCI-02',
      status: 'ACTIVE',
    },
  ];

  const enrollments = await prisma.enrollment.createManyAndReturn({
    data: enrollmentsData,
  });
  I.enr1 = enrollments[0].id;
  I.enr2 = enrollments[1].id;
  I.enr3 = enrollments[3].id;
  I.enr4 = enrollments[6].id;

  // 26. Timetable & Entries
  const timetable = await prisma.timetable.create({
    data: {
      institutionId: I.institution,
      academicYearId: I.ay2025,
      termId: I.term1,
      name: 'Academic Year 2025-26 School Bell Schedule',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  I.timetable = timetable.id;

  await prisma.timetableEntry.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.term1,
        timetableId: I.timetable,
        courseId: I.cSci09,
        facultyId: I.fac1,
        sectionId: I.secG9A,
        dayOfWeek: 'MONDAY',
        startTime: time(8, 30),
        endTime: time(9, 15),
        roomId: I.room101,
        buildingId: I.building,
      },
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.term1,
        timetableId: I.timetable,
        courseId: I.cMat09,
        facultyId: I.fac1,
        sectionId: I.secG9A,
        dayOfWeek: 'MONDAY',
        startTime: time(9, 20),
        endTime: time(10, 5),
        roomId: I.room101,
        buildingId: I.building,
      },
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.term1,
        timetableId: I.timetable,
        courseId: I.cPhy11,
        facultyId: I.fac2,
        sectionId: I.secG11A,
        dayOfWeek: 'MONDAY',
        startTime: time(10, 30),
        endTime: time(11, 15),
        roomId: I.room201,
        buildingId: I.building,
      },
      {
        institutionId: I.institution,
        academicYearId: I.ay2025,
        termId: I.term1,
        timetableId: I.timetable,
        courseId: I.cCs11,
        facultyId: I.fac2,
        sectionId: I.secG11A,
        dayOfWeek: 'TUESDAY',
        startTime: time(11, 20),
        endTime: time(12, 5),
        roomId: I.roomLab,
        buildingId: I.building,
      },
    ],
  });

  // 27. Attendance Sessions & Records
  const attSessions = await prisma.attendanceSession.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        sectionId: I.secG9A,
        facultyId: I.fac1,
        termId: I.term1,
        date: d('2025-05-05'),
        startTime: time(8, 30),
        endTime: time(9, 15),
        topic: 'Plant and Animal Cell Structure',
      },
      {
        institutionId: I.institution,
        courseId: I.cPhy11,
        sectionId: I.secG11A,
        facultyId: I.fac2,
        termId: I.term1,
        date: d('2025-05-05'),
        startTime: time(10, 30),
        endTime: time(11, 15),
        topic: 'Vectors and Kinematics Fundamentals',
      },
    ],
  });
  I.attSess1 = attSessions[0].id;
  I.attSess2 = attSessions[1].id;

  await prisma.attendanceRecord.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        attendanceSessionId: I.attSess1,
        studentId: I.stu1,
        status: 'PRESENT',
      },
      {
        institutionId: I.institution,
        attendanceSessionId: I.attSess1,
        studentId: I.stu2,
        status: 'PRESENT',
      },
      {
        institutionId: I.institution,
        attendanceSessionId: I.attSess2,
        studentId: I.stu3,
        status: 'PRESENT',
      },
      {
        institutionId: I.institution,
        attendanceSessionId: I.attSess2,
        studentId: I.stu4,
        status: 'LATE',
        remarks: 'Late bus arrival',
      },
    ],
  });

  // 28. Course Resources
  const resources = await prisma.courseResource.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        facultyId: I.fac1,
        title: 'Cell Biology Illustrated Diagram Notes',
        description: 'Microscopic diagrams and organelle breakdown notes for Grade 9',
        owner: 'FACULTY',
        resourceType: 'PDF',
        fileUrl: '/school/resources/grade9/cell_biology.pdf',
        isPublished: true,
        publishedAt: d('2025-04-15'),
      },
      {
        institutionId: I.institution,
        courseId: I.cPhy11,
        facultyId: I.fac2,
        title: 'Kinematics Formulas and Derivations Sheet',
        description: 'Comprehensive derivation guide for equations of motion',
        owner: 'FACULTY',
        resourceType: 'DOCUMENT',
        fileUrl: '/school/resources/grade11/kinematics.pdf',
        isPublished: true,
        publishedAt: d('2025-04-20'),
      },
    ],
  });
  I.res1 = resources[0].id;

  // 29. Assignments & Submissions
  const assigns = await prisma.assignment.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        facultyId: I.fac1,
        termId: I.term1,
        title: 'Cell Organelle Chart Project',
        description: 'Prepare an annotated comparative chart of Plant vs Animal cells',
        dueDate: d('2025-05-20'),
        maxMarks: 25,
        status: 'PUBLISHED',
      },
      {
        institutionId: I.institution,
        courseId: I.cPhy11,
        facultyId: I.fac2,
        termId: I.term1,
        title: 'Projectile Motion Numerical Problems',
        description: 'Solve problem set 1 to 10 on 2D motion with friction neglected',
        dueDate: d('2025-05-25'),
        maxMarks: 20,
        status: 'PUBLISHED',
      },
    ],
  });
  I.assign1 = assigns[0].id;

  await prisma.assignmentSubmission.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        assignmentId: I.assign1,
        studentId: I.stu1,
        submissionUrl: '/submissions/stu1/cell_chart.pdf',
        submittedAt: d('2025-05-18'),
        status: 'GRADED',
        marks: 24,
        feedback: 'Excellent illustrations and clear tabular differences!',
        gradedAt: d('2025-05-21'),
      },
      {
        institutionId: I.institution,
        assignmentId: I.assign1,
        studentId: I.stu2,
        submissionUrl: '/submissions/stu2/cell_chart.pdf',
        submittedAt: d('2025-05-19'),
        status: 'GRADED',
        marks: 23,
        feedback: 'Very neat presentation and accurate organelle details.',
        gradedAt: d('2025-05-21'),
      },
    ],
  });

  // 30. Exams, ExamCourses, Marks
  const exam = await prisma.exam.create({
    data: {
      institutionId: I.institution,
      academicYearId: I.ay2025,
      termId: I.term1,
      name: 'Mid-Term Periodic Assessment 1 (2025)',
      code: 'PA-1-2025',
      examType: 'MIDTERM',
      status: 'SCHEDULED',
      startDate: d('2025-07-15'),
      endDate: d('2025-07-25'),
    },
  });
  I.exam = exam.id;

  const examCourses = await prisma.examCourse.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        examId: I.exam,
        courseId: I.cSci09,
        examDate: d('2025-07-16'),
        startTime: time(9, 0),
        endTime: time(11, 30),
        roomId: I.room101,
        maxMarks: 80,
        passingMarks: 27,
      },
      {
        institutionId: I.institution,
        examId: I.exam,
        courseId: I.cPhy11,
        examDate: d('2025-07-17'),
        startTime: time(9, 0),
        endTime: time(12, 0),
        roomId: I.room201,
        maxMarks: 70,
        passingMarks: 23,
      },
    ],
  });
  I.exCourse1 = examCourses[0].id;
  I.exCourse2 = examCourses[1].id;

  await prisma.mark.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        examCourseId: I.exCourse1,
        studentId: I.stu1,
        enrollmentId: I.enr2,
        marksObtained: 76,
        percentage: 95.0,
        grade: 'A1',
        gradePoint: 10,
        resultStatus: 'PASS',
      },
      {
        institutionId: I.institution,
        examCourseId: I.exCourse1,
        studentId: I.stu2,
        enrollmentId: I.enr3,
        marksObtained: 74,
        percentage: 92.5,
        grade: 'A1',
        gradePoint: 10,
        resultStatus: 'PASS',
      },
      {
        institutionId: I.institution,
        examCourseId: I.exCourse2,
        studentId: I.stu3,
        enrollmentId: I.enr4,
        marksObtained: 66,
        percentage: 94.3,
        grade: 'A1',
        gradePoint: 10,
        resultStatus: 'PASS',
      },
    ],
  });

  // 31. Calendar Events & Announcements
  await prisma.calendarEvent.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        title: 'School Reopening & Orientation Day',
        description: 'Welcome assembly and curriculum orientation for parents and students',
        eventType: 'ACADEMIC',
        startAt: d('2025-04-01T08:00:00'),
        endAt: d('2025-04-01T14:00:00'),
        isAllDay: false,
      },
      {
        institutionId: I.institution,
        title: 'Annual Inter-House Sports Meet',
        description: 'Track and field events, relay races, and award distribution ceremony',
        eventType: 'EVENT',
        startAt: d('2025-11-20T08:00:00'),
        endAt: d('2025-11-21T17:00:00'),
        isAllDay: true,
      },
    ],
  });

  await prisma.announcement.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        title: 'Welcome to the New Academic Session 2025-2026',
        content:
          'Delhi Public International School welcomes all students and guardians to an exciting year of learning and discovery.',
        isPublished: true,
        publishedAt: d('2025-04-01'),
      },
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        facultyId: I.fac1,
        title: 'Science Lab Manual Distribution',
        content:
          'Grade 9 students are requested to collect their certified composite science lab manuals from the library desk.',
        isPublished: true,
        publishedAt: d('2025-04-10'),
      },
    ],
  });

  // 32. Notifications
  await prisma.notification.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userStu1,
        title: 'Assignment Graded: Cell Biology',
        message: 'Your submission for Cell Organelle Chart has been evaluated. Score: 24/25',
        type: 'GRADE',
        isRead: false,
      },
      {
        institutionId: I.institution,
        userId: I.userGuard1,
        title: 'Term 1 Quarterly Fee Reminder',
        message: 'Installment 1 payment for Delhi Public International School has been confirmed.',
        type: 'GENERAL',
        isRead: true,
      },
    ],
  });

  // 33. Certificate Requests & Certificates
  const certReq = await prisma.certificateRequest.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu1,
      certificateType: 'BONAFIDE',
      purpose: 'Passport verification and visa application',
      status: 'APPROVED',
      processedByUserId: I.userPrincipal,
      processedAt: d('2025-05-12'),
    },
  });
  I.certReq1 = certReq.id;

  await prisma.certificate.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu1,
      requestId: I.certReq1,
      certificateNumber: 'DPIS-BONAFIDE-2025-001',
      certificateType: 'BONAFIDE',
      issueDate: d('2025-05-14'),
      verificationCode: 'DPIS-VCODE-9001-A',
    },
  });

  // 34. Student Documents
  await prisma.studentDocument.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        documentType: 'IDENTITY',
        title: 'Birth Certificate Municipal Corporation',
        fileUrl: '/school/documents/stu1/birth_cert.pdf',
        verificationStatus: 'VERIFIED',
        verifiedByUserId: I.userPrincipal,
        verifiedAt: d('2025-04-03'),
      },
      {
        institutionId: I.institution,
        studentId: I.stu1,
        documentType: 'ACADEMIC',
        title: 'Previous School Transfer Certificate',
        fileUrl: '/school/documents/stu1/tc.pdf',
        verificationStatus: 'VERIFIED',
        verifiedByUserId: I.userPrincipal,
        verifiedAt: d('2025-04-03'),
      },
    ],
  });

  // 35. Feedback Form, Questions, Submissions, Answers
  const fbForm = await prisma.feedbackForm.create({
    data: {
      institutionId: I.institution,
      title: 'School Facilities & Classroom Experience Survey',
      description:
        'Annual student feedback on science laboratories, digital smart boards, and sports facilities',
      isActive: true,
    },
  });
  I.fbForm = fbForm.id;

  const fbQuestions = await prisma.feedbackQuestion.createManyAndReturn({
    data: [
      {
        feedbackFormId: I.fbForm,
        question: 'How well equipped do you find the science and computer laboratories?',
        questionType: 'RATING',
        isRequired: true,
        options: { min: 1, max: 5 },
        order: 1,
      },
      {
        feedbackFormId: I.fbForm,
        question: 'Which extracurricular or club activity would you like to see expanded?',
        questionType: 'TEXT',
        isRequired: false,
        order: 2,
      },
    ],
  });

  const fbSub = await prisma.feedbackSubmission.create({
    data: {
      institutionId: I.institution,
      feedbackFormId: I.fbForm,
      studentId: I.stu1,
    },
  });

  await prisma.feedbackAnswer.createManyAndReturn({
    data: [
      { submissionId: fbSub.id, questionId: fbQuestions[0].id, answer: '5' },
      {
        submissionId: fbSub.id,
        questionId: fbQuestions[1].id,
        answer: 'More hands-on electronics and competitive coding workshops',
      },
    ],
  });

  // 36. Service Requests & Grievances
  await prisma.serviceRequest.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu1,
      category: 'School Transport',
      subject: 'Bus Route Stop Modification Request',
      description:
        'Requesting pickup point change to Gate 2 of Sector 62 housing complex due to road construction.',
      status: 'OPEN',
      priority: 'MEDIUM',
      assignedToUserId: I.userVicePrincipal,
    },
  });

  await prisma.grievance.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu2,
      source: 'STUDENT',
      category: 'FACILITIES',
      subject: 'Classroom Projector Audio Low Volume',
      description:
        'Audio during multimedia science animations in Room 101 has mild distortion and low volume.',
      isAnonymous: false,
      status: 'IN_REVIEW',
      priority: 'LOW',
    },
  });

  // 37. Clubs & Events
  const club = await prisma.club.create({
    data: {
      institutionId: I.institution,
      name: 'DPIS Robotics & STEM Club',
      description:
        'Student-run organization dedicated to tinkering, microcontrollers, and national STEM challenges',
      isActive: true,
    },
  });
  I.club = club.id;

  await prisma.clubMembership.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        clubId: I.club,
        studentId: I.stu1,
        role: 'Student Coordinator',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        clubId: I.club,
        studentId: I.stu3,
        role: 'Hardware Lead',
        status: 'ACTIVE',
      },
    ],
  });

  const clubEvt = await prisma.clubEvent.create({
    data: {
      institutionId: I.institution,
      clubId: I.club,
      title: 'Inter-School Junior Robotics Expo 2025',
      description:
        'Exhibition of autonomous line-follower robots and Arduino IoT automated greenhouse prototypes',
      startAt: d('2025-08-10T09:00:00'),
      endAt: d('2025-08-10T16:00:00'),
      location: 'Composite Science Lab & Central Courtyard',
    },
  });

  await prisma.clubEventRegistration.create({
    data: {
      institutionId: I.institution,
      clubEventId: clubEvt.id,
      studentId: I.stu1,
      status: 'ATTENDED',
    },
  });

  // 38. Student Skills, Languages, Achievements, Education
  await prisma.studentSkill.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        name: 'Python Basics',
        level: 'INTERMEDIATE',
      },
      {
        institutionId: I.institution,
        studentId: I.stu1,
        name: 'Arduino Hardware',
        level: 'BEGINNER',
      },
      {
        institutionId: I.institution,
        studentId: I.stu2,
        name: 'Creative Writing',
        level: 'ADVANCED',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        name: 'Mathematical Modelling',
        level: 'ADVANCED',
      },
      {
        institutionId: I.institution,
        studentId: I.stu4,
        name: 'Python & Data Structures',
        level: 'INTERMEDIATE',
      },
    ],
  });

  await prisma.studentLanguage.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        language: 'English',
        proficiency: 'FLUENT',
      },
      { institutionId: I.institution, studentId: I.stu1, language: 'Hindi', proficiency: 'NATIVE' },
      {
        institutionId: I.institution,
        studentId: I.stu2,
        language: 'English',
        proficiency: 'FLUENT',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        language: 'English',
        proficiency: 'FLUENT',
      },
      {
        institutionId: I.institution,
        studentId: I.stu4,
        language: 'English',
        proficiency: 'FLUENT',
      },
    ],
  });

  await prisma.studentAchievement.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        title: '1st Place - Regional STEM Innovation Fair',
        description: 'Developed an automated soil moisture monitor and water pump mechanism',
        achievementDate: d('2025-02-15'),
        issuer: 'Regional Science Council',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        title: 'Distinction - National Science Talent Search Exam',
        description: 'Ranked in top 1% nationally in Physics and Logical Reasoning',
        achievementDate: d('2025-01-20'),
        issuer: 'National Science Educational Forum',
      },
    ],
  });

  await prisma.studentPreviousEducation.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        institutionName: 'Delhi Public School Junior Wing, Noida',
        academicYear: '2024-2025',
        sequence: 1,
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        institutionName: 'Modern School, Barakhamba Road, Delhi',
        academicYear: '2024-2025',
        sequence: 1,
      },
    ],
  });

  await prisma.studentProject.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        title: 'Smart Plant Hydration System',
        description:
          'Microcontroller project monitoring soil moisture with automated solenoid valve release',
        technologies: 'Arduino C++, Soil Sensor, OLED Display',
        startDate: d('2025-03-01'),
        endDate: d('2025-04-10'),
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        title: 'Double Pendulum Chaos Simulator',
        description:
          'Interactive numerical integration simulating chaotic physics motion in 2D space',
        technologies: 'Python, NumPy, Matplotlib',
        projectUrl: 'https://github.com/rohanmehta/pendulum-sim',
        startDate: d('2025-04-05'),
        endDate: d('2025-05-15'),
      },
    ],
  });

  await prisma.studentSocialProfile.createManyAndReturn({
    data: [
      { studentId: I.stu1, platform: 'GITHUB', profileUrl: 'https://github.com/aaravsharma-dpis' },
      { studentId: I.stu3, platform: 'GITHUB', profileUrl: 'https://github.com/rohanmehta-sci' },
    ],
  });

  await prisma.studentInternship.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu3,
        organization: 'Community Science Centre',
        role: 'Student Science Volunteer',
        startDate: d('2025-05-15'),
        endDate: d('2025-06-15'),
        description:
          'Conducted weekend astronomy stargazing sessions and telescope handling demos for primary kids',
      },
      {
        institutionId: I.institution,
        studentId: I.stu4,
        organization: 'Green Earth Student NGO',
        role: 'Data Analysis Volunteer',
        startDate: d('2025-05-10'),
        endDate: d('2025-06-10'),
        description:
          'Aggregated local AQI and air quality sensor readings for school environmental bulletin',
      },
    ],
  });

  // 39. Student Terms
  await prisma.studentTerm.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        academicTermId: I.term1,
        curriculumTermId: I.currTermSec1,
        status: 'ACTIVE',
        termGPA: 9.6,
      },
      {
        institutionId: I.institution,
        studentId: I.stu2,
        academicTermId: I.term1,
        curriculumTermId: I.currTermSec1,
        status: 'ACTIVE',
        termGPA: 9.4,
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        academicTermId: I.term1,
        curriculumTermId: I.currTermSr1,
        status: 'ACTIVE',
        termGPA: 9.5,
      },
      {
        institutionId: I.institution,
        studentId: I.stu4,
        academicTermId: I.term1,
        curriculumTermId: I.currTermSr1,
        status: 'ACTIVE',
        termGPA: 9.2,
      },
    ],
  });

  // 40. Fee Structures, Components, Student Fee Plans, Installments, Waivers, Payments
  const feeStructs = await prisma.feeStructure.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        name: 'Secondary School (Grade 9-10) Annual Fee Structure 2025-26',
        code: 'FEE-SEC-2025',
        programId: I.progSec,
        batchId: I.batchSec,
        academicYearId: I.ay2025,
        totalAmount: 96000,
        currency: 'INR',
        isActive: true,
      },
      {
        institutionId: I.institution,
        name: 'Senior Secondary Science (Grade 11-12) Annual Fee Structure 2025-26',
        code: 'FEE-SR-SCI-2025',
        programId: I.progSrSci,
        batchId: I.batchSrSci,
        academicYearId: I.ay2025,
        totalAmount: 118000,
        currency: 'INR',
        isActive: true,
      },
    ],
  });
  I.feeStructSec = feeStructs[0].id;
  I.feeStructSr = feeStructs[1].id;

  const feeComps = await prisma.feeComponent.createManyAndReturn({
    data: [
      // Secondary
      {
        feeStructureId: I.feeStructSec,
        name: 'Tuition & Academic Development Fee',
        type: 'TUITION',
        amount: 72000,
        isOptional: false,
        description: 'Comprehensive classroom teaching, smartboards, and learning portals',
      },
      {
        feeStructureId: I.feeStructSec,
        name: 'Science & Computer Lab Fee',
        type: 'LIBRARY',
        amount: 14000,
        isOptional: false,
        description: 'Consumables, apparatus, and digital computing lab maintenance',
      },
      {
        feeStructureId: I.feeStructSec,
        name: 'Annual Sports & Activity Fee',
        type: 'MISC',
        amount: 10000,
        isOptional: false,
        description: 'Coaching, sports equipment, inter-house fixtures, and arts',
      },

      // Senior Science
      {
        feeStructureId: I.feeStructSr,
        name: 'Tuition Fee (Senior Wing)',
        type: 'TUITION',
        amount: 84000,
        isOptional: false,
        description: 'Senior secondary specialized academic instruction',
      },
      {
        feeStructureId: I.feeStructSr,
        name: 'Advanced Science Practicals & Lab Fee',
        type: 'MISC',
        amount: 22000,
        isOptional: false,
        description: 'Physics, Chemistry, and Python Computer Science laboratories',
      },
      {
        feeStructureId: I.feeStructSr,
        name: 'Examination & Assessment Fee',
        type: 'EXAMINATION',
        amount: 12000,
        isOptional: false,
        description: 'CBSE assessment registration, periodic test supplies, and evaluation',
      },
    ],
  });
  I.feeCompSec1 = feeComps[0].id;
  I.feeCompSec2 = feeComps[1].id;
  I.feeCompSr1 = feeComps[3].id;

  // Student Fee Plans
  const feePlans = await prisma.studentFeePlan.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        academicYearId: I.ay2025,
        feeStructureId: I.feeStructSec,
        totalAmount: 96000,
        currency: 'INR',
        paymentMode: 'INSTALLMENTS',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        academicYearId: I.ay2025,
        feeStructureId: I.feeStructSr,
        totalAmount: 118000,
        currency: 'INR',
        paymentMode: 'ANNUAL',
        status: 'ACTIVE',
      },
    ],
  });
  I.feePlan1 = feePlans[0].id;
  I.feePlan2 = feePlans[1].id;

  await prisma.studentFeePlanComponent.createManyAndReturn({
    data: [
      { studentFeePlanId: I.feePlan1, feeComponentId: I.feeCompSec1, amount: 72000 },
      { studentFeePlanId: I.feePlan1, feeComponentId: I.feeCompSec2, amount: 14000 },
      { studentFeePlanId: I.feePlan2, feeComponentId: I.feeCompSr1, amount: 84000 },
    ],
  });

  const installments = await prisma.feeInstallment.createManyAndReturn({
    data: [
      {
        studentFeePlanId: I.feePlan1,
        installmentNumber: 1,
        amount: 48000,
        amountPaid: 48000,
        dueDate: d('2025-04-10'),
        status: 'PAID',
      },
      {
        studentFeePlanId: I.feePlan1,
        installmentNumber: 2,
        amount: 48000,
        amountPaid: 0,
        dueDate: d('2025-10-10'),
        status: 'PENDING',
      },
      {
        studentFeePlanId: I.feePlan2,
        installmentNumber: 1,
        amount: 118000,
        amountPaid: 118000,
        dueDate: d('2025-04-10'),
        status: 'PAID',
      },
    ],
  });
  I.inst1 = installments[0].id;

  await prisma.feeWaiver.create({
    data: {
      studentFeePlanId: I.feePlan1,
      name: 'STEM Scholar Sibling Concession',
      amount: 6000,
      waiverType: 'CONCESSION',
      status: 'APPROVED',
      reason: 'Younger sibling admitted in Primary Wing',
      approvedBy: I.userPrincipal,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu1,
      amount: 48000,
      currency: 'INR',
      paymentDate: d('2025-04-08'),
      paymentMethod: 'UPI',
      transactionReference: 'UPI-20250408-DPIS001',
      status: 'SUCCESS',
      receiptNumber: 'RCP-DPIS-2025-001',
      collectedById: I.userPrincipal,
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: payment.id,
      installmentId: I.inst1,
      amount: 48000,
    },
  });

  // 41. Applications
  await prisma.application.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        programId: I.progSec,
        academicYearId: I.ay2025,
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'aarav.sharma@student.dpis.edu',
        phone: '+91-98765-11004',
        status: 'ENROLLED',
        applicationFee: 1500,
        isFeePaid: true,
        submittedAt: d('2025-01-15'),
        acceptedAt: d('2025-02-20'),
        enrolledAt: d('2025-04-01'),
        studentId: I.stu1,
      },
      {
        institutionId: I.institution,
        programId: I.progSrSci,
        academicYearId: I.ay2025,
        firstName: 'Rohan',
        lastName: 'Mehta',
        email: 'rohan.mehta@student.dpis.edu',
        phone: '+91-98765-11006',
        status: 'ENROLLED',
        applicationFee: 1500,
        isFeePaid: true,
        submittedAt: d('2025-01-20'),
        acceptedAt: d('2025-02-25'),
        enrolledAt: d('2025-04-01'),
        studentId: I.stu3,
      },
    ],
  });

  // 42. Lesson Plans & Sections
  const lessonPlans = await prisma.lessonPlan.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cSci09,
        facultyId: I.fac1,
        termId: I.term1,
        title: 'Fundamental Unit of Life: Cells & Organelles',
        description:
          'Structure of plant and animal cells, cell membrane diffusion and osmosis experiments',
        sequence: 1,
        plannedDate: d('2025-05-02'),
        durationMinutes: 45,
        teachingMethod: 'DEMONSTRATION',
        status: 'COMPLETED',
        learningObjectives: [
          'Differentiate between plant and animal cells',
          'Prepare temporary mount of onion peel',
        ],
        teachingPlan: {
          activities: ['Microscope demonstration', 'Diagram sketching', 'Interactive Q&A'],
        },
      },
      {
        institutionId: I.institution,
        courseId: I.cPhy11,
        facultyId: I.fac2,
        termId: I.term1,
        title: 'Vectors and Resolution of Forces',
        description:
          'Vector addition, triangle law, parallelogram law, and unit vectors in 3D cartesian coordinates',
        sequence: 1,
        plannedDate: d('2025-05-03'),
        durationMinutes: 45,
        teachingMethod: 'LECTURE',
        status: 'COMPLETED',
        learningObjectives: [
          'State parallelogram law of vectors',
          'Resolve force components along x and y axes',
        ],
        teachingPlan: { activities: ['Chalkboard derivations', 'Sample numerical practice'] },
      },
    ],
  });
  I.lp1 = lessonPlans[0].id;

  await prisma.lessonPlanSection.create({
    data: { lessonPlanId: I.lp1, sectionId: I.secG9A },
  });
  await prisma.lessonPlanResource.create({
    data: { lessonPlanId: I.lp1, resourceId: I.res1, sortOrder: 1 },
  });

  // 43. Admin Resources & Audit Logs
  await prisma.adminResource.create({
    data: {
      institutionId: I.institution,
      courseId: I.cSci09,
      title: 'CBSE Class IX Science Curriculum Guide & Assessment Blueprint',
      description: 'Official board syllabus, experiment list, and chapter-wise mark breakdown',
      resourceType: 'PDF',
      fileUrl: '/admin/curriculum/cbse_science_grade9.pdf',
      uploadedBy: I.userPrincipal,
    },
  });

  await prisma.auditLog.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        actorUserId: I.userPrincipal,
        action: 'CREATE',
        entityType: 'Institution',
        entityId: I.institution,
        afterData: { name: 'Delhi Public International School', type: 'SCHOOL' },
      },
      {
        institutionId: I.institution,
        actorUserId: I.userPrincipal,
        action: 'ENROLL',
        entityType: 'Student',
        entityId: I.stu1,
        afterData: { studentId: I.stu1, rollNumber: '09-A-01', program: 'PROG-SEC' },
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   Institution: Delhi Public International School (SCHOOL)`);
  console.log(`   Departments: 2 (Middle School Department, Senior School Department)`);
  console.log(`   Programs: 2 (Secondary School Education, Senior Secondary Science)`);
  console.log(
    `   Curriculums: 2 (CBSE Secondary Curriculum, CBSE Senior Secondary Science Curriculum)`,
  );
  console.log(
    `   Courses: 10 (5 courses in Secondary Curriculum, 5 courses in Senior Secondary Science Curriculum)`,
  );
  console.log(`   Curriculum Courses: 10 (Mapped sequence 1 to 5 for each curriculum term)`);
  console.log(`   Users: 10 (2 Admin/Principal, 2 Faculty, 4 Students, 2 Guardians)`);
  console.log(`   Enrollments: 11`);
  console.log(`   Fee Structures: 2, Components: 6, Fee Plans: 2`);
  console.log(`   Timetables, Lesson Plans, Exams, Marks, Grievances, Clubs: Seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
