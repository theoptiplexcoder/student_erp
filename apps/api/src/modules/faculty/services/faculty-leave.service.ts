import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';

@Injectable()
export class FacultyLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveFacultyId(userId: string, institutionId: string): Promise<string> {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
      select: { id: true },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty.id;
  }

  async createRequest(userId: string, institutionId: string, dto: CreateLeaveRequestDto) {
    const facultyId = await this.resolveFacultyId(userId, institutionId);

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Check for overlapping pending/approved requests
    const existing = await this.prisma.facultyLeaveRequest.findFirst({
      where: {
        facultyId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You already have a pending or approved leave request overlapping these dates',
      );
    }

    return this.prisma.facultyLeaveRequest.create({
      data: {
        institutionId,
        facultyId,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        reason: dto.reason,
      },
    });
  }

  async getMyRequests(userId: string, institutionId: string) {
    const facultyId = await this.resolveFacultyId(userId, institutionId);

    return this.prisma.facultyLeaveRequest.findMany({
      where: { facultyId },
      orderBy: { createdAt: 'desc' },
      include: {
        substituteFaculty: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async cancelRequest(userId: string, institutionId: string, id: string) {
    const facultyId = await this.resolveFacultyId(userId, institutionId);

    const request = await this.prisma.facultyLeaveRequest.findFirst({
      where: { id, facultyId },
    });

    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    return this.prisma.facultyLeaveRequest.delete({ where: { id } });
  }
}
