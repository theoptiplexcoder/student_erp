import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TermsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, data: any) {
    return this.prisma.academicTerm.create({
      data: {
        ...data,
        institutionId,
      },
    });
  }

  async findAll(institutionId: string) {
    return this.prisma.academicTerm.findMany({
      where: { institutionId },
      include: { academicYear: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(institutionId: string, id: string) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { id, institutionId },
      include: { academicYear: true },
    });
    if (!term) throw new NotFoundException('Term not found');
    return term;
  }

  async update(institutionId: string, id: string, data: any) {
    return this.prisma.academicTerm.update({
      where: { id, institutionId },
      data,
    });
  }

  async remove(institutionId: string, id: string) {
    return this.prisma.academicTerm.delete({
      where: { id, institutionId },
    });
  }
}
