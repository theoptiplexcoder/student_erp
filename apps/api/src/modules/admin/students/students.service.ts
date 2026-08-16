import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId: string, query: StudentQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      search,
      programId,
      batchId,
      sectionId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {
      institutionId,
      ...(status && { lifecycleStatus: status }),
      ...(programId && { programId }),
      ...(batchId && { enrollments: { some: { batchId, status: 'ACTIVE' } } }),
      ...(sectionId && { sectionId }),
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { studentCode: { contains: search, mode: 'insensitive' } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          user: true,
          program: true,
          section: true,
        },
        skip,
        take: pageSize,
        orderBy: sortBy === 'name' ? { user: { firstName: sortOrder } } : { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
      include: {
        user: true,
        program: true,
        section: true,
        enrollments: {
          include: {
            course: true,
            term: true,
          },
        },
        attendanceRecords: {
          take: 5,
          orderBy: { markedAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }
}
