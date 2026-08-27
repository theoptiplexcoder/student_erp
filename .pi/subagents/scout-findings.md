# Student ERP — Scout Findings

Target repo root: `/home/ybl/proj/Ellipsonic/ERP/student_erp`
Monorepo: turbo/pnpm workspaces. `apps/api` (NestJS), `apps/web` (Next.js 14 App Router, React 19). UI lib at `packages/ui` (alias `@student-erp/ui`, resolved via `tsconfig.base.json:36`). DB at `libs/database/prisma/schema.prisma`.

---

## 1. Curriculum Detail Page

**File:** `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx` (247 lines)

### How data is fetched

- Server component (no `'use client'`). Uses **direct `fetch`** (not React Query) against `${API_URL}/academic/curriculums/${id}` (lines 52–67), `cache: 'no-store'`.
- `API_URL` is built by `getApiUrl()` (lines 13–18) from `NEXT_PUBLIC_API_URL` env, normalized to end in `/api/v1`.
- Auth token retrieved via `getAuthToken()` (lines 21–28): calls `createClient()` from `@/lib/supabase/server`, runs `supabase.auth.getSession()`, returns `session?.access_token`. Token sent as `Authorization: Bearer <token>` header.
- `getCurriculum()` returns `null` on non-OK or error (lines 31–40); page calls `notFound()` if null (line 52).
- Note: this page uses **raw fetch**, not the `@tanstack/react-query` hooks in `apps/web/src/hooks/api/admin/`.

### How term cards are rendered

- After fetching `curriculum`, the page iterates `curriculum.curriculumTerms` (line 58).
- Each term is a `<div key={term.id} className="rounded-lg border p-4">` (line 118).
- Inside each term card there are two `<Button asChild variant="outline" size="sm">` links (lines 172–186):
  - **"Sections"** → `href=/admin/academics/programs/${programId}/curriculums/${curriculum.id}/terms/${term.id}/sections` (line 173–178)
  - **"Manage Courses"** → `href=/admin/academics/programs/${programId}/curriculums/${curriculum.id}/terms/${term.id}` (line 179–185)
- The term card header shows `term.name`, sequence, credit requirement, elective groups (`term.electiveGroups`), and a table of `term.curriculumCourses` (lines 152–212). Columns: Course Code, Course Name, Credits, Type (Mandatory/Elective via `<Badge>`), Group.

### Existing "Manage Courses" button — exact JSX (lines 179–185)

```tsx
<Button asChild variant="outline" size="sm">
  <Link
    href={`/admin/academics/programs/${programId}/curriculums/${curriculum.id}/terms/${term.id}`}
  >
    Manage Courses
  </Link>
</Button>
```

- Imported from `@student-erp/ui` (line 7). `asChild` means the `<Link>` becomes the button trigger; `variant="outline"` `size="sm"` is the visual style.

### Action buttons in the page header (lines 99–132)

- `<CurriculumActions>` component (line 106) renders Export JSON + Duplicate buttons.
- If `isDraft` (line 61): an "Activate Curriculum" server-action form button (lines 112–130) that POSTs to `/api/v1/api/academic/curriculums/${curriculumId}/activate` and calls `revalidatePath`.

### Imports from `@student-erp/ui` (line 2–15)

`Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge`. Also `lucide-react` (`Plus, Eye, ArrowLeft, CheckCircle`) and `next/link`, `next/navigation` (`notFound`), `next/cache` (`revalidatePath`).

---

## 2. Sections Page (already exists — the term-scoped sections page)

**File:** `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/terms/[termId]/sections/page.tsx` (266 lines)

### What it currently does

- Server component (no `'use client'`). Fetches the curriculum via `getCurriculum()` (lines 29–41) from `/api/v1/academic/curriculums/${id}` (same fetch/auth pattern as the curriculum detail page).
- Finds the specific `term` by `termId` from `curriculum.curriculumTerms` (line 71). Calls `notFound()` if curriculum or term missing.
- Fetches sections via `getCurriculumTermSections(termId)` (lines 46–57): GET `/api/v1/academic/curriculum-terms/${termId}/sections`, `cache: 'no-store'`, returns `[]` on error.
- Renders summary stat cards: Total Sections, Faculty Assignments, Departments.
- Renders a per-section `<Card>` for each section with: section name/code, department badges, enrollment count (`section._count.students`), capacity, and faculty list (aggregated from `section.courseAssignments`, each with `faculty.user`, `faculty.department`, `faculty.teacherCode`, and their `courses`).
- Each section card has a "View Section" button linking to `/admin/academics/sections/${section.id}` (lines 169–172).

### What it renders (data shape it consumes)

- `section.name`, `section.code`, `section.capacity`, `section._count.students`
- `section.courseAssignments[].faculty` (with nested `.user.firstName`, `.user.lastName`, `.teacherCode`, `.department.name`)
- `section.courseAssignments[].course` (with `.id`, `.code`)

### Complete or stub?

**Complete, not a stub.** Fully functional rendering with data fetching. The only limitation: it fetches data directly (no React Query hooks), and there is no create/edit action for sections from this page (read-only view). No skeleton/loading placeholders — sections are awaited server-side so no loading state needed.

### Terms list page

**File:** `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/terms/page.tsx`
**Result:** **Does NOT exist.** Only `[termId]/page.tsx` and `[termId]/sections/page.tsx` exist under `terms/`. There is no index/listing page for curriculum terms — terms are listed inline as cards on the curriculum detail page (see §1).

### Other related sections pages (general, not term-scoped)

- `apps/web/src/app/admin/academics/sections/page.tsx` — full sections list page (uses `useAdminSections` hook, has Create Section button, search, table with Code/Name/Program/Batch/Capacity/Students).
- `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx` — **STUB** (line 3): `export default function Page() { return null; }`

---

## 3. Curriculum Term Detail Page

**File:** `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/terms/[termId]/page.tsx` (173 lines)

### What it does

- Server component. Fetches the curriculum (same `getCurriculum` fetch pattern, lines 28–40). Finds the term by ID from `curriculum.curriculumTerms` (line 63). `notFound()` if missing.
- `isDraft = curriculum.status === 'DRAFT'` (line 67).
- Renders breadcrumb link back to curriculum detail (lines 69–75).
- Renders a "Curriculum Courses" table: Sequence, Course Code, Course Name, Credits, Type (Mandatory/Elective badge), Actions.
- Shows `AddCourseDialog` (from `../../add-course-dialog`) with a "Add Course" button when `isDraft` (lines 137–149). The dialog is given `defaultTermId={term.id}` so the term pre-selects.
- Each course row has a delete form (lines 200–216): server-action `'use server'` form that DELETEs `/api/v1/academic/curriculum-courses/${cc.id}` and revalidates the term page path.

### How it links to sections

This term detail page does **NOT** directly link to sections. The sections link lives on the **curriculum detail page** (§1, lines 172–178): the "Sections" button next to each term card. The term detail page itself is course-management-focused only.

---

## 4. Curriculum Actions

**File:** `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/curriculum-actions.tsx` (89 lines)

- `'use client'` (line 1). Uses `next/navigation` router + React `useState`.
- Imports `useDuplicateCurriculum`, `useExportCurriculum` from `@/hooks/api/admin/useCurriculums` (line 6).
- Renders a `<div className="flex gap-2">` with two `<Button variant="outline" size="sm">`:

### Actions

1. **Export JSON** (lines 95–108) — calls `useExportCurriculum` mutation (`GET /api/v1/academic/curriculums/${id}/export`), then creates a Blob and triggers a download with filename `curriculum-${data.versionNumber}.json`. Shows `Download` icon + `Loader2` spinner when pending.
2. **Duplicate** (lines 72–93) — `handleDuplicate()`: prompts for version number (`prompt(...)`) and effective date, calls `useDuplicateCurriculum` mutation (`POST /api/v1/academic/curriculums/${id}/duplicate` with `{ id, data: { versionNumber, effectiveFrom } }`), shows alert, then `router.push` to the new curriculum URL. Shows `Copy` icon + `Loader2` spinner when `isDuplicating`.

### Manage Courses

"Manage Courses" is **not** in this component — it lives as a link button on the curriculum detail page (§1, term card). `CurriculumActions` only contains Export JSON + Duplicate.

---

## 5. CurriculumsController & Service (API)

### CurriculumsController

**File:** `apps/api/src/modules/academic/controllers/curriculums.controller.ts`

- `@Controller('academic/curriculums')` — base path is `academic/curriculums`. Final routes get the global prefix `api/v1` from `main.ts:15` (`app.setGlobalPrefix('api/v1')`).
- Guards: `@UseGuards(SupabaseAuthGuard, RolesGuard)` (class-level, line 17).
- Institution scoping: via `@CurrentUser() user: any` → `user.institutionId` passed to every service call.

#### All routes

| Method | Path                                       | Handler            | DTO                      |
| ------ | ------------------------------------------ | ------------------ | ------------------------ |
| POST   | `/academic/curriculums/import`             | `importCurriculum` | `ImportCurriculumDto`    |
| POST   | `/academic/curriculums`                    | `create`           | `CreateCurriculumDto`    |
| GET    | `/academic/curriculums/program/:programId` | `findByProgram`    | none                     |
| GET    | `/academic/curriculums/:id/export`         | `exportCurriculum` | none                     |
| GET    | `/academic/curriculums/:id`                | `findOne`          | none                     |
| PATCH  | `/academic/curriculums/:id`                | `update`           | `UpdateCurriculumDto`    |
| POST   | `/academic/curriculums/:id/duplicate`      | `duplicate`        | `DuplicateCurriculumDto` |
| POST   | `/academic/curriculums/:id/validate`       | `validate`         | none                     |
| POST   | `/academic/curriculums/:id/activate`       | `activate`         | none                     |
| DELETE | `/academic/curriculums/:id`                | `remove`           | none                     |

- Params use `ParseUUIDPipe` for `:id` and `:programId` where applicable.
- Note: `import` route is declared before `:id` param routes (NestJS resolves by specificity, not order, but the literal `/import` is safe).

### CurriculumsService

**File:** `apps/api/src/modules/academic/services/curriculums.service.ts`

- All methods take `institutionId` as first arg and pass it to every Prisma query.
- **`create`**: looks up program with `{ id: dto.programId, institutionId }`; auto-generates version `v<count+1>.0` if not supplied; creates with `status: DRAFT`.
- **`findByProgram`**: `prisma.curriculum.findMany({ where: { institutionId, programId } })` with `_count.curriculumTerms`, ordered by `createdAt desc`.
- **`findOne`**: `findFirst({ where: { id, institutionId } })` with nested includes: `program`, `curriculumTerms` (orderBy sequence asc) → `electiveGroups`, `curriculumCourses` (orderBy sequence asc) → `course`. This is what the frontend detail page consumes.
- **`update`**: checks draft status before allowing non-status edits; throws `ConflictException` otherwise.
- **`validateCurriculum`**: checks ≥1 term, ≥1 course per term, warns if mandatory credits < requirement.
- **`activateCurriculum`**: runs validation; allows only if no errors; sets status `ACTIVE`.
- **`remove`**: blocks deletion of `ACTIVE` curriculums; blocks if enrollments or students reference it.
- **`duplicate`**: `$transaction` cloning curriculum → terms → elective groups → curriculum courses (map old→new group IDs).
- **`exportCurriculum`**: flattens into a JSON matching `ImportCurriculumDto` shape (programId, name, versionNumber, effectiveFrom, terms[] with name/sequence/creditRequirement/electiveGroups/courses).

### DTOs

- `apps/api/src/modules/academic/dto/curriculum.dto.ts` — `CreateCurriculumDto` (programId, versionNumber?, name, effectiveFrom), `UpdateCurriculumDto` (name?, versionNumber?, effectiveFrom?, status?: CurriculumStatus).
- `apps/api/src/modules/academic/dto/curriculum-operations.dto.ts` — `DuplicateCurriculumDto`, `ImportCurriculumDto`.

### AcademicModule route registration

**File:** `apps/api/src/modules/academic/academic.module.ts`

- Registers: `CourseOfferingsController, EnrollmentsController, ProgramsController, CurriculumsController, CurriculumTermsController, CurriculumCoursesController, CurriculumElectiveGroupsController` + their services.
- Imported in `AppModule` (line 10).

---

## 6. Sections API

### Admin Sections module

**Files:**

- `apps/api/src/modules/admin/sections/sections.controller.ts`
- `apps/api/src/modules/admin/sections/sections.service.ts`
- `apps/api/src/modules/admin/sections/sections.module.ts`
- `apps/api/src/modules/admin/sections/dto/create-section.dto.ts`
- `apps/api/src/modules/admin/sections/dto/update-section.dto.ts`

**Controller:** `@Controller('admin/sections')`, `@UseGuards(SupabaseAuthGuard, RolesGuard)`, `@Roles('ADMIN')` (line 12). Only admins can CRUD sections.

#### All routes (final path = `/api/v1/admin/sections/...`)

| Method | Path                  | Handler                                                              |
| ------ | --------------------- | -------------------------------------------------------------------- |
| POST   | `/admin/sections`     | `create`                                                             |
| GET    | `/admin/sections`     | `findAll` — query params: page, pageSize, search, batchId, programId |
| GET    | `/admin/sections/:id` | `findOne`                                                            |
| PATCH  | `/admin/sections/:id` | `update`                                                             |
| DELETE | `/admin/sections/:id` | `remove`                                                             |

**Service:** `SectionsService` — all methods take `institutionId`. `findAll` does paginated `findMany` with `include: { program, batch, classLevel, academicYear }` and returns `{ data, meta: { total, page, pageSize, totalPages } }`. `findOne` has same includes.

### Curriculum-terms sections route (term-scoped)

**File:** `apps/api/src/modules/academic/controllers/curriculum-terms.controller.ts` line 19

- `@Get(':id/sections')` → `getSections(user.institutionId, id)` → `GET /api/v1/academic/curriculum-terms/:id/sections`
- **No `@Roles()` guard** on CurriculumTermsController — authenticated users (any role) can access. Guards: `SupabaseAuthGuard, RolesGuard` but no `@Roles()` decorator, so `RolesGuard` returns true (open to authenticated).

### CurriculumTermsService.getSections

**File:** `apps/api/src/modules/academic/services/curriculum-terms.service.ts` (lines 11–33)

- Finds term by `{ id, institutionId }` incl `curriculum: true`.
- `prisma.section.findMany({ where: { institutionId, programId: term.curriculum.programId, semester: term.sequence }, include: { batch: true, courseAssignments: { include: { course: true, faculty: { include: { user: true, department: true } } } }, _count: { select: { students: true } } } })`.
- **Key insight**: sections are matched to a curriculum term via `programId` + `semester` (= `term.sequence`). So a section with `semester: 3` maps to curriculum term with `sequence: 3`.

### Course Assignment endpoints

**There is NO dedicated course-assignments controller/service.** `CourseAssignment` is only exposed as a **nested include** within the `getSections` endpoint above (no standalone CRUD routes). Confirmed by grep: no `course-assignments` controller or service exists anywhere in `apps/api/src`. Course assignments are read-only via the section fetch.

### Enrollments controller (related)

**File:** `apps/api/src/modules/academic/controllers/enrollments.controller.ts` — `@Controller('academic/course-offerings/:id/enrollments')` — not section-related directly.

### CourseOfferings controller (section-related)

**File:** `apps/api/src/modules/academic/controllers/course-offerings.controller.ts` — `@Controller('academic/course-offerings')`, **no guards** (no auth/roles decorator), `findAll` accepts `?courseId` and `?termId` query params. CourseOfferings have `sectionId` field but no dedicated section-scoped route.

---

## 7. Prisma Schema

**File:** `libs/database/prisma/schema.prisma`

### Curriculum (lines ~875)

```prisma
model Curriculum {
  id               String           @id @default(uuid()) @db.Uuid
  institutionId    String           @map("institution_id") @db.Uuid
  programId        String           @map("program_id") @db.Uuid
  versionNumber    String           @map("version_number")
  name             String
  status           CurriculumStatus @default(DRAFT)
  effectiveFrom    DateTime         @map("effective_from") @db.Date
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  institution     Institution      @relation(fields: [institutionId], references: [id])
  program         Program          @relation(fields: [programId], references: [id])
  curriculumTerms CurriculumTerm[]
  students        Student[]
  enrollments     Enrollment[]

  @@unique([programId, versionNumber])
  @@index([institutionId])
  @@map("curriculums")
}
```

### CurriculumTerm (lines ~900)

```prisma
model CurriculumTerm {
  id                String   @id @default(uuid()) @db.Uuid
  institutionId     String   @map("institution_id") @db.Uuid
  curriculumId      String   @map("curriculum_id") @db.Uuid
  name              String
  sequence          Int
  creditRequirement Float?   @map("credit_requirement")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  institution       Institution        @relation(fields: [institutionId], references: [id])
  curriculum        Curriculum         @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
  curriculumCourses CurriculumCourse[]
  electiveGroups    CurriculumElectiveGroup[]

  @@unique([curriculumId, sequence])
  @@unique([curriculumId, name])
  @@index([institutionId])
  @@map("curriculum_terms")
}
```

### AcademicTerm (lines ~340)

```prisma
model AcademicTerm {
  id             String             @id @default(uuid()) @db.Uuid
  institutionId  String             @map("institution_id") @db.Uuid
  academicYearId String             @map("academic_year_id") @db.Uuid
  name           String
  code           String
  semester       Int?
  termType       TermType           @default(SEMESTER) @map("term_type")
  startDate      DateTime           @map("start_date") @db.Date
  endDate        DateTime           @map("end_date") @db.Date
  status         AcademicTermStatus @default(UPCOMING)
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  institution  Institution  @relation(fields: [institutionId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])
  enrollments        Enrollment[]
  courseAssignments  CourseAssignment[]
  timetableEntries   TimetableEntry[]
  attendanceSessions AttendanceSession[]
  assignments        Assignment[]
  courseOfferings    CourseOffering[]
  exams              Exam[]
  @@index([institutionId])
  @@index([academicYearId])
  @@map("academic_terms")
}
```

### AcademicYear (lines ~175)

```prisma
model AcademicYear {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  name          String
  startDate     DateTime @map("start_date") @db.Date
  endDate       DateTime @map("end_date") @db.Date
  isActive      Boolean  @default(false) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution      Institution      @relation(fields: [institutionId], references: [id])
  academicTerms    AcademicTerm[]
  sections         Section[]
  exams            Exam[]
  timetableEntries TimetableEntry[]
  enrollments      Enrollment[]
  feePlans         StudentFeePlan[]
  @@index([institutionId])
  @@index([institutionId, isActive])
  @@map("academic_years")
}
```

### Section (lines ~420)

```prisma
model Section {
  id             String   @id @default(uuid()) @db.Uuid
  institutionId  String   @map("institution_id") @db.Uuid
  programId      String?  @map("program_id") @db.Uuid
  classLevelId   String?  @map("class_level_id") @db.Uuid
  batchId        String?  @map("batch_id") @db.Uuid
  academicYearId String   @map("academic_year_id") @db.Uuid
  name           String
  code           String
  semester       Int?
  capacity       Int
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  institution  Institution  @relation(fields: [institutionId], references: [id])
  program      Program?     @relation(fields: [programId], references: [id])
  classLevel   ClassLevel?  @relation(fields: [classLevelId], references: [id])
  batch        Batch?       @relation(fields: [batchId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])
  students           Student[]
  enrollments        Enrollment[]
  courseAssignments  CourseAssignment[]
  timetableEntries   TimetableEntry[]
  courseOfferings    CourseOffering[]
  attendanceSessions AttendanceSession[]
  calendarEvents     CalendarEvent[]
  @@index([institutionId])
  @@map("sections")
}
```

**Note:** Section has no required FK to CurriculumTerm. The link from a curriculum term to sections is **logical**: `section.semester == curriculumTerm.sequence` and `section.programId == curriculum.programId` (confirmed in `CurriculumTermsService.getSections`).

### CourseAssignment (lines ~590)

```prisma
model CourseAssignment {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  facultyId     String   @map("faculty_id") @db.Uuid
  courseId      String   @map("course_id") @db.Uuid
  sectionId     String   @map("section_id") @db.Uuid
  termId        String   @map("term_id") @db.Uuid
  isPrimary     Boolean  @default(true) @map("is_primary")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution Institution  @relation(fields: [institutionId], references: [id])
  faculty     Faculty      @relation(fields: [facultyId], references: [id])
  course      Course       @relation(fields: [courseId], references: [id])
  section     Section      @relation(fields: [sectionId], references: [id])
  term        AcademicTerm @relation(fields: [termId], references: [id])
  @@unique([facultyId, courseId, sectionId, termId])
  @@index([institutionId])
  @@map("course_assignments")
}
```

### Faculty (lines ~230)

```prisma
model Faculty {
  id             String                @id @default(uuid()) @db.Uuid
  institutionId  String                @map("institution_id") @db.Uuid
  userId         String                @unique @map("user_id") @db.Uuid
  departmentId   String                @map("department_id") @db.Uuid
  teacherCode    String                @map("teacher_code")
  employmentType FacultyEmploymentType @map("employment_type")
  hireDate       DateTime              @map("hire_date") @db.Date
  exitDate       DateTime?             @map("exit_date") @db.Date
  status         FacultyStatus         @default(ACTIVE)
  createdAt      DateTime              @default(now()) @map("created_at")
  updatedAt      DateTime              @updatedAt @map("updated_at")
  institution Institution @relation(fields: [institutionId], references: [id])
  user        User        @relation(fields: [userId], references: [id])
  department  Department  @relation(fields: [departmentId], references: [id])
  courseAssignments  CourseAssignment[]
  timetableEntries   TimetableEntry[]
  attendanceSessions AttendanceSession[]
  courseResources    CourseResource[]
  grievances         Grievance[]
  assignments        Assignment[]
  announcements      Announcement[]
  @@unique([institutionId, teacherCode])
  @@index([institutionId])
  @@index([institutionId, departmentId])
  @@index([institutionId, status])
  @@map("faculty")
}
```

### Department (lines ~155)

```prisma
model Department {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  name          String
  code          String
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution Institution @relation(fields: [institutionId], references: [id])
  programs    Program[]
  faculty     Faculty[]
  courses     Course[]
  @@unique([institutionId, code])
  @@index([institutionId])
  @@map("departments")
}
```

### Program (lines ~135)

```prisma
model Program {
  id            String       @id @default(uuid()) @db.Uuid
  institutionId String       @map("institution_id") @db.Uuid
  departmentId  String       @map("department_id") @db.Uuid
  name          String
  code          String
  level         ProgramLevel
  durationYears Int          @map("duration_years")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution     Institution      @relation(fields: [institutionId], references: [id])
  department      Department       @relation(fields: [departmentId], references: [id])
  students        Student[]
  sections        Section[]
  batches         Batch[]
  curriculums     Curriculum[]
  calendarEvents  CalendarEvent[]
  courses         Course[]
  courseOfferings CourseOffering[]
  enrollments     Enrollment[]
  @@unique([institutionId, code])
  @@index([institutionId])
  @@index([institutionId, departmentId])
  @@map("programs")
}
```

### Course (lines ~460)

```prisma
model Course {
  id            String       @id @default(uuid()) @db.Uuid
  institutionId String       @map("institution_id") @db.Uuid
  departmentId  String?      @map("department_id") @db.Uuid
  code          String
  name          String
  description   String?
  creditValue   Float?       @map("credit_value")
  maxMarks      Float?       @map("max_marks")
  passingMarks  Float?       @map("passing_marks")
  isPractical   Boolean      @default(false) @map("is_practical")
  courseType    String?      @map("course_type")
  status        CourseStatus @default(ACTIVE)
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution Institution @relation(fields: [institutionId], references: [id])
  department  Department? @relation(fields: [departmentId], references: [id])
  curriculumCourses  CurriculumCourse[]
  prerequisitesFor   CoursePrerequisite[] @relation("CourseToPrerequisite")
  prerequisiteOf     CoursePrerequisite[] @relation("PrerequisiteToCourse")
  enrollments        Enrollment[]
  courseOfferings    CourseOffering[]
  courseAssignments  CourseAssignment[]
  timetableEntries   TimetableEntry[]
  attendanceSessions AttendanceSession[]
  courseResources    CourseResource[]
  assignments        Assignment[]
  examCourses        ExamCourse[]
  program            Program?             @relation(fields: [programId], references: [id])
  programId          String?              @db.Uuid
  classLevel         ClassLevel?          @relation(fields: [classLevelId], references: [id])
  classLevelId       String?              @db.Uuid
  @@unique([institutionId, code])
  @@index([institutionId])
  @@map("courses")
}
```

### CurriculumCourse (lines ~940)

```prisma
model CurriculumCourse {
  id               String   @id @default(uuid()) @db.Uuid
  institutionId    String   @map("institution_id") @db.Uuid
  curriculumTermId String   @map("curriculum_term_id") @db.Uuid
  courseId         String   @map("course_id") @db.Uuid
  sequence         Int
  creditValue      Float?   @map("credit_value")
  isMandatory      Boolean  @default(true) @map("is_mandatory")
  electiveGroupId  String?  @map("elective_group_id") @db.Uuid
  electiveGroup    CurriculumElectiveGroup? @relation(fields: [electiveGroupId], references: [id], onDelete: SetNull)
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  institution    Institution    @relation(fields: [institutionId], references: [id])
  curriculumTerm CurriculumTerm @relation(fields: [curriculumTermId], references: [id], onDelete: Cascade)
  course         Course         @relation(fields: [courseId], references: [id], onDelete: Restrict)
  @@unique([curriculumTermId, courseId])
  @@unique([curriculumTermId, sequence])
  @@index([institutionId])
  @@map("curriculum_courses")
}
```

### Batch (lines ~200)

```prisma
model Batch {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  programId     String   @map("program_id") @db.Uuid
  name          String
  admissionYear Int       @map("admission_year")
  startDate       DateTime? @map("start_date") @db.Date
  expectedEndDate DateTime? @map("expected_end_date") @db.Date
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  institution     Institution      @relation(fields: [institutionId], references: [id])
  program         Program          @relation(fields: [programId], references: [id])
  sections        Section[]
  courseOfferings CourseOffering[]
  enrollments     Enrollment[]
  @@index([institutionId])
  @@index([programId])
  @@map("batches")
}
```

### ClassLevel (lines ~188)

```prisma
model ClassLevel {
  id            String @id @default(uuid()) @db.Uuid
  institutionId String @map("institution_id") @db.Uuid
  name       String
  code       String?
  sequence Int
  institution Institution  @relation(fields: [institutionId], references: [id])
  sections    Section[]
  courses     Course[]
  enrollments Enrollment[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@unique([institutionId, code])
  @@index([institutionId])
  @@map("class_levels")
}
```

### Enrollment (lines ~540)

```prisma
model Enrollment {
  id               String           @id @default(uuid()) @db.Uuid
  institutionId    String           @map("institution_id") @db.Uuid
  studentId        String           @map("student_id") @db.Uuid
  academicYearId   String           @map("academic_year_id") @db.Uuid
  courseId         String?          @map("course_id") @db.Uuid
  courseOfferingId String?          @map("course_offering_id") @db.Uuid
  programId        String?          @map("program_id") @db.Uuid
  curriculumId     String?          @map("curriculum_id") @db.Uuid
  classLevelId     String?          @map("class_level_id") @db.Uuid
  batchId          String?          @map("batch_id") @db.Uuid
  sectionId        String?          @map("section_id") @db.Uuid
  termId           String?          @map("term_id") @db.Uuid
  rollNumber       String?          @map("roll_number")
  status           EnrollmentStatus @default(ACTIVE)
  enrolledAt       DateTime         @default(now()) @map("enrolled_at")
  completedAt      DateTime?        @map("completed_at")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  institution    Institution     @relation(fields: [institutionId], references: [id])
  student        Student         @relation(fields: [studentId], references: [id])
  academicYear   AcademicYear    @relation(fields: [academicYearId], references: [id])
  course         Course?         @relation(fields: [courseId], references: [id])
  courseOffering CourseOffering? @relation(fields: [courseOfferingId], references: [id])
  program        Program?        @relation(fields: [programId], references: [id])
  curriculum     Curriculum?     @relation(fields: [curriculumId], references: [id])
  classLevel     ClassLevel?     @relation(fields: [classLevelId], references: [id])
  batch          Batch?          @relation(fields: [batchId], references: [id])
  section        Section?        @relation(fields: [sectionId], references: [id])
  term           AcademicTerm?   @relation(fields: [termId], references: [id])
  marks Mark[]
  @@index([institutionId])
  @@index([institutionId, studentId])
  @@index([institutionId, courseId])
  @@index([studentId, termId])
  @@map("enrollments")
}
```

### Key relationship: Section → CurriculumTerm

There is **no direct FK** between `Section` and `CurriculumTerm`/`AcademicTerm`. The connection is logical:

- `section.programId == curriculum.programId` AND `section.semester == curriculumTerm.sequence`
- `CourseAssignment` links `Section`, `Faculty`, `Course`, and `AcademicTerm` (the operational term, not the curriculum term) via `@@unique([facultyId, courseId, sectionId, termId])`.

---

## 8. Frontend API Hooks (React Query)

**Base:** all hooks in `apps/web/src/hooks/api/admin/`. Pattern: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'` + `import { apiClient } from '@/lib/api-client'`. Query keys follow `['admin', <resource>, ...args]` pattern. `apiClient` is an axios instance (`apps/web/src/lib/api-client.ts`) that auto-injects the Supabase Bearer token via a request interceptor.

### Relevant hooks

**`useCurriculums.ts`** (`apps/web/src/hooks/api/admin/useCurriculums.ts`)

- `useAdminCurriculumsByProgram(programId)` — queryKey `['admin','curriculums','program',programId]`; `GET /academic/curriculums/program/${programId}`; enabled when valid UUID.
- `useAdminCurriculum(id)` — queryKey `['admin','curriculums',id]`; `GET /academic/curriculums/${id}`.
- `useCreateCurriculum` — `POST /academic/curriculums`; invalidates `['admin','curriculums','program',variables.programId]`.
- `useUpdateCurriculum` — `PATCH /academic/curriculums/${id}`.
- `useValidateCurriculum` — `POST /academic/curriculums/${id}/validate`.
- `useActivateCurriculum` — `POST /academic/curriculums/${id}/activate`.
- `useCreateCurriculumTerm` — `POST /academic/curriculum-terms`; invalidates `['admin','curriculums',data.curriculumId]`.
- `useDeleteCurriculumTerm` — `DELETE /academic/curriculum-terms/${id}`.
- `useCreateCurriculumCourse` — `POST /academic/curriculum-courses`.
- `useDeleteCurriculumCourse` — `DELETE /academic/curriculum-courses/${id}`.
- `useDuplicateCurriculum` — `POST /academic/curriculums/${id}/duplicate`.
- `useExportCurriculum` — `GET /academic/curriculums/${id}/export`.
- `useImportCurriculum` — `POST /academic/curriculums/import`.
- `useCreateElectiveGroup`, `useDeleteElectiveGroup`.

**`useSections.ts`** (`apps/web/src/hooks/api/admin/useSections.ts`)

- Exports `interface Section` and `interface SectionsResponse { data, meta: { total, page, pageSize, totalPages } }`.
- `useAdminSections(page, pageSize, search)` — queryKey `['admin','sections',page,pageSize,search]`; `GET /admin/sections` with params.
- `useAdminSection(id)` — `GET /admin/sections/${id}`.
- `useCreateSection`, `useUpdateSection`, `useDeleteSection`.

**`useFaculty.ts`** (`apps/web/src/hooks/api/admin/useFaculty.ts`)

- Exports `interface Faculty { id, teacherCode, employmentType, status, user:{id,firstName,lastName,email}, department?:{id,name} }`.
- `useAdminFaculty(page, pageSize, search)` — `GET /admin/faculty`.
- `useAdminFacultyDetails(id)` — `GET /admin/faculty/${id}`.

**`useCourses.ts`** — `useAdminCourses`, `useAdminCourse`, `useCreateCourse`. queryKey `['admin','courses',...]`.
**`usePrograms.ts`** — `useAdminPrograms`, `useAdminProgram`, `useCreateProgram`. queryKey `['admin','programs',...]`.
**`useDepartments.ts`** — `useAdminDepartments`, etc. queryKey `['admin','departments',...]`.
**`useBatches.ts`** — `useAdminBatches`, etc. queryKey `['admin','batches',...]`.
**`useStudents.ts`**, `useAdmissions.ts`, `useBuildings.ts`, `useCalendarEvents.ts`, `useDashboard.ts`, `useExams.ts`, `useGrievances.ts`, `useRooms.ts`.

### Missing hooks

- **NO `useCourseAssignments` hook** exists. No hook for `GET /academic/curriculum-terms/:id/sections` (the term-scoped sections endpoint). The sections page calls `fetch` directly.
- **NO hook for course-assignments** (there is no course-assignments API endpoint anyway).

### Non-API hooks

- `apps/web/src/hooks/use-current-user.ts` — `useCurrentUser()` → `GET /api/auth/me`; returns `{ user: AuthUser }` with `queryKey: ['current-user']`. `AuthUser` = `{ id, authUserId, institutionId, role, status, email, firstName, lastName, photoUrl }`. staleTime 5min, retry: false.
- `apps/web/src/hooks/use-sidebar.ts`.

---

## 9. Frontend Components (UI Library)

### `@student-erp/ui` (`packages/ui/src/index.ts`)

Exported components:

- `Avatar, AvatarImage, AvatarFallback`
- `Badge, badgeVariants`
- `Button, buttonVariants`
- `Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent`
- `Checkbox`
- `Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription`
- `Input`
- `Label`
- `Separator`
- `Skeleton`
- `Tabs, TabsList, TabsTrigger, TabsContent`
- `Table, TableHeader, TableBody, TableRow, TableHead, TableCell`
- `cn` from `./lib/utils`

**NOT exported (do NOT exist):** `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`, `Alert`, `AlertTitle`, `AlertDescription`. No shadcn Breadcrumb or Alert component anywhere in `packages/ui/src/` or `apps/web/src`.

### Local breadcrumb component

`apps/web/src/components/shared/breadcrumbs.tsx` — a client component `'use client'` that auto-generates breadcrumbs from `usePathname()`. Imported as `Breadcrumbs` in `admin-header.tsx` and `student-navbar.tsx`. Not used on the curriculum/term pages (those render manual breadcrumb text with `ArrowLeft` icon).

### Button variants (from `packages/ui/src/button.tsx`)

Variants: `default | destructive | outline | secondary | ghost | link`. Sizes: `default | sm | lg | xl | icon`. `asChild` prop swaps the root to `Slot` (radix). Used pattern on curriculum page: `<Button asChild variant="outline" size="sm"><Link>…</Link></Button>`.

### Styles

`packages/ui/package.json` exports `"./*": "./src/styles/*"` — but `find` shows no `styles/` dir currently. Tailwind config handles colors. `cn()` uses `clsx` + `tailwind-merge`. No custom color additions — uses Tailwind `bg-primary`, `text-primary-foreground`, `bg-card`, etc.

---

## 10. Seed Data

**File:** `libs/database/prisma/seed.ts` (full file, ~850 lines)

Institution: "Demo Institute of Technology" (id `d9b97b0a-0b2a-4a8f-b9f1-7c980d2215c2`), plus a secondary tenant "Demo College of Business".

### Departments (5)

CSE, IT, ECE, MATH, MBA.

### Programs (5)

B.Tech CSE (BTECH-CSE), B.Tech IT, B.Tech ECE, BCA, MBA.

### Academic Years (3)

2025-26 (inactive), 2026-27 (active), 2027-28 (inactive).

### Academic Terms (8)

Semester 1 (sem 1, COMPLETED) through Semester 8 (sem 8). Semester 3 = `SEM3-2026` (semester: 3, ACTIVE).

### Curriculum

One curriculum: "2026 CSE Curriculum" (BTECH-CSE, ACTIVE, effective 2026-07-01).

### Curriculum Terms (8)

Semester 1 (sequence 1, 20cr) … Semester 8 (sequence 8, 18cr). Semester 3 = sequence 3, creditRequirement 22.

### Courses (35)

CS101–CS407 across semesters 1–8, all 4 credits except CS405 (10cr), CS406 (6cr), CS407 (2cr). All in CSE department.

### Curriculum Courses

All 35 courses mapped to their respective curriculum term, `isMandatory: true`, with sequence numbers.

### Course Prerequisites (8)

e.g., CS102 ← CS101, CS201 ← CS102, CS203 ← CS204 (note: seed has a bug where CS203 prereq is CS204).

### Batches (3)

2024 Intake, 2025 Intake, 2026 Intake (all BTECH-CSE).

### **Sections (2) — Semester 3**

- `CSE-A` (code: CSE-A, capacity 60, semester: 3, batch: 2026 Intake)
- `CSE-B` (code: CSE-B, capacity 60, semester: 3, batch: 2026 Intake)

### **Faculty (10)** — all FULL_TIME, ACTIVE, in CSE department

Dr. Rajesh Kumar, Prof. Ananya Sharma, Dr. Vivek Rao, Dr. Priya Nair, Prof. Arjun Mehta, Dr. Sneha Kapoor, Prof. Rohit Verma, Dr. Neha Singh, Prof. Amit Joshi, Dr. Kavita Menon. Teacher codes FAC001–FAC010.

### **Course Assignments — Semester 3 (10 assignments, SEM3-2026)**

Section CSE-A:

- CS201 → Dr. Rajesh Kumar
- CS202 → Prof. Ananya Sharma
- CS203 → Dr. Vivek Rao
- CS204 → Dr. Priya Nair
- MA201 → Prof. Arjun Mehta

Section CSE-B:

- CS201 → Dr. Sneha Kapoor
- CS202 → Prof. Rohit Verma
- CS203 → Dr. Neha Singh
- CS204 → Prof. Amit Joshi
- MA201 → Dr. Kavita Menon

### Students (30)

Student1–Student15 in CSE-A, Student16–Student30 in CSE-B. All enrolled in SEM3-2026 courses (CS201, CS202, CS203, CS204, MA201).

### Other seeded

- Timetable entries (manual, CSE-A only, MON/WED for CS201, CS202; TUE/THU for CS204, MA201; WED/THU lab slots).
- 2 Announcements.
- 2 Assignments (CS202, MA201) — attributed to Dr. Rajesh Kumar.
- Attendance sessions (CS201–CSE-A only, 10 sessions, 80% present for CSE-A students).

**Key mapping for the "Sections" button:** sections `CSE-A`/`CSE-B` have `semester: 3` which matches curriculum term `sequence: 3`. The `getSections` service filters `section.semester == term.sequence` (3 == 3). ✓

---

## 11. RBAC / Auth Patterns

### Backend (NestJS) — `apps/api/src`

1. **`SupabaseAuthGuard`** (`apps/api/src/guards/supabase-auth.guard.ts`) — extracts Bearer token, calls `supabase.auth.getUser(token)`, looks up `prisma.user.findUnique({ where: { authUserId } })`, attaches `{ id, authUserId, institutionId, role, status, email }` to `request.user`. Throws `UnauthorizedException` if no token, invalid token, user not found, or not ACTIVE.
2. **`RolesGuard`** (`apps/api/src/guards/roles.guard.ts`) — reads `@Roles()` metadata via `Reflector`; returns true (allow) if no roles required; checks `requiredRoles.includes(user.role)`, throws `ForbiddenException` otherwise.
3. **`@Roles('ADMIN')`** decorator (`apps/api/src/decorators/roles.decorator.ts`) — `SetMetadata('roles', [...])`. Applied on `SectionsController` (ADMIN-only) and `FacultyController` (ADMIN-only).
4. **`@CurrentUser()`** decorator (`apps/api/src/decorators/current-user.decorator.ts`) — simple param decorator returning `request.user`.
5. **Institution scoping** — NO `@Institution()` decorator exists. Every controller extracts `institutionId` from `user.institutionId` (via `@CurrentUser()`) and passes it explicitly to the service. The service layer does `where: { institutionId, ... }` on every Prisma query. `ProgramsController` uses `@Request() req` with a fallback `'dummy-institution-id'` (line 10) — a notable inconsistency/limitation.
6. **Global prefix:** `main.ts:15` → `app.setGlobalPrefix('api/v1')`. Base URL for all API = `https://student-erp-api.onrender.com/api/v1` (env `NEXT_PUBLIC_API_URL`) in production, `http://localhost:4000/api/v1` in web local dev.

### Frontend (Next.js) — `apps/web/src`

1. **`@/lib/api-client.ts`** — axios instance with base URL `${NEXT_PUBLIC_API_URL}/api/v1` (default `http://localhost:4000/api/v1`). Request interceptor fetches Supabase session via `createClient()` from `@/lib/supabase/client` and sets `Authorization: Bearer <token>`.
2. **Server-side fetch** (SSR pages like curriculum detail, sections page) — uses `createClient()` from `@/lib/supabase/server`, calls `supabase.auth.getSession()`, reads `session.access_token`, passes as Bearer header. Pattern duplicated in each page's `getAuthToken()` helper.
3. **`useCurrentUser()`** (`apps/web/src/hooks/use-current-user.ts`) — `useQuery` → `GET /api/auth/me`, returns `AuthUser`. `staleTime: 5min`, `retry: false`.
4. **`requireAuth()`, `requireRole()`, `requireRoleOrRedirect()`** (`apps/web/src/lib/auth.ts`) — server-side auth helpers using `getCurrentUser()` which reads from Supabase server client + Prisma lookup of `User` by `authUserId`.
5. **Role checks on frontend** — pages use `requireRoleOrRedirect('ADMIN')` in layouts (not directly on the curriculum pages, which rely on the API returning 401/403). The `@student-erp/ui` components themselves have no auth.

### Auth flow summary

Supabase holds the session/JWT. Frontend passes the Supabase `access_token` as a Bearer token to the NestJS API. `SupabaseAuthGuard` validates it server-side against Supabase, then hydrates `request.user` from the `users` table (which carries `institutionId` and `role`). All downstream services scope queries by `user.institutionId`.

---

## Summary: What exists for a future "Sections button + sections page"

**The target endpoint already exists end-to-end:**

- API: `GET /api/v1/academic/curriculum-terms/:termId/sections` (CurriculumTermsController → CurriculumTermsService.getSections) returns fully-populated sections with `courseAssignments` → `faculty` (user, department) + `course`, plus `_count.students`.
- The sections page is already built at `.../terms/[termId]/sections/page.tsx` and already links to it from the curriculum detail page (§1, "Sections" button at lines 172–178).
- `apps/web/src/app/admin/academics/sections/page.tsx` is the general sections admin page (table + create) using `useAdminSections`.
- `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx` is a **STUB** (returns null) — the detail page for an individual section does not exist.

**What's missing / gaps for a coder:**

1. No `useCourseAssignments` React Query hook (and no course-assignments API endpoint at all).
2. No `@student-erp/ui` `Breadcrumb` or `Alert` component — must use `lucide-react` icons manually (as existing pages do) or `apps/web/src/components/shared/breadcrumbs.tsx`.
3. No React Query hook for `GET /academic/curriculum-terms/:termId/sections` — current page uses raw `fetch`.
4. `Section` → `CurriculumTerm` join is logical (`section.semester == term.sequence`, `section.programId == curriculum.programId`), NOT a DB FK. Any new section-creation flow must set `semester` = term sequence.
5. `SectionsController` (`admin/sections`) is **ADMIN-only** (`@Roles('ADMIN')`). The term-scoped `GET .../sections` endpoint has **no role restriction** (only auth). A new section-create action from the term sections page would need a new endpoint or use the admin sections API (which requires ADMIN role).
6. The `[sectionId]/page.tsx` section detail is a stub if a full section-view page is needed.

---

## Files Retrieved (full list with line ranges)

1. `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/page.tsx` (1–247)
2. `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/curriculum-actions.tsx` (1–89)
3. `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/terms/[termId]/page.tsx` (1–173)
4. `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/terms/[termId]/sections/page.tsx` (1–266)
5. `apps/web/src/app/admin/academics/programs/[programId]/curriculums/[curriculumId]/add-course-dialog.tsx` (1–end)
6. `apps/web/src/app/admin/academics/sections/page.tsx` (1–end)
7. `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx` (STUB: returns null)
8. `apps/api/src/modules/academic/controllers/curriculums.controller.ts` (1–end)
9. `apps/api/src/modules/academic/services/curriculums.service.ts` (1–end)
10. `apps/api/src/modules/academic/controllers/curriculum-terms.controller.ts` (1–end) — confirmed via grep/read, `@Get(':id/sections')`
11. `apps/api/src/modules/academic/services/curriculum-terms.service.ts` (1–end)
12. `apps/api/src/modules/academic/academic.module.ts`
13. `apps/api/src/modules/admin/sections/sections.controller.ts`
14. `apps/api/src/modules/admin/sections/sections.service.ts`
15. `apps/api/src/modules/admin/sections/sections.module.ts`
16. `apps/api/src/modules/admin/sections/dto/create-section.dto.ts`
17. `apps/api/src/modules/admin/sections/dto/update-section.dto.ts`
18. `apps/api/src/modules/academic/controllers/curriculum-courses.controller.ts`
19. `apps/api/src/modules/academic/services/curriculum-courses.service.ts`
20. `apps/api/src/modules/academic/controllers/curriculum-elective-groups.controller.ts`
21. `apps/api/src/modules/academic/controllers/course-offerings.controller.ts`
22. `apps/api/src/modules/academic/services/course-offerings.service.ts`
23. `apps/api/src/modules/admin/faculty/faculty.controller.ts`
24. `apps/api/src/modules/admin/faculty/faculty.service.ts` (read via structure)
25. `apps/api/src/modules/academic/controllers/programs.controller.ts`
26. `apps/api/src/modules/academic/dto/curriculum.dto.ts`
27. `apps/api/src/modules/academic/dto/curriculum-term.dto.ts`
28. `apps/api/src/modules/academic/dto/curriculum-operations.dto.ts`
29. `apps/api/src/app.module.ts`
30. `apps/api/src/main.ts` (grep: `setGlobalPrefix('api/v1')`)
31. `apps/api/src/decorators/current-user.decorator.ts`
32. `apps/api/src/decorators/roles.decorator.ts`
33. `apps/api/src/guards/supabase-auth.guard.ts`
34. `apps/api/src/guards/roles.guard.ts`
35. `apps/web/src/hooks/api/admin/useCurriculums.ts`
36. `apps/web/src/hooks/api/admin/useSections.ts`
37. `apps/web/src/hooks/api/admin/useFaculty.ts`
38. `apps/web/src/hooks/api/admin/useCourses.ts`
39. `apps/web/src/hooks/api/admin/usePrograms.ts`
40. `apps/web/src/hooks/api/admin/useDepartments.ts`
41. `apps/web/src/hooks/api/admin/useBatches.ts`
42. `apps/web/src/hooks/use-current-user.ts`
43. `apps/web/src/lib/api-client.ts`
44. `apps/web/src/lib/auth.ts`
45. `apps/web/src/components/shared/breadcrumbs.tsx`
46. `apps/web/src/components/admin/admin-header.tsx` (grep: Breadcrumbs import)
47. `libs/database/prisma/schema.prisma` (1–1473 and 1474–1703)
48. `libs/database/prisma/seed.ts` (full)
49. `packages/ui/src/index.ts`
50. `packages/ui/src/button.tsx`
51. `packages/ui/src/card.tsx`
52. `packages/ui/src/skeleton.tsx`
53. `packages/ui/package.json`
54. `tsconfig.base.json` (path alias `@student-erp/ui`)
55. `apps/web/package.json`
