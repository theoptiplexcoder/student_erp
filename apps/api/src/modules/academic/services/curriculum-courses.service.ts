import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus } from '@prisma/client';

@Injectable()
export class CurriculumCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDraft(institutionId: string, termId: string) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id: termId, institutionId },
      include: { curriculum: true },
    });
    if (!term) throw new NotFoundException('Term not found');
    if (term.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot modify courses in a non-draft curriculum');
    }
  }

  async create(institutionId: string, createCurriculumCourseDto: any) {
    await this.ensureDraft(institutionId, createCurriculumCourseDto.curriculumTermId);
    return this.prisma.curriculumCourse.create({
      data: {
        ...createCurriculumCourseDto,
        institutionId,
      },
      include: { course: true },
    });
  }

  async update(institutionId: string, id: string, updateCurriculumCourseDto: any) {
    const cc = await this.prisma.curriculumCourse.findFirst({ where: { id, institutionId } });
    if (!cc) throw new NotFoundException();
    await this.ensureDraft(institutionId, cc.curriculumTermId);

    return this.prisma.curriculumCourse.update({
      where: { id },
      data: updateCurriculumCourseDto,
    });
  }

  async remove(institutionId: string, id: string) {
    const cc = await this.prisma.curriculumCourse.findFirst({ where: { id, institutionId } });
    if (!cc) throw new NotFoundException();
    await this.ensureDraft(institutionId, cc.curriculumTermId);

    return this.prisma.curriculumCourse.delete({
      where: { id },
    });
  }
}
