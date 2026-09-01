import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, RoomType } from '@prisma/client';
import {
  CreateTimetableEntryDto,
  UpdateTimetableEntryDto,
  MoveTimetableEntryDto,
  ReassignFacultyDto,
  BulkUpdateTimetableDto,
  GenerateTimetableDto,
} from './dto';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
  }

  private formatTime(d: Date): string {
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
  }

  async checkConflicts(
    institutionId: string,
    termId: string,
    dayOfWeek: import('@prisma/client').TimetableDay,
    startTime: string,
    endTime: string,
    roomId?: string,
    facultyId?: string,
    sectionId?: string,
    excludeId?: string,
  ) {
    if (!termId || !dayOfWeek || !startTime || !endTime) {
      return [];
    }

    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    const timeOverlap = {
      startTime: { lt: end },
      endTime: { gt: start },
    };

    const conditions: Prisma.TimetableEntryWhereInput[] = [];

    if (roomId) {
      conditions.push({ roomId, ...timeOverlap });
    }

    if (facultyId) {
      conditions.push({ facultyId, ...timeOverlap });
    }

    if (sectionId) {
      conditions.push({ sectionId, ...timeOverlap });
    }

    if (conditions.length === 0) return [];

    const conflicts = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        termId,
        dayOfWeek,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: conditions,
      },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
    return conflicts;
  }

  async create(institutionId: string, dto: CreateTimetableEntryDto) {
    const term = await this.prisma.academicTerm.findUnique({ where: { id: dto.termId } });
    if (!term) throw new NotFoundException('Term not found');

    const conflicts = await this.checkConflicts(
      institutionId,
      dto.termId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
      dto.roomId,
      dto.facultyId,
      dto.sectionId,
    );
    if (conflicts.length > 0) {
      throw new ConflictException('Conflicts detected', { cause: conflicts });
    }

    return this.prisma.timetableEntry.create({
      data: {
        institutionId,
        academicYearId: term.academicYearId,
        termId: dto.termId,
        courseId: dto.courseId,
        facultyId: dto.facultyId,
        sectionId: dto.sectionId,
        dayOfWeek: dto.dayOfWeek,
        startTime: this.parseTime(dto.startTime),
        endTime: this.parseTime(dto.endTime),
        roomId: dto.roomId,
        buildingId: dto.buildingId,
        lessonPlanId: dto.lessonPlanId,
        timetableId: dto.timetableId,
      },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
  }

  async findAll(
    institutionId: string,
    filters: {
      termId?: string;
      sectionId?: string;
      facultyId?: string;
      dayOfWeek?: import('@prisma/client').TimetableDay;
    },
  ) {
    return this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        ...(filters.termId && { termId: filters.termId }),
        ...(filters.sectionId && { sectionId: filters.sectionId }),
        ...(filters.facultyId && { facultyId: filters.facultyId }),
        ...(filters.dayOfWeek && { dayOfWeek: filters.dayOfWeek }),
      },
      include: { course: true, faculty: { include: { user: true } }, section: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(institutionId: string, id: string) {
    const entry = await this.prisma.timetableEntry.findFirst({
      where: { id, institutionId },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
    if (!entry) throw new NotFoundException('Timetable entry not found');
    return entry;
  }

  async update(institutionId: string, id: string, dto: UpdateTimetableEntryDto) {
    const existing = await this.findOne(institutionId, id);

    const termId = dto.termId ?? existing.termId;
    const dayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;

    const startTime = dto.startTime ?? this.formatTime(existing.startTime);
    const endTime = dto.endTime ?? this.formatTime(existing.endTime);
    const roomId = dto.roomId !== undefined ? dto.roomId : existing.roomId;
    const facultyId = dto.facultyId ?? existing.facultyId;
    const sectionId = dto.sectionId ?? existing.sectionId;

    const conflicts = await this.checkConflicts(
      institutionId,
      termId,
      dayOfWeek,
      startTime,
      endTime,
      roomId || undefined,
      facultyId,
      sectionId,
      id,
    );

    if (conflicts.length > 0) {
      throw new ConflictException('Conflicts detected', { cause: conflicts });
    }

    let academicYearId = existing.academicYearId;
    if (dto.termId && dto.termId !== existing.termId) {
      const term = await this.prisma.academicTerm.findUnique({ where: { id: dto.termId } });
      if (!term) throw new NotFoundException('Term not found');
      academicYearId = term.academicYearId;
    }

    return this.prisma.timetableEntry.update({
      where: { id },
      data: {
        academicYearId,
        termId: dto.termId,
        courseId: dto.courseId,
        facultyId: dto.facultyId,
        sectionId: dto.sectionId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime ? this.parseTime(dto.startTime) : undefined,
        endTime: dto.endTime ? this.parseTime(dto.endTime) : undefined,
        roomId: dto.roomId,
        buildingId: dto.buildingId,
        lessonPlanId: dto.lessonPlanId,
        timetableId: dto.timetableId,
      },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
  }

  async remove(institutionId: string, id: string) {
    const entry = await this.findOne(institutionId, id);
    return this.prisma.timetableEntry.delete({
      where: { id: entry.id },
    });
  }

  async moveEntry(institutionId: string, entryId: string, moveDto: MoveTimetableEntryDto) {
    const existing = await this.prisma.timetableEntry.findFirst({
      where: { id: entryId, institutionId },
    });
    if (!existing) throw new NotFoundException('Entry not found');

    const dayOfWeek = moveDto.dayOfWeek ?? existing.dayOfWeek;
    const startTime = moveDto.startTime ?? this.formatTime(existing.startTime);
    const endTime = moveDto.endTime ?? this.formatTime(existing.endTime);
    const roomId = moveDto.roomId !== undefined ? moveDto.roomId : existing.roomId;

    const conflicts = await this.checkConflicts(
      institutionId,
      existing.termId,
      dayOfWeek,
      startTime,
      endTime,
      roomId || undefined,
      existing.facultyId,
      existing.sectionId,
      entryId,
    );

    if (conflicts.length > 0) {
      throw new ConflictException('Cannot move: conflicts detected', { cause: conflicts });
    }

    return this.prisma.timetableEntry.update({
      where: { id: entryId },
      data: {
        ...(moveDto.dayOfWeek && { dayOfWeek: moveDto.dayOfWeek }),
        ...(moveDto.startTime && { startTime: this.parseTime(moveDto.startTime) }),
        ...(moveDto.endTime && { endTime: this.parseTime(moveDto.endTime) }),
        ...(moveDto.roomId !== undefined && { roomId: moveDto.roomId }),
        ...(moveDto.buildingId !== undefined && { buildingId: moveDto.buildingId }),
      },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
  }

  async reassignFaculty(institutionId: string, dto: ReassignFacultyDto) {
    const entry = await this.prisma.timetableEntry.findFirst({
      where: { id: dto.entryId, institutionId },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    const faculty = await this.prisma.faculty.findFirst({
      where: { id: dto.facultyId, institutionId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const conflicts = await this.checkConflicts(
      institutionId,
      entry.termId,
      entry.dayOfWeek,
      this.formatTime(entry.startTime),
      this.formatTime(entry.endTime),
      entry.roomId || undefined,
      dto.facultyId,
      entry.sectionId,
      dto.entryId,
    );

    if (conflicts.length > 0) {
      throw new ConflictException('Faculty has a conflicting assignment at this time', {
        cause: conflicts,
      });
    }

    return this.prisma.timetableEntry.update({
      where: { id: dto.entryId },
      data: { facultyId: dto.facultyId },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
    });
  }

  async bulkUpdate(institutionId: string, dto: BulkUpdateTimetableDto) {
    const entries = await this.prisma.timetableEntry.findMany({
      where: { id: { in: dto.entryIds }, institutionId },
    });
    if (entries.length !== dto.entryIds.length) {
      throw new NotFoundException('Some entries not found');
    }

    for (const entry of entries) {
      const dayOfWeek = dto.updates.dayOfWeek ?? entry.dayOfWeek;
      const startTime = dto.updates.startTime ?? this.formatTime(entry.startTime);
      const endTime = dto.updates.endTime ?? this.formatTime(entry.endTime);
      const roomId = dto.updates.roomId !== undefined ? dto.updates.roomId : entry.roomId;
      const facultyId = dto.updates.facultyId ?? entry.facultyId;

      const conflicts = await this.checkConflicts(
        institutionId,
        entry.termId,
        dayOfWeek,
        startTime,
        endTime,
        roomId || undefined,
        facultyId,
        entry.sectionId,
        entry.id,
      );

      if (conflicts.length > 0) {
        throw new ConflictException(`Conflict for entry ${entry.id}`, { cause: conflicts });
      }
    }

    return this.prisma.$transaction(
      dto.entryIds.map((id) => {
        const updateData: any = { ...dto.updates };
        if (dto.updates.startTime) updateData.startTime = this.parseTime(dto.updates.startTime);
        if (dto.updates.endTime) updateData.endTime = this.parseTime(dto.updates.endTime);

        return this.prisma.timetableEntry.update({
          where: { id },
          data: updateData,
        });
      }),
    );
  }

  async bulkDelete(institutionId: string, entryIds: string[]) {
    const entries = await this.prisma.timetableEntry.findMany({
      where: { id: { in: entryIds }, institutionId },
    });
    if (entries.length !== entryIds.length) {
      throw new NotFoundException('Some entries not found');
    }

    return this.prisma.timetableEntry.deleteMany({
      where: { id: { in: entryIds } },
    });
  }

  async swapSlots(institutionId: string, entryIdA: string, entryIdB: string) {
    const [entryA, entryB] = await Promise.all([
      this.prisma.timetableEntry.findFirst({ where: { id: entryIdA, institutionId } }),
      this.prisma.timetableEntry.findFirst({ where: { id: entryIdB, institutionId } }),
    ]);

    if (!entryA || !entryB) throw new NotFoundException('One or both entries not found');

    return this.prisma.$transaction([
      this.prisma.timetableEntry.update({
        where: { id: entryIdA },
        data: {
          dayOfWeek: entryB.dayOfWeek,
          startTime: entryB.startTime,
          endTime: entryB.endTime,
          roomId: entryB.roomId,
          buildingId: entryB.buildingId,
        },
      }),
      this.prisma.timetableEntry.update({
        where: { id: entryIdB },
        data: {
          dayOfWeek: entryA.dayOfWeek,
          startTime: entryA.startTime,
          endTime: entryA.endTime,
          roomId: entryA.roomId,
          buildingId: entryA.buildingId,
        },
      }),
    ]);
  }

  async generate(institutionId: string, dto: GenerateTimetableDto) {
    const term = await this.prisma.academicTerm.findUnique({ where: { id: dto.termId } });
    if (!term) throw new NotFoundException('Term not found');

    // Archive existing timetable for this term (keep only 1 previous version)
    const existingTimetable = await this.prisma.timetable.findFirst({
      where: { institutionId, termId: dto.termId, status: { in: ['DRAFT', 'PUBLISHED'] } },
    });
    if (existingTimetable) {
      await this.prisma.timetable.update({
        where: { id: existingTimetable.id },
        data: { status: 'ARCHIVED' },
      });
      // Delete older archived timetables for this term (keep only 1 previous)
      const olderArchived = await this.prisma.timetable.findMany({
        where: {
          institutionId,
          termId: dto.termId,
          status: 'ARCHIVED',
          id: { not: existingTimetable.id },
        },
      });
      for (const old of olderArchived) {
        await this.prisma.timetableEntry.deleteMany({ where: { timetableId: old.id } });
        await this.prisma.timetable.delete({ where: { id: old.id } });
      }
    }

    const name = dto.name || `Generated Timetable - ${new Date().toISOString()}`;
    const timetable = await this.prisma.timetable.create({
      data: {
        institutionId,
        academicYearId: term.academicYearId,
        termId: dto.termId,
        name,
        status: 'DRAFT',
      },
    });

    // Fetch all assignments grouped by section
    const assignments = await this.prisma.courseAssignment.findMany({
      where: {
        institutionId,
        termId: dto.termId,
        sectionId: { in: dto.sectionIds },
      },
      include: { course: true, section: true },
    });

    const rooms = await this.prisma.room.findMany({
      where: { institutionId },
    });

    const existingEntries = await this.prisma.timetableEntry.findMany({
      where: { institutionId, termId: dto.termId },
    });

    // Fetch faculty availability for the term
    const facultyAvailability = await this.prisma.facultyAvailability.findMany({
      where: {
        facultyId: { in: [...new Set(assignments.map((a) => a.facultyId))] },
      },
    });

    const curriculumCourses = await this.prisma.curriculumCourse.findMany({
      where: {
        institutionId,
        courseId: { in: [...new Set(assignments.map((a) => a.courseId))] },
      },
      include: {
        curriculumTerm: {
          include: {
            curriculum: true,
          },
        },
      },
    });

    const getCreditsForAssignment = (assignment: any) => {
      if (!assignment.section?.programId) return assignment.course?.creditValue ?? 3;
      const cc = curriculumCourses.find(
        (c) =>
          c.courseId === assignment.courseId &&
          c.curriculumTerm?.curriculum?.programId === assignment.section.programId,
      );
      return cc?.creditValue ?? assignment.course?.creditValue ?? 3;
    };

    const days: import('@prisma/client').TimetableDay[] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
    ];
    const generatedEntries: Prisma.TimetableEntryCreateManyInput[] = [];
    const conflicts: Array<{
      type: string;
      message: string;
      courseId?: string;
      sectionId?: string;
      facultyId?: string;
    }> = [];

    // Helper to check time overlap
    const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) => {
      return startA < endB && endA > startB;
    };

    // Check if faculty is available at given time
    const isFacultyAvailable = (facultyId: string, day: string, start: Date, end: Date) => {
      const avail = facultyAvailability.filter(
        (f) => f.facultyId === facultyId && f.dayOfWeek === day,
      );
      if (avail.length === 0) return true; // No availability records = always available
      return avail.some((a) => !a.isAvailable || overlaps(start, end, a.startTime, a.endTime));
    };

    // Check for conflicts with existing or generated entries
    const checkConflict = (
      day: string,
      start: Date,
      end: Date,
      facultyId: string,
      sectionId: string,
      roomId: string | null,
    ) => {
      const allEntries: any[] = [...existingEntries, ...generatedEntries];
      for (const entry of allEntries) {
        if (entry.dayOfWeek !== day) continue;
        if (overlaps(start, end, entry.startTime, entry.endTime)) {
          if (entry.facultyId === facultyId)
            return {
              type: 'FACULTY',
              message: `Faculty conflict at ${day} ${this.formatTime(start)}-${this.formatTime(end)}`,
            };
          if (entry.sectionId === sectionId)
            return {
              type: 'SECTION',
              message: `Section conflict at ${day} ${this.formatTime(start)}-${this.formatTime(end)}`,
            };
          if (roomId && entry.roomId === roomId)
            return {
              type: 'ROOM',
              message: `Room conflict at ${day} ${this.formatTime(start)}-${this.formatTime(end)}`,
            };
        }
      }
      return null;
    };

    // Group assignments by section for proportional distribution
    const sectionAssignments = new Map<string, typeof assignments>();
    for (const assignment of assignments) {
      const existing = sectionAssignments.get(assignment.sectionId) || [];
      existing.push(assignment);
      sectionAssignments.set(assignment.sectionId, existing);
    }

    // Process each section
    for (const [sectionId, sectionAssignmentsList] of sectionAssignments) {
      // Calculate total credits for proportional distribution
      const totalCredits = sectionAssignmentsList.reduce(
        (sum, a) => sum + getCreditsForAssignment(a),
        0,
      );

      // Sort by credits descending to place larger courses first
      const sortedAssignments = [...sectionAssignmentsList].sort(
        (a, b) => getCreditsForAssignment(b) - getCreditsForAssignment(a),
      );

      for (const assignment of sortedAssignments) {
        const credits = Math.max(1, Math.floor(getCreditsForAssignment(assignment)));
        const durationMinutes =
          dto.sessionDurations?.[assignment.courseId] || dto.defaultSessionDuration || 50;
        const sessionsNeeded = credits; // Each credit = one session of configured duration

        let assigned = 0;

        // Try to spread sessions across different days
        for (const day of days) {
          if (assigned >= sessionsNeeded) break;

          const whStart = dto.workingHours ? parseInt(dto.workingHours.start.split(':')[0], 10) : 8;
          const whEnd = dto.workingHours ? parseInt(dto.workingHours.end.split(':')[0], 10) : 17;
          const half = Math.floor((whStart + whEnd) / 2);

          const startHour = assignment.course.isPractical ? Math.max(whStart, half) : whStart;
          const endHour = whEnd;

          for (let hour = startHour; hour < endHour; hour++) {
            if (assigned >= sessionsNeeded) break;

            const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
            const endTimeMinutes = hour * 60 + durationMinutes;
            const endHourCalc = Math.floor(endTimeMinutes / 60);
            const endMinuteCalc = endTimeMinutes % 60;
            const endTimeStr = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`;

            const start = this.parseTime(startTimeStr);
            const end = this.parseTime(endTimeStr);

            // Check faculty availability
            if (!isFacultyAvailable(assignment.facultyId, day, start, end)) {
              continue;
            }

            // Check for conflicts
            const conflict = checkConflict(
              day,
              start,
              end,
              assignment.facultyId,
              assignment.sectionId,
              null,
            );
            if (conflict) {
              conflicts.push({
                ...conflict,
                courseId: assignment.courseId,
                sectionId: assignment.sectionId,
                facultyId: assignment.facultyId,
              });
              continue; // Skip this slot but continue trying others
            }

            // Find a suitable room
            let selectedRoomId: string | null = null;
            for (const room of rooms) {
              if (
                room.capacity &&
                assignment.section.capacity &&
                room.capacity < assignment.section.capacity
              )
                continue;
              if (room.roomType === RoomType.LAB && !assignment.course.isPractical) continue;
              if (
                (room.roomType === RoomType.CLASSROOM || room.roomType === RoomType.LECTURE_HALL) &&
                assignment.course.isPractical
              )
                continue;

              const roomConflict = checkConflict(
                day,
                start,
                end,
                assignment.facultyId,
                assignment.sectionId,
                room.id,
              );
              if (!roomConflict) {
                selectedRoomId = room.id;
                break;
              }
            }

            if (selectedRoomId) {
              const entryData = {
                institutionId,
                academicYearId: term.academicYearId,
                termId: dto.termId,
                courseId: assignment.courseId,
                facultyId: assignment.facultyId,
                sectionId: assignment.sectionId,
                dayOfWeek: day,
                startTime: start,
                endTime: end,
                roomId: selectedRoomId,
                timetableId: timetable.id,
              };
              generatedEntries.push(entryData);
              assigned++;
              break; // Move to next day after placing a session
            }
          }
        }

        if (assigned < sessionsNeeded) {
          conflicts.push({
            type: 'UNSCHEDULED',
            message: `Could not schedule all ${sessionsNeeded} sessions for ${assignment.course.name} (only ${assigned} placed)`,
            courseId: assignment.courseId,
            sectionId: assignment.sectionId,
            facultyId: assignment.facultyId,
          });
        }
      }
    }

    if (generatedEntries.length > 0) {
      await this.prisma.timetableEntry.createMany({
        data: generatedEntries,
      });
    }

    const timetableResult = await this.prisma.timetable.findUnique({
      where: { id: timetable.id },
      include: { entries: true },
    });

    return {
      timetable: timetableResult,
      conflicts,
      summary: {
        totalSessions: generatedEntries.length,
        totalConflicts: conflicts.length,
        sectionsProcessed: sectionAssignments.size,
      },
    };
  }

  async exportTimetable(institutionId: string, termId: string, format: 'csv' | 'json') {
    const entries = await this.prisma.timetableEntry.findMany({
      where: { institutionId, termId },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    if (format === 'json') {
      return entries;
    }

    // Basic CSV generation
    const lines = ['Day,Start Time,End Time,Course,Section,Faculty,Room'];
    for (const e of entries) {
      const day = e.dayOfWeek;
      const start = e.startTime.toISOString().substring(11, 16);
      const end = e.endTime.toISOString().substring(11, 16);
      const course = e.course?.name || e.courseId;
      const section = e.section?.name || e.sectionId;
      const faculty = e.faculty ? `${e.faculty.user.firstName} ${e.faculty.user.lastName}` : 'TBA';
      const room = e.room?.name || e.roomId || '';
      lines.push(`${day},${start},${end},"${course}","${section}","${faculty}","${room}"`);
    }
    return lines.join('\n');
  }

  async publish(institutionId: string, termId: string) {
    const timetable = await this.prisma.timetable.findFirst({
      where: { institutionId, termId },
      orderBy: { createdAt: 'desc' },
    });
    if (!timetable) throw new NotFoundException('Timetable not found for this term');

    return this.prisma.timetable.update({
      where: { id: timetable.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async listConflicts(institutionId: string, termId: string) {
    const entries = await this.prisma.timetableEntry.findMany({
      where: { institutionId, termId },
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const conflicts: Array<{ entryA: any; entryB: any; type: string }> = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];

        if (a.dayOfWeek !== b.dayOfWeek) continue;

        const overlaps = a.startTime < b.endTime && a.endTime > b.startTime;
        if (!overlaps) continue;

        if (a.roomId && a.roomId === b.roomId) {
          conflicts.push({ entryA: a, entryB: b, type: 'ROOM' });
        }
        if (a.facultyId === b.facultyId) {
          conflicts.push({ entryA: a, entryB: b, type: 'FACULTY' });
        }
        if (a.sectionId === b.sectionId) {
          conflicts.push({ entryA: a, entryB: b, type: 'SECTION' });
        }
      }
    }

    return conflicts;
  }
}
