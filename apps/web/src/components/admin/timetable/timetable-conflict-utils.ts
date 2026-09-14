export interface TimetableOverlapConflict {
  type: 'TEACHER_COLLISION' | 'ROOM_COLLISION' | 'SECTION_COLLISION';
  message: string;
  entryA: any;
  entryB: any;
}

export function parseMinutes(timeStr: string | Date | undefined): number {
  if (!timeStr) return 0;
  if (timeStr instanceof Date) {
    return timeStr.getUTCHours() * 60 + timeStr.getUTCMinutes();
  }
  const str = String(timeStr);
  if (str.includes('T')) {
    const timePart = str.split('T')[1]?.substring(0, 5) || '00:00';
    const [h, m] = timePart.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function timeOverlaps(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date,
): boolean {
  const sA = parseMinutes(startA);
  const eA = parseMinutes(endA);
  const sB = parseMinutes(startB);
  const eB = parseMinutes(endB);

  return sA < eB && eA > sB;
}

/**
 * Finds all overlapping collisions in an array of timetable entries.
 * Detects:
 * 1. Same teacher scheduled at the same time (even across different sections)
 * 2. Two sections with the same faculty at the same time
 * 3. Two sections in the same class/room at the same time
 */
export function detectTimetableConflicts(entries: any[]): TimetableOverlapConflict[] {
  const conflicts: TimetableOverlapConflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      if (a.dayOfWeek !== b.dayOfWeek) continue;
      if (!timeOverlaps(a.startTime, a.endTime, b.startTime, b.endTime)) continue;

      const facultyA = a.facultyId || a.faculty?.id;
      const facultyB = b.facultyId || b.faculty?.id;
      const facultyNameA = a.faculty?.user?.lastName || a.faculty?.user?.firstName || 'Faculty';

      const sectionA = a.sectionId || a.section?.id;
      const sectionB = b.sectionId || b.section?.id;
      const sectionNameA = a.section?.name || 'Section A';
      const sectionNameB = b.section?.name || 'Section B';

      const roomA = a.roomId || a.room?.id;
      const roomB = b.roomId || b.room?.id;
      const roomNameA = a.room?.name || a.room?.number || a.roomId || 'Room';

      // 1 & 2: Faculty conflict (same teacher at same time / two sections with same faculty)
      if (facultyA && facultyB && facultyA === facultyB) {
        if (sectionA !== sectionB) {
          conflicts.push({
            type: 'SECTION_COLLISION',
            message: `Faculty ${facultyNameA} is double-booked across sections "${sectionNameA}" and "${sectionNameB}" on ${a.dayOfWeek}.`,
            entryA: a,
            entryB: b,
          });
        } else {
          conflicts.push({
            type: 'TEACHER_COLLISION',
            message: `Faculty ${facultyNameA} has multiple overlapping classes scheduled on ${a.dayOfWeek}.`,
            entryA: a,
            entryB: b,
          });
        }
      }

      // 3: Room conflict (two sections in the same class/room at the same time)
      if (roomA && roomB && roomA === roomB) {
        conflicts.push({
          type: 'ROOM_COLLISION',
          message: `Room "${roomNameA}" is double-booked by "${sectionNameA}" and "${sectionNameB}" on ${a.dayOfWeek}.`,
          entryA: a,
          entryB: b,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Check if a single entry candidate has any conflicts against existing entries
 */
export function checkSingleEntryConflicts(
  candidate: {
    id?: string;
    dayOfWeek: string;
    startTime: string | Date;
    endTime: string | Date;
    facultyId?: string;
    sectionId?: string;
    roomId?: string;
  },
  existingEntries: any[],
): string[] {
  const alerts: string[] = [];

  for (const other of existingEntries) {
    if (candidate.id && other.id === candidate.id) continue;
    if (other.dayOfWeek !== candidate.dayOfWeek) continue;
    if (!timeOverlaps(candidate.startTime, candidate.endTime, other.startTime, other.endTime)) {
      continue;
    }

    const otherFacultyId = other.facultyId || other.faculty?.id;
    const otherSectionId = other.sectionId || other.section?.id;
    const otherRoomId = other.roomId || other.room?.id;
    const otherSectionName = other.section?.name || other.section?.code || 'Another section';
    const otherFacultyName = other.faculty?.user
      ? `${other.faculty.user.firstName || ''} ${other.faculty.user.lastName || ''}`.trim()
      : 'The faculty';
    const otherRoomName = other.room?.name || other.room?.number || other.roomId || 'The room';

    if (candidate.facultyId && otherFacultyId && candidate.facultyId === otherFacultyId) {
      if (candidate.sectionId && otherSectionId && candidate.sectionId !== otherSectionId) {
        alerts.push(
          `Faculty conflict: ${otherFacultyName} is already assigned to ${otherSectionName} during this time.`,
        );
      } else {
        alerts.push(
          `Teacher collision: ${otherFacultyName} already has another session at this time.`,
        );
      }
    }

    if (candidate.roomId && otherRoomId && candidate.roomId === otherRoomId) {
      alerts.push(
        `Room conflict: Room "${otherRoomName}" is already occupied by ${otherSectionName} at this time.`,
      );
    }
  }

  return alerts;
}
