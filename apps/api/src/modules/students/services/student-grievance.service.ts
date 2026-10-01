import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ActiveTermService } from '../../../database/active-term.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StudentGrievanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activeTerm: ActiveTermService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    const grievance = await this.prisma.grievance.create({
      data: {
        institutionId,
        studentId: student.id,
        category: data.category,
        subject: data.subject,
        description: data.description,
        relatedType: data.relatedType || null,
        relatedId: data.relatedId || null,
        isAnonymous: !!data.isAnonymous,
        termId: await this.activeTerm.resolve(institutionId),
      },
    });

    this.eventEmitter.emit('grievance.created', {
      institutionId,
      grievanceId: grievance.id,
      category: grievance.category,
      studentName: data.isAnonymous
        ? 'An anonymous student'
        : `${student.user.firstName} ${student.user.lastName}`,
    });

    return grievance;
  }
}
