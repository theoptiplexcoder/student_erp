import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InstitutionStatus, UserStatus } from '@prisma/client';
import { RejectOnboardingDto } from './dto/reject-onboarding.dto';

@Injectable()
export class SuperadminService {
  constructor(private readonly prisma: PrismaService) {}

  async listOnboardingRequests(statusFilter?: string) {
    let whereClause: any = {};

    if (statusFilter && statusFilter !== 'ALL') {
      const normalized = statusFilter === 'APPROVED' ? 'ACTIVE' : statusFilter;
      whereClause.status = normalized as InstitutionStatus;
    } else if (!statusFilter) {
      // Default to pending
      whereClause.status = InstitutionStatus.PENDING;
    }

    const institutions = await this.prisma.institution.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return institutions.map((inst) => ({
      id: inst.id,
      legalName: inst.legalName,
      displayName: inst.displayName,
      institutionType: inst.institutionType,
      status: inst.status,
      rejectionReason: inst.rejectionReason,
      branding: inst.branding,
      createdAt: inst.createdAt,
      approvedAt: inst.approvedAt,
      approvedBy: inst.approvedBy,
      adminUser: inst.users[0] || null,
    }));
  }

  async getOnboardingRequest(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException(`Institution request with id ${id} not found`);
    }

    return {
      id: institution.id,
      legalName: institution.legalName,
      displayName: institution.displayName,
      institutionType: institution.institutionType,
      status: institution.status,
      rejectionReason: institution.rejectionReason,
      branding: institution.branding,
      createdAt: institution.createdAt,
      approvedAt: institution.approvedAt,
      approvedBy: institution.approvedBy,
      adminUser: institution.users[0] || null,
      adminUsers: institution.users,
    };
  }

  async approveOnboardingRequest(id: string, superadminUserId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with id ${id} not found`);
    }

    if (institution.status === InstitutionStatus.ACTIVE) {
      throw new BadRequestException('Institution is already active');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updatedInstitution = await tx.institution.update({
        where: { id },
        data: {
          status: InstitutionStatus.ACTIVE,
          approvedAt: now,
          approvedBy: superadminUserId,
          rejectionReason: null,
        },
      });

      await tx.user.updateMany({
        where: {
          institutionId: id,
          role: 'ADMIN',
          status: UserStatus.PENDING_APPROVAL,
        },
        data: {
          status: UserStatus.ACTIVE,
        },
      });

      return {
        success: true,
        message: 'Institution and tenant admin approved successfully.',
        institution: updatedInstitution,
      };
    });
  }

  async rejectOnboardingRequest(id: string, dto: RejectOnboardingDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with id ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInstitution = await tx.institution.update({
        where: { id },
        data: {
          status: InstitutionStatus.REJECTED,
          rejectionReason: dto.reason.trim(),
        },
      });

      await tx.user.updateMany({
        where: {
          institutionId: id,
          role: 'ADMIN',
        },
        data: {
          status: UserStatus.REJECTED,
        },
      });

      return {
        success: true,
        message: 'Institution request rejected.',
        institution: updatedInstitution,
      };
    });
  }

  async getStats() {
    const [pendingRequests, activeInstitutions, rejectedRequests, totalInstitutions] =
      await Promise.all([
        this.prisma.institution.count({ where: { status: InstitutionStatus.PENDING } }),
        this.prisma.institution.count({ where: { status: InstitutionStatus.ACTIVE } }),
        this.prisma.institution.count({ where: { status: InstitutionStatus.REJECTED } }),
        this.prisma.institution.count(),
      ]);

    return {
      pendingRequests,
      activeInstitutions,
      rejectedRequests,
      totalInstitutions,
    };
  }
}
