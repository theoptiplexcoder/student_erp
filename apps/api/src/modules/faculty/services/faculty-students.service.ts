import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyStudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudents(userId: string, institutionId: string) {
    if (!institutionId) throw new NotFoundException('Institution not found for this user');

    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      select: { sectionId: true },
    });

    const sectionIds = [...new Set(assignments.map((assignment) => assignment.sectionId))];

    // Faculty without section assignments have no class roster to view.
    if (sectionIds.length === 0) return [];

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

    return students
      .filter((student) => student.user !== null)
      .map((student) => {
        const { enrollments, ...rest } = student;
        const enrolledCourses = enrollments
          .map((e) => e.course)
          .filter(
            (course): course is NonNullable<typeof course> =>
              course !== null && course !== undefined,
          );
        return {
          ...rest,
          enrolledCourses,
        };
      });
  }
}
