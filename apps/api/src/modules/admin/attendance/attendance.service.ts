import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllSessions(institutionId: string, page = 1, pageSize = 50, filters?: any) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.AttendanceSessionWhereInput = { institutionId };

    if (filters?.courseId) where.courseId = filters.courseId;
    if (filters?.sectionId) where.sectionId = filters.sectionId;
    if (filters?.facultyId) where.facultyId = filters.facultyId;
    if (filters?.termId) where.termId = filters.termId;
    if (filters?.date) where.date = new Date(filters.date);

    const [data, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        include: {
          course: { select: { name: true, code: true } },
          section: { select: { name: true } },
          faculty: { select: { user: { select: { firstName: true, lastName: true } } } },
          _count: { select: { attendanceRecords: true } },
        },
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSessionById(institutionId: string, id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id, institutionId },
      include: {
        course: true,
        section: true,
        faculty: { include: { user: true } },
        attendanceRecords: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
