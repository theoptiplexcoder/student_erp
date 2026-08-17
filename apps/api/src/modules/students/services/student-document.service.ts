import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentDocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocuments(authUserId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { user: { authUserId, institutionId } },
    });

    if (!student) return [];

    return this.prisma.studentDocument.findMany({
      where: {
        institutionId,
        studentId: student.id,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
