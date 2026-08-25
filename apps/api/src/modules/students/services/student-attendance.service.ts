import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PolicyFactory } from '../../../common/policies/policy.factory';

@Injectable()
export class StudentAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private policyFactory: PolicyFactory,
  ) {}

  async getAttendanceSummary(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
      include: { institution: true },
    });

    if (!student) return [];

    const policy = this.policyFactory.getPolicy(student.institution.institutionType);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        course: true,
      },
    });

    const results = await Promise.all(
      enrollments.map(async (enr) => {
        const records = await this.prisma.attendanceRecord.findMany({
          where: {
            institutionId,
            studentId: student.id,
            attendanceSession: {
              courseId: enr.courseId || '',
            },
          },
          include: {
            attendanceSession: true,
          },
        });

        const totalSessions = records.length;
        const presentSessions = records.filter(
          (r) => r.status === 'PRESENT' || r.status === 'LATE',
        ).length;
        const percentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

        return {
          course: enr.course,
          totalSessions,
          presentSessions,
          percentage,
          requiredPercentage: policy.minimumAttendanceThreshold,
          meetsRequirement: percentage >= policy.minimumAttendanceThreshold,
        };
      }),
    );

    return results;
  }

  async getCourseAttendance(userId: string, institutionId: string, courseId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
      include: { institution: true },
    });

    if (!student) return null;

    const policy = this.policyFactory.getPolicy(student.institution.institutionType);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        institutionId,
        studentId: student.id,
        attendanceSession: {
          courseId,
        },
      },
      include: {
        attendanceSession: {
          include: {
            faculty: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: {
        attendanceSession: {
          date: 'desc',
        },
      },
    });

    return {
      records,
      requiredPercentage: policy.minimumAttendanceThreshold,
    };
  }
}
