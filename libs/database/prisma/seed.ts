import { PrismaClient, InstitutionType, ProgramLevel, TermType, UserRole, UserStatus, FacultyEmploymentType, FacultyStatus, StudentLifecycleStatus, AcademicTermStatus, CourseStatus, EnrollmentStatus, CurriculumStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Institution
  const institution = await prisma.institution.upsert({
    where: { id: 'd9b97b0a-0b2a-4a8f-b9f1-7c980d2215c2' }, // Use a fixed UUID to ensure idempotency since it lacks unique string fields.
    create: {
      id: 'd9b97b0a-0b2a-4a8f-b9f1-7c980d2215c2',
      institutionType: InstitutionType.COLLEGE,
      legalName: 'Demo Institute of Technology',
      displayName: 'Demo Institute of Technology',
    },
    update: {},
  });
  console.log(`Upserted Institution: ${institution.displayName}`);

  // 2. Departments
  const departmentsData = [
    { name: 'Computer Science and Engineering', code: 'CSE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Electronics and Communication Engineering', code: 'ECE' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Management Studies', code: 'MBA' },
  ];

  const departments: Record<string, any> = {};
  for (const dept of departmentsData) {
    departments[dept.code] = await prisma.department.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: dept.code },
      },
      create: {
        institutionId: institution.id,
        name: dept.name,
        code: dept.code,
      },
      update: {},
    });
  }
  console.log('Upserted Departments');

  // 3. Programs
  const programsData = [
    { name: 'B.Tech Computer Science and Engineering', code: 'BTECH-CSE', level: ProgramLevel.UNDERGRADUATE, durationYears: 4, departmentCode: 'CSE' },
    { name: 'B.Tech Information Technology', code: 'BTECH-IT', level: ProgramLevel.UNDERGRADUATE, durationYears: 4, departmentCode: 'IT' },
    { name: 'B.Tech Electronics and Communication Engineering', code: 'BTECH-ECE', level: ProgramLevel.UNDERGRADUATE, durationYears: 4, departmentCode: 'ECE' },
    { name: 'Bachelor of Computer Applications', code: 'BCA', level: ProgramLevel.UNDERGRADUATE, durationYears: 3, departmentCode: 'CSE' },
    { name: 'Master of Business Administration', code: 'MBA-PROG', level: ProgramLevel.POSTGRADUATE, durationYears: 2, departmentCode: 'MBA' },
  ];

  const programs: Record<string, any> = {};
  for (const prog of programsData) {
    programs[prog.code] = await prisma.program.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: prog.code },
      },
      create: {
        institutionId: institution.id,
        departmentId: departments[prog.departmentCode].id,
        name: prog.name,
        code: prog.code,
        level: prog.level,
        durationYears: prog.durationYears,
      },
      update: {},
    });
  }
  console.log('Upserted Programs');

  // 4. Academic Years
  const academicYearsData = [
    { name: '2025-26', startDate: new Date('2025-07-01'), endDate: new Date('2026-06-30'), isActive: false },
    { name: '2026-27', startDate: new Date('2026-07-01'), endDate: new Date('2027-06-30'), isActive: true },
    { name: '2027-28', startDate: new Date('2027-07-01'), endDate: new Date('2028-06-30'), isActive: false },
  ];

  const academicYears: Record<string, any> = {};
  for (const ay of academicYearsData) {
    let year = await prisma.academicYear.findFirst({
      where: { institutionId: institution.id, name: ay.name },
    });
    if (!year) {
      year = await prisma.academicYear.create({
        data: {
          institutionId: institution.id,
          name: ay.name,
          startDate: ay.startDate,
          endDate: ay.endDate,
          isActive: ay.isActive,
        },
      });
    } else {
      year = await prisma.academicYear.update({
        where: { id: year.id },
        data: { isActive: ay.isActive },
      });
    }
    academicYears[ay.name] = year;
  }
  console.log('Upserted Academic Years');

  const activeAcademicYear = academicYears['2026-27'];

  // 5. Academic Terms
  const academicTermsData = [
    { name: 'Semester 1', code: 'SEM1-2026', semester: 1, termType: TermType.SEMESTER, startDate: new Date('2026-07-15'), endDate: new Date('2026-12-15'), status: AcademicTermStatus.COMPLETED },
    { name: 'Semester 2', code: 'SEM2-2026', semester: 2, termType: TermType.SEMESTER, startDate: new Date('2027-01-15'), endDate: new Date('2027-05-30'), status: AcademicTermStatus.COMPLETED },
    { name: 'Semester 3', code: 'SEM3-2026', semester: 3, termType: TermType.SEMESTER, startDate: new Date('2026-07-15'), endDate: new Date('2026-12-15'), status: AcademicTermStatus.ACTIVE },
    { name: 'Semester 4', code: 'SEM4-2026', semester: 4, termType: TermType.SEMESTER, startDate: new Date('2027-01-15'), endDate: new Date('2027-05-30'), status: AcademicTermStatus.UPCOMING },
    { name: 'Semester 5', code: 'SEM5-2026', semester: 5, termType: TermType.SEMESTER, startDate: new Date('2026-07-15'), endDate: new Date('2026-12-15'), status: AcademicTermStatus.ACTIVE },
    { name: 'Semester 6', code: 'SEM6-2026', semester: 6, termType: TermType.SEMESTER, startDate: new Date('2027-01-15'), endDate: new Date('2027-05-30'), status: AcademicTermStatus.UPCOMING },
    { name: 'Semester 7', code: 'SEM7-2026', semester: 7, termType: TermType.SEMESTER, startDate: new Date('2026-07-15'), endDate: new Date('2026-12-15'), status: AcademicTermStatus.ACTIVE },
    { name: 'Semester 8', code: 'SEM8-2026', semester: 8, termType: TermType.SEMESTER, startDate: new Date('2027-01-15'), endDate: new Date('2027-05-30'), status: AcademicTermStatus.UPCOMING },
  ];

  const academicTerms: Record<string, any> = {};
  for (const term of academicTermsData) {
    let t = await prisma.academicTerm.findFirst({
      where: { institutionId: institution.id, academicYearId: activeAcademicYear.id, code: term.code },
    });
    if (!t) {
      t = await prisma.academicTerm.create({
        data: {
          institutionId: institution.id,
          academicYearId: activeAcademicYear.id,
          name: term.name,
          code: term.code,
          semester: term.semester,
          termType: term.termType,
          startDate: term.startDate,
          endDate: term.endDate,
          status: term.status,
        },
      });
    }
    academicTerms[term.code] = t;
  }
  console.log('Upserted Academic Terms');

  // 6. Curriculum
  const curriculum = await prisma.curriculum.upsert({
    where: {
      programId_versionNumber: { programId: programs['BTECH-CSE'].id, versionNumber: '2026-V1' },
    },
    create: {
      institutionId: institution.id,
      programId: programs['BTECH-CSE'].id,
      versionNumber: '2026-V1',
      name: '2026 CSE Curriculum',
      status: CurriculumStatus.ACTIVE,
      effectiveFrom: new Date('2026-07-01'),
    },
    update: {},
  });
  console.log('Upserted Curriculum');

  // 7. Curriculum Terms
  const curriculumTermsData = [
    { name: 'Semester 1', sequence: 1, creditRequirement: 20 },
    { name: 'Semester 2', sequence: 2, creditRequirement: 20 },
    { name: 'Semester 3', sequence: 3, creditRequirement: 22 },
    { name: 'Semester 4', sequence: 4, creditRequirement: 22 },
    { name: 'Semester 5', sequence: 5, creditRequirement: 20 },
    { name: 'Semester 6', sequence: 6, creditRequirement: 20 },
    { name: 'Semester 7', sequence: 7, creditRequirement: 18 },
    { name: 'Semester 8', sequence: 8, creditRequirement: 18 },
  ];

  const curriculumTerms: Record<number, any> = {};
  for (const ct of curriculumTermsData) {
    curriculumTerms[ct.sequence] = await prisma.curriculumTerm.upsert({
      where: {
        curriculumId_sequence: { curriculumId: curriculum.id, sequence: ct.sequence },
      },
      create: {
        institutionId: institution.id,
        curriculumId: curriculum.id,
        name: ct.name,
        sequence: ct.sequence,
        creditRequirement: ct.creditRequirement,
      },
      update: {},
    });
  }
  console.log('Upserted Curriculum Terms');

  // 8. Courses
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

  const courses: Record<string, any> = {};
  for (const c of coursesData) {
    courses[c.code] = await prisma.course.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: c.code },
      },
      create: {
        institutionId: institution.id,
        departmentId: departments['CSE'].id, 
        programId: programs['BTECH-CSE'].id,
        code: c.code,
        name: c.name,
        creditValue: c.creditValue,
        maxMarks: 100,
        passingMarks: 40,
        status: CourseStatus.ACTIVE,
      },
      update: {},
    });
  }
  console.log('Upserted Courses');

  // 9. Curriculum Courses
  for (let i = 0; i < coursesData.length; i++) {
    const cData = coursesData[i];
    const term = curriculumTerms[cData.sem];
    const course = courses[cData.code];
    
    await prisma.curriculumCourse.upsert({
      where: {
        curriculumTermId_courseId: { curriculumTermId: term.id, courseId: course.id },
      },
      create: {
        institutionId: institution.id,
        curriculumTermId: term.id,
        courseId: course.id,
        sequence: i + 1,
        creditValue: cData.creditValue,
        isMandatory: true,
      },
      update: {},
    });
  }
  console.log('Upserted Curriculum Courses');

  // 10. Course Prerequisites
  const prerequisites = [
    { courseCode: 'CS102', prereqCode: 'CS101' },
    { courseCode: 'CS201', prereqCode: 'CS102' },
    { courseCode: 'CS202', prereqCode: 'CS102' },
    { courseCode: 'CS203', prereqCode: 'CS204' },
    { courseCode: 'CS302', prereqCode: 'CS102' },
    { courseCode: 'CS301', prereqCode: 'CS102' },
    { courseCode: 'CS303', prereqCode: 'CS102' },
    { courseCode: 'CS401', prereqCode: 'CS302' },
  ];

  for (const p of prerequisites) {
    await prisma.coursePrerequisite.upsert({
      where: {
        courseId_prerequisiteCourseId: { 
          courseId: courses[p.courseCode].id, 
          prerequisiteCourseId: courses[p.prereqCode].id 
        },
      },
      create: {
        institutionId: institution.id,
        courseId: courses[p.courseCode].id,
        prerequisiteCourseId: courses[p.prereqCode].id,
      },
      update: {},
    });
  }
  console.log('Upserted Prerequisites');

  // 11. Batches
  const batchesData = [
    { name: '2024 Intake', admissionYear: 2024 },
    { name: '2025 Intake', admissionYear: 2025 },
    { name: '2026 Intake', admissionYear: 2026 },
  ];

  const batches: Record<number, any> = {};
  for (const b of batchesData) {
    let batch = await prisma.batch.findFirst({
      where: { institutionId: institution.id, programId: programs['BTECH-CSE'].id, admissionYear: b.admissionYear },
    });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          institutionId: institution.id,
          programId: programs['BTECH-CSE'].id,
          name: b.name,
          admissionYear: b.admissionYear,
          startDate: new Date(`${b.admissionYear}-07-01`),
          expectedEndDate: new Date(`${b.admissionYear + 4}-06-30`),
        },
      });
    }
    batches[b.admissionYear] = batch;
  }
  console.log('Upserted Batches');

  // 12. Sections
  const sectionsData = [
    { name: 'CSE-A', code: 'CSE-A', capacity: 60, batchYear: 2026 },
    { name: 'CSE-B', code: 'CSE-B', capacity: 60, batchYear: 2026 },
  ];

  const sections: Record<string, any> = {};
  for (const s of sectionsData) {
    let section = await prisma.section.findFirst({
      where: { institutionId: institution.id, code: s.code },
    });
    if (!section) {
      section = await prisma.section.create({
        data: {
          institutionId: institution.id,
          programId: programs['BTECH-CSE'].id,
          batchId: batches[s.batchYear].id,
          academicYearId: activeAcademicYear.id,
          name: s.name,
          code: s.code,
          capacity: s.capacity,
          semester: 3, 
        },
      });
    }
    sections[s.code] = section;
  }
  console.log('Upserted Sections');

  // 13. Admin Account
  const adminAuthUserId = '11111111-1111-1111-1111-111111111111';
  await prisma.user.upsert({
    where: { authUserId: adminAuthUserId },
    create: {
      authUserId: adminAuthUserId,
      institutionId: institution.id,
      email: 'admin@demo-institute.test',
      firstName: 'Demo Institution',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    update: {},
  });
  console.log('Upserted Admin Account');

  // 14. Faculty
  const facultyNames = [
    'Dr. Rajesh Kumar', 'Prof. Ananya Sharma', 'Dr. Vivek Rao', 'Dr. Priya Nair', 
    'Prof. Arjun Mehta', 'Dr. Sneha Kapoor', 'Prof. Rohit Verma', 'Dr. Neha Singh', 
    'Prof. Amit Joshi', 'Dr. Kavita Menon'
  ];

  const faculties: Record<string, any> = {};
  let fCounter = 1;
  for (const fName of facultyNames) {
    const parts = fName.split(' ');
    const firstName = parts[1];
    const lastName = parts[2] || '';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo-institute.test`;
    const authUserId = `22222222-2222-2222-2222-2222222220${String(fCounter).padStart(2, '0')}`;
    const teacherCode = `FAC${String(fCounter).padStart(3, '0')}`;
    
    let user = await prisma.user.findUnique({ where: { authUserId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          authUserId,
          institutionId: institution.id,
          email,
          firstName,
          lastName,
          role: UserRole.FACULTY,
          status: UserStatus.ACTIVE,
        }
      });
    }

    faculties[fName] = await prisma.faculty.upsert({
      where: { institutionId_teacherCode: { institutionId: institution.id, teacherCode } },
      create: {
        institutionId: institution.id,
        userId: user.id,
        departmentId: departments['CSE'].id,
        teacherCode,
        employmentType: FacultyEmploymentType.FULL_TIME,
        hireDate: new Date('2020-01-15'),
        status: FacultyStatus.ACTIVE,
      },
      update: {},
    });
    fCounter++;
  }
  console.log('Upserted Faculty');

  // 15. Faculty Course Assignments for Semester 3
  const assignmentsData = [
    { courseCode: 'CS201', facultyName: 'Dr. Rajesh Kumar', sectionCode: 'CSE-A' },
    { courseCode: 'CS202', facultyName: 'Prof. Ananya Sharma', sectionCode: 'CSE-A' },
    { courseCode: 'CS203', facultyName: 'Dr. Vivek Rao', sectionCode: 'CSE-A' },
    { courseCode: 'CS204', facultyName: 'Dr. Priya Nair', sectionCode: 'CSE-A' },
    { courseCode: 'MA201', facultyName: 'Prof. Arjun Mehta', sectionCode: 'CSE-A' },
    
    { courseCode: 'CS201', facultyName: 'Dr. Sneha Kapoor', sectionCode: 'CSE-B' },
    { courseCode: 'CS202', facultyName: 'Prof. Rohit Verma', sectionCode: 'CSE-B' },
    { courseCode: 'CS203', facultyName: 'Dr. Neha Singh', sectionCode: 'CSE-B' },
    { courseCode: 'CS204', facultyName: 'Prof. Amit Joshi', sectionCode: 'CSE-B' },
    { courseCode: 'MA201', facultyName: 'Dr. Kavita Menon', sectionCode: 'CSE-B' },
  ];

  for (const a of assignmentsData) {
    const fId = faculties[a.facultyName].id;
    const cId = courses[a.courseCode].id;
    const sId = sections[a.sectionCode].id;
    const tId = academicTerms['SEM3-2026'].id;

    await prisma.courseAssignment.upsert({
      where: {
        facultyId_courseId_sectionId_termId: {
          facultyId: fId,
          courseId: cId,
          sectionId: sId,
          termId: tId,
        }
      },
      create: {
        institutionId: institution.id,
        facultyId: fId,
        courseId: cId,
        sectionId: sId,
        termId: tId,
      },
      update: {},
    });
  }
  console.log('Upserted Faculty Course Assignments');

  // 16. Students
  const students = [];
  for (let i = 1; i <= 30; i++) {
    const studentCode = `STU2026${String(i).padStart(3, '0')}`;
    const email = `student${i}@demo-institute.test`;
    const authUserId = `33333333-3333-3333-3333-3333333330${String(i).padStart(2, '0')}`;
    const sectionCode = i <= 15 ? 'CSE-A' : 'CSE-B';

    let user = await prisma.user.findUnique({ where: { authUserId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          authUserId,
          institutionId: institution.id,
          email,
          firstName: `Student`,
          lastName: `${i}`,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
        }
      });
    }

    const student = await prisma.student.upsert({
      where: { institutionId_studentCode: { institutionId: institution.id, studentCode } },
      create: {
        institutionId: institution.id,
        userId: user.id,
        studentCode,
        admissionNumber: studentCode,
        lifecycleStatus: StudentLifecycleStatus.ACTIVE,
        admissionDate: new Date('2026-08-01'),
        programId: programs['BTECH-CSE'].id,
        sectionId: sections[sectionCode].id,
        curriculumId: curriculum.id,
      },
      update: {},
    });
    students.push(student);
  }
  console.log('Upserted Students');

  // 17. Student Course Enrollments
  const sem3Courses = ['CS201', 'CS202', 'CS203', 'CS204', 'MA201'];
  for (const s of students) {
    for (const cCode of sem3Courses) {
      let enrollment = await prisma.enrollment.findFirst({
        where: {
          institutionId: institution.id,
          studentId: s.id,
          termId: academicTerms['SEM3-2026'].id,
          courseId: courses[cCode].id,
        }
      });
      if (!enrollment) {
        await prisma.enrollment.create({
          data: {
            institutionId: institution.id,
            studentId: s.id,
            academicYearId: activeAcademicYear.id,
            courseId: courses[cCode].id,
            programId: programs['BTECH-CSE'].id,
            curriculumId: curriculum.id,
            sectionId: s.sectionId,
            termId: academicTerms['SEM3-2026'].id,
            status: EnrollmentStatus.ACTIVE,
          }
        });
      }
    }
  }
  console.log('Upserted Student Enrollments');

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
