import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurriculumStatus } from '@prisma/client';
import { CreateCurriculumDto, UpdateCurriculumDto } from '../dto/curriculum.dto';
import { DuplicateCurriculumDto, ImportCurriculumDto } from '../dto/curriculum-operations.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CurriculumsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, dto: CreateCurriculumDto) {
    const programIds =
      dto.programIds && dto.programIds.length > 0
        ? dto.programIds
        : dto.programId
          ? [dto.programId]
          : [];

    if (programIds.length > 0) {
      const validPrograms = await this.prisma.program.findMany({
        where: { id: { in: programIds }, institutionId },
      });
      if (validPrograms.length !== programIds.length) {
        throw new BadRequestException(
          'One or more selected programs do not exist in your institution.',
        );
      }
    }

    let versionNumber = dto.versionNumber;
    if (!versionNumber) {
      const existingCount = await this.prisma.curriculum.count({
        where: { institutionId },
      });
      versionNumber = `v${existingCount + 1}.0`;
    }

    try {
      return await this.prisma.curriculum.create({
        data: {
          institutionId,
          versionNumber,
          name: dto.name,
          effectiveFrom: new Date(dto.effectiveFrom),
          status: CurriculumStatus.DRAFT,
          ...(programIds.length > 0
            ? {
                programs: {
                  connect: programIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
        include: {
          programs: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `A curriculum with name "${dto.name}" and version "${versionNumber}" already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll(institutionId: string) {
    return this.prisma.curriculum.findMany({
      where: { institutionId },
      include: {
        programs: true,
        _count: {
          select: { curriculumTerms: true, students: true, enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProgram(institutionId: string, programId: string) {
    return this.prisma.curriculum.findMany({
      where: {
        institutionId,
        programs: {
          some: { id: programId },
        },
      },
      include: {
        programs: true,
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
        programs: true,
        curriculumTerms: {
          orderBy: { sequence: 'asc' },
          include: {
            electiveGroups: true,
            curriculumCourses: {
              orderBy: { sequence: 'asc' },
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    return curriculum;
  }

  async update(institutionId: string, id: string, dto: UpdateCurriculumDto) {
    const curriculum = await this.findOne(institutionId, id);
    if (
      curriculum.status !== CurriculumStatus.DRAFT &&
      Object.keys(dto).some((k) => k !== 'status' && k !== 'programIds')
    ) {
      throw new ConflictException('Cannot modify an active or archived curriculum.');
    }

    const { programIds, ...restDto } = dto;

    if (programIds && programIds.length > 0) {
      const validPrograms = await this.prisma.program.findMany({
        where: { id: { in: programIds }, institutionId },
      });
      if (validPrograms.length !== programIds.length) {
        throw new BadRequestException(
          'One or more selected programs do not exist in your institution.',
        );
      }
    }

    try {
      return await this.prisma.curriculum.update({
        where: { id },
        data: {
          name: restDto.name,
          versionNumber: restDto.versionNumber,
          effectiveFrom: restDto.effectiveFrom ? new Date(restDto.effectiveFrom) : undefined,
          status: restDto.status,
          ...(programIds !== undefined
            ? {
                programs: {
                  set: programIds.map((pId) => ({ id: pId })),
                },
              }
            : {}),
        },
        include: {
          programs: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`A curriculum with this version number already exists.`);
      }
      throw error;
    }
  }

  async validateCurriculum(institutionId: string, id: string) {
    const curriculum = await this.findOne(institutionId, id);
    const results: { level: 'error' | 'warning'; message: string }[] = [];

    if (curriculum.curriculumTerms.length === 0) {
      results.push({ level: 'error', message: 'Curriculum must have at least one term.' });
    }

    for (const term of curriculum.curriculumTerms) {
      if (term.curriculumCourses.length === 0) {
        results.push({ level: 'error', message: `Term '${term.name}' has no courses.` });
      }
      const mandatoryCredits = term.curriculumCourses
        .filter((cc) => cc.isMandatory)
        .reduce((sum, cc) => sum + (cc.creditValue || cc.course.creditValue || 0), 0);

      if (term.creditRequirement && mandatoryCredits < term.creditRequirement) {
        results.push({
          level: 'warning',
          message: `Term '${term.name}' mandatory courses provide ${mandatoryCredits} credits, but requirement is ${term.creditRequirement}.`,
        });
      }
    }

    return results;
  }

  async activateCurriculum(institutionId: string, id: string) {
    const curriculum = await this.findOne(institutionId, id);
    if (curriculum.status === CurriculumStatus.ACTIVE) {
      return curriculum;
    }

    const validation = await this.validateCurriculum(institutionId, id);
    const errors = validation.filter((v) => v.level === 'error');
    if (errors.length > 0) {
      throw new ConflictException({
        message: 'Curriculum validation failed',
        errors,
      });
    }

    return this.prisma.curriculum.update({
      where: { id },
      data: { status: CurriculumStatus.ACTIVE },
    });
  }

  async remove(institutionId: string, id: string) {
    const curriculum = await this.findOne(institutionId, id);
    if (curriculum.status === CurriculumStatus.ACTIVE) {
      throw new ConflictException('Cannot delete an ACTIVE curriculum. Archive it instead.');
    }
    const enrollmentsCount = await this.prisma.enrollment.count({ where: { curriculumId: id } });
    const studentsCount = await this.prisma.student.count({ where: { curriculumId: id } });
    if (enrollmentsCount > 0 || studentsCount > 0) {
      throw new ConflictException(
        'Cannot delete curriculum: it is currently referenced by students or enrollments.',
      );
    }
    return this.prisma.curriculum.delete({ where: { id } });
  }

  async duplicate(institutionId: string, id: string, dto: DuplicateCurriculumDto) {
    const existing = await this.findOne(institutionId, id);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create new draft curriculum
        const clonedCurriculum = await tx.curriculum.create({
          data: {
            institutionId,
            name: existing.name,
            versionNumber: dto.versionNumber,
            effectiveFrom: new Date(dto.effectiveFrom),
            status: CurriculumStatus.DRAFT,
            ...(existing.programs?.length > 0
              ? {
                  programs: {
                    connect: existing.programs.map((p) => ({ id: p.id })),
                  },
                }
              : {}),
          },
          include: {
            programs: true,
          },
        });

        // Clone terms & courses
        for (const term of existing.curriculumTerms) {
          const clonedTerm = await tx.curriculumTerm.create({
            data: {
              institutionId,
              curriculumId: clonedCurriculum.id,
              name: term.name,
              sequence: term.sequence,
              creditRequirement: term.creditRequirement,
            },
          });

          // Clone elective groups
          const clonedGroupsMap: Record<string, string> = {};
          if (term.electiveGroups && term.electiveGroups.length > 0) {
            for (const eg of term.electiveGroups) {
              const clonedEg = await tx.curriculumElectiveGroup.create({
                data: {
                  institutionId,
                  curriculumTermId: clonedTerm.id,
                  name: eg.name,
                  requiredCredits: eg.requiredCredits,
                  requiredCourses: eg.requiredCourses,
                },
              });
              clonedGroupsMap[eg.id] = clonedEg.id;
            }
          }

          if (term.curriculumCourses.length > 0) {
            await tx.curriculumCourse.createMany({
              data: term.curriculumCourses.map((cc) => ({
                institutionId,
                curriculumTermId: clonedTerm.id,
                courseId: cc.courseId,
                sequence: cc.sequence,
                creditValue: cc.creditValue,
                isMandatory: cc.isMandatory,
                electiveGroupId: cc.electiveGroupId ? clonedGroupsMap[cc.electiveGroupId] : null,
              })),
            });
          }
        }

        return clonedCurriculum;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `A curriculum with version ${dto.versionNumber} already exists.`,
        );
      }
      throw error;
    }
  }

  async exportCurriculum(institutionId: string, id: string) {
    const existing = await this.findOne(institutionId, id);

    // Format into a clean JSON structure that matches ImportCurriculumDto
    const exportData = {
      programIds: existing.programs.map((p) => p.id),
      name: existing.name,
      versionNumber: existing.versionNumber,
      effectiveFrom: existing.effectiveFrom,
      terms: existing.curriculumTerms.map((term) => ({
        name: term.name,
        sequence: term.sequence,
        creditRequirement: term.creditRequirement,
        electiveGroups: term.electiveGroups.map((eg) => ({
          name: eg.name,
          requiredCredits: eg.requiredCredits,
          requiredCourses: eg.requiredCourses,
        })),
        courses: term.curriculumCourses.map((cc) => ({
          code: cc.course.code,
          sequence: cc.sequence,
          creditValue: cc.creditValue,
          isMandatory: cc.isMandatory,
          electiveGroupName: cc.electiveGroupId
            ? term.electiveGroups.find((eg) => eg.id === cc.electiveGroupId)?.name
            : null,
        })),
      })),
    };

    return exportData;
  }

  async importCurriculum(institutionId: string, dto: ImportCurriculumDto) {
    const programIds =
      dto.programIds && dto.programIds.length > 0
        ? dto.programIds
        : dto.programId
          ? [dto.programId]
          : [];

    if (programIds.length > 0) {
      const validPrograms = await this.prisma.program.findMany({
        where: { id: { in: programIds }, institutionId },
      });
      if (validPrograms.length !== programIds.length) {
        throw new BadRequestException('One or more selected programs not found.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.create({
        data: {
          institutionId,
          name: dto.name,
          versionNumber: dto.versionNumber,
          effectiveFrom: new Date(dto.effectiveFrom),
          status: CurriculumStatus.DRAFT,
          ...(programIds.length > 0
            ? {
                programs: {
                  connect: programIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
        include: {
          programs: true,
        },
      });

      for (const termDto of dto.terms) {
        const term = await tx.curriculumTerm.create({
          data: {
            institutionId,
            curriculumId: curriculum.id,
            name: termDto.name,
            sequence: termDto.sequence,
            creditRequirement: termDto.creditRequirement,
          },
        });

        const createdGroups: Record<string, string> = {};
        if (termDto.electiveGroups) {
          for (const eg of termDto.electiveGroups) {
            const group = await tx.curriculumElectiveGroup.create({
              data: {
                institutionId,
                curriculumTermId: term.id,
                name: eg.name,
                requiredCredits: eg.requiredCredits,
                requiredCourses: eg.requiredCourses,
              },
            });
            createdGroups[group.name] = group.id;
          }
        }

        for (const courseDto of termDto.courses) {
          const course = await tx.course.findFirst({
            where: { code: courseDto.code, institutionId },
          });

          if (!course) {
            throw new BadRequestException(
              `Course with code ${courseDto.code} not found during import.`,
            );
          }

          await tx.curriculumCourse.create({
            data: {
              institutionId,
              curriculumTermId: term.id,
              courseId: course.id,
              sequence: courseDto.sequence,
              creditValue: courseDto.creditValue,
              isMandatory: courseDto.isMandatory ?? true,
              electiveGroupId: courseDto.electiveGroupName
                ? createdGroups[courseDto.electiveGroupName]
                : null,
            },
          });
        }
      }

      return curriculum;
    });
  }
}
