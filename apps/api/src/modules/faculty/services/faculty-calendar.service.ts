import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const events = await this.prisma.calendarEvent.findMany({
      where: { institutionId },
      orderBy: { startAt: 'asc' },
    });

    return events;
  }
}
