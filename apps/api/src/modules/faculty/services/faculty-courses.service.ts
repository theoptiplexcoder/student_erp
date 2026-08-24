import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourses(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      include: {
        course: {
          include: {
            program: true,
            department: true,
          },
        },
        section: {
          include: {
            program: true,
            batch: true,
          },
        },
        term: true,
      },
    });

    return assignments;
  }

  async getCourseDetails(userId: string, institutionId: string, courseId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    // Verify assignment
    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, institutionId, courseId },
      include: {
        course: {
          include: {
            program: true,
            department: true,
            courseResources: true,
            assignments: true,
          },
        },
        section: {
          include: {
            program: true,
            batch: true,
            enrollments: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
        term: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('You are not assigned to this course');
    }

    return assignment;
  }
}
