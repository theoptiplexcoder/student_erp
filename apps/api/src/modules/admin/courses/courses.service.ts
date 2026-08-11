import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CourseUncheckedCreateInput) {
    return this.prisma.course.create({ data });
  }

  async findAll(institutionId?: string) {
    const where: Prisma.CourseWhereInput = {};
    if (institutionId) {
      where.institutionId = institutionId;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        program: true,
        department: true,
        classLevel: true,
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        program: true,
        department: true,
        classLevel: true,
        courseOfferings: {
          include: {
            term: true,
            program: true,
            batch: true,
            section: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
