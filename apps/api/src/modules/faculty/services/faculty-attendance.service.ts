import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getEligibleStudents(
    userId: string,
    institutionId: string,
    courseId: string,
    sectionId: string,
  ) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, courseId, sectionId, institutionId },
    });
    if (!assignment) throw new BadRequestException('Not authorized for this course and section');

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        courseId,
        sectionId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: 'asc',
        },
      },
    });

    return enrollments.map((e) => e.student);
  }

  async saveAttendance(userId: string, institutionId: string, data: any) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const { courseId, sectionId, termId, date, startTime, endTime, topic, records } = data;

    if (!courseId || !sectionId || !date || !records) {
      throw new BadRequestException('Missing required attendance data');
    }

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, courseId, sectionId, institutionId },
    });
    if (!assignment) throw new BadRequestException('Not authorized for this course and section');

    const sessionDate = new Date(date);

    return this.prisma.$transaction(async (tx) => {
      // Find or create session
      let session = await tx.attendanceSession.findFirst({
        where: {
          institutionId,
          courseId,
          sectionId,
          facultyId: faculty.id,
          date: sessionDate,
        },
      });

      if (!session) {
        // Need to find termId if not provided
        let activeTermId = termId;
        if (!activeTermId) {
          const term = await tx.academicTerm.findFirst({
            where: {
              institutionId,
              startDate: { lte: sessionDate },
              endDate: { gte: sessionDate },
            },
          });
          if (!term) throw new BadRequestException('No active academic term found for this date');
          activeTermId = term.id;
        }

        session = await tx.attendanceSession.create({
          data: {
            institutionId,
            courseId,
            sectionId,
            facultyId: faculty.id,
            termId: activeTermId,
            date: sessionDate,
            startTime: new Date(startTime || sessionDate),
            endTime: new Date(endTime || sessionDate),
            topic: topic || null,
          },
        });
      } else if (topic) {
        session = await tx.attendanceSession.update({
          where: { id: session.id },
          data: { topic },
        });
      }

      // Upsert records
      for (const record of records) {
        const existing = await tx.attendanceRecord.findFirst({
          where: {
            institutionId,
            attendanceSessionId: session.id,
            studentId: record.studentId,
          },
        });

        if (existing) {
          await tx.attendanceRecord.update({
            where: { id: existing.id },
            data: { status: record.status, remarks: record.remarks },
          });
        } else {
          await tx.attendanceRecord.create({
            data: {
              institutionId,
              attendanceSessionId: session.id,
              studentId: record.studentId,
              status: record.status,
              remarks: record.remarks,
            },
          });
        }
      }

      return session;
    });
  }
}
