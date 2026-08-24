import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus, Prisma } from '@prisma/client';
import {
  CreateCurriculumElectiveGroupDto,
  UpdateCurriculumElectiveGroupDto,
} from '../dto/curriculum-elective-group.dto';

@Injectable()
export class CurriculumElectiveGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, dto: CreateCurriculumElectiveGroupDto) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id: dto.curriculumTermId, institutionId },
      include: { curriculum: true },
    });

    if (!term) throw new NotFoundException('Term not found');
    if (term.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot add elective groups to a non-draft curriculum');
    }

    try {
      return await this.prisma.curriculumElectiveGroup.create({
        data: {
          institutionId,
          curriculumTermId: dto.curriculumTermId,
          name: dto.name,
          requiredCredits: dto.requiredCredits,
          requiredCourses: dto.requiredCourses,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`An elective group with this name already exists in the term.`);
      }
      throw error;
    }
  }

  async update(institutionId: string, id: string, dto: UpdateCurriculumElectiveGroupDto) {
    const group = await this.prisma.curriculumElectiveGroup.findFirst({
      where: { id, institutionId },
      include: { curriculumTerm: { include: { curriculum: true } } },
    });

    if (!group) throw new NotFoundException('Elective group not found');
    if (group.curriculumTerm.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot modify elective groups in a non-draft curriculum');
    }

    try {
      return await this.prisma.curriculumElectiveGroup.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`An elective group with this name already exists in the term.`);
      }
      throw error;
    }
  }

  async remove(institutionId: string, id: string) {
    const group = await this.prisma.curriculumElectiveGroup.findFirst({
      where: { id, institutionId },
      include: { curriculumTerm: { include: { curriculum: true } } },
    });

    if (!group) throw new NotFoundException('Elective group not found');
    if (group.curriculumTerm.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot delete elective groups from a non-draft curriculum');
    }

    return this.prisma.curriculumElectiveGroup.delete({
      where: { id },
    });
  }
}
