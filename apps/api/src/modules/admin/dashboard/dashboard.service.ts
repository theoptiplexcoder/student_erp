import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(institutionId: string) {
    const [
      totalStudents,
      activeFaculty,
      pendingAdmissions,
    ] = await Promise.all([
      this.prisma.student.count({
        where: { institutionId },
      }),
      this.prisma.faculty.count({
        where: { institutionId, status: 'ACTIVE' },
      }),
      this.prisma.student.count({
        where: { institutionId, lifecycleStatus: 'APPLICANT' },
      })
    ]);

    return {
      students: { total: totalStudents },
      faculty: { active: activeFaculty },
      admissions: { pending: pendingAdmissions },
      attendance: { issues: 0 },
    };
  }
}
