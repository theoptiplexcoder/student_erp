import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProgramDto } from './dto/create-program.dto';

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

    const data = await this.prisma.program.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: { students: true, courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      data,
      meta: {
        total: data.length,
        page: 1,
        pageSize: data.length,
        totalPages: 1,
      },
    };
  }
}
