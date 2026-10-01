import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ActiveTermService } from '../../../database/active-term.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StudentCertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activeTerm: ActiveTermService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getCertificates(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) return [];

    return this.prisma.certificateRequest.findMany({
      where: {
        institutionId,
        studentId: student.id,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async createCertificateRequest(userId: string, institutionId: string, data: any) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    const request = await this.prisma.certificateRequest.create({
      data: {
        institutionId,
        studentId: student.id,
        certificateType: data.certificateType,
        purpose: data.purpose,
        supportingDocs: data.supportingDocs,
        termId: await this.activeTerm.resolve(institutionId),
      },
    });

    this.eventEmitter.emit('certificate.request_created', {
      institutionId,
      requestId: request.id,
      type: request.certificateType,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
    });

    return request;
  }
}
