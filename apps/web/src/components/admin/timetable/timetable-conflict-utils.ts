export type ConflictType = 'FACULTY' | 'ROOM' | 'SECTION';

export interface TimetableConflict {
  type: ConflictType;
  message: string;
  entryAId?: string;
  entryBId?: string;
  courseName?: string;
  sectionName?: string;
  facultyName?: string;
  roomName?: string;
  dayOfWeek?: string;
  time?: string;
}

/**
 * Converts a time string (e.g. "09:30", "09:30:00", or ISO "2024-01-01T09:30:00Z")
 * or Date object to minutes from midnight (0 - 1439).
 */
export function timeToMinutes(time: string | Date | undefined | null): number {
  if (!time) return 0;
  if (time instanceof Date) {
    if (isNaN(time.getTime())) return 0;
    return time.getUTCHours() * 60 + time.getUTCMinutes();
  }

  const str = String(time);
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    }
  }

  const parts = str.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }

  return 0;
}

/**
 * Format minutes or raw string/date into HH:mm
 */
export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatTimeSlot(time: string | Date | undefined | null): string {
  if (!time) return '';
  const mins = timeToMinutes(time);
  return formatMinutesToTime(mins);
}

/**
 * Check if two time intervals overlap (strictly start < otherEnd && end > otherStart).
 */
export function isTimeOverlapping(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date,
): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  return minStartA < minEndB && minEndA > minStartB;
}

function getFacultyName(entry: any): string {
  if (!entry) return 'Faculty';
  if (entry.faculty?.user) {
    const { firstName, lastName } = entry.faculty.user;
    return `${firstName || ''} ${lastName || ''}`.trim() || entry.faculty.teacherCode || 'Faculty';
  }
  return entry.facultyName || entry.facultyId || 'Faculty';
}

function getSectionName(entry: any): string {
  if (!entry) return 'Section';
  return entry.section?.name || entry.sectionName || entry.sectionId || 'Section';
}

function getCourseName(entry: any): string {
  if (!entry) return 'Course';
  return (
    entry.course?.name ||
    entry.courseOffering?.course?.name ||
    entry.courseName ||
    entry.courseId ||
    'Course'
  );
}

function getRoomName(entry: any): string {
  if (!entry) return 'Room';
  return entry.room?.name || entry.roomName || entry.roomId || 'Room';
}

/**
 * Scan all entries and detect:
 * 1. Faculty conflicts (same teacher scheduled at same time, or two sections with same faculty)
 * 2. Room conflicts (two sections scheduled in same classroom/room at same time)
 * 3. Section conflicts (same section scheduled with overlapping classes)
 */
export function findTimetableConflicts(entries: any[]): TimetableConflict[] {
  if (!Array.isArray(entries) || entries.length < 2) return [];

  const conflicts: TimetableConflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      if (!a || !b) continue;
      if (a.dayOfWeek !== b.dayOfWeek) continue;

      if (!isTimeOverlapping(a.startTime, a.endTime, b.startTime, b.endTime)) {
        continue;
      }

      const timeSpan = `${formatTimeSlot(a.startTime)}-${formatTimeSlot(a.endTime)}`;
      const day = a.dayOfWeek;

      // 1. Same Faculty / Teacher overlap
      if (a.facultyId && b.facultyId && a.facultyId === b.facultyId) {
        const facultyName = getFacultyName(a);
        const secA = getSectionName(a);
        const secB = getSectionName(b);
        const crsA = getCourseName(a);
        const crsB = getCourseName(b);

        conflicts.push({
          type: 'FACULTY',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: day,
          time: timeSpan,
          facultyName,
          message:
            secA !== secB
              ? `Faculty overlap: ${facultyName} is assigned to both ${secA} (${crsA}) and ${secB} (${crsB}) on ${day} (${timeSpan})`
              : `Faculty double-booking: ${facultyName} has overlapping sessions for ${secA} on ${day} (${timeSpan})`,
        });
      }

      // 2. Room / Classroom overlap
      if (a.roomId && b.roomId && a.roomId === b.roomId) {
        const roomName = getRoomName(a);
        const secA = getSectionName(a);
        const secB = getSectionName(b);

        conflicts.push({
          type: 'ROOM',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: day,
          time: timeSpan,
          roomName,
          message: `Classroom clash: ${roomName} is booked for both ${secA} and ${secB} on ${day} (${timeSpan})`,
        });
      }

      // 3. Section overlap
      if (a.sectionId && b.sectionId && a.sectionId === b.sectionId) {
        const secName = getSectionName(a);
        const crsA = getCourseName(a);
        const crsB = getCourseName(b);

        conflicts.push({
          type: 'SECTION',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: day,
          time: timeSpan,
          sectionName: secName,
          message: `Section schedule collision: ${secName} has concurrent classes (${crsA} & ${crsB}) on ${day} (${timeSpan})`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Return the set of entry IDs that have at least one conflict
 */
export function getConflictingEntryIds(conflicts: TimetableConflict[]): Set<string> {
  const ids = new Set<string>();
  for (const c of conflicts) {
    if (c.entryAId) ids.add(c.entryAId);
    if (c.entryBId) ids.add(c.entryBId);
  }
  return ids;
}

/**
 * Check if a prospective or edited entry collides with any existing timetable entry.
 */
export function checkCandidateEntryConflicts(
  candidate: {
    id?: string;
    dayOfWeek: string;
    startTime: string | Date;
    endTime: string | Date;
    facultyId?: string;
    roomId?: string;
    sectionId?: string;
  },
  existingEntries: any[],
): TimetableConflict[] {
  if (!candidate.dayOfWeek || !candidate.startTime || !candidate.endTime) return [];
  if (!Array.isArray(existingEntries) || existingEntries.length === 0) return [];

  const conflicts: TimetableConflict[] = [];
  const timeSpan = `${formatTimeSlot(candidate.startTime)}-${formatTimeSlot(candidate.endTime)}`;
  const day = candidate.dayOfWeek;

  for (const entry of existingEntries) {
    // Ignore self when editing
    if (candidate.id && entry.id === candidate.id) continue;
    if (entry.dayOfWeek !== candidate.dayOfWeek) continue;

    if (
      !isTimeOverlapping(candidate.startTime, candidate.endTime, entry.startTime, entry.endTime)
    ) {
      continue;
    }

    // Faculty check
    if (candidate.facultyId && entry.facultyId && candidate.facultyId === entry.facultyId) {
      const facultyName = getFacultyName(entry);
      const otherSec = getSectionName(entry);
      const otherCrs = getCourseName(entry);

      conflicts.push({
        type: 'FACULTY',
        entryAId: candidate.id,
        entryBId: entry.id,
        dayOfWeek: day,
        time: timeSpan,
        facultyName,
        message: `Faculty clash: ${facultyName} is already scheduled for ${otherSec} (${otherCrs}) on ${day} at ${formatTimeSlot(entry.startTime)}-${formatTimeSlot(entry.endTime)}`,
      });
    }

    // Room check
    if (candidate.roomId && entry.roomId && candidate.roomId === entry.roomId) {
      const roomName = getRoomName(entry);
      const otherSec = getSectionName(entry);

      conflicts.push({
        type: 'ROOM',
        entryAId: candidate.id,
        entryBId: entry.id,
        dayOfWeek: day,
        time: timeSpan,
        roomName,
        message: `Classroom clash: Room ${roomName} is already occupied by ${otherSec} on ${day} at ${formatTimeSlot(entry.startTime)}-${formatTimeSlot(entry.endTime)}`,
      });
    }

    // Section check
    if (candidate.sectionId && entry.sectionId && candidate.sectionId === entry.sectionId) {
      const secName = getSectionName(entry);
      const otherCrs = getCourseName(entry);

      conflicts.push({
        type: 'SECTION',
        entryAId: candidate.id,
        entryBId: entry.id,
        dayOfWeek: day,
        time: timeSpan,
        sectionName: secName,
        message: `Section clash: ${secName} already has ${otherCrs} scheduled on ${day} at ${formatTimeSlot(entry.startTime)}-${formatTimeSlot(entry.endTime)}`,
      });
    }
  }

  return conflicts;
}
