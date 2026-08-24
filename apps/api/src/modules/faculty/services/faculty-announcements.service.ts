import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyAnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnnouncements(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    const courseAssignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
    });
    const courseIds = courseAssignments.map((a) => a.courseId);

    return this.prisma.announcement.findMany({
      where: {
        institutionId,
        isPublished: true,
        OR: [{ courseId: null }, { courseId: { in: courseIds } }],
      },
      include: {
        course: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async createAnnouncement(userId: string, institutionId: string, data: any) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    if (!data.courseId) {
      throw new BadRequestException('Faculty can only create course-level announcements');
    }

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, institutionId, courseId: data.courseId },
    });

    if (!assignment) {
      throw new BadRequestException('You are not assigned to this course');
    }

    return this.prisma.announcement.create({
      data: {
        institutionId,
        facultyId: faculty.id,
        courseId: data.courseId,
        title: data.title,
        content: data.content,
        isPublished: data.isPublished ?? true,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  }
}
