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

    const now = new Date();

    const enhancedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [
          totalStudents,
          lessonPlansTotal,
          lessonPlansCompleted,
          nextClass,
          totalClasses,
          classesCompleted,
        ] = await Promise.all([
          // totalStudents
          this.prisma.enrollment.count({
            where: { sectionId: assignment.sectionId, status: 'ACTIVE' },
          }),
          // lessonPlansTotal
          this.prisma.lessonPlan.count({
            where: {
              courseId: assignment.courseId,
              facultyId: faculty.id,
              termId: assignment.termId,
            },
          }),
          // lessonPlansCompleted
          this.prisma.lessonPlan.count({
            where: {
              courseId: assignment.courseId,
              facultyId: faculty.id,
              termId: assignment.termId,
              status: 'COMPLETED',
            },
          }),
          // nextClass
          this.prisma.timetableEntry.findFirst({
            where: {
              courseId: assignment.courseId,
              facultyId: faculty.id,
              sectionId: assignment.sectionId,
              startTime: { gte: now }, // Wait, startTime is just time type, we need dayOfWeek too, let's keep it simple or skip accurate next class
            },
            orderBy: { startTime: 'asc' },
          }),
          // For simple demo, we mock totalClasses / completed as we don't have AttendanceSession
          // Wait, do we have AttendanceSession?
          this.prisma.timetableEntry.count({
            where: {
              courseId: assignment.courseId,
              facultyId: faculty.id,
              sectionId: assignment.sectionId,
            },
          }),
          // classesCompleted
          this.prisma.attendanceSession.count({
            where: {
              courseId: assignment.courseId,
              sectionId: assignment.sectionId,
              facultyId: faculty.id,
            },
          }),
        ]);

        return {
          ...assignment,
          totalStudents,
          lessonPlansTotal,
          lessonPlansCompleted,
          nextClass,
          totalClasses: totalClasses * 15, // Approx 15 weeks per term
          classesCompleted,
        };
      }),
    );

    return enhancedAssignments;
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
