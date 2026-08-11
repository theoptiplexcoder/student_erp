import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus } from '@prisma/client';

@Injectable()
export class CurriculumTermsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createCurriculumTermDto: any) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: { id: createCurriculumTermDto.curriculumId, institutionId }
    });
    
    if (!curriculum) throw new NotFoundException('Curriculum not found');
    if (curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot add terms to a non-draft curriculum');
    }

    return this.prisma.curriculumTerm.create({
      data: {
        ...createCurriculumTermDto,
        institutionId,
      },
    });
  }

  async update(institutionId: string, id: string, updateCurriculumTermDto: any) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id, institutionId },
      include: { curriculum: true }
    });

    if (!term) throw new NotFoundException('Term not found');
    if (term.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot modify terms in a non-draft curriculum');
    }

    return this.prisma.curriculumTerm.update({
      where: { id },
      data: updateCurriculumTermDto,
    });
  }
}
