import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { TimetableDay, SessionOccurrenceStatus } from '@prisma/client';
import { GenerateSessionOccurrencesDto } from '../dto/generate-session-occurrences.dto';

const TIMETABLE_DAY_TO_JS: Record<TimetableDay, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

@Injectable()
export class SessionOccurrenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Format Date to YYYY-MM-DD in UTC
   */
  private formatUtcDateOnly(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Helper: Calculate duration in hours between startTime and endTime (Prisma DateTime or Date)
   */
  private calculateSessionHours(startTime: Date, endTime: Date): number {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const diffHours = (endMs - startMs) / (1000 * 60 * 60);
    return Math.max(0.5, Math.round(diffHours * 10) / 10);
  }

  /**
   * Generate session occurrences for each weekly timetable entry across the term,
   * taking into account holidays and existing attendance records.
   */
  async generate(institutionId: string, dto: GenerateSessionOccurrencesDto) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { id: dto.termId },
      include: { academicYear: true },
    });
    if (!term) throw new NotFoundException('Academic term not found');
    if (!term.startDate || !term.endDate) {
      throw new BadRequestException(
        'The selected academic term must have configured start and end dates',
      );
    }

    const entryWhere: any = { institutionId, termId: dto.termId };
    if (dto.sectionIds && dto.sectionIds.length > 0) {
      entryWhere.sectionId = { in: dto.sectionIds };
    }
    if (dto.courseId) {
      entryWhere.courseId = dto.courseId;
    }

    const entries = await this.prisma.timetableEntry.findMany({
      where: entryWhere,
      include: {
        course: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true, programId: true } },
      },
    });

    if (entries.length === 0) {
      return {
        generated: 0,
        skippedHolidays: 0,
        message: 'No weekly timetable entries found for the selected criteria',
      };
    }

    // Fetch holiday events that overlap with the term dates
    const holidays = await this.prisma.calendarEvent.findMany({
      where: {
        institutionId,
        eventType: 'HOLIDAY',
        startAt: { lte: term.endDate },
        endAt: { gte: term.startDate },
      },
    });

    // Build holiday lookup maps:
    // 1. Institution-wide holidays (no programId/sectionId)
    // 2. Program-specific holidays
    // 3. Section-specific holidays
    const institutionHolidays = new Set<string>();
    const programHolidays = new Map<string, Set<string>>();
    const sectionHolidays = new Map<string, Set<string>>();

    for (const h of holidays) {
      const start = new Date(h.startAt);
      const end = new Date(h.endAt);
      const cur = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
      );
      const endUtc = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

      while (cur <= endUtc) {
        const dateStr = this.formatUtcDateOnly(cur);
        if (h.sectionId) {
          if (!sectionHolidays.has(h.sectionId)) sectionHolidays.set(h.sectionId, new Set());
          sectionHolidays.get(h.sectionId)!.add(dateStr);
        } else if (h.programId) {
          if (!programHolidays.has(h.programId)) programHolidays.set(h.programId, new Set());
          programHolidays.get(h.programId)!.add(dateStr);
        } else {
          institutionHolidays.add(dateStr);
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    // Pre-fetch any existing attendance sessions for this term to link completed sessions
    const existingAttendanceSessions = await this.prisma.attendanceSession.findMany({
      where: { institutionId, termId: dto.termId },
      select: { id: true, courseId: true, sectionId: true, date: true },
    });

    const attendanceMap = new Map<string, string>();
    for (const as of existingAttendanceSessions) {
      const key = `${as.courseId}_${as.sectionId}_${this.formatUtcDateOnly(new Date(as.date))}`;
      attendanceMap.set(key, as.id);
    }

    let generatedCount = 0;
    let skippedHolidayCount = 0;
    let retainedCount = 0;

    const termStartUtc = new Date(
      Date.UTC(
        term.startDate.getUTCFullYear(),
        term.startDate.getUTCMonth(),
        term.startDate.getUTCDate(),
      ),
    );
    const termEndUtc = new Date(
      Date.UTC(
        term.endDate.getUTCFullYear(),
        term.endDate.getUTCMonth(),
        term.endDate.getUTCDate(),
      ),
    );

    for (const entry of entries) {
      const targetJsDay = TIMETABLE_DAY_TO_JS[entry.dayOfWeek];
      if (targetJsDay === undefined) continue;

      const progId = entry.section?.programId;
      const secId = entry.sectionId;

      // Iterate day-by-day across the term range
      const dayIter = new Date(termStartUtc);
      while (dayIter <= termEndUtc) {
        if (dayIter.getUTCDay() === targetJsDay) {
          const dateStr = this.formatUtcDateOnly(dayIter);
          const occurrenceDate = new Date(dayIter);

          // Check holidays
          const isHoliday =
            institutionHolidays.has(dateStr) ||
            (progId && programHolidays.get(progId)?.has(dateStr)) ||
            sectionHolidays.get(secId)?.has(dateStr);

          if (isHoliday) {
            skippedHolidayCount++;
          } else {
            // Check if attendance was already recorded on this date
            const attSessionId = attendanceMap.get(
              `${entry.courseId}_${entry.sectionId}_${dateStr}`,
            );
            const initialStatus: SessionOccurrenceStatus = attSessionId ? 'COMPLETED' : 'PLANNED';

            // Find existing occurrence
            const existing = await this.prisma.sessionOccurrence.findUnique({
              where: {
                timetableEntryId_date: {
                  timetableEntryId: entry.id,
                  date: occurrenceDate,
                },
              },
            });

            if (existing) {
              // If already completed or cancelled by admin, don't revert to planned
              if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
                retainedCount++;
              } else if (attSessionId) {
                await this.prisma.sessionOccurrence.update({
                  where: { id: existing.id },
                  data: { status: 'COMPLETED', attendanceSessionId: attSessionId },
                });
                retainedCount++;
              } else {
                retainedCount++;
              }
            } else {
              await this.prisma.sessionOccurrence.create({
                data: {
                  institutionId,
                  timetableEntryId: entry.id,
                  courseId: entry.courseId,
                  sectionId: entry.sectionId,
                  facultyId: entry.facultyId,
                  termId: dto.termId,
                  date: occurrenceDate,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  status: initialStatus,
                  attendanceSessionId: attSessionId || null,
                },
              });
              generatedCount++;
            }
          }
        }
        dayIter.setUTCDate(dayIter.getUTCDate() + 1);
      }
    }

    return {
      generated: generatedCount,
      retained: retainedCount,
      skippedHolidays: skippedHolidayCount,
      totalEntries: entries.length,
      message: `Successfully planned sessions for ${entries.length} weekly timetable entries. (${generatedCount} new occurrences created, ${retainedCount} existing retained, ${skippedHolidayCount} holidays avoided)`,
    };
  }

  /**
   * Get session planning summary for a section in a term.
   * Returns:
   * | Course | Weekly Sessions | Planned | Completed | Cancelled | Remaining | Hours |
   */
  async getPlanningSummary(institutionId: string, termId: string, sectionId: string) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { id: termId },
    });
    if (!term) throw new NotFoundException('Academic term not found');

    const entries = await this.prisma.timetableEntry.findMany({
      where: { institutionId, termId, sectionId },
      include: {
        course: { select: { id: true, name: true, code: true, creditValue: true } },
        section: { select: { id: true, name: true, programId: true } },
      },
    });

    if (entries.length === 0) return [];

    // Group weekly entries by courseId
    const courseMap = new Map<
      string,
      {
        courseId: string;
        courseName: string;
        courseCode: string;
        creditValue: number | null;
        weeklySessions: number;
        entries: typeof entries;
        entryIds: string[];
      }
    >();

    for (const entry of entries) {
      const key = entry.courseId;
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          courseId: entry.courseId,
          courseName: entry.course?.name || 'Unknown Course',
          courseCode: entry.course?.code || '',
          creditValue: entry.course?.creditValue || null,
          weeklySessions: 0,
          entries: [],
          entryIds: [],
        });
      }
      const item = courseMap.get(key)!;
      item.weeklySessions++;
      item.entries.push(entry);
      item.entryIds.push(entry.id);
    }

    const allEntryIds = entries.map((e) => e.id);
    const existingOccurrences = await this.prisma.sessionOccurrence.findMany({
      where: { timetableEntryId: { in: allEntryIds } },
    });

    // Check if occurrences were already generated
    const hasGeneratedOccurrences = existingOccurrences.length > 0;

    // Fetch holiday dates in advance for dynamic calculation if not yet generated
    const holidays = await this.prisma.calendarEvent.findMany({
      where: {
        institutionId,
        eventType: 'HOLIDAY',
        startAt: { lte: term.endDate },
        endAt: { gte: term.startDate },
      },
    });

    const holidayDates = new Set<string>();
    for (const h of holidays) {
      const cur = new Date(h.startAt);
      const end = new Date(h.endAt);
      while (cur <= end) {
        holidayDates.add(this.formatUtcDateOnly(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }

    const summary = Array.from(courseMap.values()).map((item) => {
      if (hasGeneratedOccurrences) {
        const courseOccurrences = existingOccurrences.filter((o) =>
          item.entryIds.includes(o.timetableEntryId),
        );

        const completed = courseOccurrences.filter((o) => o.status === 'COMPLETED').length;
        const cancelled = courseOccurrences.filter((o) => o.status === 'CANCELLED').length;
        const remaining = courseOccurrences.filter((o) => o.status === 'PLANNED').length;
        const planned = courseOccurrences.length;

        // Calculate hours based on occurrences duration
        let plannedHours = 0;
        let completedHours = 0;

        for (const o of courseOccurrences) {
          const duration = this.calculateSessionHours(o.startTime, o.endTime);
          plannedHours += duration;
          if (o.status === 'COMPLETED') {
            completedHours += duration;
          }
        }

        return {
          courseId: item.courseId,
          courseName: item.courseName,
          courseCode: item.courseCode,
          creditValue: item.creditValue,
          weeklySessions: item.weeklySessions,
          planned,
          completed,
          cancelled,
          remaining,
          plannedHours: Math.round(plannedHours * 10) / 10,
          completedHours: Math.round(completedHours * 10) / 10,
          occurrencesGenerated: true,
        };
      } else {
        // Occurrences have not been generated yet: calculate projected counts dynamically
        let projectedPlanned = 0;
        let projectedHours = 0;

        const termStartUtc = new Date(
          Date.UTC(
            term.startDate.getUTCFullYear(),
            term.startDate.getUTCMonth(),
            term.startDate.getUTCDate(),
          ),
        );
        const termEndUtc = new Date(
          Date.UTC(
            term.endDate.getUTCFullYear(),
            term.endDate.getUTCMonth(),
            term.endDate.getUTCDate(),
          ),
        );

        for (const entry of item.entries) {
          const targetDay = TIMETABLE_DAY_TO_JS[entry.dayOfWeek];
          if (targetDay === undefined) continue;

          const duration = this.calculateSessionHours(entry.startTime, entry.endTime);
          const cur = new Date(termStartUtc);

          while (cur <= termEndUtc) {
            if (cur.getUTCDay() === targetDay) {
              const dStr = this.formatUtcDateOnly(cur);
              if (!holidayDates.has(dStr)) {
                projectedPlanned++;
                projectedHours += duration;
              }
            }
            cur.setUTCDate(cur.getUTCDate() + 1);
          }
        }

        return {
          courseId: item.courseId,
          courseName: item.courseName,
          courseCode: item.courseCode,
          creditValue: item.creditValue,
          weeklySessions: item.weeklySessions,
          planned: projectedPlanned,
          completed: 0,
          cancelled: 0,
          remaining: projectedPlanned,
          plannedHours: Math.round(projectedHours * 10) / 10,
          completedHours: 0,
          occurrencesGenerated: false,
        };
      }
    });

    return summary.sort((a, b) => a.courseName.localeCompare(b.courseName));
  }

  /**
   * Find individual occurrences with filters (e.g. for drilldown table/calendar)
   */
  async findAll(
    institutionId: string,
    filters: {
      termId?: string;
      sectionId?: string;
      courseId?: string;
      status?: SessionOccurrenceStatus;
      date?: string;
    },
  ) {
    const where: any = { institutionId };
    if (filters.termId) where.termId = filters.termId;
    if (filters.sectionId) where.sectionId = filters.sectionId;
    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.status) where.status = filters.status;
    if (filters.date) where.date = new Date(filters.date);

    return this.prisma.sessionOccurrence.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true, code: true } },
        faculty: {
          select: {
            id: true,
            teacherCode: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        timetableEntry: {
          select: {
            dayOfWeek: true,
            room: { select: { id: true, number: true, name: true } },
          },
        },
        attendanceSession: {
          select: {
            id: true,
            topic: true,
            _count: { select: { attendanceRecords: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Cancel an occurrence with an optional reason
   */
  async cancel(institutionId: string, id: string, reason?: string) {
    const occurrence = await this.prisma.sessionOccurrence.findFirst({
      where: { id, institutionId },
    });
    if (!occurrence) throw new NotFoundException('Session occurrence not found');
    if (occurrence.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot cancel an already completed session with recorded attendance',
      );
    }

    return this.prisma.sessionOccurrence.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledReason: reason || 'Cancelled by administrator',
      },
    });
  }

  /**
   * Reschedule an occurrence to a new date/time
   */
  async reschedule(
    institutionId: string,
    id: string,
    dto: { newDate: string; newStartTime?: string; newEndTime?: string; reason?: string },
  ) {
    const occurrence = await this.prisma.sessionOccurrence.findFirst({
      where: { id, institutionId },
    });
    if (!occurrence) throw new NotFoundException('Session occurrence not found');
    if (occurrence.status === 'COMPLETED') {
      throw new BadRequestException('Cannot reschedule an already completed session');
    }

    const reschedDate = new Date(dto.newDate);

    return this.prisma.sessionOccurrence.update({
      where: { id },
      data: {
        status: 'RESCHEDULED',
        rescheduledTo: reschedDate,
        cancelledReason: dto.reason || 'Rescheduled by administrator',
      },
    });
  }

  /**
   * Find a single occurrence by ID
   */
  async findOne(institutionId: string, id: string) {
    const occurrence = await this.prisma.sessionOccurrence.findFirst({
      where: { id, institutionId },
      include: {
        course: true,
        section: true,
        faculty: { include: { user: true } },
        timetableEntry: { include: { room: true } },
        attendanceRecords: { include: { student: { include: { user: true } } } },
      },
    });
    if (!occurrence) throw new NotFoundException('Session occurrence not found');
    return occurrence;
  }
}
