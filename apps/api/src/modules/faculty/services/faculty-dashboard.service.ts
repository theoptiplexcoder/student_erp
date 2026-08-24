import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class FacultyDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ] as const;
    const dayOfWeekEnum = days[today.getDay()];

    // 1. Assigned Courses
    const courseAssignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      include: {
        course: true,
        section: {
          include: {
            program: true,
            batch: true,
          },
        },
        term: true,
      },
    });

    // 2. Today's Classes (Timetable)
    const todaysClasses = await this.prisma.timetableEntry.findMany({
      where: {
        facultyId: faculty.id,
        institutionId,
        dayOfWeek: dayOfWeekEnum,
        term: {
          startDate: { lte: todayEnd },
          endDate: { gte: todayStart },
        },
      },
      include: {
        course: true,
        section: true,
        room: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // 3. Recent Announcements
    const announcements = await this.prisma.announcement.findMany({
      where: {
        institutionId,
        isPublished: true,
        OR: [{ courseId: null }, { courseId: { in: courseAssignments.map((ca) => ca.courseId) } }],
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    return {
      faculty: {
        id: faculty.id,
        name: `${faculty.user.firstName} ${faculty.user.lastName}`,
        department: faculty.department.name,
      },
      courseAssignments,
      todaysClasses,
      announcements,
    };
  }
}
