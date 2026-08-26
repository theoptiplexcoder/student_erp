import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyStudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudents(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      select: { sectionId: true },
    });

    const sectionIds = assignments.map((a) => a.sectionId);

    const students = await this.prisma.student.findMany({
      where: {
        institutionId,
        enrollments: {
          some: {
            sectionId: { in: sectionIds },
            status: 'ACTIVE',
          },
        },
      },
      include: {
        user: true,
        program: true,
        section: true,
        enrollments: {
          where: {
            sectionId: { in: sectionIds },
            status: 'ACTIVE',
          },
          include: {
            course: true,
          },
        },
      },
    });

    return students.map((student) => {
      const { enrollments, ...rest } = student;
      return {
        ...rest,
        enrolledCourses: enrollments.map((e) => e.course),
      };
    });
  }
}
