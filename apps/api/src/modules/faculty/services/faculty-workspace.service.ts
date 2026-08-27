import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyWorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyFacultyAccess(userId: string, institutionId: string, courseId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, institutionId, courseId },
    });

    if (!assignment) {
      throw new ForbiddenException('Not assigned to this course');
    }

    return { faculty, assignment };
  }

  // --- RESOURCES ---

  async getResources(userId: string, institutionId: string, courseId: string) {
    await this.verifyFacultyAccess(userId, institutionId, courseId);
    return this.prisma.courseResource.findMany({
      where: { institutionId, courseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createResource(userId: string, institutionId: string, courseId: string, data: any) {
    const { faculty } = await this.verifyFacultyAccess(userId, institutionId, courseId);

    return this.prisma.courseResource.create({
      data: {
        institutionId,
        courseId,
        facultyId: faculty.id,
        title: data.title,
        description: data.description,
        resourceType: data.resourceType || 'DOCUMENT',
        fileUrl: data.fileUrl,
        externalUrl: data.externalUrl,
        isPublished: data.isPublished ?? true,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  }

  async deleteResource(
    userId: string,
    institutionId: string,
    courseId: string,
    resourceId: string,
  ) {
    await this.verifyFacultyAccess(userId, institutionId, courseId);
    return this.prisma.courseResource.delete({
      where: { id: resourceId, institutionId, courseId },
    });
  }

  // --- ASSIGNMENTS ---

  async getAssignments(userId: string, institutionId: string, courseId: string) {
    await this.verifyFacultyAccess(userId, institutionId, courseId);
    return this.prisma.assignment.findMany({
      where: { institutionId, courseId },
      include: {
        _count: { select: { assignmentSubmissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAssignment(userId: string, institutionId: string, courseId: string, data: any) {
    const { faculty, assignment } = await this.verifyFacultyAccess(userId, institutionId, courseId);

    return this.prisma.assignment.create({
      data: {
        institutionId,
        courseId,
        facultyId: faculty.id,
        termId: assignment.termId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxMarks: data.maxMarks,
        status: data.status || 'PUBLISHED',
      },
    });
  }

  async getSubmissions(
    userId: string,
    institutionId: string,
    courseId: string,
    assignmentId: string,
  ) {
    await this.verifyFacultyAccess(userId, institutionId, courseId);
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId, institutionId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found in this course');

    return this.prisma.assignmentSubmission.findMany({
      where: { institutionId, assignmentId },
      include: {
        student: {
          include: { user: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(
    userId: string,
    institutionId: string,
    courseId: string,
    assignmentId: string,
    submissionId: string,
    data: any,
  ) {
    await this.verifyFacultyAccess(userId, institutionId, courseId);
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId, institutionId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found in this course');

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId, institutionId, assignmentId },
      data: {
        marks: data.marks,
        feedback: data.feedback,
        status: 'GRADED',
        gradedAt: new Date(),
      },
    });
  }
}
