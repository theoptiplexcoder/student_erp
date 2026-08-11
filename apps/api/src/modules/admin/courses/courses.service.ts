import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Course, Prisma } from '@prisma/client';

const prisma = new PrismaClient(); // normally injected in ERP context

@Injectable()
export class CoursesService {
  async create(data: Prisma.CourseUncheckedCreateInput) {
    return prisma.course.create({ data });
  }

  async findAll() {
    return prisma.course.findMany({
      include: {
        program: true,
        department: true,
        classLevel: true,
      }
    });
  }

  async findOne(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        program: true,
        department: true,
        classLevel: true,
        courseOfferings: {
          include: {
            term: true,
            program: true,
            batch: true,
            section: true,
            enrollments: true,
          }
        },
      }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return prisma.course.delete({ where: { id } });
  }
}
