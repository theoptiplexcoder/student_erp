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
  console.log('🧹 Cleaning up existing data...');
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

  console.log('🌱 Seeding institution...');

  // 1. Institution
  const inst = await prisma.institution.create({
    data: {
      institutionType: 'UNIVERSITY',
      legalName: 'Ellipsonic Institute of Technology',
      displayName: 'EIT',
      branding: { primaryColor: '#1a365d', accentColor: '#e53e3e' },
    },
  });
  I.institution = inst.id;

  // 2. Departments
  const depts = await prisma.department.createManyAndReturn({
    data: [
      { institutionId: I.institution, name: 'Computer Science', code: 'CS' },
      { institutionId: I.institution, name: 'Mathematics', code: 'MA' },
    ],
  });
  I.deptCS = depts[0].id;
  I.deptMath = depts[1].id;

  // 3. Academic Year
  const ay = await prisma.academicYear.create({
    data: {
      institutionId: I.institution,
      name: '2025-2026',
      startDate: d('2025-08-01'),
      endDate: d('2026-07-31'),
      isActive: true,
    },
  });
  I.ay2025 = ay.id;

  // 4. Class Levels
  const clsLevels = await prisma.classLevel.createManyAndReturn({
    data: [
      { institutionId: I.institution, name: 'Year 1', code: 'Y1', sequence: 1 },
      { institutionId: I.institution, name: 'Year 2', code: 'Y2', sequence: 2 },
      { institutionId: I.institution, name: 'Year 3', code: 'Y3', sequence: 3 },
    ],
  });
  I.clsYr1 = clsLevels[0].id;
  I.clsYr2 = clsLevels[1].id;
  I.clsYr3 = clsLevels[2].id;

  // 5. Building & Rooms
  const building = await prisma.building.create({
    data: {
      institutionId: I.institution,
      name: 'Main Building',
      code: 'MB',
      address: 'EIT Campus, Sector 15, Noida, UP',
      floors: 4,
    },
  });
  I.building = building.id;

  const rooms = await prisma.room.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        buildingId: I.building,
        name: 'Lecture Hall A',
        number: 'A-101',
        floor: 1,
        capacity: 120,
        roomType: 'LECTURE_HALL',
      },
      {
        institutionId: I.institution,
        buildingId: I.building,
        name: 'CS Lab B',
        number: 'B-201',
        floor: 2,
        capacity: 60,
        roomType: 'LAB',
      },
      {
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
  I.roomA101 = rooms[0].id;
  I.roomB201 = rooms[1].id;
  I.roomC301 = rooms[2].id;

  // 6. Programs
  const progs = await prisma.program.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        departmentId: I.deptCS,
        name: 'B.Tech Computer Science',
        code: 'BTCS',
        level: 'UNDERGRADUATE',
        durationYears: 4,
      },
      {
        institutionId: I.institution,
        departmentId: I.deptMath,
        name: 'B.Tech Mathematics',
        code: 'BTMA',
        level: 'UNDERGRADUATE',
        durationYears: 3,
      },
    ],
  });
  I.progBTechCS = progs[0].id;
  I.progBTechMath = progs[1].id;

  // 7. Custom Role & Permissions
  const customRole = await prisma.customRole.create({
    data: {
      institutionId: I.institution,
      name: 'Department Head',
      description: 'Head of department with full department management access',
    },
  });
  I.customRole = customRole.id;

  await prisma.rolePermission.createManyAndReturn({
    data: [
      { customRoleId: I.customRole, resource: 'faculty', action: 'MANAGE' },
      { customRoleId: I.customRole, resource: 'course', action: 'MANAGE' },
    ],
  });

  // 8. Curriculums
  const currs = await prisma.curriculum.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        programId: I.progBTechCS,
        versionNumber: '1.0',
        name: 'B.Tech CS Curriculum 2025',
        status: 'ACTIVE',
        effectiveFrom: d('2025-08-01'),
      },
      {
        institutionId: I.institution,
        programId: I.progBTechMath,
        versionNumber: '1.0',
        name: 'B.Tech Math Curriculum 2025',
        status: 'ACTIVE',
        effectiveFrom: d('2025-08-01'),
      },
    ],
  });
  I.currCS = currs[0].id;
  I.currMath = currs[1].id;

  // 9. Academic Terms
  const terms = await prisma.academicTerm.createManyAndReturn({
    data: [
      {
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
  I.termSem1 = terms[0].id;
  I.termSem2 = terms[1].id;

  // 10. Curriculum Terms
  const currTerms = await prisma.curriculumTerm.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        curriculumId: I.currCS,
        name: 'Semester 1',
        sequence: 1,
        creditRequirement: 20,
      },
      {
        institutionId: I.institution,
        curriculumId: I.currMath,
        name: 'Semester 1',
        sequence: 1,
        creditRequirement: 18,
      },
    ],
  });
  I.currTermCS1 = currTerms[0].id;
  I.currTermMath1 = currTerms[1].id;

  // 11. Curriculum Elective Groups
  const elecGroups = await prisma.curriculumElectiveGroup.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        name: 'CS Electives',
        requiredCredits: 6,
        requiredCourses: 2,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        name: 'Math Electives',
        requiredCredits: 4,
        requiredCourses: 1,
      },
    ],
  });
  I.electiveGrpCS = elecGroups[0].id;
  I.electiveGrpMath = elecGroups[1].id;

  // 12. Batches
  const batches = await prisma.batch.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        programId: I.progBTechCS,
        name: 'CS Batch 2025',
        admissionYear: 2025,
        startDate: d('2025-08-01'),
        expectedEndDate: d('2029-06-30'),
      },
      {
        institutionId: I.institution,
        programId: I.progBTechMath,
        name: 'Math Batch 2025',
        admissionYear: 2025,
        startDate: d('2025-08-01'),
        expectedEndDate: d('2028-06-30'),
      },
    ],
  });
  I.batchCS2025 = batches[0].id;
  I.batchMath2025 = batches[1].id;

  // 13. Sections
  const sections = await prisma.section.createManyAndReturn({
    data: [
      {
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
  I.sectionCS = sections[0].id;
  I.sectionMath = sections[1].id;

  // 14. Courses
  const courses = await prisma.course.createManyAndReturn({
    data: [
      {
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
  I.cs101 = courses[0].id;
  I.cs201 = courses[1].id;
  I.cs301 = courses[2].id;
  I.ma101 = courses[3].id;
  I.ma201 = courses[4].id;
  I.ma301 = courses[5].id;

  // 15. Curriculum Courses
  const currCourses = await prisma.curriculumCourse.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs101,
        sequence: 1,
        creditValue: 4,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs201,
        sequence: 2,
        creditValue: 4,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermCS1,
        courseId: I.cs301,
        sequence: 3,
        creditValue: 4,
        isMandatory: false,
        electiveGroupId: I.electiveGrpCS,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        courseId: I.ma101,
        sequence: 1,
        creditValue: 3,
        isMandatory: true,
      },
      {
        institutionId: I.institution,
        curriculumTermId: I.currTermMath1,
        courseId: I.ma201,
        sequence: 2,
        creditValue: 3,
        isMandatory: true,
      },
      {
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
    data: { institutionId: I.institution, courseId: I.cs201, prerequisiteCourseId: I.cs101 },
  });

  // 17. Users (with Supabase auth)
  const usersData = [
    {
      idKey: 'userAdmin',
      email: 'admin@eit.edu',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-98765-43210',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userFac1',
      email: 'priya.sharma@eit.edu',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-98765-43211',
      role: 'FACULTY' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userFac2',
      email: 'amit.patel@eit.edu',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91-98765-43212',
      role: 'FACULTY' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu1',
      email: 'rahul.verma@student.eit.edu',
      firstName: 'Rahul',
      lastName: 'Verma',
      phone: '+91-98765-43213',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu2',
      email: 'sneha.gupta@student.eit.edu',
      firstName: 'Sneha',
      lastName: 'Gupta',
      phone: '+91-98765-43214',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu3',
      email: 'vikram.singh@student.eit.edu',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-98765-43215',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userStu4',
      email: 'ananya.reddy@student.eit.edu',
      firstName: 'Ananya',
      lastName: 'Reddy',
      phone: '+91-98765-43216',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userGuard1',
      email: 'suresh.verma@gmail.com',
      firstName: 'Suresh',
      lastName: 'Verma',
      phone: '+91-98765-43217',
      role: 'GUARDIAN' as const,
      status: 'ACTIVE' as const,
    },
    {
      idKey: 'userGuard2',
      email: 'meena.gupta@gmail.com',
      firstName: 'Meena',
      lastName: 'Gupta',
      phone: '+91-98765-43218',
      role: 'GUARDIAN' as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const u of usersData) {
    let authUserId = null;
    const { data: existingUser } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
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
        console.error('Supabase user creation failed for', u.email, error);
      } else {
        authUserId = newUser.user.id;
      }
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
        departmentId: I.deptCS,
        teacherCode: 'FAC-001',
        employmentType: 'FULL_TIME',
        hireDate: d('2018-07-01'),
        status: 'ACTIVE',
      },
      {
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
  I.fac1 = facs[0].id;
  I.fac2 = facs[1].id;

  // 19. Faculty Availability
  await prisma.facultyAvailability.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        dayOfWeek: 'MONDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        dayOfWeek: 'TUESDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        dayOfWeek: 'WEDNESDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        dayOfWeek: 'THURSDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        dayOfWeek: 'FRIDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        dayOfWeek: 'MONDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        dayOfWeek: 'TUESDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        dayOfWeek: 'WEDNESDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        dayOfWeek: 'THURSDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        dayOfWeek: 'FRIDAY',
        startTime: time(9, 0),
        endTime: time(17, 0),
        isAvailable: true,
      },
    ],
  });

  // 20. Guardians
  const guards = await prisma.guardian.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userGuard1,
        occupation: 'Engineer',
        relationship: 'Father',
      },
      {
        institutionId: I.institution,
        userId: I.userGuard2,
        occupation: 'Teacher',
        relationship: 'Mother',
      },
    ],
  });
  I.guard1 = guards[0].id;
  I.guard2 = guards[1].id;

  // 21. Students
  const stus = await prisma.student.createManyAndReturn({
    data: [
      {
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
  I.stu1 = stus[0].id;
  I.stu2 = stus[1].id;
  I.stu3 = stus[2].id;
  I.stu4 = stus[3].id;

  // 22. Course Offerings
  const offerings = await prisma.courseOffering.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cs101,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        institutionId: I.institution,
        courseId: I.cs201,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        institutionId: I.institution,
        courseId: I.cs301,
        termId: I.termSem1,
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        sectionId: I.sectionCS,
        capacity: 60,
      },
      {
        institutionId: I.institution,
        courseId: I.ma101,
        termId: I.termSem1,
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        capacity: 40,
      },
      {
        institutionId: I.institution,
        courseId: I.ma201,
        termId: I.termSem1,
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        sectionId: I.sectionMath,
        capacity: 40,
      },
      {
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
  I.offCS101 = offerings[0].id;
  I.offCS201 = offerings[1].id;
  I.offCS301 = offerings[2].id;
  I.offMA101 = offerings[3].id;
  I.offMA201 = offerings[4].id;
  I.offMA301 = offerings[5].id;

  // 23. Course Assignments
  const courseAssigns = await prisma.courseAssignment.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        facultyId: I.fac1,
        courseId: I.cs101,
        sectionId: I.sectionCS,
        termId: I.termSem1,
        isPrimary: true,
      },
      {
        institutionId: I.institution,
        facultyId: I.fac2,
        courseId: I.ma101,
        sectionId: I.sectionMath,
        termId: I.termSem1,
        isPrimary: true,
      },
    ],
  });

  // 24. Enrollments
  const enrollments = await prisma.enrollment.createManyAndReturn({
    data: [
      {
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
      {
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
  I.enr1 = enrollments[0].id;
  I.enr2 = enrollments[1].id;
  I.enr3 = enrollments[2].id;
  I.enr4 = enrollments[3].id;
  I.enr5 = enrollments[4].id;
  I.enr6 = enrollments[5].id;
  I.enr7 = enrollments[6].id;
  I.enr8 = enrollments[7].id;

  // 25. Timetable & Timetable Entries
  const timetable = await prisma.timetable.create({
    data: {
      institutionId: I.institution,
      academicYearId: I.ay2025,
      termId: I.termSem1,
      name: 'Fall 2025 Regular Schedule',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  I.timetable1 = timetable.id;

  await prisma.timetableEntry.createManyAndReturn({
    data: [
      {
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
      {
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
      {
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
      {
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
      {
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
      {
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
      {
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
    ],
  });

  // 26. Attendance Sessions
  const attSessions = await prisma.attendanceSession.createManyAndReturn({
    data: [
      {
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
  I.attSess1 = attSessions[0].id;
  I.attSess2 = attSessions[1].id;

  // 27. Attendance Records
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
        status: 'LATE',
        remarks: 'Arrived 10 minutes late',
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
        status: 'ABSENT',
        remarks: 'Medical leave',
      },
    ],
  });

  // 28. Course Resources
  const resources = await prisma.courseResource.createManyAndReturn({
    data: [
      {
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
  I.res1 = resources[0].id;
  I.res2 = resources[1].id;

  // 29. Assignments
  const assigns = await prisma.assignment.createManyAndReturn({
    data: [
      {
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
  I.assign1 = assigns[0].id;
  I.assign2 = assigns[1].id;

  // 30. Assignment Submissions
  await prisma.assignmentSubmission.createManyAndReturn({
    data: [
      {
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
        institutionId: I.institution,
        assignmentId: I.assign1,
        studentId: I.stu2,
        submissionUrl: '/submissions/stu2/assign1.zip',
        submittedAt: d('2025-09-11'),
        status: 'SUBMITTED',
      },
    ],
  });

  // 31. Exams
  const exam = await prisma.exam.create({
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
  I.exam1 = exam.id;

  // 32. Exam Courses
  const examCourse = await prisma.examCourse.create({
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
  I.examCourse1 = examCourse.id;

  // 33. Marks
  await prisma.mark.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        examCourseId: I.examCourse1,
        studentId: I.stu1,
        enrollmentId: I.enr1,
        marksObtained: 85,
        percentage: 85,
        grade: 'A',
        gradePoint: 9,
        resultStatus: 'PASS',
      },
      {
        institutionId: I.institution,
        examCourseId: I.examCourse1,
        studentId: I.stu2,
        enrollmentId: I.enr3,
        marksObtained: 72,
        percentage: 72,
        grade: 'B+',
        gradePoint: 8,
        resultStatus: 'PASS',
      },
    ],
  });

  // 34. Calendar Events
  await prisma.calendarEvent.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        title: 'Semester 1 Begins',
        description: 'First day of classes for Semester 1',
        eventType: 'ACADEMIC',
        startAt: d('2025-08-01'),
        endAt: d('2025-08-01'),
        isAllDay: true,
      },
      {
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

  // 35. Announcements
  await prisma.announcement.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        courseId: I.cs101,
        facultyId: I.fac1,
        title: 'CS101 Assignment 1 Released',
        content: 'The first assignment has been posted. Please check the course portal.',
        isPublished: true,
        publishedAt: d('2025-08-25'),
      },
      {
        institutionId: I.institution,
        title: 'Welcome to EIT 2025',
        content: 'Welcome all new students to Ellipsonic Institute of Technology!',
        isPublished: true,
        publishedAt: d('2025-08-01'),
      },
    ],
  });

  // 36. Notifications
  await prisma.notification.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        userId: I.userStu1,
        title: 'Assignment Graded',
        message: 'Your CS101 assignment has been graded. Score: 18/20',
        type: 'GRADE',
        isRead: false,
      },
      {
        institutionId: I.institution,
        userId: I.userStu2,
        title: 'Assignment Reminder',
        message: 'CS101 Assignment 1 is due in 5 days',
        type: 'ASSIGNMENT',
        isRead: false,
      },
    ],
  });

  // 37. Certificate Request & Certificate
  const certReq = await prisma.certificateRequest.create({
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
  I.certReq1 = certReq.id;

  await prisma.certificate.create({
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

  // 38. Student Documents
  await prisma.studentDocument.createManyAndReturn({
    data: [
      {
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

  // 39. Feedback Form, Questions, Submissions, Answers
  const fbForm = await prisma.feedbackForm.create({
    data: {
      institutionId: I.institution,
      title: 'Course Feedback - CS101',
      description: 'Please provide your feedback for the CS101 course',
      isActive: true,
    },
  });
  I.fbForm = fbForm.id;

  const fbQuestions = await prisma.feedbackQuestion.createManyAndReturn({
    data: [
      {
        feedbackFormId: I.fbForm,
        question: 'How would you rate the course overall?',
        questionType: 'RATING',
        isRequired: true,
        options: { min: 1, max: 5 },
        order: 1,
      },
      {
        feedbackFormId: I.fbForm,
        question: 'Any suggestions for improvement?',
        questionType: 'TEXT',
        isRequired: false,
        order: 2,
      },
    ],
  });
  I.fbQ1 = fbQuestions[0].id;
  I.fbQ2 = fbQuestions[1].id;

  const fbSub = await prisma.feedbackSubmission.create({
    data: { institutionId: I.institution, feedbackFormId: I.fbForm, studentId: I.stu1 },
  });
  I.fbSub = fbSub.id;

  await prisma.feedbackAnswer.createManyAndReturn({
    data: [
      { submissionId: I.fbSub, questionId: I.fbQ1, answer: '4' },
      {
        submissionId: I.fbSub,
        questionId: I.fbQ2,
        answer: 'More hands-on projects would be great',
      },
    ],
  });

  // 40. Service Request
  await prisma.serviceRequest.create({
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

  // 41. Grievance
  await prisma.grievance.create({
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

  // 42. Clubs
  const club = await prisma.club.create({
    data: {
      institutionId: I.institution,
      name: 'EIT Tech Club',
      description: 'Student-led technology and programming club',
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
        role: 'President',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        clubId: I.club,
        studentId: I.stu2,
        role: 'Member',
        status: 'ACTIVE',
      },
    ],
  });

  const clubEvt = await prisma.clubEvent.create({
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
  I.clubEvt = clubEvt.id;

  await prisma.clubEventRegistration.create({
    data: {
      institutionId: I.institution,
      clubEventId: I.clubEvt,
      studentId: I.stu1,
      status: 'REGISTERED',
    },
  });

  // 43. Student Skills
  await prisma.studentSkill.createManyAndReturn({
    data: [
      { institutionId: I.institution, studentId: I.stu1, name: 'Python', level: 'ADVANCED' },
      {
        institutionId: I.institution,
        studentId: I.stu1,
        name: 'JavaScript',
        level: 'INTERMEDIATE',
      },
      { institutionId: I.institution, studentId: I.stu2, name: 'Python', level: 'INTERMEDIATE' },
      {
        institutionId: I.institution,
        studentId: I.stu2,
        name: 'Machine Learning',
        level: 'BEGINNER',
      },
      { institutionId: I.institution, studentId: I.stu3, name: 'MATLAB', level: 'ADVANCED' },
      { institutionId: I.institution, studentId: I.stu3, name: 'R', level: 'INTERMEDIATE' },
      { institutionId: I.institution, studentId: I.stu4, name: 'Python', level: 'BEGINNER' },
      { institutionId: I.institution, studentId: I.stu4, name: 'Statistics', level: 'ADVANCED' },
    ],
  });

  // 44. Student Languages
  await prisma.studentLanguage.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        language: 'English',
        proficiency: 'FLUENT',
      },
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
        proficiency: 'CONVERSATIONAL',
      },
      {
        institutionId: I.institution,
        studentId: I.stu4,
        language: 'English',
        proficiency: 'FLUENT',
      },
    ],
  });

  // 45. Student Achievements
  await prisma.studentAchievement.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        title: 'State-level Coding Competition Winner',
        description: 'Won first place in state coding competition',
        achievementDate: d('2025-03-15'),
        issuer: 'State Education Board',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        title: 'Math Olympiad Gold Medal',
        description: 'Gold medal in national math olympiad',
        achievementDate: d('2025-02-20'),
        issuer: 'National Math Foundation',
      },
    ],
  });

  // 46. Student Previous Education
  await prisma.studentPreviousEducation.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        institutionName: 'Delhi Public School, Noida',
        academicYear: '2023-2024',
        sequence: 1,
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        institutionName: "St. Xavier's School, Jaipur",
        academicYear: '2023-2024',
        sequence: 1,
      },
    ],
  });

  // 47. Student Projects
  await prisma.studentProject.createManyAndReturn({
    data: [
      {
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

  // 48. Student Social Profiles
  await prisma.studentSocialProfile.createManyAndReturn({
    data: [
      { studentId: I.stu1, platform: 'GITHUB', profileUrl: 'https://github.com/rahulverma' },
      { studentId: I.stu2, platform: 'LINKEDIN', profileUrl: 'https://linkedin.com/in/snehagupta' },
    ],
  });

  // 49. Student Internships (NEW)
  await prisma.studentInternship.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        organization: 'TechCorp Solutions',
        role: 'Software Engineering Intern',
        startDate: d('2025-05-01'),
        endDate: d('2025-07-31'),
        description: 'Worked on backend APIs using Node.js and PostgreSQL',
        certificateUrl: '/internships/stu1/techcorp.pdf',
      },
      {
        institutionId: I.institution,
        studentId: I.stu2,
        organization: 'DataViz Analytics',
        role: 'ML Intern',
        startDate: d('2025-06-01'),
        endDate: d('2025-08-15'),
        description: 'Built predictive models for customer churn analysis',
      },
    ],
  });

  // 50. Student Terms
  await prisma.studentTerm.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        academicTermId: I.termSem1,
        curriculumTermId: I.currTermCS1,
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        academicTermId: I.termSem1,
        curriculumTermId: I.currTermMath1,
        status: 'ACTIVE',
      },
    ],
  });

  // 51. Fee Structures (NEW)
  const feeStructs = await prisma.feeStructure.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        name: 'B.Tech CS 2025 Fee',
        code: 'FEE-BTCS-2025',
        programId: I.progBTechCS,
        batchId: I.batchCS2025,
        academicYearId: I.ay2025,
        totalAmount: 150000,
        currency: 'INR',
        isActive: true,
      },
      {
        institutionId: I.institution,
        name: 'B.Tech Math 2025 Fee',
        code: 'FEE-BTMA-2025',
        programId: I.progBTechMath,
        batchId: I.batchMath2025,
        academicYearId: I.ay2025,
        totalAmount: 120000,
        currency: 'INR',
        isActive: true,
      },
    ],
  });
  I.feeStructCS = feeStructs[0].id;
  I.feeStructMath = feeStructs[1].id;

  // 52. Fee Components (NEW)
  const feeComps = await prisma.feeComponent.createManyAndReturn({
    data: [
      {
        feeStructureId: I.feeStructCS,
        name: 'Tuition Fee',
        type: 'TUITION',
        amount: 120000,
        isOptional: false,
        description: 'Semester tuition fee',
      },
      {
        feeStructureId: I.feeStructCS,
        name: 'Examination Fee',
        type: 'EXAMINATION',
        amount: 15000,
        isOptional: false,
        description: 'Exam and evaluation charges',
      },
      {
        feeStructureId: I.feeStructCS,
        name: 'Library Fee',
        type: 'LIBRARY',
        amount: 5000,
        isOptional: false,
        description: 'Annual library access',
      },
      {
        feeStructureId: I.feeStructCS,
        name: 'Hostel Fee',
        type: 'HOSTEL',
        amount: 10000,
        isOptional: true,
        description: 'Hostel accommodation (optional)',
      },
      {
        feeStructureId: I.feeStructMath,
        name: 'Tuition Fee',
        type: 'TUITION',
        amount: 100000,
        isOptional: false,
        description: 'Semester tuition fee',
      },
      {
        feeStructureId: I.feeStructMath,
        name: 'Examination Fee',
        type: 'EXAMINATION',
        amount: 12000,
        isOptional: false,
        description: 'Exam and evaluation charges',
      },
      {
        feeStructureId: I.feeStructMath,
        name: 'Library Fee',
        type: 'LIBRARY',
        amount: 5000,
        isOptional: false,
        description: 'Annual library access',
      },
    ],
  });
  I.feeCompCS1 = feeComps[0].id;
  I.feeCompCS2 = feeComps[1].id;
  I.feeCompMath1 = feeComps[4].id;

  // 53. Student Fee Plans
  const feePlans = await prisma.studentFeePlan.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        studentId: I.stu1,
        academicYearId: I.ay2025,
        feeStructureId: I.feeStructCS,
        totalAmount: 150000,
        currency: 'INR',
        paymentMode: 'INSTALLMENTS',
        status: 'ACTIVE',
      },
      {
        institutionId: I.institution,
        studentId: I.stu3,
        academicYearId: I.ay2025,
        feeStructureId: I.feeStructMath,
        totalAmount: 120000,
        currency: 'INR',
        paymentMode: 'ANNUAL',
        status: 'ACTIVE',
      },
    ],
  });
  I.feePlan1 = feePlans[0].id;
  I.feePlan2 = feePlans[1].id;

  // 54. Student Fee Plan Components (NEW)
  await prisma.studentFeePlanComponent.createManyAndReturn({
    data: [
      { studentFeePlanId: I.feePlan1, feeComponentId: I.feeCompCS1, amount: 120000 },
      { studentFeePlanId: I.feePlan1, feeComponentId: I.feeCompCS2, amount: 15000 },
      { studentFeePlanId: I.feePlan2, feeComponentId: I.feeCompMath1, amount: 100000 },
    ],
  });

  // 55. Fee Installments
  const installments = await prisma.feeInstallment.createManyAndReturn({
    data: [
      {
        studentFeePlanId: I.feePlan1,
        installmentNumber: 1,
        amount: 75000,
        amountPaid: 75000,
        dueDate: d('2025-08-01'),
        status: 'PAID',
      },
      {
        studentFeePlanId: I.feePlan1,
        installmentNumber: 2,
        amount: 75000,
        amountPaid: 0,
        dueDate: d('2026-01-05'),
        status: 'PENDING',
      },
      {
        studentFeePlanId: I.feePlan2,
        installmentNumber: 1,
        amount: 120000,
        amountPaid: 120000,
        dueDate: d('2025-08-01'),
        status: 'PAID',
      },
    ],
  });
  I.inst1 = installments[0].id;
  I.inst2 = installments[1].id;
  I.inst3 = installments[2].id;

  // 56. Fee Waivers (NEW)
  await prisma.feeWaiver.createManyAndReturn({
    data: [
      {
        studentFeePlanId: I.feePlan1,
        name: 'Merit Scholarship',
        amount: 10000,
        waiverType: 'SCHOLARSHIP',
        status: 'APPROVED',
        reason: 'Top 5% in entrance exam',
        approvedBy: I.userAdmin,
      },
    ],
  });

  // 57. Payments (NEW)
  const payment = await prisma.payment.create({
    data: {
      institutionId: I.institution,
      studentId: I.stu1,
      amount: 75000,
      currency: 'INR',
      paymentDate: d('2025-08-01'),
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: 'TXN-2025-001',
      status: 'SUCCESS',
      receiptNumber: 'RCP-2025-001',
      collectedById: I.userAdmin,
    },
  });
  I.payment1 = payment.id;

  // 58. Payment Allocations (NEW)
  await prisma.paymentAllocation.create({
    data: { paymentId: I.payment1, installmentId: I.inst1, amount: 75000 },
  });

  // 59. Applications
  await prisma.application.createManyAndReturn({
    data: [
      {
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

  // 60. Lesson Plans
  const lessonPlans = await prisma.lessonPlan.createManyAndReturn({
    data: [
      {
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
  I.lp1 = lessonPlans[0].id;

  await prisma.lessonPlanSection.create({ data: { lessonPlanId: I.lp1, sectionId: I.sectionCS } });
  await prisma.lessonPlanResource.create({
    data: { lessonPlanId: I.lp1, resourceId: I.res1, sortOrder: 1 },
  });

  // 61. Admin Resources
  await prisma.adminResource.create({
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

  // 62. Audit Logs
  await prisma.auditLog.createManyAndReturn({
    data: [
      {
        institutionId: I.institution,
        actorUserId: I.userAdmin,
        action: 'CREATE',
        entityType: 'Institution',
        entityId: I.institution,
        afterData: { name: 'Ellipsonic Institute of Technology' },
      },
      {
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
  console.log(`   Fee Structures: 2, Components: 7, Fee Plans: 2`);
  console.log(`   Payments: 1, Installments: 3, Waivers: 1`);
  console.log(`   Internships: 2`);
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
