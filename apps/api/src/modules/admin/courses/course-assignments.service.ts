import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';

@Injectable()
export class CourseAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, data: CreateCourseAssignmentDto) {
    const { facultyId, courseId, sectionId, termId, isPrimary } = data;

    const [faculty, course, section, term] = await Promise.all([
      this.prisma.faculty.findUnique({ where: { id: facultyId } }),
      this.prisma.course.findUnique({ where: { id: courseId } }),
      this.prisma.section.findUnique({ where: { id: sectionId } }),
      this.prisma.academicTerm.findUnique({ where: { id: termId } }),
    ]);

    if (!faculty || faculty.institutionId !== institutionId)
      throw new NotFoundException('Faculty not found in this institution');
    if (!course || course.institutionId !== institutionId)
      throw new NotFoundException('Course not found in this institution');
    if (!section || section.institutionId !== institutionId)
      throw new NotFoundException('Section not found in this institution');
    if (!term || term.institutionId !== institutionId)
      throw new NotFoundException('Term not found in this institution');

    try {
      return await this.prisma.courseAssignment.create({
        data: {
          institutionId,
          facultyId,
          courseId,
          sectionId,
          termId,
          isPrimary: isPrimary ?? true,
        },
        include: {
          faculty: { include: { user: true } },
          course: true,
          section: true,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('This course assignment already exists');
      }
      throw e;
    }
  }

  async findAll(institutionId: string, courseId?: string, sectionId?: string, termId?: string) {
    const where: any = { institutionId };
    if (courseId) where.courseId = courseId;
    if (sectionId) where.sectionId = sectionId;
    if (termId) where.termId = termId;

    return this.prisma.courseAssignment.findMany({
      where,
      include: {
        faculty: {
          include: { user: true },
        },
        course: true,
        section: true,
        term: true,
      },
    });
  }

  async remove(institutionId: string, id: string) {
    const assignment = await this.prisma.courseAssignment.findUnique({
      where: { id },
    });

    if (!assignment || assignment.institutionId !== institutionId) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.courseAssignment.delete({
      where: { id },
    });
  }
}
