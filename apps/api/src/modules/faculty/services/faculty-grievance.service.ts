import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FacultyGrievanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      include: { user: true },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const grievance = await this.prisma.grievance.create({
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

    this.eventEmitter.emit('grievance.created', {
      institutionId,
      grievanceId: grievance.id,
      category: grievance.category,
      studentName: data.isAnonymous
        ? 'An anonymous faculty member'
        : `${faculty.user.firstName} ${faculty.user.lastName}`,
    });

    return grievance;
  }
}
