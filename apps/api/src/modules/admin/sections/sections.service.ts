import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createSectionDto: CreateSectionDto) {
    return this.prisma.section.create({
      data: {
        ...createSectionDto,
        institutionId,
      },
    });
  }

  async findAll(
    institutionId: string,
    page = 1,
    pageSize = 50,
    search?: string,
    batchId?: string,
    programId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.SectionWhereInput = {
      institutionId,
      ...(batchId ? { batchId } : {}),
      ...(programId ? { programId } : {}),
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
      this.prisma.section.count({ where }),
      this.prisma.section.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          program: true,
          batch: true,
          classLevel: true,
          academicYear: true,
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

  async findOne(institutionId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, institutionId },
      include: {
        program: true,
        batch: true,
        classLevel: true,
        academicYear: true,
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
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return section;
  }

  async update(institutionId: string, id: string, updateSectionDto: UpdateSectionDto) {
    await this.findOne(institutionId, id);
    return this.prisma.section.update({
      where: { id },
      data: updateSectionDto,
    });
  }

  async remove(institutionId: string, id: string) {
    await this.findOne(institutionId, id);
    return this.prisma.section.delete({
      where: { id },
    });
  }
}
