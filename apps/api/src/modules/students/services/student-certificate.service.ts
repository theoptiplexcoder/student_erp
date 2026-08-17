import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentCertificateService {
  constructor(private readonly prisma: PrismaService) {}

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
}
