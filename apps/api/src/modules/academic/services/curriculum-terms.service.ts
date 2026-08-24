import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus, Prisma } from '@prisma/client';
import { CreateCurriculumTermDto, UpdateCurriculumTermDto } from '../dto/curriculum-term.dto';

@Injectable()
export class CurriculumTermsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSections(institutionId: string, id: string) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id, institutionId },
      include: { curriculum: true },
    });
    if (!term) throw new NotFoundException('Curriculum term not found');

    const sections = await this.prisma.section.findMany({
      where: {
        institutionId,
        programId: term.curriculum.programId,
        semester: term.sequence,
      },
      include: {
        batch: true,
        courseAssignments: {
          include: {
            course: true,
            faculty: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    return sections;
  }

  async create(institutionId: string, dto: CreateCurriculumTermDto) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: { id: dto.curriculumId, institutionId },
    });

    if (!curriculum) throw new NotFoundException('Curriculum not found');
    if (curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot add terms to a non-draft curriculum');
    }

    try {
      return await this.prisma.curriculumTerm.create({
        data: {
          institutionId,
          curriculumId: dto.curriculumId,
          name: dto.name,
          sequence: dto.sequence,
          creditRequirement: dto.creditRequirement,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `A term with this sequence or name already exists in the curriculum.`,
        );
      }
      throw error;
    }
  }

  async update(institutionId: string, id: string, dto: UpdateCurriculumTermDto) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id, institutionId },
      include: { curriculum: true },
    });

    if (!term) throw new NotFoundException('Term not found');
    if (term.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot modify terms in a non-draft curriculum');
    }

    try {
      return await this.prisma.curriculumTerm.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `A term with this sequence or name already exists in the curriculum.`,
        );
      }
      throw error;
    }
  }

  async remove(institutionId: string, id: string) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id, institutionId },
      include: { curriculum: true },
    });

    if (!term) throw new NotFoundException('Term not found');
    if (term.curriculum.status !== CurriculumStatus.DRAFT) {
      throw new BadRequestException('Cannot delete terms from a non-draft curriculum');
    }

    // Ensure it's not referenced by enrollments... actually deleting a draft curriculum term is totally fine
    // since the curriculum is DRAFT, there should be no enrollments mapped to a draft curriculum.
    return this.prisma.curriculumTerm.delete({
      where: { id },
    });
  }
}
