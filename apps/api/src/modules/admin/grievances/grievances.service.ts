import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminGrievancesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    institutionId: string,
    page = 1,
    pageSize = 50,
    source?: string,
    category?: string,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.GrievanceWhereInput = { institutionId };

    if (source && source !== 'ALL') {
      where.source = source as any;
    }

    if (category && category !== 'ALL') {
      where.category = category as any;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { id: { equals: search } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.grievance.count({ where }),
      this.prisma.grievance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          faculty: {
            include: {
              user: true,
            },
          },
        },
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
    const grievance = await this.prisma.grievance.findFirst({
      where: { id, institutionId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        faculty: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!grievance) throw new NotFoundException('Grievance not found');
    return grievance;
  }

  async updateStatus(institutionId: string, id: string, status: string) {
    const grievance = await this.prisma.grievance.findFirst({
      where: { id, institutionId },
    });
    if (!grievance) throw new NotFoundException('Grievance not found');

    return this.prisma.grievance.update({
      where: { id },
      data: { status },
    });
  }
}
