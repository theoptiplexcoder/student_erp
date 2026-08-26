import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { FacultyAttendanceService } from './modules/faculty/services/faculty-attendance.service';
import { FacultyExaminationsService } from './modules/faculty/services/faculty-examinations.service';
import { createClient } from '@supabase/supabase-js';
import {
  UserRole,
  UserStatus,
  StudentLifecycleStatus,
  EnrollmentStatus,
  ExamType,
  ResultStatus,
} from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const attendanceService = app.get(FacultyAttendanceService);
  const examsService = app.get(FacultyExaminationsService);

  console.log('--- Phase 1 & 2: Read Existing Data ---');
  const institution = await prisma.institution.findFirst({
    where: { displayName: 'Demo Institute of Technology' },
  });
  if (!institution) throw new Error('Demo Institute not found');

  const program = await prisma.program.findFirst({
    where: { code: 'BTECH-CSE', institutionId: institution.id },
  });
  if (!program) throw new Error('Program not found');

  const curriculum = await prisma.curriculum.findFirst({
    where: { programId: program.id, status: 'ACTIVE' },
  });
  if (!curriculum) throw new Error('Curriculum not found');

  const activeAcademicYear = await prisma.academicYear.findFirst({
    where: { institutionId: institution.id, isActive: true },
  });
  if (!activeAcademicYear) throw new Error('Active Academic Year not found');

  const activeTerm = await prisma.academicTerm.findFirst({
    where: {
      institutionId: institution.id,
      code: 'SEM3-2026',
      academicYearId: activeAcademicYear.id,
    },
  });
  if (!activeTerm) throw new Error('Active Term not found');

  const sem1Term = await prisma.academicTerm.findFirst({
    where: { institutionId: institution.id, code: 'SEM1-2026', status: 'COMPLETED' },
  });
  const sem2Term = await prisma.academicTerm.findFirst({
    where: { institutionId: institution.id, code: 'SEM2-2026', status: 'COMPLETED' },
  });

  const sectionA = await prisma.section.findFirst({
    where: { institutionId: institution.id, code: 'CSE-A' },
  });

  const faculty = await prisma.faculty.findFirst({
    where: { institutionId: institution.id, user: { firstName: 'Rajesh', lastName: 'Kumar' } },
    include: { user: true },
  });
  if (!faculty) throw new Error('Faculty not found');

  console.log('--- Phase 5: Create Authenticated User ---');
  let supabaseAuthId = 'student1-demo-id';
  if (process.env['SUPABASE_URL'] && process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    const supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    );
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    let sbUser = existingUser?.users?.find((u) => u.email === 'student1@demo-institute.test');
    if (!sbUser) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'student1@demo-institute.test',
        password: 'wasdwasd12',
        email_confirm: true,
        user_metadata: { first_name: 'Student', last_name: 'One', role: UserRole.STUDENT },
      });
      if (error) throw error;
      sbUser = data.user;
    } else {
      await supabase.auth.admin.updateUserById(sbUser.id, { password: 'wasdwasd12' });
    }
    supabaseAuthId = sbUser.id;
  }

  const existingAuthUser = await prisma.user.findFirst({ where: { authUserId: supabaseAuthId } });
  const existingEmailUser = await prisma.user.findFirst({
    where: { email: 'student1@demo-institute.test' },
  });

  let user = existingAuthUser || existingEmailUser;
  if (!user) {
    user = await prisma.user.create({
      data: {
        authUserId: supabaseAuthId,
        institutionId: institution!.id,
        email: 'student1@demo-institute.test',
        firstName: 'Student',
        lastName: 'One',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { authUserId: supabaseAuthId },
    });
  }

  console.log('--- Phase 6: Create Student Record ---');
  let student = await prisma.student.findFirst({ where: { userId: user.id } });
  if (!student) {
    student = await prisma.student.create({
      data: {
        institutionId: institution!.id,
        userId: user.id,
        studentCode: 'STU2026-ONE',
        admissionNumber: 'STU2026-ONE',
        lifecycleStatus: StudentLifecycleStatus.ACTIVE,
        programId: program!.id,
        sectionId: sectionA!.id,
        curriculumId: curriculum!.id,
      },
    });
  }

  console.log('Student created/verified:', student!.id);

  async function setupTerm(term: any, semesterNum: number, isCompleted: boolean) {
    console.log(`Setting up ${term.name}...`);
    const currTerm = await prisma.curriculumTerm.findFirst({
      where: { curriculumId: curriculum!.id, sequence: semesterNum },
    });
    const currCourses = await prisma.curriculumCourse.findMany({
      where: { curriculumTermId: currTerm!.id },
      include: { course: true },
    });

    for (const cc of currCourses) {
      await prisma.courseAssignment.upsert({
        where: {
          facultyId_courseId_sectionId_termId: {
            facultyId: faculty!.id,
            courseId: cc.course.id,
            sectionId: sectionA!.id,
            termId: term.id,
          },
        },
        create: {
          institutionId: institution!.id,
          facultyId: faculty!.id,
          courseId: cc.course.id,
          sectionId: sectionA!.id,
          termId: term.id,
        },
        update: {},
      });

      let exam = await prisma.exam.findFirst({ where: { termId: term.id } });
      if (!exam) {
        exam = await prisma.exam.create({
          data: {
            institutionId: institution!.id,
            academicYearId: activeAcademicYear!.id,
            termId: term.id,
            name: `${term.name} Final`,
            examType: ExamType.FINAL,
            status: 'PUBLISHED',
          },
        });
      }

      let examCourse = await prisma.examCourse.findFirst({
        where: { examId: exam.id, courseId: cc.course.id },
      });
      if (!examCourse) {
        examCourse = await prisma.examCourse.create({
          data: {
            institutionId: institution!.id,
            examId: exam.id,
            courseId: cc.course.id,
            examDate: new Date(),
            startTime: new Date(),
            endTime: new Date(),
            maxMarks: 100,
            passingMarks: 40,
          },
        });
      }

      let enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student!.id, termId: term.id, courseId: cc.course.id },
      });
      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            institutionId: institution!.id,
            studentId: student!.id,
            academicYearId: activeAcademicYear!.id,
            courseId: cc.course.id,
            programId: program!.id,
            curriculumId: curriculum!.id,
            sectionId: sectionA!.id,
            termId: term.id,
            status: EnrollmentStatus.ACTIVE,
          },
        });
      } else if (enrollment.status !== EnrollmentStatus.ACTIVE) {
        enrollment = await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: EnrollmentStatus.ACTIVE },
        });
      }

      if (isCompleted) {
        await attendanceService.saveAttendance(faculty!.user.id, institution!.id, {
          courseId: cc.course.id,
          sectionId: sectionA!.id,
          termId: term.id,
          date: new Date('2026-05-01'),
          startTime: new Date('2026-05-01T09:00:00Z'),
          endTime: new Date('2026-05-01T10:00:00Z'),
          topic: 'Mock Session',
          records: [{ studentId: student!.id, status: 'PRESENT', remarks: '' }],
        });

        const rawMark = 40 + Math.floor(Math.random() * 50);
        const gradePoint = Math.floor(rawMark / 10);
        await examsService.saveMarks(faculty!.user.id, institution!.id, examCourse.id, {
          marks: [
            {
              studentId: student!.id,
              enrollmentId: enrollment.id,
              marksObtained: rawMark,
              percentage: rawMark,
              grade: rawMark >= 90 ? 'O' : rawMark >= 80 ? 'A' : rawMark >= 70 ? 'B+' : 'B',
              gradePoint: gradePoint,
              resultStatus: ResultStatus.PASS,
              remarks: 'Mock Result',
            },
          ],
        });

        // Set to completed after marks are saved
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: EnrollmentStatus.COMPLETED },
        });
      } else {
        await attendanceService.saveAttendance(faculty!.user.id, institution!.id, {
          courseId: cc.course.id,
          sectionId: sectionA!.id,
          termId: term.id,
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          topic: 'Active Mock Session',
          records: [{ studentId: student!.id, status: 'PRESENT', remarks: 'Active Class' }],
        });
      }
    }

    let studentTerm = await prisma.studentTerm.findFirst({
      where: { studentId: student!.id, academicTermId: term.id },
    });
    if (!studentTerm) {
      studentTerm = await prisma.studentTerm.create({
        data: {
          institutionId: institution!.id,
          studentId: student!.id,
          academicTermId: term.id,
          curriculumTermId: currTerm!.id,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        },
      });
    } else {
      await prisma.studentTerm.update({
        where: { id: studentTerm.id },
        data: { status: isCompleted ? 'COMPLETED' : 'ACTIVE' },
      });
    }
  }

  await setupTerm(sem1Term, 1, true);
  await setupTerm(sem2Term, 2, true);
  await setupTerm(activeTerm, 3, false);

  console.log('Mock Data Seed Complete!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
