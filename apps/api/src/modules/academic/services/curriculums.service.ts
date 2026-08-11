import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus } from '@prisma/client';

@Injectable()
export class CurriculumsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createCurriculumDto: any) {
    return this.prisma.curriculum.create({
      data: {
        ...createCurriculumDto,
        institutionId,
        status: CurriculumStatus.DRAFT,
      },
    });
  }

  async findByProgram(institutionId: string, programId: string) {
    return this.prisma.curriculum.findMany({
      where: { institutionId, programId },
      include: {
        _count: {
          select: { curriculumTerms: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(institutionId: string, id: string) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: { id, institutionId },
      include: {
        program: true,
        curriculumTerms: {
          orderBy: { sequence: 'asc' },
          include: {
            curriculumCourses: {
              include: {
                course: true
              }
            }
          }
        },
      },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    return curriculum;
  }

  async update(institutionId: string, id: string, updateCurriculumDto: any) {
    const curriculum = await this.findOne(institutionId, id);
    if (curriculum.status !== CurriculumStatus.DRAFT && updateCurriculumDto.status === undefined) {
      throw new BadRequestException('Cannot modify a published or archived curriculum.');
    }
    return this.prisma.curriculum.update({
      where: { id },
      data: updateCurriculumDto,
    });
  }

  async publish(institutionId: string, id: string) {
    const curriculum = await this.findOne(institutionId, id);
    
    // Validation
    if (curriculum.curriculumTerms.length === 0) {
      throw new BadRequestException('Cannot publish a curriculum with no terms.');
    }

    for (const term of curriculum.curriculumTerms) {
      if (term.curriculumCourses.length === 0) {
        throw new BadRequestException(`Term ${term.name} has no courses.`);
      }
    }

    return this.prisma.curriculum.update({
      where: { id },
      data: { status: CurriculumStatus.ACTIVE },
    });
  }
}
