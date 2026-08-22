import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

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
