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
        facultyId: faculty.id,
        courseId,
        sectionId,
        date,
      },
      include: {
        course: true,
        section: {
          include: {
            program: true,
            batch: true,
          },
        },
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

    return session;
  }
}
