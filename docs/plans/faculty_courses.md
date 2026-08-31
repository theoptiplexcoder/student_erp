# Faculty Course Workspace — `/faculty/courses` Design

## Overview

Redesign the Faculty Courses page from a simple course list into a full **My Courses / Course Workspace** with a **Lesson Planning** system. The page serves as the faculty's primary teaching hub: view assigned courses, access course workspace (curriculum, resources, students, attendance, assignments, grades, announcements, discussions), and build semester teaching plans.

---

## Architecture Context

| Layer | Tech                                   | Location                                  |
| ----- | -------------------------------------- | ----------------------------------------- |
| DB    | Prisma + PostgreSQL                    | `libs/database/prisma/schema.prisma`      |
| API   | NestJS                                 | `apps/api/src/modules/faculty/`           |
| SDK   | Axios client                           | `packages/sdk/src/client/faculty-api.ts`  |
| Hooks | React Query                            | `packages/hooks/src/api/faculty.hooks.ts` |
| UI    | Next.js + `@student-erp/ui` + Tailwind | `apps/web/src/app/faculty/courses/`       |

---

## 1. Schema — Required Changes

### 1.1 New Enums

```prisma
enum LessonPlanStatus {
  DRAFT
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  OVERDUE
  CANCELLED
}

enum TeachingMethod {
  LECTURE
  TUTORIAL
  PRACTICAL
  LABORATORY
  DISCUSSION
  SEMINAR
  DEMONSTRATION
  WORKSHOP
  PROJECT
  REVISION
  ASSESSMENT
}

enum ResourceOwner {
  ADMIN
  FACULTY
}
```

### 1.2 New Models

```prisma
model LessonPlan {
  id                    String           @id @default(uuid()) @db.Uuid
  institutionId         String           @map("institution_id") @db.Uuid
  courseId              String           @map("course_id") @db.Uuid
  facultyId            String           @map("faculty_id") @db.Uuid
  termId               String           @map("term_id") @db.Uuid
  unitId               String?          @map("unit_id") @db.Uuid
  chapterId            String?          @map("chapter_id") @db.Uuid
  title                String
  description          String?          @db.Text
  sequence             Int
  plannedDate          DateTime         @map("planned_date") @db.Date
  deadline             DateTime?        @map("deadline") @db.Date
  actualCompletionDate DateTime?        @map("actual_completion_date") @db.Date
  durationMinutes      Int?             @map("duration_minutes")
  teachingMethod        TeachingMethod   @default(LECTURE) @map("teaching_method")
  status               LessonPlanStatus @default(DRAFT)
  learningObjectives   Json?            @map("learning_objectives")
  teachingPlan         Json?            @map("teaching_plan")
  teachingNotes        String?          @db.Text @map("teaching_notes")
  reflectionNotes      String?          @db.Text @map("reflection_notes")
  createdAt            DateTime         @default(now()) @map("created_at")
  updatedAt            DateTime         @updatedAt @map("updated_at")

  institution Institution      @relation(fields: [institutionId], references: [id])
  course      Course           @relation(fields: [courseId], references: [id])
  faculty     Faculty          @relation(fields: [facultyId], references: [id])
  term        AcademicTerm     @relation(fields: [termId], references: [id])

  sections         LessonPlanSection[]
  resources        LessonPlanResource[]

  @@index([institutionId])
  @@index([courseId])
  @@index([facultyId])
  @@index([termId])
  @@index([plannedDate])
  @@map("lesson_plans")
}

model LessonPlanSection {
  id           String @id @default(uuid()) @db.Uuid
  lessonPlanId String @map("lesson_plan_id") @db.Uuid
  sectionId    String @map("section_id") @db.Uuid

  lessonPlan LessonPlan @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
  section    Section    @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@unique([lessonPlanId, sectionId])
  @@map("lesson_plan_sections")
}

model LessonPlanResource {
  id           String @id @default(uuid()) @db.Uuid
  lessonPlanId String @map("lesson_plan_id") @db.Uuid
  resourceId   String @map("resource_id") @db.Uuid
  sortOrder    Int    @default(0) @map("sort_order")

  lessonPlan LessonPlan    @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
  resource   CourseResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@unique([lessonPlanId, resourceId])
  @@map("lesson_plan_resources")
}

model AdminResource {
  id            String       @id @default(uuid()) @db.Uuid
  institutionId String       @map("institution_id") @db.Uuid
  courseId      String?      @map("course_id") @db.Uuid
  title         String
  description   String?      @db.Text
  resourceType  ResourceType @map("resource_type")
  fileUrl       String?      @map("file_url")
  externalUrl   String?      @map("external_url")
  uploadedBy    String?      @map("uploaded_by") @db.Uuid
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  institution Institution  @relation(fields: [institutionId], references: [id])
  course      Course?       @relation(fields: [courseId], references: [id])

  @@index([institutionId])
  @@index([courseId])
  @@map("admin_resources")
}
```

### 1.3 Modified Models

Add to existing `CourseResource`:

```prisma
model CourseResource {
  // ... existing fields ...
  owner      ResourceOwner @default(FACULTY) @map("owner")
  unitId     String?       @map("unit_id") @db.Uuid
  chapterId  String?       @map("chapter_id") @db.Uuid
  topic      String?
  // ... existing relations ...
}
```

Add to `TimetableEntry`:

```prisma
model TimetableEntry {
  // ... existing fields ...
  lessonPlanId String? @map("lesson_plan_id") @db.Uuid
  lessonPlan   LessonPlan? @relation(fields: [lessonPlanId], references: [id])
  // ... existing relations ...
}
```

---

## 2. Backend

### 2.1 New Module Structure

```
apps/api/src/modules/faculty/
├── controllers/
│   └── lesson-plan.controller.ts
├── services/
│   └── lesson-plan.service.ts
├── dto/
│   └── lesson-plan.dto.ts
└── faculty.module.ts  (register LessonPlan controller + service)
```

### 2.2 API Endpoints

#### Course Listing

| Method | Endpoint                     | Purpose                            |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/faculty/courses`           | List assigned courses with filters |
| GET    | `/faculty/courses/:courseId` | Course detail + workspace          |

**Query params for listing:**

- `academicYearId` — filter by year
- `termId` — filter by term
- `programId` — filter by program
- `departmentId` — filter by department
- `section` — filter by section name
- `status` — ACTIVE | INACTIVE
- `search` — text search on course code/name
- `tab` — active | completed | upcoming

**GET /faculty/courses response shape:**

```typescript
{
  id: string;
  course: {
    id: string;
    code: string;
    name: string;
    creditValue: number | null;
    description: string | null;
    department: { id: string; name: string; code: string } | null;
  };
  section: {
    id: string;
    name: string;
    code: string;
    enrollments: { id: string; status: string }[];
  };
  term: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  program: { id: string; name: string; code: string } | null;
  curriculumCourse: {
    id: string;
    curriculumTerm: {
      curriculum: {
        id: string;
        name: string;
        versionNumber: string;
      };
    };
  } | null;
  academicYear: { id: string; name: string };
  // Computed fields from aggregation
  totalStudents: number;
  classesCompleted: number;
  totalClasses: number;
  lessonPlansTotal: number;
  lessonPlansCompleted: number;
  nextClass: { date: string; time: string; section: string } | null;
}
```

#### Lesson Plans

| Method | Endpoint                                               | Purpose                      |
| ------ | ------------------------------------------------------ | ---------------------------- |
| GET    | `/faculty/courses/:courseId/lesson-plans`              | List lesson plans for course |
| POST   | `/faculty/courses/:courseId/lesson-plans`              | Create lesson plan           |
| GET    | `/faculty/courses/:courseId/lesson-plans/:id`          | Get lesson plan detail       |
| PATCH  | `/faculty/courses/:courseId/lesson-plans/:id`          | Update lesson plan           |
| POST   | `/faculty/courses/:courseId/lesson-plans/:id/complete` | Mark as completed            |
| GET    | `/faculty/courses/:courseId/lesson-plans/calendar`     | Calendar view data           |
| GET    | `/faculty/courses/:courseId/progress`                  | Course + unit progress       |

#### Admin Resources

| Method | Endpoint                                     | Purpose                       |
| ------ | -------------------------------------------- | ----------------------------- |
| GET    | `/faculty/courses/:courseId/admin-resources` | List admin-provided resources |

#### Faculty Resources

| Method | Endpoint                                   | Purpose                                          |
| ------ | ------------------------------------------ | ------------------------------------------------ |
| GET    | `/faculty/courses/:courseId/resources`     | List faculty resources (grouped by unit/chapter) |
| POST   | `/faculty/courses/:courseId/resources`     | Upload resource                                  |
| DELETE | `/faculty/courses/:courseId/resources/:id` | Delete resource                                  |

#### Curriculum

| Method | Endpoint                                | Purpose                         |
| ------ | --------------------------------------- | ------------------------------- |
| GET    | `/faculty/courses/:courseId/curriculum` | Curriculum hierarchy for course |

**Response:**

```typescript
{
  program: {
    id: string;
    name: string;
    code: string;
    level: string;
    durationYears: number;
  }
  department: {
    id: string;
    name: string;
    code: string;
  }
  curriculum: {
    id: string;
    name: string;
    versionNumber: string;
    status: string;
  }
  curriculumTerm: {
    id: string;
    name: string;
    sequence: number;
  }
  course: {
    id: string;
    code: string;
    name: string;
    creditValue: number | null;
    description: string | null;
  }
  prerequisites: {
    id: string;
    code: string;
    name: string;
  }
  [];
}
```

### 2.3 Lesson Plan Service Logic

```typescript
// Status auto-calculation:
// - If status is DRAFT and plannedDate > today → stays DRAFT
// - If plannedDate <= today and actualCompletionDate is null → SCHEDULED or IN_PROGRESS
// - If actualCompletionDate is set → COMPLETED
// - If deadline < today and actualCompletionDate is null → OVERDUE
// - Faculty cannot manually set OVERDUE — system calculates it

// Progress calculation:
// - Course progress = completed lessons / total planned lessons * 100
// - Unit progress = completed lessons in unit / total planned lessons in unit * 100
// - Schedule health = count of (on-schedule | upcoming | overdue | not-planned)
```

### 2.4 Service: Course Aggregation

```typescript
// GET /faculty/courses needs computed fields:
// 1. totalStudents: count(Enrollment where sectionId matches and status = ACTIVE)
// 2. classesCompleted: count(AttendanceSession where courseId + sectionId + facultyId)
// 3. totalClasses: derive from TimetableEntry count within term date range
// 4. lessonPlansTotal: count(LessonPlan where courseId + facultyId + termId)
// 5. lessonPlansCompleted: count(LessonPlan where status = COMPLETED)
// 6. nextClass: earliest TimetableEntry from today onward
```

---

## 3. Client — Pages and Components

### 3.1 File Structure

```
apps/web/src/app/faculty/courses/
├── page.tsx                              # My Courses listing
├── [courseId]/
│   ├── page.tsx                          # Course Workspace (tabs)
│   ├── curriculum/page.tsx               # Curriculum tab (optional, could be in tab)
│   ├── resources/page.tsx                # Resources tab
│   ├── lesson-plan/
│   │   ├── page.tsx                      # Lesson Plan listing + dashboard
│   │   ├── new/page.tsx                  # Create lesson plan form
│   │   └── [lessonId]/page.tsx           # Lesson plan detail
│   ├── students/page.tsx                 # Students tab
│   ├── attendance/page.tsx               # Attendance tab
│   ├── assignments/
│   │   ├── page.tsx                      # Assignments listing
│   │   └── [assignmentId]/page.tsx       # Assignment submissions
│   ├── grades/page.tsx                   # Grades tab
│   ├── announcements/page.tsx            # Announcements tab
│   └── discussions/page.tsx              # Discussions tab

apps/web/src/components/faculty/courses/
├── course-card.tsx                        # Course card for listing
├── course-filters.tsx                     # Filter bar
├── course-stats.tsx                       # Teaching summary cards
├── section-breakdown.tsx                  # Section table
├── curriculum-tree.tsx                    # Curriculum hierarchy view
├── admin-resources-list.tsx              # Admin-provided resources
├── faculty-resources-list.tsx            # Faculty resources grouped by unit
├── lesson-plan-dashboard.tsx             # Lesson plan overview stats
├── lesson-plan-list.tsx                  # Lesson plan table
├── lesson-plan-calendar.tsx              # Calendar view
├── lesson-plan-form.tsx                  # Create/edit form
├── lesson-plan-detail.tsx                # Lesson detail view
├── lesson-objectives.tsx                 # Learning objectives display
├── unit-plan-card.tsx                    # Unit-level planning card
├── progress-bar.tsx                      # Course/unit progress bars
└── schedule-health.tsx                   # Schedule health indicator
```

### 3.2 My Courses Page (`/faculty/courses/page.tsx`)

Replace the current simple card grid with:

#### Header

```
My Courses
Courses and sections assigned to you

[Search courses...]
```

#### Filter Bar

```
[Academic Year ▾] [Term ▾] [Program ▾] [Department ▾] [Section ▾] [Status ▾]
```

#### Tab Bar

```
[Active Courses] [Completed Courses] [Upcoming]
```

#### Course Cards (Grid: 1 col mobile, 2 col tablet, 3 col desktop)

Each card shows:

```
┌──────────────────────────────────────────┐
│  Database Management Systems        [A]  │
│  CS301                                    │
│                                          │
│  📘 B.Tech CSE                           │
│  📅 Semester 5 · 2026-27                 │
│  👥 62 students                           │
│                                          │
│  Progress    ████████░░░░ 18/45 classes  │
│  Next class  Today, 2:00 PM              │
│                                          │
│  [ View Course → ]                       │
└──────────────────────────────────────────┘
```

**Card fields:**

- Course name (title)
- Course code (muted, below title)
- Program name (e.g., "B.Tech CSE")
- Term + Academic Year
- Student count
- Progress bar: classes completed / total classes
- Next class date/time (from TimetableEntry)
- Section badge (top-right)

#### Empty State

```
No courses are currently assigned to you.
```

#### Responsive Behavior

- Mobile: single column, full-width cards
- Tablet: 2-column grid
- Desktop: 3-column grid
- Filter bar: collapses to horizontal scroll on mobile

### 3.3 Course Detail Page (`/faculty/courses/[courseId]/page.tsx`)

Replace the current basic tabs with the full Course Workspace.

#### Course Header

```
Database Management Systems
CS301

B.Tech CSE · Semester 5 · Section A · Section B
Credits: 4 · Academic Year 2026-27

[Overview] [Curriculum] [Resources] [Lesson Plan]
[Students] [Attendance] [Assignments] [Grades]
[Announcements] [Discussions]
```

Back button returns to `/faculty/courses`.

#### Tab Breakdown

##### Overview Tab

**Teaching Summary Cards (2x3 grid):**

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Students │ │ Sections │ │ Lessons  │
│    62    │ │    2     │ │ Planned  │
│          │ │          │ │   24     │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Lessons  │ │ Upcoming │ │ Course   │
│ Completed│ │ Deadline │ │ Progress │
│    17    │ │ Sep 04   │ │   71%    │
└──────────┘ └──────────┘ └──────────┘
```

**Section Breakdown Table:**

| Section | Students | Schedule  | Room     | Attendance |
| ------- | -------: | --------- | -------- | ---------: |
| A       |       32 | Mon 10:00 | Room 204 |        86% |
| B       |       30 | Tue 11:00 | Room 205 |        89% |

Click section row → opens section-scoped data.

**Course Description:**

```
Course Description
No description provided.

Credits: 4 | Course Type: Standard | Max Marks: N/A | Passing Marks: N/A
```

##### Curriculum Tab

**Breadcrumb Navigation:**

```
B.Tech Computer Science & Engineering
  └─ Curriculum 2026
      └─ Semester 5
          └─ CS301 Database Management Systems
```

**Curriculum Information Card:**

| Field              | Value                                 |
| ------------------ | ------------------------------------- |
| Program            | B.Tech Computer Science & Engineering |
| Program Code       | CSE                                   |
| Department         | Computer Science                      |
| Level              | UNDERGRADUATE                         |
| Duration           | 4 years                               |
| Curriculum Version | 2026                                  |
| Effective From     | Aug 2026                              |
| Total Credits      | 160                                   |
| Course Credits     | 4                                     |

**Prerequisites:**

```
Prerequisites
- CS101 Introduction to Programming
- CS201 Data Structures
```

**Curriculum Document:** View / Download button (if curriculum file exists).

##### Admin Documents Tab

Clearly separated from faculty resources:

```
Admin Resources

📄 CS301 Official Syllabus
   Uploaded by Academic Administrator
   Aug 20, 2026
   [ Preview ] [ Download ]

📄 Assessment Guidelines
   Uploaded by Academic Administrator
   Aug 18, 2026
   [ Preview ] [ Download ]

📄 Curriculum 2026
   Uploaded by Academic Administrator
   Aug 15, 2026
   [ Preview ] [ Download ]
```

**No create/upload button** — faculty cannot modify admin resources.

##### Resources Tab

Split into two sections:

```
Admin Resources
├── Official Syllabus (view/download only)
├── Curriculum
└── Assessment Guidelines

My Teaching Resources
├── Unit 1 — Introduction to DBMS
│   ├── Introduction.pdf
│   ├── Lecture Slides.pptx
│   └── SQL Basics.pdf
│
├── Unit 2 — Relational Model
│   ├── Relational Algebra.pdf
│   └── SQL Queries.pptx
│
├── Unit 3 — SQL
│   └── (empty)
│
└── [ + Upload Resource ]
```

**Upload form:**

```
Title: [.............]
File/URL: [.............]
Type: [PDF ▾]
Unit: [Unit 2 — Relational Model ▾]
Chapter/Topic: [.............]
[ Upload ]
```

##### Lesson Plan Tab

**Lesson Plan Dashboard:**

```
Lesson Plan

24 Lessons | 17 Completed | 5 Upcoming | 2 Overdue

Course Progress
██████████████████░░░░░░░░░░░░░ 71%
```

**Sub-tabs:**

```
[Overview] [Units] [Lessons] [Calendar]
```

**Overview Sub-tab — Upcoming Lessons:**

| Lesson        | Unit   | Planned Date | Deadline | Status   |
| ------------- | ------ | ------------ | -------- | -------- |
| SQL Joins     | Unit 2 | Sep 02       | Sep 02   | Upcoming |
| Normalization | Unit 2 | Sep 04       | Sep 04   | Upcoming |
| Transactions  | Unit 3 | Sep 08       | Sep 08   | Upcoming |

**Units Sub-tab:**

```
Unit 1 — Introduction to DBMS     ██████████ 100%  (8/8 lessons)
Unit 2 — Relational Model         ███████░░░  70%  (7/10 lessons)
Unit 3 — SQL                      ██░░░░░░░░  20%  (2/10 lessons)
Unit 4 — Normalization            ░░░░░░░░░░   0%  (0/6 lessons)

[ + Add Unit Plan ]
```

Click a unit → shows its lessons.

**Calendar Sub-tab:**

```
September 2026

Mon     Tue     Wed     Thu     Fri
                  1       2       3       4
                          SQL     SQL     Norm
                          Joins   Basics  aliz.

7       8       9      10      11
Trans   -       Index   -       Review
act.
```

Color indicators:

- Green: Completed
- Blue: Upcoming
- Red: Overdue
- Gray: Draft

Click date → shows lesson detail.

**Create Lesson Plan Button:** `+ Create Lesson Plan`

##### Students Tab

Lists enrolled students with:

| Name       | Roll Number | Status |
| ---------- | ----------- | ------ |
| John Doe   | CS-2024-001 | ACTIVE |
| Jane Smith | CS-2024-002 | ACTIVE |

##### Attendance Tab

Lists attendance sessions with:

| Date   | Section | Topic         | Present | Absent | Rate |
| ------ | ------- | ------------- | ------: | -----: | ---: |
| Sep 01 | A       | Intro to DBMS |      30 |      2 |  94% |
| Sep 01 | B       | Intro to DBMS |      28 |      2 |  93% |

[ + Mark Attendance ] → links to timetable session.

##### Assignments Tab

```
Create Assignment

Title: [.............]
Description: [.............]
Due Date: [...........]
Max Marks: [100]
[ Create Assignment ]

Active Assignments

Assignment 1
Due: Sep 15, 2026 | Max Marks: 100
12 Submissions
[ View Submissions → ]
```

##### Grades Tab

```
Enter Marks

Exam: [Midterm ▾]
Course: CS301

| Student        | Roll Number | Marks | Grade | Status   |
|----------------|-------------|-------|-------|----------|
| John Doe       | CS-2024-001 | 85    | A     | GRADED   |
| Jane Smith     | CS-2024-002 | 72    | B+    | GRADED   |
```

##### Announcements Tab

```
[ + New Announcement ]

Title: [.............]
Content: [.............]
[ Publish ]
```

List of published announcements with date and content.

##### Discussions Tab

Threaded Q&A for the course. Students can post questions; faculty can reply.

### 3.4 Lesson Plan Create/Edit Form

**Form Fields:**

```
Lesson Plan

Basic Information
├── Lesson Title: [.............]
├── Unit: [Unit 2 — Relational Model ▾]
├── Chapter/Topic: [SQL ▾]
├── Description: [.............]
├── Sequence: [3] (auto-filled based on existing lessons in unit)
│
Academic Mapping (auto-populated, read-only)
├── Course: Database Management Systems
├── Program: B.Tech CSE
├── Curriculum: B.Tech CSE 2026
├── Term: Semester 5
├── Section(s): [✓] Section A  [✓] Section B
│
Teaching
├── Teaching Method: [Lecture ▾]
├── Duration: [60] minutes
├── Required Resources: [SQL Joins.pdf ✓] [SQL Examples.sql ✓]
│
Dates
├── Planned Date: [2026-09-02]
├── Start Date/Time: [2026-09-02 10:00]
├── Deadline: [2026-09-02]
│
Learning Objectives
├── Objective 1: [Explain INNER JOIN........]
├── Objective 2: [Differentiate LEFT/RIGHT...]
├── Objective 3: [Write JOIN queries.........]
├── [+ Add Objective]
│
Teaching Plan (optional)
├── Step 1: [Introduction — 10 min]
├── Step 2: [INNER JOIN — 15 min]
├── Step 3: [LEFT JOIN — 15 min]
├── Step 4: [Practical examples — 15 min]
├── Step 5: [Questions — 5 min]
├── [+ Add Step]
│
[ Save as Draft ]  [ Schedule ]
```

### 3.5 Lesson Detail Page

```
SQL Joins

Unit 2 → SQL

Status: Upcoming
Planned Date: Sep 02, 2026
Duration: 60 minutes
Sections: A, B
Teaching Method: Lecture

Learning Objectives
1. Understand joins
2. Differentiate LEFT and RIGHT JOIN
3. Write JOIN queries

Teaching Plan
1. Introduction — 10 min
2. INNER JOIN — 15 min
3. LEFT JOIN — 15 min
4. Practical examples — 15 min
5. Questions — 5 min

Resources
- SQL Joins.pdf
- SQL Examples.sql

[ Start Lesson ]  [ Mark as Completed ]
```

**On Completion:**

```
Completion Form

Actual Completion Date: [auto-filled]
Topics Covered: [.............]
Faculty Notes: [.............]
What went well: [.............]
Topics requiring revision: [.............]
Students struggled with: [.............]
Follow-up required: [.............]

[ Complete ]
```

### 3.6 Timetable Integration

When a faculty member opens a timetable entry for today:

```
Today's Class

Database Management Systems
Section A · 10:00 AM - 11:00 AM · Room 204

Lesson: SQL Joins
Objectives: 3
Resources: 2

[ Start Lesson ]  [ Mark Attendance ]
```

After class:

```
[ Mark Attendance ]  [ Complete Lesson ]
```

This links `TimetableEntry.lessonPlanId` → `LessonPlan` → shows lesson context inline.

---

## 4. Data Flow

### 4.1 Course Listing Flow

```
GET /faculty/courses
  ↓
Join: CourseAssignment → Course → Section → AcademicTerm → Program → CurriculumCourse → Curriculum → CurriculumTerm
  ↓
Aggregate: count(Enrollment), count(AttendanceSession), count(LessonPlan), next TimetableEntry
  ↓
Return: CourseCard[] with computed fields
```

### 4.2 Lesson Plan Status Calculation

```
On each GET:
  For each LessonPlan:
    if actualCompletionDate is set → COMPLETED
    else if deadline < today → OVERDUE
    else if plannedDate <= today → IN_PROGRESS
    else → SCHEDULED
    (DRAFT only if explicitly saved as draft)
```

### 4.3 Progress Calculation

```
Course Progress:
  total = count(LessonPlan where courseId + termId)
  completed = count(LessonPlan where courseId + termId + status = COMPLETED)
  percentage = completed / total * 100

Unit Progress:
  total = count(LessonPlan where unitId)
  completed = count(LessonPlan where unitId + status = COMPLETED)
  percentage = completed / total * 100
```

---

## 5. Permissions

| Resource          | Faculty              | Admin      |
| ----------------- | -------------------- | ---------- |
| Course details    | READ                 | READ/WRITE |
| Curriculum        | READ                 | READ/WRITE |
| Admin Resources   | READ                 | READ/WRITE |
| Faculty Resources | CREATE/UPDATE/DELETE | READ       |
| Lesson Plans      | CREATE/UPDATE        | READ       |
| Attendance        | CREATE/UPDATE        | READ       |
| Assignments       | CREATE/UPDATE        | READ       |
| Grades            | CREATE/UPDATE        | READ       |
| Announcements     | CREATE/UPDATE        | READ       |

---

## 6. Files

### Create

- `apps/api/src/modules/faculty/controllers/lesson-plan.controller.ts`
- `apps/api/src/modules/faculty/services/lesson-plan.service.ts`
- `apps/api/src/modules/faculty/dto/lesson-plan.dto.ts`
- `apps/web/src/app/faculty/courses/page.tsx` (rewrite)
- `apps/web/src/app/faculty/courses/[courseId]/page.tsx` (rewrite)
- `apps/web/src/app/faculty/courses/[courseId]/lesson-plan/page.tsx`
- `apps/web/src/app/faculty/courses/[courseId]/lesson-plan/new/page.tsx`
- `apps/web/src/app/faculty/courses/[courseId]/lesson-plan/[lessonId]/page.tsx`
- `apps/web/src/components/faculty/courses/course-card.tsx`
- `apps/web/src/components/faculty/courses/course-filters.tsx`
- `apps/web/src/components/faculty/courses/course-stats.tsx`
- `apps/web/src/components/faculty/courses/section-breakdown.tsx`
- `apps/web/src/components/faculty/courses/curriculum-tree.tsx`
- `apps/web/src/components/faculty/courses/admin-resources-list.tsx`
- `apps/web/src/components/faculty/courses/faculty-resources-list.tsx`
- `apps/web/src/components/faculty/courses/lesson-plan-dashboard.tsx`
- `apps/web/src/components/faculty/courses/lesson-plan-list.tsx`
- `apps/web/src/components/faculty/courses/lesson-plan-calendar.tsx`
- `apps/web/src/components/faculty/courses/lesson-plan-form.tsx`
- `apps/web/src/components/faculty/courses/lesson-plan-detail.tsx`
- `apps/web/src/components/faculty/courses/progress-bar.tsx`
- `apps/web/src/components/faculty/courses/schedule-health.tsx`
- `packages/sdk/src/client/lesson-plan-api.ts`
- `packages/hooks/src/api/lesson-plan.hooks.ts`
- Prisma migration for new models

### Modify

- `libs/database/prisma/schema.prisma` — Add LessonPlan, LessonPlanSection, LessonPlanResource, AdminResource models + enums
- `packages/sdk/src/client/faculty-api.ts` — Add lesson plan API calls
- `packages/hooks/src/api/faculty.hooks.ts` — Add lesson plan hooks
- `apps/api/src/modules/faculty/faculty.module.ts` — Register lesson plan controller/service
- `apps/web/src/app/faculty/courses/[courseId]/page.tsx` — Expand tabs
- `apps/web/src/app/faculty/timetable/session/page.tsx` — Link lesson plan to timetable entry

### No Changes Needed

- `apps/web/src/app/faculty/layout.tsx` — Navigation already includes courses
- `apps/web/src/app/faculty/dashboard/page.tsx` — Dashboard can link to courses
- `apps/web/src/app/faculty/timetable/page.tsx` — Timetable page unchanged
