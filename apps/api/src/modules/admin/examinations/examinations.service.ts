import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, ExamType, CalendarEventType } from '@prisma/client';
import { ScheduleExamDto } from './dto/schedule-exam.dto';

@Injectable()
export class ExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  async schedule(institutionId: string, dto: ScheduleExamDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find or create Exam
      let exam = await tx.exam.findFirst({
        where: {
          institutionId,
          termId: dto.termId,
          examType: dto.examType as ExamType,
        },
      });

      if (!exam) {
        // Fetch term name for auto-naming
        const term = await tx.academicTerm.findUnique({ where: { id: dto.termId } });
        exam = await tx.exam.create({
          data: {
            institutionId,
            academicYearId: dto.academicYearId,
            termId: dto.termId,
            examType: dto.examType as ExamType,
            name: dto.name || `${term?.name || 'Term'} ${dto.examType} Exam`,
            status: 'SCHEDULED',
          },
        });
      } else {
        await tx.exam.update({
          where: { id: exam.id },
          data: { status: 'SCHEDULED', name: dto.name || exam.name },
        });
      }

      // 2. Determine min/max dates
      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      // 3. Process courses
      for (const courseDto of dto.courses) {
        const examDate = new Date(courseDto.examDate);

        // Parse time
        const [hours, minutes] = courseDto.startTime.split(':').map(Number);
        const startTime = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));

        const endTime = new Date(startTime.getTime() + courseDto.durationMinutes * 60000);

        if (!minDate || examDate < minDate) minDate = examDate;
        if (!maxDate || examDate > maxDate) maxDate = examDate;

        // Check Room Conflict
        if (courseDto.roomId) {
          // A room is considered in conflict if another ExamCourse uses the same room on the same day
          // and the times overlap.
          const conflictingCourse = await tx.examCourse.findFirst({
            where: {
              institutionId,
              roomId: courseDto.roomId,
              examDate: examDate,
              id: { notIn: [] }, // will exclude this one if we update
            },
          });

          if (conflictingCourse) {
            // Need a more precise overlap check if needed, but for MVP, let's pull all and check manually
            const roomExams = await tx.examCourse.findMany({
              where: {
                institutionId,
                roomId: courseDto.roomId,
                examDate: examDate,
                NOT: {
                  examId: exam.id,
                  courseId: courseDto.courseId,
                },
              },
            });

            for (const re of roomExams) {
              const startA = re.startTime.getTime() - new Date(Date.UTC(1970, 0, 1)).getTime();
              const endA = re.endTime.getTime() - new Date(Date.UTC(1970, 0, 1)).getTime();
              const startB = startTime.getTime() - new Date(Date.UTC(1970, 0, 1)).getTime();
              const endB = endTime.getTime() - new Date(Date.UTC(1970, 0, 1)).getTime();

              if (Math.max(startA, startB) < Math.min(endA, endB)) {
                // overlap
                const room = await tx.room.findUnique({ where: { id: courseDto.roomId } });
                throw new BadRequestException(
                  `Room conflict: ${room?.name} is already booked on ${courseDto.examDate}.`,
                );
              }
            }
          }

          // Check Capacity
          const room = await tx.room.findUnique({ where: { id: courseDto.roomId } });
          if (room && room.capacity) {
            // Count students
            const enrollmentsCount = await tx.enrollment.count({
              where: {
                institutionId,
                courseId: courseDto.courseId,
                termId: dto.termId,
                status: 'ACTIVE',
              },
            });
            if (enrollmentsCount > room.capacity) {
              throw new BadRequestException(
                `Capacity exceeded: Room ${room.name} has capacity ${room.capacity}, but course has ${enrollmentsCount} students.`,
              );
            }
          }
        }

        // Upsert ExamCourse
        const examCourse = await tx.examCourse.upsert({
          where: {
            examId_courseId: {
              examId: exam.id,
              courseId: courseDto.courseId,
            },
          },
          create: {
            institutionId,
            examId: exam.id,
            courseId: courseDto.courseId,
            examDate,
            startTime,
            endTime,
            roomId: courseDto.roomId,
          },
          update: {
            examDate,
            startTime,
            endTime,
            roomId: courseDto.roomId,
          },
        });

        // Sync with CalendarEvent
        const course = await tx.course.findUnique({ where: { id: courseDto.courseId } });
        const roomName = courseDto.roomId
          ? (await tx.room.findUnique({ where: { id: courseDto.roomId } }))?.name
          : '';

        // Calculate absolute start/end for calendar
        const eventStart = new Date(courseDto.examDate);
        eventStart.setUTCHours(hours, minutes, 0, 0);

        const eventEnd = new Date(eventStart.getTime() + courseDto.durationMinutes * 60000);

        const title = `${dto.examType} Exam - ${course?.name}`;

        // Find existing calendar event by a convention, or we could add `examCourseId` to CalendarEvent.
        // Since we didn't add the relation, we can use `description` to store the reference or query by title/date.
        // Actually, let's just delete the old one if we can identify it, or keep it simple.
        // Let's find event starting at same time and same title
        const existingEvents = await tx.calendarEvent.findMany({
          where: {
            institutionId,
            eventType: 'EXAM',
            title: title,
          },
        });

        if (existingEvents.length > 0) {
          await tx.calendarEvent.update({
            where: { id: existingEvents[0].id },
            data: {
              startAt: eventStart,
              endAt: eventEnd,
              location: roomName || null,
            },
          });
        } else {
          await tx.calendarEvent.create({
            data: {
              institutionId,
              title,
              description: `Examination for ${course?.name} (${course?.code})`,
              eventType: 'EXAM',
              startAt: eventStart,
              endAt: eventEnd,
              location: roomName || null,
            },
          });
        }
      }

      if (minDate && maxDate) {
        await tx.exam.update({
          where: { id: exam.id },
          data: { startDate: minDate, endDate: maxDate },
        });
      }

      return exam;
    });
  }

  async remove(institutionId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Find the exam and its courses
      const exam = await tx.exam.findFirst({
        where: { id, institutionId },
        include: { examCourses: { include: { course: true } } },
      });

      if (!exam) return { success: false };

      // Delete associated calendar events
      for (const ec of exam.examCourses) {
        const title = `${exam.examType} Exam - ${ec.course.name}`;
        await tx.calendarEvent.deleteMany({
          where: {
            institutionId,
            eventType: 'EXAM',
            title: title,
          },
        });
      }

      // Delete Exam (Cascade deletes ExamCourse)
      await tx.exam.delete({
        where: { id },
      });

      return { success: true };
    });
  }

  async findAll(
    institutionId?: string,
    page = 1,
    pageSize = 50,
    search?: string,
    programId?: string,
    curriculumId?: string,
    termId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ExamWhereInput = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (termId) {
      where.termId = termId;
    }

    if (programId || curriculumId) {
      const courseFilter: any = {};
      if (programId) courseFilter.programId = programId;
      if (curriculumId) {
        courseFilter.curriculumCourses = {
          some: {
            curriculumTerm: {
              curriculumId,
            },
          },
        };
      }

      where.examCourses = {
        some: {
          course: courseFilter,
        },
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          academicYear: true,
          term: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findResults(institutionId?: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.MarkWhereInput = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    // if (search) {
    //   where.student = {
    //     user: {
    //       OR: [
    //         { firstName: { contains: search, mode: 'insensitive' } },
    //         { lastName: { contains: search, mode: 'insensitive' } },
    //       ]
    //     }
    //   }
    // }

    const [total, data] = await Promise.all([
      this.prisma.mark.count({ where }),
      this.prisma.mark.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: {
            include: { user: true },
          },
          examCourse: {
            include: { exam: true, course: true },
          },
        },
        orderBy: { id: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
