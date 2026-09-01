import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateFeeStructureDto } from '../dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from '../dto/update-fee-structure.dto';

@Injectable()
export class FeeStructureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, dto: CreateFeeStructureDto) {
    const totalAmount =
      dto.totalAmount !== undefined
        ? dto.totalAmount
        : (dto.components || []).reduce((sum, c) => sum + (c.amount || 0), 0);

    return this.prisma.$transaction(async (tx) => {
      const feeStructure = await tx.feeStructure.create({
        data: {
          institutionId,
          name: dto.name,
          code: dto.code,
          programId: dto.programId || null,
          batchId: dto.batchId || null,
          academicYearId: dto.academicYearId,
          totalAmount,
          currency: dto.currency || 'INR',
          components: {
            create: (dto.components || []).map((c) => ({
              name: c.name,
              type: c.type,
              amount: c.amount,
              isOptional: c.isOptional ?? false,
              description: c.description,
            })),
          },
        },
        include: {
          components: true,
          program: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true, startDate: true, endDate: true } },
        },
      });

      return feeStructure;
    });
  }

  async findAll(
    institutionId: string,
    filters?: {
      programId?: string;
      batchId?: string;
      academicYearId?: string;
      isActive?: boolean;
    },
  ) {
    const where: any = { institutionId };
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.batchId) where.batchId = filters.batchId;
    if (filters?.academicYearId) where.academicYearId = filters.academicYearId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.feeStructure.findMany({
      where,
      include: {
        components: true,
        program: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        _count: {
          select: {
            feePlans: true,
            components: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(institutionId: string, id: string) {
    const structure = await this.prisma.feeStructure.findFirst({
      where: { id, institutionId },
      include: {
        components: true,
        program: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true, startDate: true, endDate: true } },
        _count: {
          select: {
            feePlans: true,
          },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }

    return structure;
  }

  async update(institutionId: string, id: string, dto: UpdateFeeStructureDto) {
    await this.findOne(institutionId, id);

    return this.prisma.$transaction(async (tx) => {
      // If components provided, delete existing and recreate
      if (dto.components) {
        await tx.feeComponent.deleteMany({
          where: { feeStructureId: id },
        });

        await tx.feeComponent.createMany({
          data: dto.components.map((c) => ({
            feeStructureId: id,
            name: c.name,
            type: c.type,
            amount: c.amount,
            isOptional: c.isOptional ?? false,
            description: c.description,
          })),
        });
      }

      return tx.feeStructure.update({
        where: { id },
        data: {
          name: dto.name,
          code: dto.code,
          programId: dto.programId,
          batchId: dto.batchId,
          academicYearId: dto.academicYearId,
          totalAmount: dto.totalAmount,
          currency: dto.currency,
          isActive: dto.isActive,
        },
        include: {
          components: true,
          program: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
        },
      });
    });
  }

  async remove(institutionId: string, id: string) {
    const structure = await this.findOne(institutionId, id);

    const plansCount = await this.prisma.studentFeePlan.count({
      where: { feeStructureId: id },
    });

    if (plansCount > 0) {
      // Soft-delete by setting isActive to false
      return this.prisma.feeStructure.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.feeStructure.delete({
      where: { id },
    });
  }
}
