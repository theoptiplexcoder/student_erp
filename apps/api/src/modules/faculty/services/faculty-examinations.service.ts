import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExaminations(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    // Get all assigned courses
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      select: { courseId: true, sectionId: true },
    });

    const courseIds = assignments.map((a) => a.courseId);

    // Get ExamCourses for these courses
    return this.prisma.examCourse.findMany({
      where: {
        institutionId,
        courseId: { in: courseIds },
      },
      include: {
        exam: {
          include: {
            term: true,
          },
        },
        course: true,
      },
      orderBy: { examDate: 'desc' },
    });
  }

  async getExamMarks(userId: string, institutionId: string, examCourseId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const examCourse = await this.prisma.examCourse.findFirst({
      where: { id: examCourseId, institutionId },
      include: { course: true, exam: true },
    });

    if (!examCourse) throw new NotFoundException('Exam Course not found');

    // Make sure faculty is assigned to this course
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId, courseId: examCourse.courseId },
    });

    if (assignments.length === 0) {
      throw new BadRequestException('You are not assigned to this course');
    }

    const sectionIds = assignments.map((a) => a.sectionId);

    // Fetch enrollments for the sections this faculty teaches
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        courseId: examCourse.courseId,
        sectionId: { in: sectionIds },
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    const enrollmentIds = enrollments.map((e) => e.id);

    // Fetch existing marks
    const marks = await this.prisma.mark.findMany({
      where: {
        institutionId,
        examCourseId,
        enrollmentId: { in: enrollmentIds },
      },
    });

    return {
      examCourse,
      enrollments,
      marks,
    };
  }

  async saveMarks(userId: string, institutionId: string, examCourseId: string, data: any) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const examCourse = await this.prisma.examCourse.findFirst({
      where: { id: examCourseId, institutionId },
    });

    if (!examCourse) throw new NotFoundException('Exam Course not found');

    // Enforce authorization
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId, courseId: examCourse.courseId },
    });

    if (assignments.length === 0)
      throw new BadRequestException('You are not authorized to grade this course');

    const sectionIds = assignments.map((a) => a.sectionId);

    const validEnrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        courseId: examCourse.courseId,
        sectionId: { in: sectionIds },
        studentId: { in: data.marks.map((m: any) => m.studentId) },
        status: 'ACTIVE',
      },
    });

    const validStudentIds = new Set(validEnrollments.map((e) => e.studentId));

    // Helper for automatic grading
    const calculateGradeAndStatus = (marksObtained: number | null | undefined) => {
      if (marksObtained === null || marksObtained === undefined) {
        return { percentage: null, grade: null, gradePoint: null, resultStatus: 'ABSENT' as const };
      }

      let percentage: number | null = null;
      if (examCourse.maxMarks && examCourse.maxMarks > 0) {
        percentage = Math.round((marksObtained / examCourse.maxMarks) * 100 * 100) / 100;
      }

      let grade = 'F';
      let gradePoint = 0.0;
      const scoreToCheck = percentage ?? marksObtained;

      if (scoreToCheck >= 90) {
        grade = 'A+';
        gradePoint = 4.0;
      } else if (scoreToCheck >= 80) {
        grade = 'A';
        gradePoint = 3.7;
      } else if (scoreToCheck >= 70) {
        grade = 'B';
        gradePoint = 3.0;
      } else if (scoreToCheck >= 60) {
        grade = 'C';
        gradePoint = 2.0;
      } else if (scoreToCheck >= 50) {
        grade = 'D';
        gradePoint = 1.0;
      } else {
        grade = 'F';
        gradePoint = 0.0;
      }

      const passingMarks =
        examCourse.passingMarks ?? (examCourse.maxMarks ? examCourse.maxMarks * 0.4 : 40);
      const isPass = marksObtained >= passingMarks;
      const resultStatus = isPass ? ('PASS' as const) : ('FAIL' as const);

      return { percentage, grade, gradePoint, resultStatus };
    };

    return this.prisma.$transaction(async (tx) => {
      for (const record of data.marks) {
        if (!validStudentIds.has(record.studentId)) {
          throw new BadRequestException(
            `Not authorized to submit marks for student ${record.studentId}`,
          );
        }

        if (
          examCourse.maxMarks !== null &&
          examCourse.maxMarks !== undefined &&
          record.marksObtained !== null &&
          record.marksObtained !== undefined &&
          record.marksObtained > examCourse.maxMarks
        ) {
          throw new BadRequestException(
            `Marks obtained (${record.marksObtained}) exceeds max marks (${examCourse.maxMarks})`,
          );
        }

        const calculated = calculateGradeAndStatus(record.marksObtained);
        const marksObtained = record.marksObtained !== undefined ? record.marksObtained : null;
        const percentage = record.percentage ?? calculated.percentage;
        const grade = record.grade || calculated.grade;
        const gradePoint = record.gradePoint ?? calculated.gradePoint;
        const resultStatus = record.resultStatus || calculated.resultStatus;
        const remarks = record.remarks || null;

        const existing = await tx.mark.findUnique({
          where: {
            examCourseId_studentId: {
              examCourseId,
              studentId: record.studentId,
            },
          },
        });

        if (existing) {
          await tx.mark.update({
            where: { id: existing.id },
            data: {
              marksObtained,
              percentage,
              grade,
              gradePoint,
              resultStatus,
              remarks,
            },
          });
        } else {
          await tx.mark.create({
            data: {
              institutionId,
              examCourseId,
              studentId: record.studentId,
              enrollmentId: record.enrollmentId,
              marksObtained,
              percentage,
              grade,
              gradePoint,
              resultStatus,
              remarks,
            },
          });
        }
      }

      return { success: true };
    });
  }
}
