# Timetable Implementation Guide

## 1. System Overview & Architecture

The Student ERP Timetable Subsystem provides end-to-end curriculum scheduling, automated conflict-free timetable generation, real-time client/server conflict auditing, interactive schedule authoring (drag-and-drop moves, slot swapping, faculty reassignment, bulk batch updates), and administrative publication controls.

### 1.1 High-Level Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    Next.js Web Application                                         |
|                                                                                                    |
|  +---------------------------+  +--------------------------+  +---------------------------------+  |
|  | admin/timetable/page.tsx  |  | admin/timetable/weekly   |  | TimetableGenerationModal        |  |
|  | - Scope filters           |  | - Tabular weekly matrix  |  | - Section selector (all/prog)   |  |
|  | - Unsaved moves buffer    |  | - HTML5 drag-and-drop    |  | - Working hours & breaks        |  |
|  | - Inspector side-panel    |  | - Slot swap / move       |  | - Session durations per course  |  |
|  | - Multi-entry selection   |  | - Faculty reassignment   |  | - Room whitelist selection      |  |
|  +-------------+-------------+  +------------+-------------+  +----------------+----------------+  |
|                |                             |                                 |                   |
|                +-----------------------------+---------------------------------+                   |
|                                              |                                                     |
|                                              v                                                     |
|                         +----------------------------------------+                                 |
|                         | timetable-conflict-utils.ts            |                                 |
|                         | - Client-side live conflict engine     |                                 |
|                         | - Overlap detection (O(N^2) interval)  |                                 |
|                         | - Candidate placement pre-flight audit |                                 |
|                         +--------------------+-------------------+                                 |
|                                              |                                                     |
|                                              v                                                     |
|                         +----------------------------------------+                                 |
|                         | @student-erp/hooks (TanStack Query v5) |                                 |
|                         | - useAdminTimetable                    |                                 |
|                         | - useGenerateTimetable                 |                                 |
|                         | - useMoveTimetableEntry                |                                 |
|                         | - useSwapTimetableSlots                |                                 |
|                         | - usePublishTimetable                  |                                 |
|                         +--------------------+-------------------+                                 |
+----------------------------------------------|-----------------------------------------------------+
                                               | HTTP REST / JSON
                                               v
+----------------------------------------------------------------------------------------------------+
|                                    NestJS API Backend                                              |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | TimetableController (/admin/timetable)                                                       |  |
|  | Guarded by SupabaseAuthGuard + RolesGuard ('ADMIN')                                          |  |
|  +----------------------------------------------+-----------------------------------------------+  |
|                                                 |                                                  |
|                                                 v                                                  |
|  +----------------------------------------------------------------------------------------------+  |
|  | TimetableService                                                                             |  |
|  |  +----------------------------------+  +--------------------------------------------------+  |  |
|  |  | checkConflicts()                |  | generate()                                       |  |  |
|  |  | - PostgreSQL Prisma interval     |  | - Credit hour calculation (Curriculum Course)    |  |  |
|  |  |   lt/gt overlaps query           |  | - Faculty availability (available + blackout)    |  |  |
|  |  | - Faculty, Room, Section checks  |  | - Room type & capacity heuristics                |  |  |
|  |  +----------------------------------+  | - Working hours & break windows                  |  |  |
|  |  +----------------------------------+  | - Single version archival retention              |  |  |
|  |  | moveEntry() / swapSlots()        |  +--------------------------------------------------+  |  |
|  |  | reassignFaculty() / bulkUpdate() |  | publish() / listConflicts() / exportTimetable()   |  |  |
|  |  +----------------------------------+  +--------------------------------------------------+  |  |
|  +----------------------------------------------+-----------------------------------------------+  |
|                                                 |                                                  |
|                                                 v                                                  |
|  +----------------------------------------------------------------------------------------------+  |
|  | Prisma ORM & Database Layer (PostgreSQL)                                                     |  |
|  | Tables: Timetable, TimetableEntry, FacultyAvailability, Room, CourseAssignment, Section       |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### 1.2 Module Organization & File Manifest

| File Path                                                                      | Role                         | Key Exports / Responsibilities                                                                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/modules/admin/timetable/timetable.service.ts`                    | Backend Core Service         | Schedule generation, database conflict validation, atomic moves, slot swaps, bulk operations, exports, and publication.                                  |
| `apps/api/src/modules/admin/timetable/timetable.controller.ts`                 | Backend Controller           | REST endpoint definitions, route authentication, role checks (`ADMIN`), and query/body parameter mapping.                                                |
| `apps/web/src/app/admin/timetable/page.tsx`                                    | Main Timetable Page          | Scope filtering (Curriculum, Program, Term, Section, Day), unsaved move staging buffer, batch edit bar, overview heatmap, and inspector side-panel.      |
| `apps/web/src/app/admin/timetable/weekly/page.tsx`                             | Weekly Timetable Page        | Tabular weekday-versus-timeslot matrix, native HTML5 drag-and-drop slot moves, slot swapping, and contextual right-click menu.                           |
| `apps/web/src/components/admin/timetable/timetable-grid.tsx`                   | Timetable Grid Component     | Full dnd-kit drag-and-drop canvas, timeslot column rendering, dynamic color coding, conflict ring highlights, and empty slot quick-add.                  |
| `apps/web/src/components/admin/timetable/timetable-conflict-utils.ts`          | Frontend Conflict Engine     | Pure TypeScript conflict detection (`findTimetableConflicts`), candidate placement evaluator (`checkCandidateEntryConflicts`), and time math converters. |
| `apps/web/src/components/admin/timetable/timetable-generation-modal.tsx`       | Generation Config Modal      | Configuration wizard for automatic schedule generation: section scoping, working hours, break periods, session durations, and room selection.            |
| `apps/web/src/components/admin/timetable/timetable-context-conflict-panel.tsx` | Context & Conflict Inspector | Side drawer inspecting simultaneous faculty sessions, section schedules, room bookings, and detailed conflict cards with resolution actions.             |
| `apps/web/src/components/admin/timetable/timetable-publish-modal.tsx`          | Publication Gating Modal     | Pre-flight audit dialog enforcing hard blocks on Faculty, Room, or Section overlaps prior to setting timetable state to `PUBLISHED`.                     |

---

## 2. Timetable Generation Engine

Automatic timetable synthesis is implemented in `TimetableService.generate()` in `apps/api/src/modules/admin/timetable/timetable.service.ts` and configured via `TimetableGenerationModal` in `apps/web/src/components/admin/timetable/timetable-generation-modal.tsx`.

### 2.1 Generation Parameters (`GenerateTimetableDto`)

```typescript
export class GenerateTimetableDto {
  termId: string;
  sectionIds: string[];
  name?: string;
  days?: TimetableDay[]; // ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  workingHours?: {
    start: string; // e.g. "08:00"
    end: string; // e.g. "17:00"
  };
  breakPeriods?: Array<{
    start: string; // e.g. "12:00"
    end: string; // e.g. "13:00"
  }>;
  defaultSessionDuration?: number; // Minutes, defaults to 50
  sessionDurations?: Record<string, number>; // courseId -> duration in minutes
  selectedRoomIds?: string[]; // Optional whitelist of room IDs
}
```

### 2.2 Archival Retention & Timetable Lifecycle

Before generating a new schedule for a given academic term:

1. **Archive Active Timetable**: Any existing timetable for the `termId` with status `DRAFT` or `PUBLISHED` is transitioned to `ARCHIVED`.
2. **Single-Version Retention Rule**: Older archived timetables for that term (`status: 'ARCHIVED'`, excluding the newly archived one) are permanently pruned along with their `TimetableEntry` records:
   ```typescript
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
   ```
3. **Draft Provisioning**: A new `Timetable` record is instantiated with `status: 'DRAFT'`.
4. **Target Section Cleansing**: Existing timetable entries belonging to `dto.sectionIds` for that term are deleted to avoid double-counting, while entries for non-targeted sections are retained in memory (`existingEntries`) as immoveable collision boundaries.

### 2.3 Proportional Credit Hours Resolution

The engine maps curriculum lecture requirements directly to weekly timeslots:

- Evaluates `CurriculumCourse` records associated with each course in the assignments.
- Resolves credits using program matching and semester sequence fallback:
  1. Primary: Curriculum matches `section.programId` AND `curriculumTerm.sequence === (section.semester ?? term.semester)`.
  2. Fallback: Curriculum matches `section.programId`.
  3. Default: Assignment's `course.creditValue`, defaulting to `3` if undefined.
- Session Target Formula:
  $$\text{sessionsNeeded} = \max(1, \lfloor \text{credits} \rfloor)$$
  Each credit corresponds strictly to one weekly teaching session.

### 2.4 Scheduling Constraints & Heuristic Rules

1. **Course Ordering**: Within each section, courses are sorted in descending order of credit count (`b.credits - a.credits`), ensuring heavier academic courses are placed into prime scheduling slots first.
2. **Practical vs. Theory Hour Distribution**:
   - For theoretical courses, slot search begins at `workingHours.start` (typically `08:00`).
   - For practical courses (`course.isPractical === true`), slot search starts at the midpoint of the working day:
     $$\text{startHour} = \max\left(\text{whStart}, \left\lfloor\frac{\text{whStart} + \text{whEnd}}{2}\right\rfloor\right)$$
     This prioritizes afternoon hours for laboratories and studios.
3. **Day Spreading**: The engine attempts to distribute a course's sessions across distinct days by breaking the inner hour loop and advancing to the next day immediately after successfully placing a session.
4. **Break Period Blackouts**: A candidate interval $[start, end]$ is rejected if it overlaps with any configured break interval $[bpStart, bpEnd]$:
   $$\text{overlaps}(start, end, bpStart, bpEnd) \iff start < bpEnd \land end > bpStart$$
5. **Faculty Availability & Blackout Windows**:
   - If no `FacultyAvailability` records exist for that faculty member on that day, the faculty is treated as fully available.
   - **Whitelisted Slots (`isAvailable: true`)**: If explicit availability records exist, the candidate session must fall wholly within at least one valid slot:
     $$start \ge a.startTime \land end \le a.endTime$$
   - **Blackout Slots (`isAvailable: false`)**: Candidate sessions must strictly not intersect any blackout period:
     $$\neg \text{overlaps}(start, end, a.startTime, a.endTime)$$
   - **Multiple Faculty Support**: If a course has multiple assigned faculty members (primary faculty listed first), the engine iterates through `courseItem.facultyIds` to find the first member free of constraints.
6. **Room Matching Constraints**:
   - **Capacity Check**: `room.capacity >= section.capacity`.
   - **Type Enforcement**:
     - `room.roomType === RoomType.LAB` requires `course.isPractical === true`.
     - `room.roomType IN [CLASSROOM, LECTURE_HALL]` requires `course.isPractical === false`.
   - **Room Availability**: The room must have no overlapping booking with either existing entries or previously generated entries in the current batch.

### 2.5 Conflict Emission & Telemetry

When a course cannot place all required sessions:

- An entry is appended to `conflicts` with `type: 'UNSCHEDULED'` and message `Could not schedule all X sessions for <Course> (only Y placed)`.
- If any conflict occurs, the system emits an event via NestJS `EventEmitter2`:
  ```typescript
  this.eventEmitter.emit('timetable.conflict_detected', {
    institutionId,
    termId: dto.termId,
    count: conflicts.length,
  });
  ```
- All successfully scheduled slots are written in bulk via `prisma.timetableEntry.createMany()`.

---

## 3. Conflict Detection Engine

Conflict auditing is executed symmetrically across both the backend database layer and frontend reactive state.

### 3.1 Overlap Condition Mathematics

Two scheduled sessions $A$ and $B$ within the same day of the week collide if and only if their half-open time intervals $[start_A, end_A)$ and $[start_B, end_B)$ intersect:
$$\text{Overlap}(A, B) \iff start_A < end_B \quad \land \quad end_A > start_B$$

### 3.2 Conflict Classification

| Conflict Type | Classification Condition                               | User Impact                                                                  |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `FACULTY`     | $A.facultyId = B.facultyId \land \text{Overlap}(A, B)$ | Teacher double-booked across two different sections or simultaneous courses. |
| `ROOM`        | $A.roomId = B.roomId \land \text{Overlap}(A, B)$       | Physical room double-booked for two separate classes.                        |
| `SECTION`     | $A.sectionId = B.sectionId \land \text{Overlap}(A, B)$ | Student cohort assigned to two concurrent classes.                           |
| `UNSCHEDULED` | $\text{placedSessions} < \text{requiredCredits}$       | Generation engine unable to fit curriculum credit requirements.              |

### 3.3 Server-Side Conflict Validation (`TimetableService.checkConflicts`)

The backend runs parameterized SQL queries using Prisma ORM:

```typescript
const start = this.parseTime(startTime);
const end = this.parseTime(endTime);

const timeOverlap = {
  startTime: { lt: end },
  endTime: { gt: start },
};

const conditions: Prisma.TimetableEntryWhereInput[] = [];
if (roomId) conditions.push({ roomId, ...timeOverlap });
if (facultyId) conditions.push({ facultyId, ...timeOverlap });
if (sectionId) conditions.push({ sectionId, ...timeOverlap });

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
```

If `conflicts.length > 0`, mutation endpoints immediately reject the operation by raising a `ConflictException('Conflicts detected', { cause: conflicts })`.

### 3.4 Client-Side Live Conflict Detection (`timetable-conflict-utils.ts`)

To provide instant UI feedback during drag-and-drop or manual editing, the client replicates the validation logic in pure TypeScript without incurring network latency:

```
[All Rendered Timetable Entries]
               |
               v
     +-------------------+
     | Nested Comparison |  O(N^2) over entries where:
     |    Loop (i < j)   |  - a.dayOfWeek === b.dayOfWeek
     +---------+---------+  - isTimeOverlapping(a, b) === true
               |
       +-------+-------+-----------------------+
       |               |                       |
       v               v                       v
[Same Faculty?]  [Same Room?]           [Same Section?]
       |               |                       |
  Yes: FACULTY    Yes: ROOM               Yes: SECTION
       \               |                       /
        +--------------+----------------------+
                       |
                       v
     [Array of TimetableConflict Objects]
                       |
           +-----------+-----------+
           |                       |
           v                       v
[Highlight Grid Cards]   [Feed Context Inspector]
(Red ring & badge)       (Real-time warning list)
```

The client also provides `checkCandidateEntryConflicts(candidate, existingEntries)`, which verifies whether a prospective move or newly drafted slot would create a conflict before the user confirms the action.

---

## 4. Conflict Resolution & Interactive Adjustments

### 4.1 Unsaved Moves Staging Buffer

Manual drag-and-drop actions on `apps/web/src/app/admin/timetable/page.tsx` do not immediately execute network mutations. Instead, they enter a client-side staging queue:

```typescript
interface UnsavedMove {
  entryId: string;
  previous: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  target: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}
```

#### Workflow Lifecycle:

1. **Drag Execution**: Dropping an entry into a new timeslot updates the local entry in `optimisticEntries` and pushes an `UnsavedMove` record to `unsavedMoves`.
2. **Floating Action Bar**: When `unsavedMoves.length > 0`, a bottom action dock appears displaying:
   - Total count of pending changes.
   - Active conflict count calculated across the optimistic dataset.
   - **Undo All Changes Button**: Restores original positions and clears the staging queue.
   - **Save All Changes Button**: Iterates through `unsavedMoves` using `moveMutation.mutateAsync()` with toast progress notifications.

```
+-------------------------------------------------------------------------------+
| [i] 3 unsaved schedule changes   ( 1 Warning Detected )   [Undo]  [Save Changes]|
+-------------------------------------------------------------------------------+
```

### 4.2 Drag-and-Drop Implementations

The codebase features two drag-and-drop architectures:

1. **dnd-kit Architecture (`timetable-grid.tsx`)**:
   - `DndContext` with `PointerSensor` (activation constraint of 6px distance to prevent accidental drags during clicks) and `KeyboardSensor`.
   - Grid cards wrapped in `useDraggable({ id: entry.id, data: { entry } })`.
   - Empty grid cells wrapped in `useDroppable({ id: 'cell-${day}-${time}' })`.
   - Drag overlay clone rendered via `<DragOverlay>` to give visual feedback during drag.
   - Resolves target coordinates on `onDragEnd` and invokes `onMoveEntry`.
2. **HTML5 Native Drag-and-Drop (`weekly/page.tsx`)**:
   - Standard browser event listeners: `onDragStart`, `onDragOver`, `onDrop`.
   - Payload extraction via drop coordinates:
     - If the target cell is empty $\rightarrow$ triggers `moveMutation`.
     - If the target cell already contains an entry $\rightarrow$ automatically triggers `swapMutation`.

### 4.3 Slot Swapping (`POST /admin/timetable/swap-slots`)

Enables swapping two sessions atomically in the database:

```typescript
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
```

### 4.4 Faculty Reassignment (`POST /admin/timetable/reassign-faculty`)

Allows reallocating a session to a substitute teacher:

1. Validates existence of entry and target faculty under `institutionId`.
2. Calls `checkConflicts` passing target `facultyId`.
3. If free, updates `facultyId` on the entry; otherwise aborts with a 409 Conflict.

### 4.5 Bulk Updates & Batch Operations

- **Bulk Move / Reassign (`POST /admin/timetable/bulk-update`)**:
  Accepts `{ entryIds: string[], updates: UpdateTimetableEntryDto }`.
  Iterates over every target entry, performs individual conflict checks, and commits all modifications within an atomic Prisma transaction (`prisma.$transaction`).
- **Bulk Delete (`POST /admin/timetable/bulk-delete`)**:
  Deletes selected IDs via `prisma.timetableEntry.deleteMany({ where: { id: { in: entryIds } } })`.

### 4.6 Overwrite Warning Dialog

Triggered in `TimetableOverwriteWarningDialog` when initiating automatic schedule generation for a term that already contains scheduled entries:

- Warns the administrator that regenerating will overwrite all existing sessions for the selected sections.
- Displays the exact count of existing sessions facing deletion.
- Requires explicit acknowledgement (`"Yes, Replace Schedule"`) before invoking the generator.

### 4.7 Context Conflict Panel (`TimetableContextConflictPanel`)

A persistent inspection sidebar:

- **Default State**: Summarizes overall conflict health across the institution, displaying clickable warning chips for every detected clash.
- **Entry Focused State**: Clicking any timetable card highlights:
  - **Selected Session Details**: Course name, code, section, assigned faculty, room, day, and time.
  - **Direct Conflicts**: Explicit clash descriptions with quick-action links to select the competing session.
  - **Simultaneous Faculty Schedule**: All other commitments the assigned teacher has on that day.
  - **Simultaneous Section Schedule**: Cohort workload distribution for the day.
  - **Room Availability**: Other classes scheduled in that specific room throughout the day.

### 4.8 Publication Gating (`TimetablePublishModal`)

Promoting a schedule from `DRAFT` to `PUBLISHED` (`POST /admin/timetable/publish`) enforces strict governance:

- **Pre-Flight Audit**: The modal inspects all active conflicts:
  $$\text{blockingCount} = \text{facultyConflicts} + \text{roomConflicts} + \text{sectionConflicts}$$
- **Hard Lock**: If $\text{blockingCount} > 0$:
  - Modal switches to a locked state (`Lock` icon, red background).
  - Displays explicit breakdown of blocking conflicts.
  - **The "Confirm & Publish" button is strictly disabled**.
- **Success Path**: When $\text{blockingCount} === 0$, publishing sets `status = 'PUBLISHED'` and records `publishedAt = new Date()`, releasing the schedule to student and faculty portals.

---

## 5. Weekly Timetable Display & Views

### 5.1 Multi-View Modes

1. **Section / Grid Matrix View (`admin/timetable/page.tsx`)**:
   - Filterable by Curriculum $\rightarrow$ Program $\rightarrow$ Term $\rightarrow$ Section.
   - Column layout partitioned by time intervals.
   - Compact view toggle for dense, high-capacity schedules.
   - Program section summary overview showing completion ratios.
2. **Weekly Calendar Matrix (`admin/timetable/weekly/page.tsx`)**:
   - Tabular layout with days of the week (`MONDAY` through `SATURDAY`) as columns and uniform timeslot rows (`08:00-09:00`, `09:00-10:00`, etc.).
   - Interactive cell targets for drag, drop, and swap operations.
3. **Overview Heatmap (`TimetableOverviewHeatmap`)**:
   - Global visual representation of room and section density across all days and timeslots.

### 5.2 Timeline Headers & Slot Math

Timeslots are dynamically calculated based on existing entries or institution hours:

- `timeToMinutes(time)`: Parses `HH:mm`, `HH:mm:ss`, or ISO strings into minutes from midnight (0–1439).
- `formatMinutesToTime(minutes)`: Converts integer minutes into zero-padded `HH:mm` format.
- `isTimeOverlapping(startA, endA, startB, endB)`: Strict integer overlap evaluation.

### 5.3 Interactive Cards & Status Badges

- **Draggable Entry Card**:
  - Distinct color palette assigned based on course identity (`blue`, `emerald`, `purple`, `amber`, `rose`).
  - Left-hand drag grip handle (`GripVertical`).
  - Room and faculty badges with iconography (`MapPin`, `User`).
  - Multi-select checkbox supporting bulk operations.
  - Glowing red border and alert triangle badge when conflicting.
- **TimetableStatusBadge**:
  - Visually denotes state: `DRAFT` (slate/yellow), `PUBLISHED` (emerald), `ARCHIVED` (muted gray).

### 5.4 Contextual Action Menu (`TimetableContextMenu`)

Right-clicking any card on the weekly matrix opens a floating menu with coordinate-positioned actions:

- **Edit Details**: Opens the full session editing modal.
- **Reassign Faculty**: Launches `FacultyReassignModal` to choose an available substitute teacher.
- **Delete Slot**: Removes the slot with instant confirmation.
- **Swap Slot**: Initiates swap pairing mode.

### 5.5 Export Capabilities

The system provides synchronous data exports via `GET /admin/timetable/export?termId=...&format=...`:

- **JSON Format**: Direct serialization of all timetable entries including relations (`course`, `faculty.user`, `section`, `room`).
- **CSV Format**: RFC 4180-compliant comma-separated output:
  ```csv
  Day,Start Time,End Time,Course,Section,Faculty,Room
  MONDAY,08:00,08:50,"Data Structures","CS-A","Prof. Alan Turing","Room 301"
  ```
  Streams with headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename=timetable-<termId>.csv`.

---

## 6. End-to-End Workflow & Lifecycle

The standard operational lifecycle from term inception to published schedule is illustrated below:

```
                          [1. Term Configuration]
                         Curriculum, Courses & Rooms
                                     |
                                     v
                       [2. Teaching Assignments]
                 Assign Faculty to Courses & Sections
                                     |
                                     v
                   [3. Configure Generation Parameters]
                Open TimetableGenerationModal in Web UI
             (Select Sections, Working Hours, Break Windows)
                                     |
                                     v
                  [4. Automated Engine Execution (API)]
               POST /admin/timetable/generate (TimetableService)
             - Archive prior schedule (keep 1 archived version)
             - Calculate credit requirements per section
             - Search slots respecting availability & breaks
             - Allocate suitable classrooms and labs
                                     |
                                     v
                  [5. Real-Time Review & Conflict Audit]
                Admin Timetable Grid with Live Inspector
                                     |
          +--------------------------+--------------------------+
          |                                                     |
  (Conflicts Present)                                   (Clean Schedule)
          |                                                     |
          v                                                     v
[6. Interactive Adjustments]                                    |
- Drag-and-drop to empty slots                                  |
- Unsaved moves staging buffer                                  |
- Slot swapping & faculty reassign                              |
- Inspect via Conflict Panel                                    |
          |                                                     |
          +--------------------------+--------------------------+
                                     |
                                     v
                         [7. Pre-Flight Validation]
                        Open TimetablePublishModal
                                     |
                         [Any Blocking Conflicts?]
                                /          \
                             Yes            No
                             /                \
             (Publish Button Locked)     (Publish Enabled)
             Return to Step 6                  |
                                               v
                                   [8. Campus Publication]
                                 POST /admin/timetable/publish
                             Schedule goes live for students & staff
```

---

## 7. Data Models & Interface Contracts

### 7.1 Prisma Schema Reference

```prisma
model Timetable {
  id              String            @id @default(uuid())
  institutionId   String
  academicYearId  String
  termId          String
  name            String
  status          TimetableStatus   @default(DRAFT) // DRAFT, PUBLISHED, ARCHIVED
  publishedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  entries         TimetableEntry[]

  @@index([institutionId, termId])
}

model TimetableEntry {
  id              String         @id @default(uuid())
  institutionId   String
  academicYearId  String
  termId          String
  timetableId     String?
  courseId        String
  facultyId       String?
  sectionId       String
  roomId          String?
  buildingId      String?
  lessonPlanId    String?
  dayOfWeek       TimetableDay   // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
  startTime       DateTime       @db.Time
  endTime         DateTime       @db.Time

  timetable       Timetable?     @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  course          Course         @relation(fields: [courseId], references: [id])
  faculty         Faculty?       @relation(fields: [facultyId], references: [id])
  section         Section        @relation(fields: [sectionId], references: [id])
  room            Room?          @relation(fields: [roomId], references: [id])

  @@index([institutionId, termId, dayOfWeek])
  @@index([facultyId, dayOfWeek])
  @@index([roomId, dayOfWeek])
  @@index([sectionId, dayOfWeek])
}

model FacultyAvailability {
  id            String         @id @default(uuid())
  facultyId     String
  dayOfWeek     TimetableDay
  startTime     DateTime       @db.Time
  endTime       DateTime       @db.Time
  isAvailable   Boolean        @default(true) // true = available slot, false = blackout window

  faculty       Faculty        @relation(fields: [facultyId], references: [id], onDelete: Cascade)

  @@index([facultyId, dayOfWeek])
}
```

### 7.2 API Endpoint Catalog

| Method   | Endpoint                            | Description                                                               | Auth / Guard |
| -------- | ----------------------------------- | ------------------------------------------------------------------------- | ------------ |
| `POST`   | `/admin/timetable`                  | Create a single timetable entry with conflict check.                      | `ADMIN`      |
| `GET`    | `/admin/timetable`                  | List entries filtered by `termId`, `sectionId`, `facultyId`, `dayOfWeek`. | `ADMIN`      |
| `GET`    | `/admin/timetable/:id`              | Fetch specific entry details.                                             | `ADMIN`      |
| `PATCH`  | `/admin/timetable/:id`              | Update an existing entry with conflict validation.                        | `ADMIN`      |
| `DELETE` | `/admin/timetable/:id`              | Delete an entry.                                                          | `ADMIN`      |
| `POST`   | `/admin/timetable/generate`         | Run automatic timetable generation engine.                                | `ADMIN`      |
| `GET`    | `/admin/timetable/conflicts`        | List pairwise collisions for a term.                                      | `ADMIN`      |
| `POST`   | `/admin/timetable/move`             | Move entry to new day/time slot.                                          | `ADMIN`      |
| `POST`   | `/admin/timetable/swap-slots`       | Atomically swap day/time/room between two entries.                        | `ADMIN`      |
| `POST`   | `/admin/timetable/reassign-faculty` | Reassign session teacher with clash check.                                | `ADMIN`      |
| `POST`   | `/admin/timetable/bulk-update`      | Batch update multiple entries within a transaction.                       | `ADMIN`      |
| `POST`   | `/admin/timetable/bulk-delete`      | Batch delete entries by ID array.                                         | `ADMIN`      |
| `POST`   | `/admin/timetable/publish`          | Set timetable status to `PUBLISHED`.                                      | `ADMIN`      |
| `GET`    | `/admin/timetable/export`           | Export timetable entries as CSV or JSON.                                  | `ADMIN`      |
