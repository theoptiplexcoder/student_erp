import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(institutionId: string) {
    // Parallelize queries to be efficient
    const [
      activeStudents,
      activeFaculty,
      pendingAdmissionsCount,
      admittedAdmissionsCount,
      enrolledAdmissionsCount,
      openGrievancesCount,
      criticalGrievancesCount,
      attendanceStats,
      upcomingExams,
      pendingResults,
      grievanceList,
    ] = await Promise.all([
      // 1. Active students
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: { in: ['ACTIVE', 'ENROLLED'] } },
      }),
      // 2. Active faculty
      this.prisma.faculty.count({
        where: { institutionId, status: 'ACTIVE' },
      }),
      // 3. Admissions (funnel)
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: 'APPLICANT' },
      }),
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: 'ADMITTED' },
      }),
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: 'ENROLLED' },
      }),
      // 4. Open grievances
      this.prisma.grievance.count({
        where: { institutionId, status: { in: ['OPEN', 'IN_REVIEW', 'IN_PROGRESS'] } },
      }),
      this.prisma.grievance.count({
        where: {
          institutionId,
          status: { in: ['OPEN', 'IN_REVIEW'] },
          priority: { in: ['URGENT', 'HIGH'] },
        },
      }),
      // 5. Attendance stats (using groupBy)
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { institutionId },
        _count: { status: true },
      }),
      // 6. Upcoming exams
      this.prisma.exam.count({
        where: { institutionId, status: { in: ['SCHEDULED'] } }, // or check startDate
      }),
      // 7. Results pending
      this.prisma.exam.count({
        where: { institutionId, status: 'COMPLETED' },
      }),
      // 8. Grievance list (recent and critical)
      this.prisma.grievance.findMany({
        where: { institutionId, status: { in: ['OPEN', 'IN_REVIEW', 'IN_PROGRESS'] } },
        orderBy: [
          { priority: 'desc' }, // Need to handle ENUM sorting carefully in Prisma. For now, order by createdAt
          { createdAt: 'desc' },
        ],
        take: 5,
        select: {
          id: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate attendance percentage
    let totalAttendance = 0;
    let presentAttendance = 0;
    attendanceStats.forEach((stat) => {
      totalAttendance += stat._count.status;
      if (['PRESENT', 'EXCUSED', 'LATE'].includes(stat.status)) {
        presentAttendance += stat._count.status;
      }
    });
    const attendanceRate =
      totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    // We don't have a direct "low attendance students" count without a complex query or raw query.
    // For now, let's use a raw query or mock it to 0 if not easily available.
    // Finding students below a threshold requires aggregating per student.
    const lowAttendanceStudentsCount = await this.getLowAttendanceStudentsCount(institutionId);

    const attentionRequired = [];

    if (lowAttendanceStudentsCount > 0) {
      attentionRequired.push({
        type: 'ATTENDANCE',
        severity: 'HIGH',
        title: `${lowAttendanceStudentsCount} students below attendance threshold`,
        count: lowAttendanceStudentsCount,
        actionText: 'Review attendance →',
        link: '/admin/attendance/reports',
      });
    }

    if (pendingAdmissionsCount > 0) {
      attentionRequired.push({
        type: 'ADMISSION',
        severity: 'HIGH',
        title: `${pendingAdmissionsCount} applications awaiting review`,
        count: pendingAdmissionsCount,
        actionText: 'Review admissions →',
        link: '/admin/admissions/applications',
      });
    }

    if (pendingResults > 0) {
      attentionRequired.push({
        type: 'EXAMINATION',
        severity: 'MEDIUM',
        title: `${pendingResults} examinations have pending marks`,
        count: pendingResults,
        actionText: 'Review examinations →',
        link: '/admin/examinations/marks',
      });
    }

    if (openGrievancesCount > 0) {
      attentionRequired.push({
        type: 'GRIEVANCE',
        severity: criticalGrievancesCount > 0 ? 'HIGH' : 'MEDIUM',
        title: `${openGrievancesCount} unresolved grievances (${criticalGrievancesCount} critical/high)`,
        count: openGrievancesCount,
        actionText: 'Review grievances →',
        link: '/admin/grievances',
      });
    }

    // Sort grievances to put URGENT/HIGH first
    const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sortedGrievances = grievanceList.sort((a, b) => {
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    return {
      kpis: {
        activeStudents: { current: activeStudents },
        activeFaculty: { current: activeFaculty },
        attendanceRate: { percentage: attendanceRate },
        pendingAdmissions: { current: pendingAdmissionsCount },
        openGrievances: { current: openGrievancesCount },
      },
      attentionRequired,
      grievances: sortedGrievances,
      academicHealth: {
        upcomingExams,
        resultsPending: pendingResults,
        attendanceAverage: attendanceRate,
        lowAttendanceStudents: lowAttendanceStudentsCount,
      },
      admissions: {
        applicants: pendingAdmissionsCount,
        admitted: admittedAdmissionsCount,
        enrolled: enrolledAdmissionsCount,
      },
    };
  }

  private async getLowAttendanceStudentsCount(institutionId: string): Promise<number> {
    try {
      // Prisma raw query to find students with attendance < 75%
      const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM (
          SELECT "student_id",
                 SUM(CASE WHEN status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as percentage
          FROM "attendance_records"
          WHERE "institution_id" = ${institutionId}::uuid
          GROUP BY "student_id"
          HAVING SUM(CASE WHEN status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 ELSE 0 END) * 100.0 / COUNT(*) < 75.0
        ) as subquery;
      `;
      return Number(result[0]?.count || 0);
    } catch (e) {
      console.error('Failed to get low attendance count:', e);
      return 0;
    }
  }
}
