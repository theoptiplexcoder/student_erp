import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createDepartmentDto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        ...createDepartmentDto,
        institutionId,
      },
    });
  }

  async findAll(institutionId: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.DepartmentWhereInput = {
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
      this.prisma.department.count({ where }),
      this.prisma.department.findMany({
        where,
        skip,
        take: pageSize,
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
    const department = await this.prisma.department.findFirst({
      where: { id, institutionId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(institutionId: string, id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(institutionId, id);
    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(institutionId: string, id: string) {
    await this.findOne(institutionId, id);
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
