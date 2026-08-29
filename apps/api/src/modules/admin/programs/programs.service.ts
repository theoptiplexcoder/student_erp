import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProgram(institutionId: string, dto: CreateProgramDto) {
    // Verify department belongs to institution
    const department = await this.prisma.department.findFirst({
      where: { id: dto.departmentId, institutionId },
    });

    if (!department) {
      throw new NotFoundException('Department not found or does not belong to your institution');
    }

    // Verify uniqueness of code within institution
    const existingCode = await this.prisma.program.findFirst({
      where: { code: dto.code, institutionId },
    });

    if (existingCode) {
      throw new BadRequestException('A program with this code already exists in your institution');
    }

    return this.prisma.program.create({
      data: {
        institutionId,
        departmentId: dto.departmentId,
        name: dto.name,
        code: dto.code,
        level: dto.level,
        durationYears: dto.durationYears,
      },
    });
  }

  async getProgramById(institutionId: string, id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, institutionId },
      include: {
        department: true,
        curriculums: {
          orderBy: { versionNumber: 'desc' },
        },
        _count: {
          select: { students: true, courses: true },
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
          _count: {
            select: { students: true, courses: true },
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

    return this.prisma.program.update({
      where: { id },
      data: dto,
    });
  }

  async removeProgram(institutionId: string, id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, institutionId },
      include: {
        _count: {
          select: {
            students: true,
            courses: true,
            curriculums: true,
            sections: true,
            enrollments: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program._count) {
      const { students, courses, curriculums, sections, enrollments } = program._count;
      if (students > 0 || courses > 0 || curriculums > 0 || sections > 0 || enrollments > 0) {
        throw new BadRequestException(
          `Cannot delete program. It has dependent records (${students} students, ${courses} courses, ${curriculums} curriculums, ${sections} sections, ${enrollments} enrollments).`,
        );
      }
    }

    return this.prisma.program.delete({
      where: { id },
    });
  }
}
