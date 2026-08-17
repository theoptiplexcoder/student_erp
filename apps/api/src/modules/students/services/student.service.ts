import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentProfile(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        userId,
        institutionId,
      },
      include: {
        user: true,
        program: true,
        section: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async getDashboardData(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const today = new Date().getDay();
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const timetable = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        sectionId: student.sectionId ?? undefined,
        dayOfWeek: dayMap[today] as any,
      },
      include: {
        course: true,
        faculty: {
          include: { user: true },
        },
      },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const upcomingEvents = await this.prisma.calendarEvent.findMany({
      where: {
        institutionId,
        startAt: { gte: new Date() },
      },
      take: 5,
      orderBy: { startAt: 'asc' },
    });

    const recentAnnouncements = await this.prisma.announcement.findMany({
      where: {
        institutionId,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const upcomingDeadlines = await this.prisma.assignment.findMany({
      where: {
        institutionId,
        courseId: { in: enrollments.map((e) => e.courseId).filter(Boolean) as string[] },
        dueDate: { gte: new Date() },
      },
      include: {
        course: true,
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
    });

    return {
      student,
      stats: {
        enrolledCourses: enrollments.length,
        attendancePercentage: 85.5,
        upcomingDeadlines: upcomingDeadlines.length,
      },
      todaySchedule: timetable,
      upcomingEvents,
      recentAnnouncements,
      upcomingDeadlines,
    };
  }

  async getTimetable(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    const timetable = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        courseId: { in: courseIds.filter((id) => id !== null) as string[] },
      },
      include: {
        course: true,
        faculty: {
          include: { user: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return timetable;
  }

  async getAssignments(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const courseIds = enrollments.map((e) => e.courseId).filter(Boolean) as string[];

    return this.prisma.assignment.findMany({
      where: {
        institutionId,
        courseId: { in: courseIds },
      },
      include: {
        course: true,
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getExaminations(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    const courseIds = enrollments.map((e) => e.courseId).filter(Boolean) as string[];

    return this.prisma.examCourse.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        exam: true,
        course: true,
      },
    });
  }

  async getNotifications(userId: string, institutionId: string) {
    return this.prisma.notification.findMany({
      where: {
        institutionId,
        userId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCalendar(institutionId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { institutionId },
      orderBy: { startAt: 'asc' },
    });
  }

  async getFeedback(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const forms = await this.prisma.feedbackForm.findMany({
      where: { institutionId, isActive: true },
    });

    const grievances = await this.prisma.serviceRequest.findMany({
      where: { institutionId, studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return { forms, grievances };
  }

  async getClubs(userId: string, institutionId: string) {
    const student = await this.getStudentProfile(userId, institutionId);

    const myMemberships = await this.prisma.clubMembership.findMany({
      where: { institutionId, studentId: student.id, status: 'ACTIVE' },
      include: { club: true },
    });

    const availableClubs = await this.prisma.club.findMany({
      where: {
        institutionId,
        isActive: true,
        id: { notIn: myMemberships.map((m) => m.clubId) },
      },
    });

    return { myMemberships, availableClubs };
  }
}
