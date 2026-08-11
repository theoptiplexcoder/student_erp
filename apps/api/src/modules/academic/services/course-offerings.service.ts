import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Simplification for ERP context; normally injected

@Injectable()
export class CourseOfferingsService {
  async create(createCourseOfferingDto: any) {
    return prisma.courseOffering.create({
      data: createCourseOfferingDto,
    });
  }

  async findAll(courseId?: string, termId?: string) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (termId) where.termId = termId;

    return prisma.courseOffering.findMany({
      where,
      include: {
        course: true,
        term: true,
        program: true,
        batch: true,
        section: true,
        enrollments: true,
      },
    });
  }

  async findOne(id: string) {
    const offering = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: true,
        term: true,
        program: true,
        batch: true,
        section: true,
        enrollments: true,
      },
    });
    if (!offering) {
      throw new NotFoundException(`CourseOffering with ID ${id} not found`);
    }
    return offering;
  }

  async update(id: string, updateCourseOfferingDto: any) {
    return prisma.courseOffering.update({
      where: { id },
      data: updateCourseOfferingDto,
    });
  }

  async remove(id: string) {
    return prisma.courseOffering.delete({
      where: { id },
    });
  }
}
