import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StudentAcademicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourses(userId: string, institutionId: string, termId?: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) {
      return [];
    }

    const whereClause: any = {
      institutionId,
      studentId: student.id,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    };

    if (termId) {
      whereClause.termId = termId;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        program: {
          include: {
            courses: {
              include: {
                department: true,
              },
            },
            curriculums: {
              include: {
                curriculumTerms: {
                  include: {
                    curriculumCourses: {
                      include: {
                        course: {
                          include: {
                            department: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        term: true,
      },
    });

    const courseMap = new Map<string, any>();

    for (const e of enrollments) {
      if (e.course) {
        courseMap.set(e.course.id, {
          ...e.course,
          enrollmentId: e.id,
          term: e.term,
        });
      }

      if (e.program?.courses) {
        for (const pc of e.program.courses) {
          if (!courseMap.has(pc.id)) {
            courseMap.set(pc.id, {
              ...pc,
              enrollmentId: e.id,
              term: e.term,
            });
          }
        }
      }

      if (e.program?.curriculums) {
        for (const curr of e.program.curriculums) {
          for (const ct of curr.curriculumTerms) {
            for (const cc of ct.curriculumCourses) {
              if (cc.course && !courseMap.has(cc.course.id)) {
                courseMap.set(cc.course.id, {
                  ...cc.course,
                  enrollmentId: e.id,
                  term: e.term,
                });
              }
            }
          }
        }
      }
    }

    return Array.from(courseMap.values());
  }

  async getTerms(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) {
      return [];
    }

    const studentTerms = await this.prisma.studentTerm.findMany({
      where: { studentId: student.id, institutionId },
      include: { academicTerm: true },
      orderBy: { academicTerm: { startDate: 'desc' } },
    });

    return studentTerms.map((st) => ({
      ...st.academicTerm,
      studentStatus: st.status,
      termGPA: st.termGPA,
      studentTermId: st.id,
    }));
  }

  async getCourseDetails(userId: string, institutionId: string, courseId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });

    if (!student) return null;

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        institutionId,
        studentId: student.id,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        program: {
          include: {
            courses: true,
            curriculums: {
              include: {
                curriculumTerms: {
                  include: {
                    curriculumCourses: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const isEnrolled = enrollments.some((e) => {
      if (e.courseId === courseId) return true;
      if (e.program?.courses?.some((pc) => pc.id === courseId)) return true;
      if (
        e.program?.curriculums?.some((curr) =>
          curr.curriculumTerms?.some((ct) =>
            ct.curriculumCourses?.some((cc) => cc.courseId === courseId),
          ),
        )
      ) {
        return true;
      }
      return false;
    });

    if (!isEnrolled) {
      throw new Error('Not enrolled in this course');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        courseResources: {
          where: { isPublished: true },
        },
        assignments: {
          where: { status: 'PUBLISHED' },
          include: {
            assignmentSubmissions: {
              where: { studentId: student.id },
            },
          },
        },
      },
    });

    return course;
  }

  async submitAssignment(
    userId: string,
    institutionId: string,
    courseId: string,
    assignmentId: string,
    data: any,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId },
    });
    if (!student) throw new Error('Student not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { institutionId, studentId: student.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: {
        program: {
          include: {
            courses: true,
            curriculums: {
              include: {
                curriculumTerms: {
                  include: {
                    curriculumCourses: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const isEnrolled = enrollments.some((e) => {
      if (e.courseId === courseId) return true;
      if (e.program?.courses?.some((pc) => pc.id === courseId)) return true;
      if (
        e.program?.curriculums?.some((curr) =>
          curr.curriculumTerms?.some((ct) =>
            ct.curriculumCourses?.some((cc) => cc.courseId === courseId),
          ),
        )
      ) {
        return true;
      }
      return false;
    });

    if (!isEnrolled) throw new Error('Not enrolled in this course');

    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId, institutionId, status: 'PUBLISHED' },
    });
    if (!assignment) throw new Error('Assignment not found or not published');

    return this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
      update: {
        submissionUrl: data.submissionUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      create: {
        institutionId,
        assignmentId,
        studentId: student.id,
        submissionUrl: data.submissionUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
    });
  }
}
