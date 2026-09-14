import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateExaminationTypeDto, UpdateExaminationTypeDto } from './dto/examination-type.dto';

@Injectable()
export class ExaminationTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId: string) {
    return this.prisma.examinationType.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { exams: true },
        },
      },
    });
  }

  async findOne(institutionId: string, id: string) {
    const examType = await this.prisma.examinationType.findFirst({
      where: { id, institutionId },
    });
    if (!examType) {
      throw new NotFoundException('Examination type not found');
    }
    return examType;
  }

  async create(institutionId: string, dto: CreateExaminationTypeDto) {
    const existing = await this.prisma.examinationType.findFirst({
      where: { institutionId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Examination type with name "${dto.name}" already exists`);
    }

    return this.prisma.examinationType.create({
      data: {
        institutionId,
        name: dto.name,
        code: dto.code,
        totalMarks: dto.totalMarks,
        passingMarks: dto.passingMarks,
        description: dto.description,
      },
    });
  }

  async update(institutionId: string, id: string, dto: UpdateExaminationTypeDto) {
    await this.findOne(institutionId, id);

    if (dto.name) {
      const existing = await this.prisma.examinationType.findFirst({
        where: { institutionId, name: dto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Examination type with name "${dto.name}" already exists`);
      }
    }

    return this.prisma.examinationType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.totalMarks !== undefined && { totalMarks: dto.totalMarks }),
        ...(dto.passingMarks !== undefined && { passingMarks: dto.passingMarks }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(institutionId: string, id: string) {
    await this.findOne(institutionId, id);

    const examCount = await this.prisma.exam.count({
      where: { examinationTypeId: id },
    });
    if (examCount > 0) {
      throw new ConflictException('Cannot delete examination type with associated scheduled exams');
    }

    return this.prisma.examinationType.delete({
      where: { id },
    });
  }
}
