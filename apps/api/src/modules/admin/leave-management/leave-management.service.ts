import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LeaveRequestStatus, Prisma } from '@prisma/client';
import { ReviewLeaveDto, LeaveReviewAction } from './dto/review-leave.dto';

@Injectable()
export class LeaveManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    institutionId: string,
    page = 1,
    pageSize = 20,
    status?: string,
    leaveType?: string,
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;

    const where: Prisma.FacultyLeaveRequestWhereInput = { institutionId };

    if (status && status !== 'ALL') {
      where.status = status as LeaveRequestStatus;
    }

    if (leaveType && leaveType !== 'ALL') {
      where.leaveType = leaveType as any;
    }

    if (search) {
      where.faculty = {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.facultyLeaveRequest.count({ where }),
      this.prisma.facultyLeaveRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          faculty: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profileImageUrl: true,
                },
              },
              department: { select: { id: true, name: true } },
            },
          },
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
    const leave = await this.prisma.facultyLeaveRequest.findFirst({
      where: { id, institutionId },
      include: {
        faculty: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImageUrl: true,
              },
            },
            department: { select: { id: true, name: true } },
          },
        },
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
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async review(institutionId: string, id: string, reviewerId: string, dto: ReviewLeaveDto) {
    const leave = await this.prisma.facultyLeaveRequest.findFirst({
      where: { id, institutionId },
    });

    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${leave.status.toLowerCase()}`);
    }

    const newStatus =
      dto.action === LeaveReviewAction.APPROVE
        ? LeaveRequestStatus.APPROVED
        : LeaveRequestStatus.REJECTED;

    const updated = await this.prisma.facultyLeaveRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: dto.adminNote ?? null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        ...(dto.action === LeaveReviewAction.APPROVE && {
          substituteFacultyId: dto.substituteFacultyId ?? null,
          substituteNote: dto.substituteNote ?? null,
          substituteSessionIds: dto.substituteSessionIds ?? [],
        }),
      },
      include: {
        faculty: {
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

    return updated;
  }

  async getStats(institutionId: string) {
    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.facultyLeaveRequest.count({
        where: { institutionId, status: LeaveRequestStatus.PENDING },
      }),
      this.prisma.facultyLeaveRequest.count({
        where: { institutionId, status: LeaveRequestStatus.APPROVED },
      }),
      this.prisma.facultyLeaveRequest.count({
        where: { institutionId, status: LeaveRequestStatus.REJECTED },
      }),
      this.prisma.facultyLeaveRequest.count({ where: { institutionId } }),
    ]);

    return { pending, approved, rejected, total };
  }

  async getAffectedSessions(
    institutionId: string,
    facultyId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const sessions = await this.prisma.sessionOccurrence.findMany({
      where: {
        institutionId,
        facultyId,
        date: { gte: start, lte: end },
      },
      include: {
        timetableEntry: {
          include: {
            course: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return sessions;
  }

  async getAvailableSubstitutes(
    institutionId: string,
    startDate: string,
    endDate: string,
    excludeFacultyId?: string,
  ) {
    // Get all active faculty in the institution who are not on leave during the period
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find faculty that have approved leaves overlapping with the given range
    const onLeave = await this.prisma.facultyLeaveRequest.findMany({
      where: {
        institutionId,
        status: LeaveRequestStatus.APPROVED,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { facultyId: true },
    });

    const excludedIds = [
      ...onLeave.map((l) => l.facultyId),
      ...(excludeFacultyId ? [excludeFacultyId] : []),
    ];

    const substitutes = await this.prisma.faculty.findMany({
      where: {
        institutionId,
        status: 'ACTIVE',
        id: { notIn: excludedIds },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: { select: { id: true, name: true } },
      },
      orderBy: { user: { lastName: 'asc' } },
    });

    return substitutes;
  }
}
