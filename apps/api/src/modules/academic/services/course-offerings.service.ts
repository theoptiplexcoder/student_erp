import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CourseOfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseOfferingDto: any) {
    const { courseId, termId, institutionId } = createCourseOfferingDto;

    const [course, term] = await Promise.all([
      this.prisma.course.findUnique({ where: { id: courseId } }),
      this.prisma.academicTerm.findUnique({ where: { id: termId } }),
    ]);

    if (!course || course.institutionId !== institutionId)
      throw new NotFoundException('Course not found in this institution');
    if (!term || term.institutionId !== institutionId)
      throw new NotFoundException('Term not found in this institution');

    return this.prisma.courseOffering.create({
      data: createCourseOfferingDto,
    });
  }

  async findAll(institutionId: string, courseId?: string, termId?: string) {
    const where: any = { institutionId };
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
        _count: { select: { enrollments: true } },
      },
    });
  }

  async findOne(institutionId: string, id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: true,
        term: true,
        program: true,
        batch: true,
        section: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!offering || offering.institutionId !== institutionId) {
      throw new NotFoundException(`CourseOffering with ID ${id} not found`);
    }
    return offering;
  }

  async update(institutionId: string, id: string, updateCourseOfferingDto: any) {
    const offering = await this.findOne(institutionId, id);
    return this.prisma.courseOffering.update({
      where: { id: offering.id },
      data: updateCourseOfferingDto,
    });
  }

  async remove(institutionId: string, id: string) {
    const offering = await this.findOne(institutionId, id);
    return this.prisma.courseOffering.delete({
      where: { id: offering.id },
    });
  }
}
