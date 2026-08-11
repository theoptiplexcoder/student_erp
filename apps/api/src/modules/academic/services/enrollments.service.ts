import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enrollStudent(courseOfferingId: string, data: any) {
    const { studentId, institutionId, academicYearId } = data;

    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    if (offering.capacity > 0 && offering._count.enrollments >= offering.capacity) {
      throw new ConflictException('Course capacity has been reached');
    }

    const existing = await this.prisma.enrollment.findFirst({
      where: { courseOfferingId, studentId },
    });

    if (existing) {
      throw new ConflictException('Student is already enrolled in this offering');
    }

    return this.prisma.enrollment.create({
      data: {
        institutionId: institutionId || offering.institutionId,
        studentId,
        academicYearId: academicYearId || offering.termId,
        courseOfferingId,
        courseId: offering.courseId,
        programId: offering.programId,
        batchId: offering.batchId,
        sectionId: offering.sectionId,
        termId: offering.termId,
        status: 'ACTIVE',
      },
    });
  }

  async removeEnrollment(courseOfferingId: string, studentId: string) {
    const existing = await this.prisma.enrollment.findFirst({
      where: { courseOfferingId, studentId },
    });

    if (!existing) {
      throw new BadRequestException('Enrollment not found');
    }

    return this.prisma.enrollment.delete({
      where: { id: existing.id },
    });
  }
}
