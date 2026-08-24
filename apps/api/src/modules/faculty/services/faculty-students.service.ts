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

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        sectionId: { in: sectionIds },
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: true,
            program: true,
            section: true,
          },
        },
        course: true,
      },
    });

    // Deduplicate students
    const studentMap = new Map();
    for (const e of enrollments) {
      if (!studentMap.has(e.studentId)) {
        studentMap.set(e.studentId, {
          ...e.student,
          enrolledCourses: [e.course],
        });
      } else {
        studentMap.get(e.studentId).enrolledCourses.push(e.course);
      }
    }

    return Array.from(studentMap.values());
  }
}
