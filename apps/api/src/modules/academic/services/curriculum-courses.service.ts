import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus, Prisma } from '@prisma/client';
import { CreateCurriculumCourseDto, UpdateCurriculumCourseDto } from '../dto/curriculum-course.dto';

@Injectable()
export class CurriculumCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkCircularPrerequisites(
    tx: any,
    institutionId: string,
    courseId: string,
    newPrerequisiteIds: string[],
  ) {
    // Basic DFS to detect cycle
    const visited = new Set<string>();
    const stack = new Set<string>();

    const fetchPrereqs = async (cId: string): Promise<string[]> => {
      if (cId === courseId) return newPrerequisiteIds;
      const prereqs = await tx.coursePrerequisite.findMany({
        where: { courseId: cId, institutionId },
        select: { prerequisiteCourseId: true },
      });
      return prereqs.map((p: any) => p.prerequisiteCourseId);
    };

    const dfs = async (node: string) => {
      visited.add(node);
      stack.add(node);

      const prereqs = await fetchPrereqs(node);
      for (const neighbor of prereqs) {
        if (!visited.has(neighbor)) {
          await dfs(neighbor);
        } else if (stack.has(neighbor)) {
          throw new ConflictException(
            `Circular prerequisite detected involving course ID: ${neighbor}`,
          );
        }
      }
      stack.delete(node);
    };

    await dfs(courseId);
  }

  async create(institutionId: string, dto: CreateCurriculumCourseDto) {
    const term = await this.prisma.curriculumTerm.findFirst({
      where: { id: dto.curriculumTermId, institutionId },
      include: { curriculum: true },
    });

    if (!term) throw new NotFoundException('Curriculum term not found');

    if (dto.curriculumId && term.curriculumId !== dto.curriculumId) {
      throw new BadRequestException('Curriculum term does not belong to the provided curriculum');
    }

    if (dto.programId && term.curriculum.programId !== dto.programId) {
      throw new BadRequestException('Curriculum does not belong to the provided program');
    }

    // Check elective group if provided
    if (dto.electiveGroupId) {
      const group = await this.prisma.curriculumElectiveGroup.findFirst({
        where: { id: dto.electiveGroupId, institutionId, curriculumTermId: term.id },
      });
      if (!group) throw new BadRequestException('Elective group not found in this term');
    }

    let targetCourseId = dto.courseId;

    return this.prisma.$transaction(async (tx) => {
      if (!targetCourseId) {
        if (!dto.newCourse) {
          throw new BadRequestException('Either courseId or newCourse must be provided');
        }
        // Find-or-create: if a course with this code already exists, reuse it
        const existingCourse = await tx.course.findFirst({
          where: { institutionId, code: dto.newCourse.code },
        });
        if (existingCourse) {
          targetCourseId = existingCourse.id;
        } else {
          const created = await tx.course.create({
            data: {
              ...dto.newCourse,
              institutionId,
              status: 'ACTIVE',
            },
          });
          targetCourseId = created.id;
        }
      } else {
        const existing = await tx.course.findFirst({
          where: { id: targetCourseId, institutionId },
        });
        if (!existing) {
          throw new BadRequestException('Course not found or does not belong to your institution');
        }
      }

      if (dto.prerequisiteCourseIds && dto.prerequisiteCourseIds.length > 0) {
        await this.checkCircularPrerequisites(
          tx,
          institutionId,
          targetCourseId,
          dto.prerequisiteCourseIds,
        );

        await tx.coursePrerequisite.deleteMany({
          where: { courseId: targetCourseId },
        });

        await tx.coursePrerequisite.createMany({
          data: dto.prerequisiteCourseIds.map((pId) => ({
            institutionId,
            courseId: targetCourseId!,
            prerequisiteCourseId: pId,
          })),
        });
      }

      try {
        const cc = await tx.curriculumCourse.create({
          data: {
            institutionId,
            curriculumTermId: dto.curriculumTermId,
            courseId: targetCourseId,
            sequence: dto.sequence,
            creditValue: dto.creditValue,
            isMandatory: dto.isMandatory ?? true,
            electiveGroupId: dto.electiveGroupId || null,
          },
          include: { course: true },
        });
        return cc;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException(`Course is already in this term or sequence is taken.`);
        }
        throw error;
      }
    });
  }

  async update(institutionId: string, id: string, dto: UpdateCurriculumCourseDto) {
    const cc = await this.prisma.curriculumCourse.findFirst({
      where: { id, institutionId },
      include: { curriculumTerm: { include: { curriculum: true } } },
    });

    if (!cc) throw new NotFoundException('Curriculum course not found');

    // Check elective group if provided
    if (dto.electiveGroupId !== undefined && dto.electiveGroupId !== null) {
      const group = await this.prisma.curriculumElectiveGroup.findFirst({
        where: { id: dto.electiveGroupId, institutionId, curriculumTermId: cc.curriculumTermId },
      });
      if (!group) throw new BadRequestException('Elective group not found in this term');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.prerequisiteCourseIds) {
        await this.checkCircularPrerequisites(
          tx,
          institutionId,
          cc.courseId,
          dto.prerequisiteCourseIds,
        );

        await tx.coursePrerequisite.deleteMany({
          where: { courseId: cc.courseId },
        });

        await tx.coursePrerequisite.createMany({
          data: dto.prerequisiteCourseIds.map((pId) => ({
            institutionId,
            courseId: cc.courseId,
            prerequisiteCourseId: pId,
          })),
        });
      }

      const updateData: any = {};
      if (dto.sequence !== undefined) updateData.sequence = dto.sequence;
      if (dto.creditValue !== undefined) updateData.creditValue = dto.creditValue;
      if (dto.isMandatory !== undefined) updateData.isMandatory = dto.isMandatory;
      if (dto.electiveGroupId !== undefined)
        updateData.electiveGroupId = dto.electiveGroupId || null;

      if (Object.keys(updateData).length > 0) {
        try {
          return await tx.curriculumCourse.update({
            where: { id },
            data: updateData,
            include: { course: true },
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new ConflictException(`Sequence is taken by another course in this term.`);
          }
          throw error;
        }
      }

      return tx.curriculumCourse.findUnique({ where: { id }, include: { course: true } });
    });
  }

  async remove(institutionId: string, id: string) {
    const cc = await this.prisma.curriculumCourse.findFirst({
      where: { id, institutionId },
      include: { curriculumTerm: { include: { curriculum: true } } },
    });

    if (!cc) throw new NotFoundException('Curriculum course not found');

    const curriculum = cc.curriculumTerm.curriculum;

    if (curriculum.status === CurriculumStatus.ACTIVE) {
      const enrollmentsCount = await this.prisma.enrollment.count({
        where: {
          curriculumId: curriculum.id,
          termId: cc.curriculumTerm.id,
        },
      });

      if (enrollmentsCount > 0) {
        throw new ConflictException(
          'Cannot delete curriculum course: enrollments already reference this active curriculum term.',
        );
      }
    }

    return this.prisma.curriculumCourse.delete({
      where: { id },
    });
  }
}
