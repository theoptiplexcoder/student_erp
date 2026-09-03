# Faculty-Section Assignment — Implementation Plan

## Context

The `faculty_assign.md` design doc describes a **FacultySection** model: assign faculty to **sections** with a role (Teacher, Class Teacher, or custom), scoped to an academic year. This is **separate from the existing `CourseAssignment`** model which assigns faculty to courses within sections, scoped to terms.

**Status**: `FacultySection` does NOT exist in the Prisma schema yet. No API, hooks, or UI for it exist.

**Goal**: Implement the full stack — schema, API, SDK, hooks, UI — following existing codebase patterns.

---

## Architecture Decisions

### 1. Module Placement (Backend)

**Decision**: Create a new `faculty-sections` module under `apps/api/src/modules/admin/`, NOT inside the existing `faculty/` or `courses/` modules.

**Rationale**:

- `faculty/` module owns faculty CRUD + the `POST :id/assignments` (course assignment) endpoints
- `courses/` module owns `CourseAssignment` CRUD via `course-assignments.controller.ts`
- `FacultySection` is a cross-cutting concern (links faculty + section + academic year + role) — a dedicated module keeps it clean
- Follows the pattern of `sections/`, `roles/`, `timetable/` — each domain gets its own module

**Files**:

```
apps/api/src/modules/admin/faculty-sections/
├── faculty-sections.module.ts
├── faculty-sections.controller.ts
├── faculty-sections.service.ts
└── dto/
    ├── create-faculty-section.dto.ts
    └── update-faculty-section.dto.ts
```

### 2. No Custom Role CRUD Changes Needed

**Decision**: The existing `CustomRole` model and `/admin/roles` endpoints are **sufficient**. No new role CRUD is needed.

**Rationale**:

- `CustomRole` already exists with `name`, `description`, `institutionId`, and `RolePermission[]`
- The roles page at `/admin/administration/roles/page.tsx` already has create/list UI
- The `FacultySection.role` field is a plain string — it stores the role name (built-in or custom)
- The UI just needs to fetch `/admin/roles` and combine with built-in roles (`TEACHER`, `CLASS_TEACHER`) for the dropdown

### 3. Academic Year Scoping

**Decision**: `FacultySection` is scoped to `academicYearId` (not `termId`). The section detail page already has `section.academicYear?.id` available.

**Rationale**:

- Section-level assignments (who is the class teacher) are year-level concerns
- Course assignments are term-level (different courses per semester)
- The UI will use the section's academic year automatically

### 4. Unique Constraint

**Decision**: `@@unique([facultyId, sectionId, academicYearId])` — one role per faculty per section per year.

**Rationale**: A faculty can't be both "Teacher" and "Class Teacher" in the same section in the same year. If role changes, use PATCH.

---

## Phase 1: Database Schema

### New Model: `FacultySection`

**File**: `libs/database/prisma/schema.prisma`

Add after the `CourseAssignment` model (~line 930):

```prisma
model FacultySection {
  id             String   @id @default(uuid()) @db.Uuid
  institutionId  String   @map("institution_id") @db.Uuid
  facultyId      String   @map("faculty_id") @db.Uuid
  sectionId      String   @map("section_id") @db.Uuid
  role           String   // "TEACHER" | "CLASS_TEACHER" | custom role name
  academicYearId String   @map("academic_year_id") @db.Uuid
  isPrimary      Boolean  @default(false) @map("is_primary")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  institution  Institution  @relation(fields: [institutionId], references: [id])
  faculty      Faculty      @relation(fields: [facultyId], references: [id])
  section      Section      @relation(fields: [sectionId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])

  @@unique([facultyId, sectionId, academicYearId])
  @@index([institutionId])
  @@index([facultyId])
  @@index([sectionId])
  @@index([academicYearId])
  @@map("faculty_sections")
}
```

### Schema Updates to Existing Models

Add relation fields to existing models:

```prisma
// Faculty model — add:
facultySections FacultySection[]

// Section model — add:
facultySections FacultySection[]

// AcademicYear model — add:
facultySections FacultySection[]
```

### Migration

```bash
npx prisma migrate dev --name add-faculty-section
```

**Verify**: `npx prisma db push` or check migration SQL includes the new table, unique constraint, and indexes.

---

## Phase 2: Backend API

### DTOs

**File**: `apps/api/src/modules/admin/faculty-sections/dto/create-faculty-section.dto.ts`

```typescript
import { IsUUID, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateFacultySectionDto {
  @IsUUID()
  facultyId!: string;

  @IsUUID()
  sectionId!: string;

  @IsString()
  @MaxLength(100)
  role!: string; // "TEACHER" | "CLASS_TEACHER" | custom role name

  @IsUUID()
  academicYearId!: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
```

**File**: `apps/api/src/modules/admin/faculty-sections/dto/update-faculty-section.dto.ts`

```typescript
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateFacultySectionDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
```

### Service

**File**: `apps/api/src/modules/admin/faculty-sections/faculty-sections.service.ts`

Key methods:

| Method                                                       | Logic                                                                                                                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create(institutionId, dto)`                                 | Validate all FKs exist + belong to institution. Check unique constraint. If `isPrimary`, unset other primary for same section+year. Return with includes. |
| `findAllBySection(institutionId, sectionId, academicYearId)` | Filter by section + year. Include `faculty.user`, `section`, `academicYear`.                                                                              |
| `findAllByFaculty(institutionId, facultyId, academicYearId)` | Filter by faculty + year. Include `section`, `academicYear`.                                                                                              |
| `update(institutionId, id, dto)`                             | Validate assignment exists + belongs to institution. If setting `isPrimary`, unset others.                                                                |
| `remove(institutionId, id)`                                  | Validate ownership, delete.                                                                                                                               |
| `findUnassigned(institutionId, sectionId, academicYearId)`   | Get all active faculty NOT already assigned to this section in this year.                                                                                 |

**Pattern to follow**: `apps/api/src/modules/admin/courses/course-assignments.service.ts` (FK validation, P2002 handling, institution scoping).

### Controller

**File**: `apps/api/src/modules/admin/faculty-sections/faculty-sections.controller.ts`

```typescript
@Controller('admin/faculty-sections')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FacultySectionsController {
  // POST   /admin/faculty-sections              — Assign faculty to section
  // GET    /admin/faculty-sections              — List (query: sectionId, facultyId, academicYearId)
  // GET    /admin/faculty-sections/unassigned   — Unassigned faculty (query: sectionId, academicYearId)
  // PATCH  /admin/faculty-sections/:id          — Update role/isPrimary
  // DELETE /admin/faculty-sections/:id          — Remove assignment
}
```

**Pattern to follow**: `apps/api/src/modules/admin/courses/course-assignments.controller.ts` — same guards, same `@Request()` for `institutionId`.

### Module Registration

**File**: `apps/api/src/modules/admin/admin.module.ts`

Add:

```typescript
import { FacultySectionsModule } from './faculty-sections/faculty-sections.module';
```

And add `FacultySectionsModule` to the `imports` array.

**File**: `apps/api/src/modules/admin/faculty-sections/faculty-sections.module.ts`

```typescript
@Module({
  controllers: [FacultySectionsController],
  providers: [FacultySectionsService],
})
export class FacultySectionsModule {}
```

---

## Phase 3: SDK & Hooks

### SDK Methods

**File**: `packages/sdk/src/client/admin-api.ts`

Add to `AdminApi`:

```typescript
facultySections: {
  create: (data: CreateFacultySectionDto) =>
    adminApiClient.post('/faculty-sections', data).then(res => res.data),
  list: (params: { sectionId?: string; facultyId?: string; academicYearId?: string }) =>
    adminApiClient.get('/faculty-sections', { params }).then(res => res.data),
  unassigned: (params: { sectionId: string; academicYearId: string }) =>
    adminApiClient.get('/faculty-sections/unassigned', { params }).then(res => res.data),
  update: (id: string, data: UpdateFacultySectionDto) =>
    adminApiClient.patch(`/faculty-sections/${id}`, data).then(res => res.data),
  remove: (id: string) =>
    adminApiClient.delete(`/faculty-sections/${id}`).then(res => res.data),
},
```

### React Hooks

**File**: `apps/web/src/hooks/api/admin/useFacultySections.ts` (new file)

```typescript
// useAdminFacultySectionsBySection(sectionId, academicYearId) — query
// useAdminFacultySectionsByFaculty(facultyId, academicYearId) — query
// useAdminUnassignedFaculty(sectionId, academicYearId) — query
// useAdminCreateFacultySection() — mutation, invalidates ['admin', 'faculty-sections']
// useAdminUpdateFacultySection() — mutation
// useAdminDeleteFacultySection() — mutation
```

**Pattern to follow**: `apps/web/src/hooks/api/admin/useCourseAssignments.ts` — same `apiClient`, same invalidation pattern.

---

## Phase 4: UI Changes

### 4a. Section Detail Page — New "Faculty & Roles" Card

**File**: `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx`

**What to add**: A new `<Card>` BELOW the existing "Faculty Assignments" card. This card shows faculty-section role assignments (separate from course assignments).

**Structure**:

```
┌─────────────────────────────────────────────────┐
│ Faculty & Roles                          [+ Add] │
│ Faculty assigned to this section with roles      │
├─────────────────────────────────────────────────┤
│ [Assign form - faculty dropdown, role dropdown,  │
│  primary checkbox, submit button]                │
├─────────────────────────────────────────────────┤
│ Dr. Smith          [CLASS_TEACHER] [Primary] [×] │
│ Prof. Johnson      [TEACHER]              [×]    │
│ Ms. Lee            [Mentor]              [×]     │
└─────────────────────────────────────────────────┘
```

**Key details**:

- Fetch `useAdminFacultySectionsBySection(sectionId, section.academicYear?.id)`
- Fetch `useAdminUnassignedFaculty(sectionId, section.academicYear?.id)` for the dropdown
- Fetch `useAdminRoles()` for custom role options in the role dropdown
- Role dropdown options: built-in (`TEACHER`, `CLASS_TEACHER`) + custom roles from API
- The existing "Faculty Assignments" card (course-level) stays as-is
- Add `useAdminCreateFacultySection` and `useAdminDeleteFacultySection` mutations

### 4b. Faculty List Page — "Assign Section" Button

**File**: `apps/web/src/app/admin/faculty/page.tsx`

**What to add**: An "Assign Section" button in the Actions column (desktop) and mobile card actions.

**Desktop table** — add to the Actions `<TableCell>`:

```tsx
<Button variant="ghost" size="sm" onClick={() => openAssignModal(faculty)}>
  Assign Section
</Button>
```

**Mobile cards** — add alongside "View Details" button.

**New component**: `apps/web/src/components/admin/faculty/AssignSectionModal.tsx`

```
┌─────────────────────────────────────┐
│ Assign Section to [Faculty Name]    │
├─────────────────────────────────────┤
│ Section:    [dropdown - by program] │
│ Academic Year: [auto from section]  │
│ Role:       [dropdown - built-in +] │
│             [custom roles]          │
│ [✓] Primary Class Teacher           │
├─────────────────────────────────────┤
│ [Cancel]              [Assign]      │
└─────────────────────────────────────┘
```

**Key details**:

- Modal triggered from faculty list page
- Section dropdown grouped by program/batch
- Academic year auto-selected from section
- Role dropdown: `TEACHER`, `CLASS_TEACHER` + custom roles from `useAdminRoles()`
- On success: invalidate `faculty-sections` queries

### 4c. Sidebar Navigation (Optional)

**File**: `apps/web/src/components/admin/admin-sidebar.tsx`

**Decision**: Do NOT add a new sidebar entry. The feature is accessed via:

1. Section detail page → "Faculty & Roles" card
2. Faculty list page → "Assign Section" button

A dedicated `/admin/faculty-sections` page is unnecessary — the two access points cover the use cases. This avoids nav clutter.

---

## Execution Order

| Step | What                                              | Depends On | Parallelizable     |
| ---- | ------------------------------------------------- | ---------- | ------------------ |
| 1    | Add `FacultySection` to Prisma schema + relations | —          | —                  |
| 2    | Run migration                                     | Step 1     | —                  |
| 3    | Create DTOs                                       | Step 2     | Yes with Step 4    |
| 4    | Create service                                    | Step 2     | Yes with Step 3    |
| 5    | Create controller                                 | Steps 3, 4 | —                  |
| 6    | Create module + register in admin.module          | Step 5     | —                  |
| 7    | Add SDK methods                                   | Step 6     | Yes with Steps 8-9 |
| 8    | Create React hooks                                | Step 7     | Yes with Step 9    |
| 9    | Build section detail page UI (4a)                 | Steps 7, 8 | Yes with Step 10   |
| 10   | Build faculty list page UI + modal (4b)           | Steps 7, 8 | Yes with Step 9    |

**Estimated effort**: ~6 files created, ~3 files modified.

---

## Verification Checklist

- [ ] `npx prisma migrate dev` succeeds without errors
- [ ] `POST /admin/faculty-sections` creates assignment, returns 400 on duplicate
- [ ] `GET /admin/faculty-sections?sectionId=X&academicYearId=Y` returns filtered list
- [ ] `GET /admin/faculty-sections/unassigned?sectionId=X&academicYearId=Y` returns only unassigned faculty
- [ ] `PATCH /admin/faculty-sections/:id` updates role/isPrimary
- [ ] `DELETE /admin/faculty-sections/:id` removes assignment
- [ ] Setting `isPrimary: true` unsets other primaries for same section+year
- [ ] All endpoints return 401 without auth, 403 for non-admin
- [ ] Section detail page shows "Faculty & Roles" card with correct data
- [ ] Faculty list page shows "Assign Section" button, modal works end-to-end
- [ ] Role dropdown shows both built-in and custom roles
- [ ] Mobile responsive for both pages
- [ ] Query invalidation works (creating/deleting updates the UI without full reload)

---

## Files Summary

### New Files (8)

| File                                                                            | Purpose              |
| ------------------------------------------------------------------------------- | -------------------- |
| `apps/api/src/modules/admin/faculty-sections/faculty-sections.module.ts`        | NestJS module        |
| `apps/api/src/modules/admin/faculty-sections/faculty-sections.controller.ts`    | API endpoints        |
| `apps/api/src/modules/admin/faculty-sections/faculty-sections.service.ts`       | Business logic       |
| `apps/api/src/modules/admin/faculty-sections/dto/create-faculty-section.dto.ts` | Create DTO           |
| `apps/api/src/modules/admin/faculty-sections/dto/update-faculty-section.dto.ts` | Update DTO           |
| `apps/web/src/hooks/api/admin/useFacultySections.ts`                            | React Query hooks    |
| `apps/web/src/components/admin/faculty/AssignSectionModal.tsx`                  | Assign section modal |

### Modified Files (5)

| File                                                             | Change                                      |
| ---------------------------------------------------------------- | ------------------------------------------- |
| `libs/database/prisma/schema.prisma`                             | Add `FacultySection` model + relations      |
| `apps/api/src/modules/admin/admin.module.ts`                     | Register `FacultySectionsModule`            |
| `packages/sdk/src/client/admin-api.ts`                           | Add `facultySections` API methods           |
| `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx` | Add "Faculty & Roles" card                  |
| `apps/web/src/app/admin/faculty/page.tsx`                        | Add "Assign Section" button + modal trigger |
