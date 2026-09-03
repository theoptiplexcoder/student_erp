import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateFacultySectionDto } from './dto/create-faculty-section.dto';
import { UpdateFacultySectionDto } from './dto/update-faculty-section.dto';

@Injectable()
export class FacultySectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, dto: CreateFacultySectionDto) {
    const { facultyId, sectionId, academicYearId, role, isPrimary } = dto;

    const [faculty, section, academicYear] = await Promise.all([
      this.prisma.faculty.findUnique({ where: { id: facultyId } }),
      this.prisma.section.findUnique({ where: { id: sectionId } }),
      this.prisma.academicYear.findUnique({ where: { id: academicYearId } }),
    ]);

    if (!faculty || faculty.institutionId !== institutionId) {
      throw new NotFoundException('Faculty not found in this institution');
    }
    if (!section || section.institutionId !== institutionId) {
      throw new NotFoundException('Section not found in this institution');
    }
    if (!academicYear || academicYear.institutionId !== institutionId) {
      throw new NotFoundException('Academic year not found in this institution');
    }

    // If isPrimary is set, unset any existing primary assignment for this section & academic year
    if (isPrimary) {
      await this.prisma.facultySection.updateMany({
        where: {
          institutionId,
          sectionId,
          academicYearId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    try {
      return await this.prisma.facultySection.create({
        data: {
          institutionId,
          facultyId,
          sectionId,
          academicYearId,
          role,
          isPrimary: isPrimary ?? false,
        },
        include: {
          faculty: {
            include: {
              user: true,
              department: true,
            },
          },
          section: true,
          academicYear: true,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('This faculty section assignment already exists');
      }
      throw e;
    }
  }

  async findAll(
    institutionId: string,
    query: { sectionId?: string; facultyId?: string; academicYearId?: string },
  ) {
    const where: any = { institutionId };
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.facultyId) where.facultyId = query.facultyId;
    if (query.academicYearId) where.academicYearId = query.academicYearId;

    return this.prisma.facultySection.findMany({
      where,
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
        section: true,
        academicYear: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findUnassigned(institutionId: string, sectionId: string, academicYearId: string) {
    const assigned = await this.prisma.facultySection.findMany({
      where: {
        institutionId,
        sectionId,
        academicYearId,
      },
      select: {
        facultyId: true,
      },
    });

    const assignedIds = assigned.map((a) => a.facultyId);

    return this.prisma.faculty.findMany({
      where: {
        institutionId,
        status: 'ACTIVE',
        ...(assignedIds.length > 0 ? { id: { notIn: assignedIds } } : {}),
      },
      include: {
        user: true,
        department: true,
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });
  }

  async update(institutionId: string, id: string, dto: UpdateFacultySectionDto) {
    const existing = await this.prisma.facultySection.findUnique({
      where: { id },
    });

    if (!existing || existing.institutionId !== institutionId) {
      throw new NotFoundException('Faculty section assignment not found');
    }

    if (dto.isPrimary) {
      await this.prisma.facultySection.updateMany({
        where: {
          institutionId,
          sectionId: existing.sectionId,
          academicYearId: existing.academicYearId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.facultySection.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
        section: true,
        academicYear: true,
      },
    });
  }

  async remove(institutionId: string, id: string) {
    const existing = await this.prisma.facultySection.findUnique({
      where: { id },
    });

    if (!existing || existing.institutionId !== institutionId) {
      throw new NotFoundException('Faculty section assignment not found');
    }

    return this.prisma.facultySection.delete({
      where: { id },
    });
  }
}
