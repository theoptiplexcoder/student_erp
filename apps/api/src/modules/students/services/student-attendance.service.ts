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
        program: {
          include: {
            courses: true,
            curriculums: {
              include: {
                curriculumTerms: {
                  include: {
                    curriculumCourses: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const coursesMap = new Map<string, any>();

    for (const enr of enrollments) {
      if (enr.course) {
        coursesMap.set(enr.course.id, enr.course);
      }
      if (enr.program?.courses) {
        for (const pc of enr.program.courses) {
          if (!coursesMap.has(pc.id)) {
            coursesMap.set(pc.id, pc);
          }
        }
      }
      if (enr.program?.curriculums) {
        for (const curr of enr.program.curriculums) {
          for (const ct of curr.curriculumTerms) {
            for (const cc of ct.curriculumCourses) {
              if (cc.course && !coursesMap.has(cc.course.id)) {
                coursesMap.set(cc.course.id, cc.course);
              }
            }
          }
        }
      }
    }

    const validCourses = Array.from(coursesMap.values());

    if (validCourses.length === 0) {
      return [];
    }

    const courseIds = validCourses.map((c) => c.id);

    const recordsByCourse = new Map<string, { status: string }[]>();

    if (courseIds.length > 0) {
      const allRecords = await this.prisma.attendanceRecord.findMany({
        where: {
          institutionId,
          studentId: student.id,
          attendanceSession: {
            courseId: { in: courseIds },
          },
        },
        select: {
          status: true,
          attendanceSession: {
            select: {
              courseId: true,
            },
          },
        },
      });

      for (const record of allRecords) {
        const cId = record.attendanceSession.courseId;
        if (!recordsByCourse.has(cId)) {
          recordsByCourse.set(cId, []);
        }
        recordsByCourse.get(cId)!.push({ status: record.status });
      }
    }

    return validCourses.map((crs) => {
      const records = recordsByCourse.get(crs.id) || [];
      const totalSessions = records.length;
      const presentSessions = records.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE',
      ).length;
      const percentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

      return {
        course: crs,
        totalSessions,
        presentSessions,
        percentage,
        requiredPercentage: policy.minimumAttendanceThreshold,
        meetsRequirement: percentage >= policy.minimumAttendanceThreshold,
      };
    });
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
