import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { DeleteProgramDto } from './dto/delete-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProgram(institutionId: string, dto: CreateProgramDto) {
    // If departmentId is provided, verify it belongs to institution
    if (dto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, institutionId },
      });

      if (!department) {
        throw new NotFoundException('Department not found or does not belong to your institution');
      }
    }

    // Verify uniqueness of code within institution
    const existingCode = await this.prisma.program.findFirst({
      where: { code: dto.code, institutionId },
    });

    if (existingCode) {
      throw new BadRequestException('A program with this code already exists in your institution');
    }

    const { courseIds, ...programData } = dto;

    return this.prisma.program.create({
      data: {
        institutionId,
        departmentId: programData.departmentId || null,
        name: programData.name,
        code: programData.code,
        level: programData.level,
        durationYears: programData.durationYears,
        ...(courseIds && courseIds.length > 0
          ? {
              courses: {
                connect: courseIds.map((cId) => ({ id: cId })),
              },
            }
          : {}),
      },
      include: {
        department: true,
        courses: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async getProgramById(institutionId: string, id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, institutionId },
      include: {
        department: true,
        courses: {
          include: {
            department: true,
          },
        },
        curriculums: {
          orderBy: { versionNumber: 'desc' },
        },
        _count: {
          select: {
            students: true,
            courses: true,
            curriculums: true,
            sections: true,
            batches: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async getPrograms(institutionId: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ProgramWhereInput = {
      institutionId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.program.count({ where }),
      this.prisma.program.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          department: true,
          courses: {
            include: {
              department: true,
            },
          },
          _count: {
            select: {
              students: true,
              courses: true,
              curriculums: true,
              sections: true,
              batches: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateProgram(institutionId: string, id: string, dto: UpdateProgramDto) {
    const program = await this.getProgramById(institutionId, id);

    if (dto.departmentId && dto.departmentId !== program.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, institutionId },
      });
      if (!department) {
        throw new NotFoundException('Department not found or does not belong to your institution');
      }
    }

    if (dto.code && dto.code !== program.code) {
      const existingCode = await this.prisma.program.findFirst({
        where: { code: dto.code, institutionId },
      });
      if (existingCode) {
        throw new BadRequestException(
          'A program with this code already exists in your institution',
        );
      }
    }

    const { courseIds, ...updateData } = dto;

    return this.prisma.program.update({
      where: { id },
      data: {
        ...updateData,
        ...(courseIds !== undefined
          ? {
              courses: {
                set: courseIds.map((cId) => ({ id: cId })),
              },
            }
          : {}),
      },
      include: {
        department: true,
        courses: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async removeProgram(institutionId: string, id: string, dto?: DeleteProgramDto) {
    const program = await this.prisma.program.findFirst({
      where: { id, institutionId },
      include: {
        courses: { select: { id: true, programOfferings: { select: { id: true } } } },
        curriculums: { select: { id: true, programs: { select: { id: true } } } },
        _count: {
          select: {
            students: true,
            courses: true,
            curriculums: true,
            sections: true,
            enrollments: true,
            batches: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const { students, enrollments, sections, batches } = program._count;

    if (students > 0 || enrollments > 0) {
      throw new BadRequestException(
        `Cannot delete program. It has active students (${students}) or student enrollments (${enrollments}). Please reassign or graduate students first.`,
      );
    }

    if (sections > 0 && !dto?.deleteSections) {
      throw new BadRequestException(
        `Cannot delete program. It has ${sections} linked sections. Choose whether to delete sections or reassign them first.`,
      );
    }

    if (batches > 0 && !dto?.deleteBatches) {
      throw new BadRequestException(
        `Cannot delete program. It has ${batches} linked batches. Choose whether to delete batches or reassign them first.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Unlink foreign keys pointing to this program (for tables where program_id is optional)
      await tx.calendarEvent.updateMany({
        where: { programId: id, institutionId },
        data: { programId: null },
      });

      await tx.feeStructure.updateMany({
        where: { programId: id, institutionId },
        data: { programId: null },
      });

      await tx.courseOffering.updateMany({
        where: { programId: id, institutionId },
        data: { programId: null },
      });

      // 2. Handle sections
      if (dto?.deleteSections) {
        // Find sections belonging to this program to cleanly clean up dependent references
        const sectionsToDelete = await tx.section.findMany({
          where: { programId: id, institutionId },
          select: { id: true },
        });
        const sectionIds = sectionsToDelete.map((s) => s.id);

        if (sectionIds.length > 0) {
          // Unlink or delete foreign relations pointing to these sections
          // Nullable sectionId relations:
          await tx.student.updateMany({
            where: { sectionId: { in: sectionIds }, institutionId },
            data: { sectionId: null },
          });

          await tx.enrollment.updateMany({
            where: { sectionId: { in: sectionIds }, institutionId },
            data: { sectionId: null },
          });

          await tx.courseOffering.updateMany({
            where: { sectionId: { in: sectionIds }, institutionId },
            data: { sectionId: null },
          });

          await tx.calendarEvent.updateMany({
            where: { sectionId: { in: sectionIds }, institutionId },
            data: { sectionId: null },
          });

          // Non-nullable sectionId relations:
          await tx.facultySection.deleteMany({
            where: { sectionId: { in: sectionIds }, institutionId },
          });

          await tx.courseAssignment.deleteMany({
            where: { sectionId: { in: sectionIds }, institutionId },
          });

          // Session occurrences and attendance records
          await tx.attendanceRecord.deleteMany({
            where: {
              attendanceSession: {
                sectionId: { in: sectionIds },
              },
            },
          });

          await tx.attendanceSession.deleteMany({
            where: { sectionId: { in: sectionIds }, institutionId },
          });

          await tx.sessionOccurrence.deleteMany({
            where: { sectionId: { in: sectionIds }, institutionId },
          });

          await tx.timetableEntry.deleteMany({
            where: { sectionId: { in: sectionIds }, institutionId },
          });

          await tx.lessonPlanSection.deleteMany({
            where: { sectionId: { in: sectionIds } },
          });

          await tx.section.deleteMany({
            where: { id: { in: sectionIds }, institutionId },
          });
        }
      } else {
        await tx.section.updateMany({
          where: { programId: id, institutionId },
          data: { programId: null },
        });
      }

      // 3. Handle batches (Batch has non-nullable program_id, so if deleted it deletes; if any exist they must have been authorized to delete)
      if (dto?.deleteBatches) {
        await tx.batch.deleteMany({
          where: { programId: id, institutionId },
        });
      }

      // 4. Handle courses
      // First disconnect all courses from this program
      await tx.program.update({
        where: { id },
        data: {
          courses: {
            set: [],
          },
        },
      });

      if (dto?.deleteCourses) {
        // If deleteCourses is true, delete only courses that are exclusively linked to this program
        const exclusiveCourseIds = program.courses
          .filter((c) => c.programOfferings.length <= 1)
          .map((c) => c.id);

        if (exclusiveCourseIds.length > 0) {
          await tx.course.deleteMany({
            where: { id: { in: exclusiveCourseIds }, institutionId },
          });
        }
      }

      // 5. Handle curriculums
      // First disconnect all curriculums from this program
      await tx.program.update({
        where: { id },
        data: {
          curriculums: {
            set: [],
          },
        },
      });

      if (dto?.deleteCurriculums) {
        // If deleteCurriculums is true, delete only curriculums that are exclusively linked to this program
        const exclusiveCurriculumIds = program.curriculums
          .filter((c) => c.programs.length <= 1)
          .map((c) => c.id);

        if (exclusiveCurriculumIds.length > 0) {
          await tx.curriculum.deleteMany({
            where: { id: { in: exclusiveCurriculumIds }, institutionId },
          });
        }
      }

      // 6. Finally delete the program
      return tx.program.delete({
        where: { id },
      });
    });
  }
}
