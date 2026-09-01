# Timetable Generation & Management — Instructions

## Current State

The Prisma schema defines `TimetableEntry` (line 917) with relations to `Institution`, `AcademicYear`, `AcademicTerm`, `Course`, `Faculty`, and `Section`. Supporting models `Building` and `Room` exist but are not referenced by FK. Read-only timetable APIs exist for students and faculty. The admin timetable module (controller, service, DTOs, SDK, hooks, UI pages) are all empty shells.

---

## 1. Database Schema Issues & Changes

### 1.1 `TimetableEntry` — Fix `room` and `building` to use FK references

**Problem:** `room` and `building` are plain strings. This prevents availability checking, capacity validation, and room conflict detection.

**Change:**
```prisma
model TimetableEntry {
  id             String       @id @default(uuid()) @db.Uuid
  institutionId  String       @map("institution_id") @db.Uuid
  academicYearId String       @map("academic_year_id") @db.Uuid
  termId         String       @map("term_id") @db.Uuid
  courseId        String       @map("course_id") @db.Uuid
  facultyId      String       @map("faculty_id") @db.Uuid
  sectionId      String       @map("section_id") @db.Uuid
  dayOfWeek      TimetableDay @map("day_of_week")
  startTime      DateTime     @map("start_time") @db.Time
  endTime        DateTime     @map("end_time") @db.Time
  roomId         String?      @map("room_id") @db.Uuid
  buildingId     String?      @map("building_id") @db.Uuid
  lessonPlanId   String?      @map("lesson_plan_id") @db.Uuid
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  institution  Institution  @relation(fields: [institutionId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])
  term         AcademicTerm @relation(fields: [termId], references: [id])
  course       Course       @relation(fields: [courseId], references: [id])
  faculty      Faculty      @relation(fields: [facultyId], references: [id])
  section      Section      @relation(fields: [sectionId], references: [id])
  room         Room?        @relation(fields: [roomId], references: [id])
  building     Building?    @relation(fields: [buildingId], references: [id])
  lessonPlan   LessonPlan?  @relation(fields: [lessonPlanId], references: [id])

  @@unique([termId, sectionId, dayOfWeek, startTime])
  @@unique([termId, facultyId, dayOfWeek, startTime])
  @@unique([termId, roomId, dayOfWeek, startTime])
  @@index([institutionId])
  @@index([termId])
  @@index([sectionId])
  @@index([facultyId])
  @@index([dayOfWeek])
  @@map("timetable_entries")
}
```

**Add reverse relations to `Room` and `Building`:**
```prisma
model Room {
  // ... existing fields ...
  timetableEntries TimetableEntry[]
}

model Building {
  // ... existing fields ...
  timetableEntries TimetableEntry[]
}
```

**Note:** The `isPublished` field is NOT added to `TimetableEntry`. Publish status lives on the `Timetable` container model (section 1.3). This avoids redundant state.

### 1.2 New enum: `TimetableStatus`

Add before the `TimetableEntry` model:

```prisma
enum TimetableStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 1.3 New model: `Timetable`

A timetable is a versioned container for entries. This enables draft/publish workflows and term-based versions.

**Tradeoff:** If you only need one timetable per term (no multiple drafts), skip this model and add `status TimetableStatus @default(DRAFT)` directly to `TimetableEntry`. The container model adds a JOIN to every query but enables multiple named drafts per term.

```prisma
model Timetable {
  id             String          @id @default(uuid()) @db.Uuid
  institutionId  String          @map("institution_id") @db.Uuid
  academicYearId String          @map("academic_year_id") @db.Uuid
  termId         String          @map("term_id") @db.Uuid
  name           String
  status         TimetableStatus @default(DRAFT)
  publishedAt    DateTime?       @map("published_at")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  institution  Institution  @relation(fields: [institutionId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])
  term         AcademicTerm @relation(fields: [termId], references: [id])
  entries      TimetableEntry[]

  @@unique([termId, name])
  @@index([institutionId])
  @@map("timetables")
}
```

Add `timetableId String? @map("timetable_id") @db.Uuid` to `TimetableEntry` and a `timetable Timetable?` relation.

### 1.4 New model: `FacultyAvailability`

Optional but recommended for constraint-based generation:

```prisma
model FacultyAvailability {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  facultyId     String   @map("faculty_id") @db.Uuid
  dayOfWeek     TimetableDay @map("day_of_week")
  startTime     DateTime @map("start_time") @db.Time
  endTime       DateTime @map("end_time") @db.Time
  isAvailable   Boolean  @default(true) @map("is_available")
  createdAt     DateTime @default(now()) @map("created_at")

  institution Institution @relation(fields: [institutionId], references: [id])
  faculty     Faculty     @relation(fields: [facultyId], references: [id])

  @@unique([facultyId, dayOfWeek, startTime])
  @@index([institutionId])
  @@index([facultyId])
  @@map("faculty_availability")
}
```

Add `availability FacultyAvailability[]` to `Faculty`.

### 1.5 Migration

After schema changes, run:
```bash
npx prisma migrate dev --name add_timetable_versioning_and_room_fk
```

---

## 2. API Layer — Admin Timetable Controller & Service

### 2.1 DTOs

**`CreateTimetableEntryDto`** — all required fields validated:

| Field         | Type              | Validation           |
|---------------|-------------------|----------------------|
| termId        | string (uuid)     | IsNotEmpty, IsUUID   |
| courseId       | string (uuid)     | IsNotEmpty, IsUUID   |
| facultyId     | string (uuid)     | IsNotEmpty, IsUUID   |
| sectionId     | string (uuid)     | IsNotEmpty, IsUUID   |
| dayOfWeek     | TimetableDay enum | IsNotEmpty, IsIn     |
| startTime     | string (HH:mm)    | IsNotEmpty           |
| endTime       | string (HH:mm)    | IsNotEmpty, > start  |
| roomId        | string (uuid)     | IsOptional, IsUUID   |
| buildingId    | string (uuid)     | IsOptional, IsUUID   |
| lessonPlanId  | string (uuid)     | IsOptional, IsUUID   |
| timetableId   | string (uuid)     | IsOptional, IsUUID   |

**`UpdateTimetableEntryDto`** — partial of create, same validations.

**`GenerateTimetableDto`** — for auto-generation:

| Field         | Type              | Validation           |
|---------------|-------------------|----------------------|
| termId        | string (uuid)     | IsNotEmpty, IsUUID   |
| sectionIds    | string[] (uuid)   | IsNotEmpty, ArrayMin |
| name          | string            | IsOptional           |

**`MoveTimetableEntryDto`** — for drag-and-drop refactoring:

| Field         | Type              | Validation           |
|---------------|-------------------|----------------------|
| dayOfWeek     | TimetableDay enum | IsOptional           |
| startTime     | string (HH:mm)    | IsOptional           |
| endTime       | string (HH:mm)    | IsOptional           |
| roomId        | string (uuid)     | IsOptional, IsUUID   |
| buildingId    | string (uuid)     | IsOptional, IsUUID   |

**`ReassignFacultyDto`** — for faculty allotment changes:

| Field         | Type              | Validation           |
|---------------|-------------------|----------------------|
| entryId       | string (uuid)     | IsNotEmpty, IsUUID   |
| facultyId     | string (uuid)     | IsNotEmpty, IsUUID   |

**`BulkUpdateTimetableDto`** — for batch operations:

| Field         | Type              | Validation           |
|---------------|-------------------|----------------------|
| entryIds      | string[] (uuid)   | IsNotEmpty, ArrayMin |
| updates       | object            | IsNotEmpty           |
| updates.dayOfWeek | TimetableDay enum | IsOptional       |
| updates.startTime | string (HH:mm)  | IsOptional           |
| updates.endTime   | string (HH:mm)  | IsOptional           |
| updates.roomId    | string (uuid)   | IsOptional, IsUUID   |
| updates.facultyId | string (uuid)   | IsOptional, IsUUID   |

### 2.2 Controller Endpoints

```
POST   /admin/timetable                  — Create single entry
GET    /admin/timetable                  — List entries (filters: termId, sectionId, facultyId, dayOfWeek)
GET    /admin/timetable/:id              — Get single entry
PATCH  /admin/timetable/:id              — Update entry
DELETE /admin/timetable/:id              — Delete entry

POST   /admin/timetable/generate         — Auto-generate timetable for sections
POST   /admin/timetable/validate         — Validate no conflicts before publish
POST   /admin/timetable/publish          — Publish draft timetable
POST   /admin/timetable/duplicate        — Copy term timetable to next term
GET    /admin/timetable/export           — Export as CSV/JSON
POST   /admin/timetable/import           — Bulk import from CSV

POST   /admin/timetable/:id/move         — Move entry to new time/slot (drag-and-drop)
POST   /admin/timetable/reassign-faculty — Reassign faculty for one or more entries
POST   /admin/timetable/bulk-update      — Batch update multiple entries
POST   /admin/timetable/bulk-delete      — Batch delete multiple entries
POST   /admin/timetable/swap-slots       — Swap two entries (faculty or room swap)
GET    /admin/timetable/conflicts        — List all conflicts for a term
```

### 2.3 Service — Conflict Detection

Every `create` and `update` must check three unique constraints. The query must find entries where time ranges overlap AND at least one resource (room, faculty, or section) collides.

**Correct implementation:**
```typescript
async checkConflicts(entry: CreateTimetableEntryDto, excludeId?: string) {
  const timeOverlap = {
    startTime: { lt: entry.endTime },
    endTime: { gt: entry.startTime },
  };

  const conditions: Prisma.TimetableEntryWhereInput[] = [];

  // Room conflict (only if room is specified)
  if (entry.roomId) {
    conditions.push({
      roomId: entry.roomId,
      ...timeOverlap,
    });
  }

  // Faculty conflict
  conditions.push({
    facultyId: entry.facultyId,
    ...timeOverlap,
  });

  // Section conflict
  conditions.push({
    sectionId: entry.sectionId,
    ...timeOverlap,
  });

  const conflicts = await this.prisma.timetableEntry.findMany({
    where: {
      termId: entry.termId,
      dayOfWeek: entry.dayOfWeek,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: conditions,
    },
    include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
  });
  return conflicts;
}
```

**Why this works:**
- `OR` means "any of these conflict types" — a room overlap OR faculty overlap OR section overlap
- Each condition independently checks time range overlap
- Room condition is excluded when `roomId` is null (no room = no room conflict)
- `excludeId` allows updating an existing entry without flagging itself

### 2.4 Service — Move Entry (Drag-and-Drop)

```typescript
async moveEntry(institutionId: string, entryId: string, moveDto: MoveTimetableEntryDto) {
  const existing = await this.prisma.timetableEntry.findFirst({
    where: { id: entryId, institutionId },
  });
  if (!existing) throw new NotFoundException('Entry not found');

  const updated = {
    ...existing,
    ...Object.fromEntries(Object.entries(moveDto).filter(([_, v]) => v !== undefined)),
  };

  // Check conflicts at new position
  const conflicts = await this.checkConflicts(updated, entryId);
  if (conflicts.length > 0) {
    throw new ConflictException('Cannot move: conflicts detected', conflicts);
  }

  return this.prisma.timetableEntry.update({
    where: { id: entryId },
    data: moveDto,
    include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
  });
}
```

### 2.5 Service — Faculty Reassignment

```typescript
async reassignFaculty(institutionId: string, dto: ReassignFacultyDto) {
  const entry = await this.prisma.timetableEntry.findFirst({
    where: { id: dto.entryId, institutionId },
  });
  if (!entry) throw new NotFoundException('Entry not found');

  // Verify new faculty exists and belongs to institution
  const faculty = await this.prisma.faculty.findFirst({
    where: { id: dto.facultyId, institutionId },
  });
  if (!faculty) throw new NotFoundException('Faculty not found');

  // Check if new faculty has a conflict at this slot
  const conflicts = await this.checkConflicts({
    ...entry,
    facultyId: dto.facultyId,
  }, dto.entryId);

  if (conflicts.length > 0) {
    throw new ConflictException('Faculty has a conflicting assignment at this time', conflicts);
  }

  return this.prisma.timetableEntry.update({
    where: { id: dto.entryId },
    data: { facultyId: dto.facultyId },
    include: { course: true, faculty: { include: { user: true } }, section: true, room: true },
  });
}
```

### 2.6 Service — Bulk Operations

```typescript
async bulkUpdate(institutionId: string, dto: BulkUpdateTimetableDto) {
  // Verify all entries belong to institution
  const entries = await this.prisma.timetableEntry.findMany({
    where: { id: { in: dto.entryIds }, institutionId },
  });
  if (entries.length !== dto.entryIds.length) {
    throw new NotFoundException('Some entries not found');
  }

  // Check conflicts for each updated entry
  for (const entry of entries) {
    const updated = { ...entry, ...dto.updates };
    const conflicts = await this.checkConflicts(updated, entry.id);
    if (conflicts.length > 0) {
      throw new ConflictException(
        `Conflict for entry ${entry.id}: ${conflicts.map(c => c.course.code).join(', ')}`,
        conflicts,
      );
    }
  }

  // All clear — batch update
  return this.prisma.$transaction(
    dto.entryIds.map(id =>
      this.prisma.timetableEntry.update({
        where: { id },
        data: dto.updates,
      })
    )
  );
}

async bulkDelete(institutionId: string, entryIds: string[]) {
  // Verify ownership before delete
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
```

### 2.7 Service — Swap Slots

```typescript
async swapSlots(institutionId: string, entryIdA: string, entryIdB: string) {
  const [entryA, entryB] = await Promise.all([
    this.prisma.timetableEntry.findFirst({ where: { id: entryIdA, institutionId } }),
    this.prisma.timetableEntry.findFirst({ where: { id: entryIdB, institutionId } }),
  ]);

  if (!entryA || !entryB) throw new NotFoundException('One or both entries not found');

  // Swap: A gets B's time/slot, B gets A's time/slot
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

### 2.8 Service — List Conflicts

```typescript
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

      // Same day check
      if (a.dayOfWeek !== b.dayOfWeek) continue;

      // Time overlap check
      const overlaps = a.startTime < b.endTime && a.endTime > b.startTime;
      if (!overlaps) continue;

      // Resource conflict check
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
```

### 2.9 Service — Auto-Generation Algorithm

For MVP, use a greedy slot-filling approach:

1. **Input:** term, list of sections, list of courses per section (from `CourseAssignment`)
2. **Build constraint matrix:**
   - Available time slots: Mon-Fri, configurable start/end (e.g., 08:00-16:00), slot size from `Course.creditValue` or fixed 60min
   - Faculty load: count assigned courses per faculty, spread across days
   - Room capacity: match section size to room capacity
3. **For each section, for each course:**
   - Find slots where: faculty is free, room is free, section is free
   - Prefer morning slots for theory, afternoon for labs
   - Assign and mark slot as taken
4. **Return generated entries** as DRAFT — admin reviews before publish

---

## 3. SDK Layer — Admin Timetable Methods

Add to `packages/sdk/src/client/admin-api.ts`:

```typescript
timetable: {
  list: (params?: { termId?: string; sectionId?: string; facultyId?: string; dayOfWeek?: string }) =>
    GET('/admin/timetable', { params }),
  get: (id: string) => GET(`/admin/timetable/${id}`),
  create: (data: CreateTimetableEntryDto) => POST('/admin/timetable', data),
  update: (id: string, data: UpdateTimetableEntryDto) => PATCH(`/admin/timetable/${id}`, data),
  delete: (id: string) => DELETE(`/admin/timetable/${id}`),
  generate: (data: GenerateTimetableDto) => POST('/admin/timetable/generate', data),
  validate: (termId: string) => POST('/admin/timetable/validate', { termId }),
  publish: (termId: string) => POST('/admin/timetable/publish', { termId }),
  export: (params: { termId: string; format: 'csv' | 'json' }) =>
    GET('/admin/timetable/export', { params }),
  import: (data: FormData) => POST('/admin/timetable/import', data),
  move: (id: string, data: MoveTimetableEntryDto) => POST(`/admin/timetable/${id}/move`, data),
  reassignFaculty: (data: ReassignFacultyDto) => POST('/admin/timetable/reassign-faculty', data),
  bulkUpdate: (data: BulkUpdateTimetableDto) => POST('/admin/timetable/bulk-update', data),
  bulkDelete: (entryIds: string[]) => POST('/admin/timetable/bulk-delete', { entryIds }),
  swapSlots: (entryIdA: string, entryIdB: string) =>
    POST('/admin/timetable/swap-slots', { entryIdA, entryIdB }),
  conflicts: (termId: string) => GET('/admin/timetable/conflicts', { params: { termId } }),
},
```

---

## 4. React Hooks

Add to `packages/hooks/src/api/admin.hooks.ts`:

```typescript
export const useAdminTimetable = (params?: { termId?: string; sectionId?: string }) =>
  useQuery(['admin', 'timetable', params], () => AdminApi.timetable.list(params));

export const useAdminTimetableEntry = (id: string) =>
  useQuery(['admin', 'timetable', id], () => AdminApi.timetable.get(id));

export const useAdminTimetableConflicts = (termId: string) =>
  useQuery(['admin', 'timetable', 'conflicts', termId], () => AdminApi.timetable.conflicts(termId));

export const useCreateTimetableEntry = () =>
  useMutation(AdminApi.timetable.create, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useUpdateTimetableEntry = () =>
  useMutation(({ id, data }: { id: string; data: any }) => AdminApi.timetable.update(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useDeleteTimetableEntry = () =>
  useMutation(AdminApi.timetable.delete, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useMoveTimetableEntry = () =>
  useMutation(({ id, data }: { id: string; data: any }) => AdminApi.timetable.move(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useReassignFaculty = () =>
  useMutation(AdminApi.timetable.reassignFaculty, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useBulkUpdateTimetable = () =>
  useMutation(AdminApi.timetable.bulkUpdate, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useBulkDeleteTimetable = () =>
  useMutation(AdminApi.timetable.bulkDelete, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const useSwapTimetableSlots = () =>
  useMutation(
    ({ entryIdA, entryIdB }: { entryIdA: string; entryIdB: string }) =>
      AdminApi.timetable.swapSlots(entryIdA, entryIdB),
    { onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']) },
  );

export const useGenerateTimetable = () =>
  useMutation(AdminApi.timetable.generate, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });

export const usePublishTimetable = () =>
  useMutation(AdminApi.timetable.publish, {
    onSuccess: () => queryClient.invalidateQueries(['admin', 'timetable']),
  });
```

---

## 5. UI Pages

### 5.1 `/admin/timetable/page.tsx` — Main Timetable View

- **Top bar:** Term selector dropdown, section filter, faculty filter, day filter
- **Actions:** "Generate" button, "Import CSV" button, "Export" button, "Publish" button
- **Grid:** Weekly timetable grid (reuse pattern from student `timetable-grid.tsx` but with edit capabilities)
- **Click cell:** Opens slide-over or modal to create/edit/delete entry
- **Conflict indicator:** Red highlight on conflicting cells
- **Status badge:** DRAFT / PUBLISHED / ARCHIVED
- **Bulk mode:** Checkbox per entry, bulk action bar (delete, move, reassign faculty)

### 5.2 `/admin/timetable/weekly/page.tsx` — Weekly Detail View

- Full-width weekly grid
- **Drag-and-drop** to move entries between slots (calls `POST /admin/timetable/:id/move`)
- Inline edit on hover
- Right-click context menu: Move, Swap, Reassign Faculty, Delete

### 5.3 `/admin/timetable/faculty/page.tsx` — Faculty View

- Toggle to see all faculty overlaid on one grid
- Per-faculty tab or sidebar list
- Shows faculty load (hours per day, hours per week)
- **Quick reassign:** Click faculty name → dropdown to reassign to another faculty

### 5.4 `/admin/timetable/rooms/page.tsx` — Room Utilization

- Grid showing room usage per time slot
- Heatmap color coding (green=free, red=occupied)
- Filter by building

### 5.5 `/admin/timetable/generate/page.tsx` — Auto-Generation

- Step 1: Select term and sections
- Step 2: Configure constraints (slot size, available hours, preferences)
- Step 3: Preview generated timetable
- Step 4: Confirm or regenerate

### 5.6 `/admin/faculty/[facultyId]/timetable/page.tsx` — Per-Faculty Timetable

- Read-only view of one faculty's timetable
- Shows total hours, conflicts, free slots

---

## 6. Component Structure

```
apps/web/src/components/admin/timetable/
├── timetable-grid.tsx              — Weekly grid (desktop table + mobile card)
├── timetable-cell.tsx              — Single cell (time slot)
├── timetable-entry-form.tsx        — Create/edit entry form (slide-over)
├── timetable-toolbar.tsx           — Filters, action buttons
├── timetable-conflict-badge.tsx    — Conflict indicator
├── timetable-status-badge.tsx      — DRAFT/PUBLISHED badge
├── timetable-bulk-actions.tsx      — Bulk action bar (delete, move, reassign)
├── timetable-context-menu.tsx      — Right-click menu (move, swap, reassign, delete)
├── faculty-reassign-modal.tsx      — Faculty reassignment dialog
├── generate-timetable-form.tsx     — Auto-generation wizard
├── timetable-import-modal.tsx      — CSV import dialog
├── timetable-export-button.tsx     — Export trigger
├── room-utilization-grid.tsx       — Room heatmap
└── faculty-load-card.tsx           — Faculty hours summary
```

---

## 7. Implementation Order

| Phase | Task | Depends On |
|-------|------|------------|
| 1 | Schema migration: `Timetable` model, FK on `room`/`building`, `FacultyAvailability`, unique constraints | — |
| 2 | Admin DTOs with validation | Phase 1 |
| 3 | Admin Service: CRUD + conflict detection | Phase 2 |
| 4 | Admin Service: move, reassign, bulk ops, swap, conflicts list | Phase 3 |
| 5 | Admin Controller: all endpoints | Phase 4 |
| 6 | SDK methods + React hooks | Phase 5 |
| 7 | UI: main timetable grid + entry form + bulk actions | Phase 6 |
| 8 | UI: drag-and-drop, context menu, faculty reassign | Phase 7 |
| 9 | UI: generate, import/export, publish | Phase 8 |
| 10 | UI: faculty view, room utilization | Phase 9 |
| 11 | Auto-generation algorithm (greedy MVP) | Phase 4 |
| 12 | Seed data expansion (realistic timetable entries) | Phase 1 |

---

## 8. Key Files to Modify

| File | Action |
|------|--------|
| `libs/database/prisma/schema.prisma` | Add `Timetable`, `FacultyAvailability` models; fix FK on `TimetableEntry` |
| `apps/api/src/modules/admin/timetable/timetable.controller.ts` | Implement all endpoints |
| `apps/api/src/modules/admin/timetable/timetable.service.ts` | Implement CRUD, conflict detection, move, reassign, bulk ops, swap, generation |
| `apps/api/src/modules/admin/timetable/dto/create-timetable-entry.dto.ts` | Add validation decorators |
| `apps/api/src/modules/admin/timetable/dto/update-timetable-entry.dto.ts` | Add validation decorators |
| `apps/api/src/modules/admin/timetable/dto/move-timetable-entry.dto.ts` | New DTO for move operations |
| `apps/api/src/modules/admin/timetable/dto/reassign-faculty.dto.ts` | New DTO for faculty reassignment |
| `apps/api/src/modules/admin/timetable/dto/bulk-update-timetable.dto.ts` | New DTO for bulk operations |
| `packages/sdk/src/client/admin-api.ts` | Add timetable methods |
| `packages/hooks/src/api/admin.hooks.ts` | Add timetable hooks |
| `apps/web/src/app/admin/timetable/page.tsx` | Implement main view |
| `apps/web/src/app/admin/timetable/weekly/page.tsx` | Implement weekly view with drag-and-drop |
| `apps/web/src/app/admin/timetable/faculty/page.tsx` | Implement faculty view |
| `apps/web/src/app/admin/timetable/rooms/page.tsx` | Implement room view |
| `apps/web/src/app/admin/timetable/generate/page.tsx` | Implement generation wizard |
| `apps/web/src/components/admin/timetable/` (new directory) | All reusable components |

---

## 9. Seed Data

Expand `libs/database/prisma/seed.ts` to include:

- 5-10 timetable entries per term covering multiple sections, faculty, days, and time slots
- Mix of theory and lab sessions
- Some entries sharing rooms to demonstrate conflict detection
- Entries across Mon-Fri with realistic 60-90 minute slots

---

## 10. Edge Cases to Handle

1. **Lab sessions** may span 2+ consecutive time slots — model as single entry with longer `endTime`
2. **Shared sections** (two sections in same class) — same `sectionId` entries at same time are valid if room capacity allows
3. **Faculty on leave** — check `Faculty.status === ON_LEAVE` before assigning
4. **Room maintenance** — could add `Room.isActive` or a `RoomBlackout` table (future)
5. **Back-to-back entries** — same faculty or section with no gap is valid but flag as warning
6. **Weekend classes** — `TimetableDay` includes SATURDAY/SUNDAY, gate behind institution config
7. **Partial week** — some institutions run Mon-Thu or Tue-Sat — make working days configurable
