import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentAcademicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourses(userId: string, institutionId: string, termId?: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) {
      return [];
    }

    const whereClause: any = {
      institutionId,
      studentId: student.id,
      status: 'ACTIVE',
    };

    if (termId) {
      whereClause.termId = termId;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        term: true,
      },
    });

    return enrollments.map((e) => ({
      ...e.course,
      enrollmentId: e.id,
      term: e.term,
    }));
  }

  async getTerms(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) {
      return [];
    }

    return this.prisma.academicTerm.findMany({
      where: {
        institutionId,
        enrollments: {
          some: {
            studentId: student.id,
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async getCourseDetails(userId: string, institutionId: string, courseId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) return null;

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        institutionId,
        studentId: student.id,
        courseId,
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        courseResources: true,
        assignments: {
          where: { status: 'PUBLISHED' },
        },
      },
    });

    return course;
  }
}
