import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../../database/prisma.service';

@Injectable()
export class StudentService {
  async getStudentProfile(authUserId: string, institutionId: string) {
    const student = await prisma.student.findFirst({
      where: {
        user: {
          authUserId,
          institutionId,
        },
      },
      include: {
        user: true,
        program: true,
        section: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async getDashboardData(authUserId: string, institutionId: string) {
    const student = await this.getStudentProfile(authUserId, institutionId);

    // Get today's timetable
    const today = new Date().getDay(); // 0-6 (Sun-Sat)
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    const timetable = await prisma.timetableEntry.findMany({
      where: {
        institutionId,
        sectionId: student.sectionId ?? undefined,
        dayOfWeek: dayMap[today] as any,
      },
      include: {
        course: true,
        faculty: {
          include: { user: true }
        },
      },
    });

    // Enrolled courses count
    const enrollments = await prisma.enrollment.count({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    return {
      student,
      stats: {
        enrolledCourses: enrollments,
        // Mocked stats, should be implemented realistically later
        attendancePercentage: 85.5,
        upcomingDeadlines: 2,
      },
      todaySchedule: timetable,
    };
  }
}
