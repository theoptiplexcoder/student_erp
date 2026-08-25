import 'dotenv/config';
import {
  PrismaClient,
  ProgramLevel,
  TermType,
  UserRole,
  UserStatus,
  StudentLifecycleStatus,
  AcademicTermStatus,
  CourseStatus,
  EnrollmentStatus,
  CurriculumStatus,
  ResultStatus,
  ExamType,
  ExamStatus,
} from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const INSTITUTION_ID = 'd9b97b0a-0b2a-4a8f-b9f1-7c980d2215c2';
const TARGET_PROGRAM_ID = '564c40eb-d661-477a-a6c5-afaec3e79fb8';
const STUDENT_EMAIL = 'student@123.com';
const STUDENT_CODE = 'STU2026100';
const AUTH_USER_ID = '55555555-5555-5555-5555-555555555555';

const coursesData = [
  { code: 'CS101', name: 'Programming in C', creditValue: 4, sem: 1 },
  { code: 'MA101', name: 'Mathematics I', creditValue: 4, sem: 1 },
  { code: 'PH101', name: 'Engineering Physics', creditValue: 4, sem: 1 },
  { code: 'EC101', name: 'Basic Electronics', creditValue: 4, sem: 1 },
  { code: 'HS101', name: 'Communication Skills', creditValue: 4, sem: 1 },
  { code: 'CS102', name: 'Data Structures', creditValue: 4, sem: 2 },
  { code: 'MA102', name: 'Mathematics II', creditValue: 4, sem: 2 },
  { code: 'CS103', name: 'Object Oriented Programming', creditValue: 4, sem: 2 },
  { code: 'EC102', name: 'Digital Logic', creditValue: 4, sem: 2 },
  { code: 'HS102', name: 'Professional Communication', creditValue: 4, sem: 2 },
  { code: 'CS201', name: 'Database Management Systems', creditValue: 4, sem: 3 },
  { code: 'CS202', name: 'Operating Systems', creditValue: 4, sem: 3 },
  { code: 'CS203', name: 'Computer Networks', creditValue: 4, sem: 3 },
  { code: 'CS204', name: 'Computer Organization', creditValue: 4, sem: 3 },
  { code: 'MA201', name: 'Discrete Mathematics', creditValue: 4, sem: 3 },
  { code: 'CS205', name: 'Software Engineering', creditValue: 4, sem: 4 },
  { code: 'CS206', name: 'Theory of Computation', creditValue: 4, sem: 4 },
  { code: 'CS207', name: 'Design and Analysis of Algorithms', creditValue: 4, sem: 4 },
  { code: 'CS208', name: 'Web Technologies', creditValue: 4, sem: 4 },
  { code: 'CS209', name: 'Microprocessors', creditValue: 4, sem: 4 },
  { code: 'CS301', name: 'Artificial Intelligence', creditValue: 4, sem: 5 },
  { code: 'CS302', name: 'Machine Learning', creditValue: 4, sem: 5 },
  { code: 'CS303', name: 'Compiler Design', creditValue: 4, sem: 5 },
  { code: 'CS304', name: 'Distributed Systems', creditValue: 4, sem: 5 },
  { code: 'CS305', name: 'Cloud Computing', creditValue: 4, sem: 5 },
  { code: 'CS306', name: 'Data Mining', creditValue: 4, sem: 6 },
  { code: 'CS307', name: 'Cyber Security', creditValue: 4, sem: 6 },
  { code: 'CS308', name: 'Mobile Application Development', creditValue: 4, sem: 6 },
  { code: 'CS309', name: 'Big Data Analytics', creditValue: 4, sem: 6 },
  { code: 'CS310', name: 'Internet of Things', creditValue: 4, sem: 6 },
  { code: 'CS401', name: 'Deep Learning', creditValue: 4, sem: 7 },
  { code: 'CS402', name: 'Natural Language Processing', creditValue: 4, sem: 7 },
  { code: 'CS403', name: 'Advanced Database Systems', creditValue: 4, sem: 7 },
  { code: 'CS404', name: 'Software Project Management', creditValue: 4, sem: 7 },
  { code: 'CS405', name: 'Major Project', creditValue: 10, sem: 8 },
  { code: 'CS406', name: 'Internship', creditValue: 6, sem: 8 },
  { code: 'CS407', name: 'Seminar', creditValue: 2, sem: 8 },
];

function generateGrade(marks: number): { grade: string; gradePoint: number } {
  if (marks >= 90) return { grade: 'A+', gradePoint: 10 };
  if (marks >= 80) return { grade: 'A', gradePoint: 9 };
  if (marks >= 70) return { grade: 'B+', gradePoint: 8 };
  if (marks >= 60) return { grade: 'B', gradePoint: 7 };
  if (marks >= 50) return { grade: 'C+', gradePoint: 6 };
  if (marks >= 40) return { grade: 'C', gradePoint: 5 };
  return { grade: 'F', gradePoint: 0 };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function main() {
  console.log('Starting mock student seed...');

  // 1. Institution upsert
  await prisma.institution.upsert({
    where: { id: INSTITUTION_ID },
    create: {
      id: INSTITUTION_ID,
      institutionType: 'COLLEGE',
      legalName: 'Demo Institute of Technology',
      displayName: 'Demo Institute of Technology',
    },
    update: {},
  });
  console.log('Institution ensured');

  // 2. Department
  const dept = await prisma.department.upsert({
    where: { institutionId_code: { institutionId: INSTITUTION_ID, code: 'CSE' } },
    create: {
      institutionId: INSTITUTION_ID,
      name: 'Computer Science and Engineering',
      code: 'CSE',
    },
    update: {},
  });

  // 3. Program
  let program = await prisma.program.findUnique({ where: { id: TARGET_PROGRAM_ID } });
  if (!program) {
    program = await prisma.program.create({
      data: {
        id: TARGET_PROGRAM_ID,
        institutionId: INSTITUTION_ID,
        departmentId: dept.id,
        name: 'B.Tech Computer Science and Engineering',
        code: 'BTECH-CSE',
        level: ProgramLevel.UNDERGRADUATE,
        durationYears: 4,
      },
    });
  }
  console.log(`Program: ${program.code}`);

  // 4. Curriculum
  let curriculum = await prisma.curriculum.findFirst({
    where: { programId: program.id, status: 'ACTIVE' },
  });
  if (!curriculum) {
    curriculum = await prisma.curriculum.create({
      data: {
        institutionId: INSTITUTION_ID,
        programId: program.id,
        versionNumber: '2026-V1',
        name: '2026 CSE Curriculum',
        status: CurriculumStatus.ACTIVE,
        effectiveFrom: new Date('2026-07-01'),
      },
    });
  }
  console.log(`Curriculum: ${curriculum.name}`);

  // 5. Curriculum terms (batch upsert)
  const ctData = [
    { name: 'Semester 1', sequence: 1, creditRequirement: 20 },
    { name: 'Semester 2', sequence: 2, creditRequirement: 20 },
    { name: 'Semester 3', sequence: 3, creditRequirement: 22 },
    { name: 'Semester 4', sequence: 4, creditRequirement: 22 },
    { name: 'Semester 5', sequence: 5, creditRequirement: 20 },
    { name: 'Semester 6', sequence: 6, creditRequirement: 20 },
    { name: 'Semester 7', sequence: 7, creditRequirement: 18 },
    { name: 'Semester 8', sequence: 8, creditRequirement: 18 },
  ];

  // Batch: find all existing, then create missing
  const existingCTs = await prisma.curriculumTerm.findMany({
    where: { curriculumId: curriculum.id },
    select: { sequence: true },
  });
  const existingCTSeqs = new Set(existingCTs.map((ct) => ct.sequence));
  const newCTs = ctData.filter((ct) => !existingCTSeqs.has(ct.sequence));
  if (newCTs.length > 0) {
    await prisma.curriculumTerm.createMany({
      data: newCTs.map((ct) => ({
        institutionId: INSTITUTION_ID,
        curriculumId: curriculum.id,
        name: ct.name,
        sequence: ct.sequence,
        creditRequirement: ct.creditRequirement,
      })),
    });
  }
  const allCTs = await prisma.curriculumTerm.findMany({
    where: { curriculumId: curriculum.id },
    orderBy: { sequence: 'asc' },
  });
  const curriculumTermsMap = new Map(allCTs.map((ct) => [ct.sequence, ct]));
  console.log('Curriculum terms ensured');

  // 6. Courses (batch upsert)
  const existingCourses = await prisma.course.findMany({
    where: { institutionId: INSTITUTION_ID },
    select: { code: true },
  });
  const existingCourseCodes = new Set(existingCourses.map((c) => c.code));
  const newCourses = coursesData.filter((c) => !existingCourseCodes.has(c.code));
  if (newCourses.length > 0) {
    await prisma.course.createMany({
      data: newCourses.map((c) => ({
        institutionId: INSTITUTION_ID,
        code: c.code,
        name: c.name,
        creditValue: c.creditValue,
        maxMarks: 100,
        passingMarks: 40,
        status: CourseStatus.ACTIVE,
      })),
    });
  }
  const allCourses = await prisma.course.findMany({
    where: { institutionId: INSTITUTION_ID },
  });
  const coursesMap = new Map(allCourses.map((c) => [c.code, c]));
  console.log('Courses ensured');

  // 7. Curriculum course links (batch upsert)
  const existingCCs = await prisma.curriculumCourse.findMany({
    where: { curriculumTermId: { in: allCTs.map((ct) => ct.id) } },
    select: { curriculumTermId: true, courseId: true },
  });
  const existingCCKeys = new Set(existingCCs.map((cc) => `${cc.curriculumTermId}-${cc.courseId}`));
  const newCCs: any[] = [];
  for (let i = 0; i < coursesData.length; i++) {
    const cd = coursesData[i];
    const ct = curriculumTermsMap.get(cd.sem)!;
    const course = coursesMap.get(cd.code)!;
    if (!existingCCKeys.has(`${ct.id}-${course.id}`)) {
      newCCs.push({
        institutionId: INSTITUTION_ID,
        curriculumTermId: ct.id,
        courseId: course.id,
        sequence: i + 1,
        creditValue: cd.creditValue,
        isMandatory: true,
      });
    }
  }
  if (newCCs.length > 0) {
    await prisma.curriculumCourse.createMany({ data: newCCs });
  }
  console.log('Curriculum courses ensured');

  // 8. Academic years (batch)
  const ayData = [
    {
      name: '2026-27',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2027-06-30'),
      isActive: true,
    },
    {
      name: '2027-28',
      startDate: new Date('2027-07-01'),
      endDate: new Date('2028-06-30'),
      isActive: false,
    },
    {
      name: '2028-29',
      startDate: new Date('2028-07-01'),
      endDate: new Date('2029-06-30'),
      isActive: false,
    },
    {
      name: '2029-30',
      startDate: new Date('2029-07-01'),
      endDate: new Date('2030-06-30'),
      isActive: false,
    },
  ];
  const existingAYs = await prisma.academicYear.findMany({
    where: { institutionId: INSTITUTION_ID },
    select: { name: true },
  });
  const existingAYNames = new Set(existingAYs.map((ay) => ay.name));
  const newAYs = ayData.filter((ay) => !existingAYNames.has(ay.name));
  if (newAYs.length > 0) {
    await prisma.academicYear.createMany({
      data: newAYs.map((ay) => ({
        institutionId: INSTITUTION_ID,
        ...ay,
      })),
    });
  }
  const allAYs = await prisma.academicYear.findMany({
    where: { institutionId: INSTITUTION_ID },
  });
  const ayMap = new Map(allAYs.map((ay) => [ay.name, ay]));
  console.log('Academic years ensured');

  // 9. Academic terms (batch)
  const atData = [
    {
      name: 'Semester 1',
      code: 'SEM1-AY2026-27',
      semester: 1,
      ayName: '2026-27',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-12-15'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 2',
      code: 'SEM2-AY2026-27',
      semester: 2,
      ayName: '2026-27',
      startDate: new Date('2027-01-15'),
      endDate: new Date('2027-05-30'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 3',
      code: 'SEM3-AY2027-28',
      semester: 3,
      ayName: '2027-28',
      startDate: new Date('2027-07-15'),
      endDate: new Date('2027-12-15'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 4',
      code: 'SEM4-AY2027-28',
      semester: 4,
      ayName: '2027-28',
      startDate: new Date('2028-01-15'),
      endDate: new Date('2028-05-30'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 5',
      code: 'SEM5-AY2028-29',
      semester: 5,
      ayName: '2028-29',
      startDate: new Date('2028-07-15'),
      endDate: new Date('2028-12-15'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 6',
      code: 'SEM6-AY2028-29',
      semester: 6,
      ayName: '2028-29',
      startDate: new Date('2029-01-15'),
      endDate: new Date('2029-05-30'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 7',
      code: 'SEM7-AY2029-30',
      semester: 7,
      ayName: '2029-30',
      startDate: new Date('2029-07-15'),
      endDate: new Date('2029-12-15'),
      status: AcademicTermStatus.ACTIVE,
    },
    {
      name: 'Semester 8',
      code: 'SEM8-AY2029-30',
      semester: 8,
      ayName: '2029-30',
      startDate: new Date('2030-01-15'),
      endDate: new Date('2030-05-30'),
      status: AcademicTermStatus.ACTIVE,
    },
  ];
  const existingATs = await prisma.academicTerm.findMany({
    where: { institutionId: INSTITUTION_ID },
    select: { code: true },
  });
  const existingATCodes = new Set(existingATs.map((at) => at.code));
  const newATs = atData.filter((at) => !existingATCodes.has(at.code));
  if (newATs.length > 0) {
    await prisma.academicTerm.createMany({
      data: newATs.map((at) => ({
        institutionId: INSTITUTION_ID,
        academicYearId: ayMap.get(at.ayName)!.id,
        name: at.name,
        code: at.code,
        semester: at.semester,
        termType: TermType.SEMESTER,
        startDate: at.startDate,
        endDate: at.endDate,
        status: at.status,
      })),
    });
  }
  const allATs = await prisma.academicTerm.findMany({
    where: { institutionId: INSTITUTION_ID },
    orderBy: { semester: 'asc' },
  });
  const atMap = new Map(allATs.map((at) => [at.code, at]));
  console.log('Academic terms ensured');

  // 10. Batch
  let batch = await prisma.batch.findFirst({
    where: { institutionId: INSTITUTION_ID, programId: program.id, admissionYear: 2026 },
  });
  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        institutionId: INSTITUTION_ID,
        programId: program.id,
        name: '2026 Intake',
        admissionYear: 2026,
        startDate: new Date('2026-07-01'),
        expectedEndDate: new Date('2030-06-30'),
      },
    });
  }
  console.log('Batch ensured');

  // 11. Sections (batch)
  const existingSections = await prisma.section.findMany({
    where: { institutionId: INSTITUTION_ID, batchId: batch.id },
    select: { code: true },
  });
  const existingSectionCodes = new Set(existingSections.map((s) => s.code));
  const sectionCodesToCreate = Array.from({ length: 8 }, (_, i) => `CSE-A-SEM${i + 1}`);
  const newSections = sectionCodesToCreate.filter((code) => !existingSectionCodes.has(code));
  if (newSections.length > 0) {
    await prisma.section.createMany({
      data: newSections.map((code) => {
        const sem = parseInt(code.slice(-1));
        const at = atData.find((a) => a.semester === sem)!;
        return {
          institutionId: INSTITUTION_ID,
          programId: program.id,
          batchId: batch.id,
          academicYearId: ayMap.get(at.ayName)!.id,
          name: `CSE-A Semester ${sem}`,
          code,
          semester: sem,
          capacity: 60,
        };
      }),
    });
  }
  const allSections = await prisma.section.findMany({
    where: { institutionId: INSTITUTION_ID, batchId: batch.id },
    orderBy: { semester: 'asc' },
  });
  const sectionMap = new Map(allSections.map((s) => [s.semester!, s]));
  console.log('Sections ensured');

  // 12. User + Student
  let user = await prisma.user.findUnique({ where: { authUserId: AUTH_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        authUserId: AUTH_USER_ID,
        institutionId: INSTITUTION_ID,
        email: STUDENT_EMAIL,
        firstName: 'Test',
        lastName: 'Student',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email: STUDENT_EMAIL, role: UserRole.STUDENT, status: UserStatus.ACTIVE },
    });
  }
  console.log(`User: ${user.email}`);

  let student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) {
    student = await prisma.student.upsert({
      where: {
        institutionId_studentCode: { institutionId: INSTITUTION_ID, studentCode: STUDENT_CODE },
      },
      create: {
        institutionId: INSTITUTION_ID,
        userId: user.id,
        studentCode: STUDENT_CODE,
        admissionNumber: STUDENT_CODE,
        lifecycleStatus: StudentLifecycleStatus.ACTIVE,
        admissionDate: new Date('2026-08-01'),
        dateOfBirth: new Date('2004-05-15'),
        gender: 'MALE',
        programId: program.id,
        sectionId: sectionMap.get(1)!.id,
        curriculumId: curriculum.id,
      },
      update: {
        lifecycleStatus: StudentLifecycleStatus.ACTIVE,
        programId: program.id,
        sectionId: sectionMap.get(1)!.id,
        curriculumId: curriculum.id,
      },
    });
  } else {
    student = await prisma.student.update({
      where: { id: student.id },
      data: {
        lifecycleStatus: StudentLifecycleStatus.ACTIVE,
        programId: program.id,
        sectionId: sectionMap.get(1)!.id,
        curriculumId: curriculum.id,
      },
    });
  }
  console.log(`Student: ${student.studentCode}`);

  // 13. Enrollments (batch)
  // Find all existing enrollments for this student
  const existingEnrollments = await prisma.enrollment.findMany({
    where: { institutionId: INSTITUTION_ID, studentId: student.id },
    select: { termId: true, courseId: true },
  });
  const existingEnrollKeys = new Set(existingEnrollments.map((e) => `${e.termId}-${e.courseId}`));

  const enrollmentData: any[] = [];
  for (let sem = 1; sem <= 7; sem++) {
    const atEntry = atData.find((a) => a.semester === sem)!;
    const term = atMap.get(atEntry.code)!;
    const year = ayMap.get(atEntry.ayName)!;
    const semCourses = coursesData.filter((c) => c.sem === sem);

    for (const cd of semCourses) {
      const course = coursesMap.get(cd.code)!;
      if (!existingEnrollKeys.has(`${term.id}-${course.id}`)) {
        const enrolledAt = new Date(year.startDate);
        enrolledAt.setDate(enrolledAt.getDate() + 14);
        enrollmentData.push({
          institutionId: INSTITUTION_ID,
          studentId: student.id,
          academicYearId: year.id,
          courseId: course.id,
          programId: program.id,
          curriculumId: curriculum.id,
          sectionId: sectionMap.get(sem)!.id,
          termId: term.id,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt,
          completedAt: new Date(term.endDate),
        });
      }
    }
  }

  if (enrollmentData.length > 0) {
    const createdEnrollments = await prisma.$transaction(
      enrollmentData.map((e) => prisma.enrollment.create({ data: e })),
    );
    console.log(`Created ${createdEnrollments.length} enrollments`);
  } else {
    console.log('All enrollments exist');
  }

  // Fix any existing enrollments stuck in non-ACTIVE status
  const updated = await prisma.enrollment.updateMany({
    where: {
      institutionId: INSTITUTION_ID,
      studentId: student.id,
      status: { not: EnrollmentStatus.ACTIVE },
    },
    data: { status: EnrollmentStatus.ACTIVE },
  });
  if (updated.count > 0) {
    console.log(`Fixed ${updated.count} enrollments to ACTIVE`);
  }

  // Build enrollment lookup: termId-courseId -> enrollment
  const allEnrollments = await prisma.enrollment.findMany({
    where: { institutionId: INSTITUTION_ID, studentId: student.id },
  });
  const enrollmentMap = new Map(allEnrollments.map((e) => [`${e.termId}-${e.courseId}`, e]));
  console.log(`Total enrollments: ${allEnrollments.length}`);

  // 14. Exams, ExamCourses, Marks (batch where possible)
  let examCount = 0;
  let examCourseCount = 0;
  let markCount = 0;

  for (let sem = 1; sem <= 7; sem++) {
    const atEntry = atData.find((a) => a.semester === sem)!;
    const term = atMap.get(atEntry.code)!;
    const year = ayMap.get(atEntry.ayName)!;
    const semCourses = coursesData.filter((c) => c.sem === sem);

    // Find or create exam
    const examCode = `FINAL-SEM${sem}-AY${atEntry.ayName}`;
    let exam = await prisma.exam.findFirst({
      where: { institutionId: INSTITUTION_ID, termId: term.id, code: examCode },
    });
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          institutionId: INSTITUTION_ID,
          academicYearId: year.id,
          termId: term.id,
          name: `Final Exam - Semester ${sem}`,
          code: examCode,
          examType: ExamType.FINAL,
          status: ExamStatus.COMPLETED,
          startDate: new Date(term.endDate),
          endDate: new Date(term.endDate),
        },
      });
      examCount++;
    }

    // Batch: find existing exam courses, create missing
    const existingECs = await prisma.examCourse.findMany({
      where: { examId: exam.id },
      select: { courseId: true },
    });
    const existingECKeys = new Set(existingECs.map((ec) => ec.courseId));
    const newECs = semCourses
      .filter((cd) => !existingECKeys.has(coursesMap.get(cd.code)!.id))
      .map((cd) => ({
        institutionId: INSTITUTION_ID,
        examId: exam.id,
        courseId: coursesMap.get(cd.code)!.id,
        examDate: new Date(term.endDate),
        startTime: new Date('2026-01-01T09:00:00Z'),
        endTime: new Date('2026-01-01T12:00:00Z'),
        maxMarks: 100,
        passingMarks: 40,
      }));
    if (newECs.length > 0) {
      await prisma.examCourse.createMany({ data: newECs });
      examCourseCount += newECs.length;
    }

    // Get all exam courses for this exam
    const allECs = await prisma.examCourse.findMany({ where: { examId: exam.id } });
    const ecMap = new Map(allECs.map((ec) => [ec.courseId, ec]));

    // Batch: find existing marks, create missing
    const existingMarks = await prisma.mark.findMany({
      where: { studentId: student.id, examCourseId: { in: allECs.map((ec) => ec.id) } },
      select: { examCourseId: true },
    });
    const existingMarkECIds = new Set(existingMarks.map((m) => m.examCourseId));
    const newMarks: any[] = [];
    for (const cd of semCourses) {
      const course = coursesMap.get(cd.code)!;
      const ec = ecMap.get(course.id)!;
      if (existingMarkECIds.has(ec.id)) continue;

      const enrollment = enrollmentMap.get(`${term.id}-${course.id}`);
      if (!enrollment) continue;

      const seed =
        parseInt(student.id.replace(/-/g, '').slice(0, 8), 16) +
        cd.code.charCodeAt(1) * 100 +
        sem * 10;
      const baseMarks = 55 + Math.floor(seededRandom(seed) * 40);
      const { grade, gradePoint } = generateGrade(baseMarks);

      newMarks.push({
        institutionId: INSTITUTION_ID,
        examCourseId: ec.id,
        studentId: student.id,
        enrollmentId: enrollment.id,
        marksObtained: baseMarks,
        percentage: baseMarks,
        grade,
        gradePoint,
        resultStatus: grade === 'F' ? ResultStatus.FAIL : ResultStatus.PASS,
      });
    }
    if (newMarks.length > 0) {
      await prisma.mark.createMany({ data: newMarks });
      markCount += newMarks.length;
    }
  }

  console.log(`Created ${examCount} exams, ${examCourseCount} exam courses, ${markCount} marks`);

  // 15. Summary
  const totalEnrollments = await prisma.enrollment.count({
    where: { institutionId: INSTITUTION_ID, studentId: student.id },
  });
  const totalMarks = await prisma.mark.count({
    where: { institutionId: INSTITUTION_ID, studentId: student.id },
  });

  // 16. Supabase auth account for login
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const LOGIN_PASSWORD = 'changeme123';

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let authUser = users.find((u) => u.email?.toLowerCase() === STUDENT_EMAIL.toLowerCase());

    if (!authUser) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: STUDENT_EMAIL,
        password: LOGIN_PASSWORD,
        email_confirm: true,
        user_metadata: { first_name: 'Test', last_name: 'Student', role: UserRole.STUDENT },
      });
      if (error) throw error;
      authUser = data.user;
    } else {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: LOGIN_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
    }

    // Retarget the seeded DB user row to the real Supabase auth ID
    const userByRealAuthId = await prisma.user.findUnique({
      where: { authUserId: authUser.id },
    });
    const userBySyntheticAuthId = await prisma.user.findUnique({
      where: { authUserId: AUTH_USER_ID },
    });

    if (userBySyntheticAuthId) {
      if (userByRealAuthId && userByRealAuthId.id !== userBySyntheticAuthId.id) {
        await prisma.user.delete({ where: { id: userBySyntheticAuthId.id } });
      } else {
        await prisma.user.update({
          where: { id: userBySyntheticAuthId.id },
          data: { authUserId: authUser.id },
        });
      }
    } else if (!userByRealAuthId) {
      await prisma.user.create({
        data: {
          authUserId: authUser.id,
          institutionId: INSTITUTION_ID,
          email: STUDENT_EMAIL,
          firstName: 'Test',
          lastName: 'Student',
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
        },
      });
    }

    console.log(`Supabase auth account ensured for ${STUDENT_EMAIL}`);
  } else {
    console.warn(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Skipping Supabase auth account creation.',
    );
  }

  console.log('\n=== Mock Student Summary ===');
  console.log(`Email: ${STUDENT_EMAIL}`);
  console.log(`Password: ${LOGIN_PASSWORD}`);
  console.log(`Student Code: ${STUDENT_CODE}`);
  console.log(`Program: ${program.name} (${program.code})`);
  console.log(`Curriculum: ${curriculum.name}`);
  console.log(`Semesters: 7 (all completed)`);
  console.log(`Total Enrollments: ${totalEnrollments}`);
  console.log(`Total Marks: ${totalMarks}`);
  console.log('============================');
}

main()
  .catch((e) => {
    console.error('Mock student seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
