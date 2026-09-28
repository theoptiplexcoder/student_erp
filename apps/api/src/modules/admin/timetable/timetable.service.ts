import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, RoomType } from '@prisma/client';
import { validateSchedule, type SolverInput } from '@student-erp/timetable-engine';
import { solveInWorker } from './generation/engine-worker';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
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

    // Build and validate the candidate schedule before changing any persisted timetable.
    const existingTimetable = await this.prisma.timetable.findFirst({
      where: { institutionId, termId: dto.termId, status: 'PUBLISHED' },
    });
    if (existingTimetable) {
      throw new ConflictException(
        'A published timetable cannot be overwritten. Archive it explicitly before generating a replacement.',
      );
    }

    const name = dto.name || `Generated Timetable - ${new Date().toISOString()}`;
    // Fetch all assignments grouped by section
    const assignments = await this.prisma.courseAssignment.findMany({
      where: {
        institutionId,
        termId: dto.termId,
        sectionId: { in: dto.sectionIds },
      },
      include: { course: true, section: true },
    });

    if (assignments.length === 0) {
      throw new BadRequestException(
        'No course assignments found for the selected sections in this term. Please assign courses and faculty to the sections first.',
      );
    }

    const rooms = await this.prisma.room.findMany({
      where: {
        institutionId,
        ...(dto.selectedRoomIds && dto.selectedRoomIds.length > 0
          ? { id: { in: dto.selectedRoomIds } }
          : {}),
      },
    });

    if (rooms.length === 0) {
      throw new BadRequestException(
        dto.selectedRoomIds && dto.selectedRoomIds.length > 0
          ? 'None of the selected rooms were found. Please select available rooms before generating the timetable.'
          : 'No rooms found in the system. Please add rooms before generating the timetable.',
      );
    }

    const existingEntries = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        termId: dto.termId,
        sectionId: { notIn: dto.sectionIds },
      },
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
            curriculum: {
              include: {
                programs: true,
              },
            },
          },
        },
      },
    });

    const getCreditsForAssignment = (assignment: any) => {
      if (!assignment.section?.programId) return assignment.course?.creditValue ?? null;
      const targetSemester = assignment.section.semester ?? term.semester;
      // First try to match curriculum program AND matching semester sequence
      const matchedCC =
        curriculumCourses.find(
          (c) =>
            c.courseId === assignment.courseId &&
            c.curriculumTerm?.curriculum?.programs?.some(
              (p) => p.id === assignment.section.programId,
            ) &&
            (targetSemester === undefined ||
              targetSemester === null ||
              c.curriculumTerm?.sequence === targetSemester),
        ) ||
        curriculumCourses.find(
          (c) =>
            c.courseId === assignment.courseId &&
            c.curriculumTerm?.curriculum?.programs?.some(
              (p) => p.id === assignment.section.programId,
            ),
        );
      return matchedCC?.creditValue ?? assignment.course?.creditValue ?? null;
    };

    const days: import('@prisma/client').TimetableDay[] =
      dto.days && dto.days.length > 0
        ? dto.days
        : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const parseClockMinutes = (value: string) => {
      const match = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(value);
      if (!match) throw new BadRequestException(`Invalid time: ${value}; expected HH:mm`);
      return Number(match[1]) * 60 + Number(match[2]);
    };
    const startOfDay = dto.workingHours ? parseClockMinutes(dto.workingHours.start) : 8 * 60;
    const endOfDay = dto.workingHours ? parseClockMinutes(dto.workingHours.end) : 17 * 60;
    const startAnchors = Array.from(
      { length: Math.floor((endOfDay - startOfDay) / 30) + 1 },
      (_, index) => startOfDay + index * 30,
    );
    if (endOfDay <= startOfDay)
      throw new BadRequestException('Working-hours end must be after start.');
    for (const bp of dto.breakPeriods ?? []) {
      if (parseClockMinutes(bp.end) <= parseClockMinutes(bp.start))
        throw new BadRequestException('Break-period end must be after start.');
    }
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

      // If explicit available slots exist (isAvailable: true), candidate session must fall within one
      const availableSlots = avail.filter((a) => a.isAvailable);
      if (availableSlots.length > 0) {
        const withinAvailable = availableSlots.some(
          (a) => start >= a.startTime && end <= a.endTime,
        );
        if (!withinAvailable) return false;
      }

      // If explicit blackout/unavailable slots exist (isAvailable: false), candidate session must NOT overlap
      const unavailableSlots = avail.filter((a) => !a.isAvailable);
      if (unavailableSlots.length > 0) {
        const inBlackout = unavailableSlots.some((a) =>
          overlaps(start, end, a.startTime, a.endTime),
        );
        if (inBlackout) return false;
      }

      return true;
    };

    // Resolve course-section teaching requirements before handing the plain-data problem to the engine.
    interface SectionCourseScheduleItem {
      courseId: string;
      course: any;
      sectionId: string;
      section: any;
      facultyIds: string[];
      credits: number;
    }

    const sectionCourseMap = new Map<string, Map<string, SectionCourseScheduleItem>>();
    for (const assignment of assignments) {
      if (!sectionCourseMap.has(assignment.sectionId)) {
        sectionCourseMap.set(assignment.sectionId, new Map());
      }
      const courseMap = sectionCourseMap.get(assignment.sectionId)!;
      if (!courseMap.has(assignment.courseId)) {
        courseMap.set(assignment.courseId, {
          courseId: assignment.courseId,
          course: assignment.course,
          sectionId: assignment.sectionId,
          section: assignment.section,
          facultyIds: [assignment.facultyId],
          credits:
            getCreditsForAssignment(assignment) === null
              ? -1
              : Math.ceil(getCreditsForAssignment(assignment) ?? 0),
        });
      } else {
        const item = courseMap.get(assignment.courseId)!;
        if (!item.facultyIds.includes(assignment.facultyId)) {
          // Keep primary/first faculty at the start
          if (assignment.isPrimary) {
            item.facultyIds.unshift(assignment.facultyId);
          } else {
            item.facultyIds.push(assignment.facultyId);
          }
        }
      }
    }

    // Missing/zero credits are reported rather than silently inventing sessions.
    for (const courseMap of sectionCourseMap.values()) {
      for (const item of courseMap.values()) {
        if (item.facultyIds.length === 0) {
          conflicts.push({
            type: 'MISSING_ASSIGNMENT',
            message: `No faculty assigned to ${item.course.name}.`,
            courseId: item.courseId,
            sectionId: item.sectionId,
          });
        }
        if (item.credits < 0) {
          conflicts.push({
            type: 'MISSING_CREDITS',
            message: `No usable credits for ${item.course.name}; no sessions generated.`,
            courseId: item.courseId,
            sectionId: item.sectionId,
          });
        }
      }
    }

    // Allow room capacity fallback if room has no capacity set or capacity is matched
    const requirements = Array.from(sectionCourseMap.values()).flatMap((courses) =>
      Array.from(courses.values())
        .filter((item) => item.credits > 0 && item.facultyIds.length > 0)
        .map((item) => {
          const matchingRooms = rooms.filter(
            (room) =>
              (!room.capacity ||
                !item.section.capacity ||
                room.capacity >= item.section.capacity) &&
              (item.course.isPractical
                ? room.roomType === RoomType.LAB
                : room.roomType !== RoomType.LAB && room.roomType !== RoomType.OFFICE),
          );
          // Fallback to any suitable typed room if strict capacity filters out all rooms
          const allowedRooms =
            matchingRooms.length > 0
              ? matchingRooms
              : rooms.filter((room) =>
                  item.course.isPractical
                    ? room.roomType === RoomType.LAB
                    : room.roomType !== RoomType.LAB && room.roomType !== RoomType.OFFICE,
                );

          return {
            id: `${item.sectionId}:${item.courseId}`,
            sectionId: item.sectionId,
            courseId: item.courseId,
            facultyIds: [item.facultyIds[0]],
            roomType: item.course.isPractical ? RoomType.LAB : undefined,
            roomIds: allowedRooms.map((room) => room.id),
            durationMinutes:
              dto.sessionDurations?.[item.courseId] || dto.defaultSessionDuration || 50,
            occurrences: item.credits,
          };
        }),
    );
    const engineInput: SolverInput = {
      engineVersion: '1.0.0',
      days,
      startMinute: startOfDay,
      endMinute: endOfDay,
      anchors: startAnchors,
      seed: 1,
      rooms: rooms.map((room) => ({ id: room.id, type: room.roomType })),
      fixedPlacements: existingEntries.map((entry) => ({
        sectionId: entry.sectionId,
        facultyIds: entry.facultyId ? [entry.facultyId] : [],
        roomId: entry.roomId ?? undefined,
        day: entry.dayOfWeek,
        startMinute: entry.startTime.getUTCHours() * 60 + entry.startTime.getUTCMinutes(),
        endMinute: entry.endTime.getUTCHours() * 60 + entry.endTime.getUTCMinutes(),
      })),
      roomCapacities: Object.fromEntries(
        rooms.map((room) => [
          room.id,
          room.capacity !== null && room.capacity !== undefined ? room.capacity : Infinity,
        ]),
      ),
      sectionCapacities: Object.fromEntries(
        Array.from(sectionCourseMap.values()).flatMap((courses) =>
          Array.from(courses.values()).map((item) => [
            item.sectionId,
            item.section.capacity ?? undefined,
          ]),
        ),
      ),
      availabilityRestricted: Array.from(
        new Map(
          facultyAvailability
            .filter((row) => row.isAvailable)
            .map((row) => [
              `${row.facultyId}:${row.dayOfWeek}`,
              { resourceId: row.facultyId, day: row.dayOfWeek },
            ]),
        ).values(),
      ),
      availability: facultyAvailability
        .filter((row) => row.isAvailable)
        .map((row) => ({
          resourceId: row.facultyId,
          day: row.dayOfWeek,
          startMinute: row.startTime.getUTCHours() * 60 + row.startTime.getUTCMinutes(),
          endMinute: row.endTime.getUTCHours() * 60 + row.endTime.getUTCMinutes(),
        })),
      blackouts: facultyAvailability
        .filter((row) => !row.isAvailable)
        .map((row) => ({
          resourceId: row.facultyId,
          day: row.dayOfWeek,
          startMinute: row.startTime.getUTCHours() * 60 + row.startTime.getUTCMinutes(),
          endMinute: row.endTime.getUTCHours() * 60 + row.endTime.getUTCMinutes(),
        })),
      dayBreaks: (dto.breakPeriods ?? []).flatMap((bp) =>
        days.map((day) => ({
          day,
          startMinute: parseClockMinutes(bp.start),
          endMinute: parseClockMinutes(bp.end),
        })),
      ),
      requirements,
    };
    const solved = await solveInWorker(engineInput, 1, 30_000);
    const validationIssues = validateSchedule(engineInput, solved.placements);
    if (validationIssues.length > 0)
      throw new ConflictException(
        `Engine validation failed: ${validationIssues.map((issue) => issue.reason).join(', ')}`,
      );
    const requirementById = new Map(
      requirements.map((requirement) => [requirement.id, requirement]),
    );
    for (const placement of solved.placements) {
      generatedEntries.push({
        institutionId,
        academicYearId: term.academicYearId,
        termId: dto.termId,
        courseId: placement.courseId,
        facultyId: placement.facultyIds[0],
        sectionId: placement.sectionId,
        dayOfWeek: placement.day as import('@prisma/client').TimetableDay,
        startTime: this.parseTime(
          `${String(Math.floor(placement.startMinute / 60)).padStart(2, '0')}:${String(placement.startMinute % 60).padStart(2, '0')}`,
        ),
        endTime: this.parseTime(
          `${String(Math.floor(placement.endMinute / 60)).padStart(2, '0')}:${String(placement.endMinute % 60).padStart(2, '0')}`,
        ),
        roomId: placement.roomId,
      });
    }
    for (const issue of solved.issues ?? []) {
      const requirement = requirementById.get(issue.requirementId ?? '');
      conflicts.push({
        type: issue.code,
        message: issue.message,
        courseId: requirement?.courseId,
        sectionId: requirement?.sectionId,
        facultyId: requirement?.facultyIds[0],
      });
    }

    // Independent overlap verification before the atomic replace.
    const validated = [...existingEntries, ...generatedEntries].map((entry) => ({
      ...entry,
      startTime: entry.startTime instanceof Date ? entry.startTime : new Date(entry.startTime),
      endTime: entry.endTime instanceof Date ? entry.endTime : new Date(entry.endTime),
    }));
    for (let i = 0; i < validated.length; i++) {
      const a = validated[i];
      for (let j = i + 1; j < validated.length; j++) {
        const b = validated[j];
        if (
          a.dayOfWeek !== b.dayOfWeek ||
          !overlaps(a.startTime, a.endTime, b.startTime, b.endTime)
        )
          continue;
        if (
          a.facultyId === b.facultyId ||
          a.sectionId === b.sectionId ||
          (a.roomId && a.roomId === b.roomId)
        ) {
          throw new ConflictException(
            'Generated timetable failed independent hard-conflict validation; nothing was persisted.',
          );
        }
      }
    }

    const timetableResult = await this.prisma.$transaction(
      async (tx) => {
        const currentPublished = await tx.timetable.findFirst({
          where: { institutionId, termId: dto.termId, status: 'PUBLISHED' },
        });
        if (currentPublished)
          throw new ConflictException('A published timetable cannot be overwritten.');
        const draft = await tx.timetable.create({
          data: {
            institutionId,
            academicYearId: term.academicYearId,
            termId: dto.termId,
            name,
            status: 'DRAFT',
          },
        });
        const oldDrafts = await tx.timetable.findMany({
          where: { institutionId, termId: dto.termId, status: 'DRAFT', id: { not: draft.id } },
          select: { id: true },
        });
        await tx.timetableEntry.deleteMany({
          where: {
            institutionId,
            termId: dto.termId,
            sectionId: { in: dto.sectionIds },
            OR: [{ timetableId: null }, { timetable: { status: 'DRAFT' } }],
          },
        });
        if (generatedEntries.length > 0) {
          await tx.timetableEntry.createMany({
            data: generatedEntries.map((entry) => ({ ...entry, timetableId: draft.id })),
          });
        }
        for (const old of oldDrafts) {
          await tx.timetable.update({ where: { id: old.id }, data: { status: 'ARCHIVED' } });
        }
        return tx.timetable.findUnique({ where: { id: draft.id }, include: { entries: true } });
      },
      { timeout: 30000, maxWait: 10000 },
    );

    if (conflicts.length > 0) {
      this.eventEmitter.emit('timetable.conflict_detected', {
        institutionId,
        termId: dto.termId,
        count: conflicts.length,
      });
    }

    return {
      timetable: timetableResult,
      conflicts,
      summary: {
        totalSessions: generatedEntries.length,
        totalConflicts: conflicts.length,
        sectionsProcessed: sectionCourseMap.size,
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
      where: { institutionId, termId, status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
    });
    if (!timetable) throw new NotFoundException('Timetable not found for this term');

    const conflicts = await this.listConflicts(institutionId, termId);
    if (conflicts.length > 0) {
      throw new ConflictException('Cannot publish a timetable with unresolved hard conflicts.');
    }

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
