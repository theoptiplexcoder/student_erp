import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface SectionAttendanceOverview {
  sectionId: string;
  sectionName: string;
  sectionCode: string;
  program: string | null;
  classLevel: string | null;
  totalStudents: number;
  totalSessions: number;
  averageAttendancePercent: number;
  presentCount: number;
  totalRecords: number;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(institutionId: string) {
    const totalSessions = await this.prisma.attendanceSession.count({
      where: { institutionId },
    });

    // We can compute average attendance based on present vs total records
    // Let's get the aggregate of records
    const presentRecords = await this.prisma.attendanceRecord.count({
      where: {
        attendanceSession: { institutionId },
        status: 'PRESENT',
      },
    });

    const totalRecords = await this.prisma.attendanceRecord.count({
      where: {
        attendanceSession: { institutionId },
      },
    });

    const averageAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    // Threshold could be fetched from institution settings, but let's default to 75 for now
    const threshold = 75.0;

    return {
      totalSessions,
      averageAttendance,
      threshold,
      trend: {
        value: '+1.2%', // Dummy trend for now since tracking historical would be complex
        direction: 'up',
        label: 'vs last week',
      },
    };
  }

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

  /**
   * Returns one card per section with the average attendance percentage
   * across all students enrolled in that section.
   *
   * Logic:
   *  - For every AttendanceSession in a section, fetch all AttendanceRecords.
   *  - averageAttendancePercent = (PRESENT records / total records) * 100
   *  - totalStudents comes from Student.sectionId count.
   */
  async getSectionOverview(institutionId: string): Promise<SectionAttendanceOverview[]> {
    // Fetch all sections for the institution
    const sections = await this.prisma.section.findMany({
      where: { institutionId },
      include: {
        program: { select: { name: true } },
        classLevel: { select: { name: true } },
        _count: { select: { students: true, attendanceSessions: true } },
      },
      orderBy: [{ classLevel: { sequence: 'asc' } }, { name: 'asc' }],
    });

    // For each section compute present / total attendance records
    const results: SectionAttendanceOverview[] = await Promise.all(
      sections.map(async (section) => {
        const [present, total] = await Promise.all([
          this.prisma.attendanceRecord.count({
            where: {
              attendanceSession: { sectionId: section.id, institutionId },
              status: 'PRESENT',
            },
          }),
          this.prisma.attendanceRecord.count({
            where: { attendanceSession: { sectionId: section.id, institutionId } },
          }),
        ]);

        return {
          sectionId: section.id,
          sectionName: section.name,
          sectionCode: section.code,
          program: section.program?.name ?? null,
          classLevel: section.classLevel?.name ?? null,
          totalStudents: section._count.students,
          totalSessions: section._count.attendanceSessions,
          presentCount: present,
          totalRecords: total,
          averageAttendancePercent: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
        };
      }),
    );

    return results;
  }
}
