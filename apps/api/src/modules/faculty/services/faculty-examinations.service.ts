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
            academicTerm: true,
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

    return this.prisma.$transaction(async (tx) => {
      for (const record of data.marks) {
        if (!validStudentIds.has(record.studentId)) {
          throw new BadRequestException(
            `Not authorized to submit marks for student ${record.studentId}`,
          );
        }

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
              marksObtained: record.marksObtained,
              percentage: record.percentage,
              grade: record.grade,
              gradePoint: record.gradePoint,
              resultStatus: record.resultStatus,
              remarks: record.remarks,
            },
          });
        } else {
          await tx.mark.create({
            data: {
              institutionId,
              examCourseId,
              studentId: record.studentId,
              enrollmentId: record.enrollmentId,
              marksObtained: record.marksObtained,
              percentage: record.percentage,
              grade: record.grade,
              gradePoint: record.gradePoint,
              resultStatus: record.resultStatus,
              remarks: record.remarks,
            },
          });
        }
      }

      return { success: true };
    });
  }
}
