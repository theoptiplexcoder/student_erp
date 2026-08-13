import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId?: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ExamWhereInput = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          academicYear: true,
          term: true,
        },
        orderBy: { createdAt: 'desc' },
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

  async findResults(institutionId?: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.MarkWhereInput = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    // if (search) {
    //   where.student = {
    //     user: {
    //       OR: [
    //         { firstName: { contains: search, mode: 'insensitive' } },
    //         { lastName: { contains: search, mode: 'insensitive' } },
    //       ]
    //     }
    //   }
    // }

    const [total, data] = await Promise.all([
      this.prisma.mark.count({ where }),
      this.prisma.mark.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: {
            include: { user: true },
          },
          examCourse: {
            include: { exam: true, course: true },
          },
        },
        orderBy: { id: 'desc' },
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
}
