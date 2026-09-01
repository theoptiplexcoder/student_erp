import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTimetableEntryDto, UpdateTimetableEntryDto, MoveTimetableEntryDto, ReassignFacultyDto, BulkUpdateTimetableDto, GenerateTimetableDto } from './dto';

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
    dayOfWeek: import("@prisma/client").TimetableDay,
    startTime: string,
    endTime: string,
    roomId?: string,
    facultyId?: string,
    sectionId?: string,
    excludeId?: string
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
      dto.sectionId
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

  async findAll(institutionId: string, filters: { termId?: string; sectionId?: string; facultyId?: string; dayOfWeek?: import("@prisma/client").TimetableDay }) {
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
      id
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
      entryId
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
      dto.entryId
    );

    if (conflicts.length > 0) {
      throw new ConflictException('Faculty has a conflicting assignment at this time', { cause: conflicts });
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
        entry.id
      );

      if (conflicts.length > 0) {
        throw new ConflictException(
          `Conflict for entry ${entry.id}`,
          { cause: conflicts }
        );
      }
    }

    return this.prisma.$transaction(
      dto.entryIds.map(id => {
        const updateData: any = { ...dto.updates };
        if (dto.updates.startTime) updateData.startTime = this.parseTime(dto.updates.startTime);
        if (dto.updates.endTime) updateData.endTime = this.parseTime(dto.updates.endTime);
        
        return this.prisma.timetableEntry.update({
          where: { id },
          data: updateData,
        });
      })
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

    const days: import("@prisma/client").TimetableDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const generatedEntries: Prisma.TimetableEntryCreateManyInput[] = [];

    const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) => {
      return startA < endB && endA > startB;
    };

    const isConflict = (day: string, start: Date, end: Date, facultyId: string, sectionId: string, roomId: string) => {
      const allEntries: any[] = [...existingEntries, ...generatedEntries];
      for (const entry of allEntries) {
        if (entry.dayOfWeek !== day) continue;
        if (overlaps(start, end, entry.startTime, entry.endTime)) {
          if (entry.facultyId === facultyId || entry.sectionId === sectionId || entry.roomId === roomId) {
            return true;
          }
        }
      }
      return false;
    };

    for (const assignment of assignments) {
      const credits = Math.max(1, Math.floor(assignment.course.creditValue || 3));
      let assigned = 0;

      for (const day of days) {
        if (assigned >= credits) break;
        
        const startHour = assignment.course.isPractical ? 12 : 8;
        const endHour = assignment.course.isPractical ? 16 : 12;

        for (let hour = startHour; hour < endHour; hour++) {
          if (assigned >= credits) break;

          const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
          const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
          const start = this.parseTime(startTimeStr);
          const end = this.parseTime(endTimeStr);

          let selectedRoomId = null;
          for (const room of rooms) {
            if (room.capacity && assignment.section.capacity && room.capacity < assignment.section.capacity) continue;
            if (!isConflict(day, start, end, assignment.facultyId, assignment.sectionId, room.id)) {
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
            break; // spread across days
          }
        }
      }
    }

    if (generatedEntries.length > 0) {
      await this.prisma.timetableEntry.createMany({
        data: generatedEntries,
      });
    }

    return this.prisma.timetable.findUnique({
      where: { id: timetable.id },
      include: { entries: true },
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
