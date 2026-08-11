import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Simplification

@Injectable()
export class EnrollmentsService {
  async enrollStudent(courseOfferingId: string, data: any) {
    const { studentId, institutionId, academicYearId } = data;

    // Check offering exists
    const offering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: {
        _count: { select: { enrollments: true } }
      }
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    // Check capacity
    if (offering.capacity > 0 && offering._count.enrollments >= offering.capacity) {
      throw new ConflictException('Course capacity has been reached');
    }

    // Check duplicate
    const existing = await prisma.enrollment.findFirst({
      where: { courseOfferingId, studentId }
    });

    if (existing) {
      throw new ConflictException('Student is already enrolled in this offering');
    }

    return prisma.enrollment.create({
      data: {
        institutionId: institutionId || offering.institutionId,
        studentId,
        academicYearId: academicYearId || offering.termId, // Ideally passing proper academicYearId
        courseOfferingId,
        courseId: offering.courseId,
        programId: offering.programId,
        batchId: offering.batchId,
        sectionId: offering.sectionId,
        termId: offering.termId,
        status: 'ACTIVE'
      },
    });
  }

  async removeEnrollment(courseOfferingId: string, studentId: string) {
    const existing = await prisma.enrollment.findFirst({
      where: { courseOfferingId, studentId }
    });

    if (!existing) {
      throw new BadRequestException('Enrollment not found');
    }

    return prisma.enrollment.delete({
      where: { id: existing.id }
    });
  }
}
