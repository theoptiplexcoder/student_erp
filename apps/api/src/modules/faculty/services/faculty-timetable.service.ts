import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyTimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimetable(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.timetableEntry.findMany({
      where: { facultyId: faculty.id, institutionId },
      include: {
        course: true,
        section: true,
        term: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getSession(
    userId: string,
    institutionId: string,
    courseId: string,
    sectionId: string,
    dateStr: string,
  ) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const date = new Date(dateStr);

    // Find if session already exists
    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        institutionId,
        courseId,
        sectionId,
        date,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        section: {
          include: {
            program: true,
            batch: true,
          },
        },
        term: true,
        attendanceRecords: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const dayNames = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ] as const;
    const dayOfWeek = dayNames[date.getUTCDay()];

    const timetableEntry = await this.prisma.timetableEntry.findFirst({
      where: {
        courseId,
        sectionId,
        dayOfWeek,
      },
      include: {
        room: true,
        building: true,
        term: true,
      },
    });

    if (!session) {
      const [course, section] = await Promise.all([
        this.prisma.course.findUnique({
          where: { id: courseId },
          include: { department: true },
        }),
        this.prisma.section.findUnique({
          where: { id: sectionId },
          include: { program: true, batch: true },
        }),
      ]);

      return {
        id: null,
        institutionId,
        courseId,
        sectionId,
        facultyId: faculty.id,
        date,
        startTime: timetableEntry?.startTime || null,
        endTime: timetableEntry?.endTime || null,
        topic: null,
        course,
        section,
        term: timetableEntry?.term || null,
        timetableEntry,
        attendanceRecords: [],
      };
    }

    return {
      ...session,
      timetableEntry,
    };
  }
}
