import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentGrievanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getGrievances(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) return [];

    return this.prisma.grievance.findMany({
      where: {
        institutionId,
        studentId: student.id,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGrievance(userId: string, institutionId: string, data: any) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.grievance.create({
      data: {
        institutionId,
        studentId: student.id,
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
