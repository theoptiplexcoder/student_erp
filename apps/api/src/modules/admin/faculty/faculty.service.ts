import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async getFaculty(institutionId: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.FacultyWhereInput = {
      institutionId,
      ...(search
        ? {
            OR: [
              { user: { firstName: { contains: search, mode: 'insensitive' } } },
              { user: { lastName: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { teacherCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.faculty.count({ where }),
      this.prisma.faculty.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          department: true,
        },
        orderBy: { user: { lastName: 'asc' } },
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

  async getFacultyById(institutionId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, institutionId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!faculty) {
      throw new Error('Faculty not found');
    }
    return faculty;
  }
}
