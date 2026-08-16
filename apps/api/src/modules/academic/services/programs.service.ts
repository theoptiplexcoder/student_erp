import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createProgramDto: any) {
    return this.prisma.program.create({
      data: {
        ...createProgramDto,
        institutionId,
      },
    });
  }

  async findAll(institutionId: string) {
    return this.prisma.program.findMany({
      where: { institutionId },
      include: {
        department: true,
        _count: {
          select: { curriculums: true },
        },
      },
    });
  }

  async findOne(institutionId: string, id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, institutionId },
      include: {
        department: true,
        curriculums: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async update(institutionId: string, id: string, updateProgramDto: any) {
    // Check first
    await this.findOne(institutionId, id);
    return this.prisma.program.update({
      where: { id },
      data: updateProgramDto,
    });
  }
}
