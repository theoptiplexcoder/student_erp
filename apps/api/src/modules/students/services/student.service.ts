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

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const upcomingEvents = await this.prisma.calendarEvent.findMany({
      where: {
        institutionId,
        startAt: { gte: new Date() },
      },
      take: 5,
      orderBy: { startAt: 'asc' },
    });

    const recentAnnouncements = await this.prisma.announcement.findMany({
      where: {
        institutionId,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const upcomingDeadlines = await this.prisma.assignment.findMany({
      where: {
        institutionId,
        courseId: { in: enrollments.map((e) => e.courseId).filter(Boolean) as string[] },
        dueDate: { gte: new Date() },
      },
      include: {
        course: true,
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
    });

    return {
      student,
      stats: {
        enrolledCourses: enrollments.length,
        attendancePercentage: 85.5,
        upcomingDeadlines: upcomingDeadlines.length,
      },
      todaySchedule: timetable,
      upcomingEvents,
      recentAnnouncements,
      upcomingDeadlines,
    };
  }

  async getTimetable(authUserId: string, institutionId: string) {
    const student = await this.getStudentProfile(authUserId, institutionId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    const timetable = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        courseId: { in: courseIds.filter((id) => id !== null) as string[] },
      },
      include: {
        course: true,
        faculty: {
          include: { user: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return timetable;
  }
}
