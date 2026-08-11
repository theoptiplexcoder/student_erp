import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CourseOfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseOfferingDto: any) {
    return this.prisma.courseOffering.create({
      data: createCourseOfferingDto,
    });
  }

  async findAll(courseId?: string, termId?: string) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (termId) where.termId = termId;

    return this.prisma.courseOffering.findMany({
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
    const offering = await this.prisma.courseOffering.findUnique({
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
    return this.prisma.courseOffering.update({
      where: { id },
      data: updateCourseOfferingDto,
    });
  }

  async remove(id: string) {
    return this.prisma.courseOffering.delete({
      where: { id },
    });
  }
}
