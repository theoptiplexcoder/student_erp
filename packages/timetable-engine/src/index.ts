export type Day = string;
export type EntityId = string;

export interface Requirement {
  id: EntityId;
  requirementId?: EntityId;
  indexInRequirement?: number;
  sectionId: EntityId;
  courseId: EntityId;
  facultyIds: EntityId[];
  roomType?: string;
  roomIds?: EntityId[];
  durationMinutes: number;
  occurrences: number;
  allowedStarts?: number[];
}
export interface Room {
  id: EntityId;
  type?: string;
}
export interface Availability {
  resourceId: EntityId;
  day: Day;
  startMinute: number;
  endMinute: number;
}
export interface SolverInput {
  engineVersion?: string;
  days: Day[];
  startMinute: number;
  endMinute: number;
  anchors?: number[];
  seed?: number;
  rooms: Room[];
  roomCapacities?: Record<EntityId, number>;
  sectionCapacities?: Record<EntityId, number>;
  dayBreaks?: Array<{ day: Day; startMinute: number; endMinute: number }>;
  availability?: Availability[];
  strictAvailability?: boolean;
  availabilityRestricted?: Array<{ resourceId: EntityId; day: Day }>;
  blackouts?: Availability[];
  roomBlackouts?: Availability[];
  fixedPlacements?: Array<{
    sectionId: EntityId;
    facultyIds: EntityId[];
    roomId?: EntityId;
    day: Day;
    startMinute: number;
    endMinute: number;
  }>;
  requirements: Requirement[];
}
export interface Placement {
  requirementId: EntityId;
  occurrence: number;
  sectionId: EntityId;
  courseId: EntityId;
  facultyIds: EntityId[];
  roomId: EntityId;
  day: Day;
  startMinute: number;
  endMinute: number;
}
export interface SolverResult {
  placements: Placement[];
  unplaced: string[];
  issues?: Array<{ code: string; message: string; requirementId?: string }>;
}
export interface SolveOptions {
  seed?: number;
  timeBudgetMs?: number;
  maxRepairMoves?: number;
}
export interface RunControl {
  shouldStop(): boolean;
  onProgress?(progress: { placed: number; total: number; phase: string }): void;
}
export interface ValidationIssue {
  placement: number;
  reason: string;
}
export const SLOT_MINUTES = 5;
export type Bitboard = number[];

export function emptyBitboard(slotCount: number): Bitboard {
  if (!Number.isInteger(slotCount) || slotCount < 0)
    throw new RangeError('slotCount must be a non-negative integer');
  return Array.from({ length: Math.ceil(slotCount / 32) }, () => 0);
}
export function bitboardHas(mask: Bitboard, start: number, length: number): boolean {
  for (let slot = start; slot < start + length; slot++)
    if ((mask[Math.floor(slot / 32)] ?? 0) & (1 << (slot % 32))) return true;
  return false;
}
export function bitboardSet(mask: Bitboard, start: number, length: number): void {
  for (let slot = start; slot < start + length; slot++) {
    const word = Math.floor(slot / 32);
    while (mask.length <= word) mask.push(0);
    mask[word] |= 1 << (slot % 32);
  }
}
export interface Meeting {
  requirementId: EntityId;
  occurrence: number;
  sectionId: EntityId;
  courseId: EntityId;
  facultyIds: EntityId[];
  roomType?: string;
  roomIds?: EntityId[];
  durationMinutes: number;
  allowedStarts?: number[];
}
export function expandRequirements(requirements: Requirement[]): Meeting[] {
  const meetings: Meeting[] = [];
  for (const r of requirements) {
    if (!Number.isInteger(r.occurrences) || r.occurrences < 0)
      throw new RangeError(`Invalid occurrences for ${r.id}`);
    if (
      !Number.isInteger(r.durationMinutes) ||
      r.durationMinutes <= 0 ||
      r.durationMinutes % SLOT_MINUTES !== 0
    )
      throw new RangeError(`Invalid duration for ${r.id}`);
    for (let occurrence = 0; occurrence < r.occurrences; occurrence++)
      meetings.push({
        requirementId: r.id,
        occurrence,
        sectionId: r.sectionId,
        courseId: r.courseId,
        facultyIds: [...r.facultyIds],
        roomType: r.roomType,
        roomIds: r.roomIds ? [...r.roomIds] : undefined,
        durationMinutes: r.durationMinutes,
        allowedStarts: r.allowedStarts ? [...r.allowedStarts] : undefined,
      });
  }
  return meetings;
}
function availabilityAllows(
  input: SolverInput,
  resourceId: string,
  day: string,
  start: number,
  end: number,
): boolean {
  const windows = (input.availability ?? []).filter(
    (a) => a.resourceId === resourceId && a.day === day,
  );
  const blackouts = (input.blackouts ?? []).filter(
    (a) => a.resourceId === resourceId && a.day === day,
  );
  if (blackouts.some((a) => start < a.endMinute && end > a.startMinute)) return false;
  const restricted = (input.availabilityRestricted ?? []).some(
    (item) => item.resourceId === resourceId && item.day === day,
  );
  if (windows.length === 0) return !restricted;
  const ordered = windows.slice().sort((a, b) => a.startMinute - b.startMinute);
  let coveredUntil = start;
  for (const window of ordered) {
    if (window.endMinute <= coveredUntil) continue;
    if (window.startMinute > coveredUntil) break;
    coveredUntil = Math.max(coveredUntil, window.endMinute);
    if (coveredUntil >= end) return true;
  }
  return false;
}
function reqRoomType(input: SolverInput, requirementId: string): string | undefined {
  return input.requirements.find((r) => r.id === requirementId)?.roomType;
}
/** Independently checks every hard constraint on a candidate timetable. */
export function validateSchedule(input: SolverInput, placements: Placement[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const occupied = new Map<string, Array<[number, number]>>();
  for (const fixed of input.fixedPlacements ?? []) {
    for (const resource of [
      fixed.sectionId,
      ...fixed.facultyIds,
      ...(fixed.roomId ? [fixed.roomId] : []),
    ]) {
      const key = `${fixed.day}:${resource}`;
      const ranges = occupied.get(key) ?? [];
      ranges.push([fixed.startMinute, fixed.endMinute]);
      occupied.set(key, ranges);
    }
  }
  const add = (key: string, start: number, end: number, index: number) => {
    const ranges = occupied.get(key) ?? [];
    if (ranges.some(([a, b]) => start < b && a < end))
      issues.push({ placement: index, reason: `overlap:${key}` });
    ranges.push([start, end]);
    occupied.set(key, ranges);
  };
  placements.forEach((p, i) => {
    const duration = p.endMinute - p.startMinute;
    if (
      !input.days.includes(p.day) ||
      p.startMinute < input.startMinute ||
      p.endMinute > input.endMinute ||
      duration <= 0 ||
      duration % SLOT_MINUTES !== 0 ||
      p.startMinute % SLOT_MINUTES !== 0
    )
      issues.push({ placement: i, reason: 'invalid-time' });
    const room = input.rooms.find((r) => r.id === p.roomId);
    if (
      !room ||
      (reqRoomType(input, p.requirementId) && room.type !== reqRoomType(input, p.requirementId))
    )
      issues.push({ placement: i, reason: 'invalid-room' });
    if (
      room &&
      (input.roomCapacities?.[p.roomId] ?? Infinity) < (input.sectionCapacities?.[p.sectionId] ?? 0)
    )
      issues.push({ placement: i, reason: 'insufficient-room-capacity' });
    if (
      (input.dayBreaks ?? []).some(
        (b) => b.day === p.day && p.startMinute < b.endMinute && p.endMinute > b.startMinute,
      )
    )
      issues.push({ placement: i, reason: 'break-overlap' });
    const req = input.requirements.find((r) => r.id === p.requirementId);
    if (
      !req ||
      p.sectionId !== req.sectionId ||
      p.courseId !== req.courseId ||
      duration !== req.durationMinutes ||
      !req.facultyIds.every((x) => p.facultyIds.includes(x)) ||
      (req.roomIds && !req.roomIds.includes(p.roomId))
    )
      issues.push({ placement: i, reason: 'requirement-mismatch' });
    if (req?.allowedStarts && !req.allowedStarts.includes(p.startMinute))
      issues.push({ placement: i, reason: 'invalid-anchor' });
    for (const resource of [p.sectionId, p.roomId, ...p.facultyIds]) {
      add(`${p.day}:${resource}`, p.startMinute, p.endMinute, i);
      if (!availabilityAllows(input, resource, p.day, p.startMinute, p.endMinute))
        issues.push({ placement: i, reason: `unavailable:${resource}` });
      if (
        resource === p.roomId &&
        (input.roomBlackouts ?? []).some(
          (b) =>
            b.resourceId === resource &&
            b.day === p.day &&
            p.startMinute < b.endMinute &&
            p.endMinute > b.startMinute,
        )
      )
        issues.push({ placement: i, reason: `room-blackout:${resource}` });
    }
  });
  return issues;
}
export function solveTimetable(
  input: SolverInput,
  options: SolveOptions = {},
  control?: RunControl,
): SolverResult {
  const shouldStop = () => Boolean(control?.shouldStop());
  const seed = options.seed ?? input.seed ?? 1;
  const random = (() => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const meetings = expandRequirements(input.requirements).sort(
    (a, b) =>
      (a.allowedStarts?.length ?? Infinity) - (b.allowedStarts?.length ?? Infinity) ||
      b.durationMinutes - a.durationMinutes ||
      b.facultyIds.length - a.facultyIds.length ||
      a.requirementId.localeCompare(b.requirementId) ||
      a.occurrence - b.occurrence,
  );
  const placements: Placement[] = [];
  const unplaced: string[] = [];
  const reasons = new Map<string, string>();
  for (const m of meetings) {
    let found: Placement | undefined;
    const allowedRooms = input.rooms
      .filter(
        (r) =>
          (!m.roomType || r.type === m.roomType) &&
          (!m.roomIds || m.roomIds.includes(r.id)) &&
          (input.roomCapacities?.[r.id] ?? Infinity) >=
            (input.sectionCapacities?.[m.sectionId] ?? 0),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    const starts = (
      m.allowedStarts ??
      (input.anchors?.length
        ? input.anchors
        : Array.from(
            { length: Math.ceil((input.endMinute - input.startMinute) / SLOT_MINUTES) },
            (_, i) => input.startMinute + i * SLOT_MINUTES,
          ))
    ).filter((start) => start >= input.startMinute && start + m.durationMinutes <= input.endMinute);
    // Stable ordering gives byte-identical output for a fixed input and seed.
    outer: for (const day of input.days)
      for (const start of starts) {
        if (shouldStop()) break outer;
        const end = start + m.durationMinutes;
        for (const room of allowedRooms) {
          const candidate: Placement = {
            requirementId: m.requirementId,
            occurrence: m.occurrence,
            sectionId: m.sectionId,
            courseId: m.courseId,
            facultyIds: m.facultyIds,
            roomId: room.id,
            day,
            startMinute: start,
            endMinute: end,
          };
          if (validateSchedule(input, [...placements, candidate]).length === 0) {
            found = candidate;
            break outer;
          }
        }
      }
    if (found) placements.push(found);
    else {
      const id = `${m.requirementId}:${m.occurrence}`;
      unplaced.push(id);
      reasons.set(id, starts.length ? 'NO_FEASIBLE_SLOT' : 'NO_START_ANCHOR');
    }
    control?.onProgress?.({
      placed: placements.length,
      total: meetings.length,
      phase: 'construct',
    });
    if (shouldStop()) {
      for (const rest of meetings.slice(meetings.indexOf(m) + 1)) {
        const id = `${rest.requirementId}:${rest.occurrence}`;
        if (!unplaced.includes(id)) {
          unplaced.push(id);
          reasons.set(id, 'TIME_BUDGET_EXCEEDED');
        }
      }
      break;
    }
  }
  return {
    placements,
    unplaced,
    issues: unplaced.map((id) => ({
      code: reasons.get(id) ?? 'UNPLACED',
      message: `Session ${id} could not be scheduled (${reasons.get(id) ?? 'unknown reason'}).`,
      requirementId: id.split(':')[0],
    })),
  };
}
