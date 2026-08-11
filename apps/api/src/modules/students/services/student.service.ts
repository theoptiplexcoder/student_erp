import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentProfile(authUserId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
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

    const today = new Date().getDay();
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const timetable = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        sectionId: student.sectionId ?? undefined,
        dayOfWeek: dayMap[today] as any,
      },
      include: {
        course: true,
        faculty: {
          include: { user: true },
        },
      },
    });

    const enrollments = await this.prisma.enrollment.count({
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
        attendancePercentage: 85.5,
        upcomingDeadlines: 2,
      },
      todaySchedule: timetable,
    };
  }
}
