import { Injectable } from '@nestjs/common';
import { prisma } from '../../../database/prisma.service';

@Injectable()
export class StudentAcademicService {
  async getCourses(authUserId: string, institutionId: string) {
    const student = await prisma.student.findFirst({
      where: { user: { authUserId, institutionId } }
    });

    if (!student) {
      return [];
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
      include: {
        course: {
          include: {
            department: true,
          }
        },
        term: true,
      },
    });

    return enrollments.map(e => ({
      ...e.course,
      enrollmentId: e.id,
      term: e.term,
    }));
  }

  async getCourseDetails(authUserId: string, institutionId: string, courseId: string) {
    const student = await prisma.student.findFirst({
      where: { user: { authUserId, institutionId } }
    });

    if (!student) return null;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        institutionId,
        studentId: student.id,
        courseId,
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        courseResources: true,
        assignments: {
          where: { status: 'PUBLISHED' }
        }
      }
    });

    return course;
  }
}
