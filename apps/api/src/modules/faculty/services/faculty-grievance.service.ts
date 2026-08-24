import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyGrievanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getGrievances(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) return [];

    return this.prisma.grievance.findMany({
      where: {
        institutionId,
        facultyId: faculty.id,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGrievance(userId: string, institutionId: string, data: any) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.grievance.create({
      data: {
        institutionId,
        facultyId: faculty.id,
        source: 'FACULTY',
        category: data.category,
        subject: data.subject,
        description: data.description,
        relatedType: data.relatedType || null,
        relatedId: data.relatedId || null,
        isAnonymous: !!data.isAnonymous,
      },
    });
  }
}
