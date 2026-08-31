import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CourseUncheckedCreateInput) {
    return this.prisma.course.create({ data });
  }

  async findAll(
    institutionId?: string,
    page = 1,
    pageSize = 50,
    search?: string,
    programId?: string,
    termId?: string,
    curriculumId?: string,
    curriculumTermId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.CourseWhereInput = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (programId) {
      where.programId = programId;
    }

    if (curriculumId) {
      where.curriculumCourses = {
        some: {
          curriculumTerm: {
            curriculumId,
          },
        },
      };
    }

    if (curriculumTermId) {
      where.curriculumCourses = {
        some: {
          curriculumTermId,
        },
      };
    }

    if (termId) {
      where.courseOfferings = {
        some: {
          termId,
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          program: true,
          department: true,
          classLevel: true,
          curriculumCourses: {
            include: {
              curriculumTerm: {
                include: {
                  curriculum: {
                    include: {
                      program: true,
                    },
                  },
                },
              },
            },
          },
          courseOfferings: {
            include: {
              term: true,
            },
          },
        },
        orderBy: { code: 'asc' },
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
