import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, ExamType } from '@prisma/client';
import { ScheduleExamDto } from './dto/schedule-exam.dto';

@Injectable()
export class ExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  async schedule(institutionId: string, dto: ScheduleExamDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch custom ExaminationType if provided
      let examTypeName = dto.examType;
      if (dto.examinationTypeId) {
        const customType = await tx.examinationType.findFirst({
          where: { id: dto.examinationTypeId, institutionId },
        });
        if (customType) {
          examTypeName = customType.name;
        }
      }

      // Valid enum values for ExamType fallback
      const validExamTypes = ['INTERNAL', 'MIDTERM', 'FINAL', 'MAKEUP'];
      const examTypeEnum = validExamTypes.includes(dto.examType)
        ? (dto.examType as ExamType)
        : ExamType.INTERNAL;

      // Determine initial dates from dto
      let minDate: Date = dto.startDate ? new Date(dto.startDate) : new Date();
      let maxDate: Date = dto.endDate ? new Date(dto.endDate) : minDate;

      // Find or create Exam
      const term = await tx.academicTerm.findUnique({ where: { id: dto.termId } });
      const examName = dto.name || `${term?.name || 'Term'} ${examTypeName} Exam`;

      let exam = await tx.exam.findFirst({
        where: {
          institutionId,
          termId: dto.termId,
          ...(dto.examinationTypeId
            ? { examinationTypeId: dto.examinationTypeId }
            : { examType: examTypeEnum }),
        },
      });

      if (!exam) {
        exam = await tx.exam.create({
          data: {
            institutionId,
            academicYearId: dto.academicYearId,
            termId: dto.termId,
            examinationTypeId: dto.examinationTypeId || null,
            examType: examTypeEnum,
            name: examName,
            status: 'SCHEDULED',
            startDate: minDate,
            endDate: maxDate,
          },
        });
      } else {
        exam = await tx.exam.update({
          where: { id: exam.id },
          data: {
            status: 'SCHEDULED',
            name: dto.name || exam.name,
            examinationTypeId: dto.examinationTypeId || exam.examinationTypeId,
            startDate: minDate,
            endDate: maxDate,
          },
        });
      }

      // 3. Process courses if provided
      const courses = dto.courses || [];
      for (const courseDto of courses) {
        const examDate = new Date(courseDto.examDate);

        // Parse time
        const [hours, minutes] = courseDto.startTime.split(':').map(Number);
        const startTime = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
        const endTime = new Date(startTime.getTime() + courseDto.durationMinutes * 60000);

        if (examDate < minDate) minDate = examDate;
        if (examDate > maxDate) maxDate = examDate;

        // Check Room Conflict
        if (courseDto.roomId) {
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
              const room = await tx.room.findUnique({ where: { id: courseDto.roomId } });
              throw new BadRequestException(
                `Room conflict: ${room?.name} is already booked on ${courseDto.examDate}.`,
              );
            }
          }

          // Check Capacity
          const room = await tx.room.findUnique({ where: { id: courseDto.roomId } });
          if (room && room.capacity) {
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
        await tx.examCourse.upsert({
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
            maxMarks: courseDto.maxMarks ?? null,
            passingMarks: courseDto.passingMarks ?? null,
          },
          update: {
            examDate,
            startTime,
            endTime,
            roomId: courseDto.roomId,
            ...(courseDto.maxMarks !== undefined && { maxMarks: courseDto.maxMarks }),
            ...(courseDto.passingMarks !== undefined && { passingMarks: courseDto.passingMarks }),
          },
        });

        // Sync with Course CalendarEvent
        const course = await tx.course.findUnique({ where: { id: courseDto.courseId } });
        const roomName = courseDto.roomId
          ? (await tx.room.findUnique({ where: { id: courseDto.roomId } }))?.name
          : '';

        const eventStart = new Date(courseDto.examDate);
        eventStart.setUTCHours(hours, minutes, 0, 0);
        const eventEnd = new Date(eventStart.getTime() + courseDto.durationMinutes * 60000);

        const courseEventTitle = `${examTypeName} Exam - ${course?.code ? `[${course.code}] ` : ''}${course?.name || 'Course'}`;
        const courseDescription = `Examination for ${course?.name} (${course?.code || ''})${
          courseDto.maxMarks ? ` | Max Marks: ${courseDto.maxMarks}` : ''
        } [Ref: EXAM-${exam.id}]`;

        const existingCourseEvents = await tx.calendarEvent.findMany({
          where: {
            institutionId,
            eventType: 'EXAM',
            OR: [
              { description: { contains: `[Ref: EXAM-${exam.id}]` }, title: courseEventTitle },
              { title: courseEventTitle },
            ],
          },
        });

        if (existingCourseEvents.length > 0) {
          await tx.calendarEvent.update({
            where: { id: existingCourseEvents[0].id },
            data: {
              startAt: eventStart,
              endAt: eventEnd,
              location: roomName || null,
              description: courseDescription,
              programId: dto.programId || null,
            },
          });
        } else {
          await tx.calendarEvent.create({
            data: {
              institutionId,
              title: courseEventTitle,
              description: courseDescription,
              eventType: 'EXAM',
              startAt: eventStart,
              endAt: eventEnd,
              location: roomName || null,
              programId: dto.programId || null,
            },
          });
        }
      }

      // Update exam with final envelope dates
      await tx.exam.update({
        where: { id: exam.id },
        data: { startDate: minDate, endDate: maxDate },
      });

      // Also create or update the primary Exam CalendarEvent
      const examCalendarTitle = exam.name;
      const examCalendarDesc = `${examTypeName} Examination - ${term?.name || ''} [Ref: EXAM-${exam.id}]`;
      const examStart = new Date(minDate);
      examStart.setUTCHours(0, 0, 0, 0);
      const examEnd = new Date(maxDate);
      examEnd.setUTCHours(23, 59, 59, 999);

      const existingExamCalendarEvent = await tx.calendarEvent.findFirst({
        where: {
          institutionId,
          eventType: 'EXAM',
          OR: [
            { description: { contains: `[Ref: EXAM-${exam.id}]` } },
            { title: examCalendarTitle },
          ],
        },
      });

      if (existingExamCalendarEvent) {
        await tx.calendarEvent.update({
          where: { id: existingExamCalendarEvent.id },
          data: {
            title: examCalendarTitle,
            startAt: examStart,
            endAt: examEnd,
            isAllDay: true,
            description: examCalendarDesc,
            programId: dto.programId || null,
          },
        });
      } else {
        await tx.calendarEvent.create({
          data: {
            institutionId,
            title: examCalendarTitle,
            description: examCalendarDesc,
            eventType: 'EXAM',
            startAt: examStart,
            endAt: examEnd,
            isAllDay: true,
            programId: dto.programId || null,
          },
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

      // Delete associated calendar events by ref tag
      await tx.calendarEvent.deleteMany({
        where: {
          institutionId,
          eventType: 'EXAM',
          description: { contains: `[Ref: EXAM-${exam.id}]` },
        },
      });

      // Delete by title fallback
      await tx.calendarEvent.deleteMany({
        where: {
          institutionId,
          eventType: 'EXAM',
          title: exam.name,
        },
      });

      for (const ec of exam.examCourses) {
        const fallbackTitle = `${exam.examType} Exam - ${ec.course.name}`;
        await tx.calendarEvent.deleteMany({
          where: {
            institutionId,
            eventType: 'EXAM',
            title: fallbackTitle,
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
    startDate?: string,
    endDate?: string,
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

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (programId || curriculumId) {
      const courseFilter: any = {};
      if (programId) {
        courseFilter.OR = [
          {
            programOfferings: {
              some: {
                id: programId,
              },
            },
          },
          {
            curriculumCourses: {
              some: {
                curriculumTerm: {
                  curriculum: {
                    programs: {
                      some: { id: programId },
                    },
                  },
                },
              },
            },
          },
        ];
      }
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
          examinationType: true,
          examCourses: {
            include: {
              course: true,
              room: true,
            },
          },
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
