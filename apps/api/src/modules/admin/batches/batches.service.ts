import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createBatchDto: CreateBatchDto) {
    const { startDate, expectedEndDate, ...rest } = createBatchDto;
    return this.prisma.batch.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        institutionId,
      },
    });
  }

  async findAll(
    institutionId: string,
    page = 1,
    pageSize = 50,
    search?: string,
    programId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.BatchWhereInput = {
      institutionId,
      ...(programId ? { programId } : {}),
      ...(search
        ? {
            OR: [{ name: { contains: search, mode: 'insensitive' } }],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.batch.count({ where }),
      this.prisma.batch.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          program: true,
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
    const batch = await this.prisma.batch.findFirst({
      where: { id, institutionId },
      include: {
        program: true,
      },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async update(institutionId: string, id: string, updateBatchDto: UpdateBatchDto) {
    await this.findOne(institutionId, id);
    const { startDate, expectedEndDate, ...rest } = updateBatchDto;

    const data: any = { ...rest };
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (expectedEndDate !== undefined)
      data.expectedEndDate = expectedEndDate ? new Date(expectedEndDate) : null;

    return this.prisma.batch.update({
      where: { id },
      data,
    });
  }

  async remove(institutionId: string, id: string) {
    await this.findOne(institutionId, id);
    return this.prisma.batch.delete({
      where: { id },
    });
  }
}
