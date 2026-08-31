# Faculty Sections — Classes & Sections Workspace

## Overview

A dedicated page at `/faculty/sections` that lists all classes and sections assigned to the faculty member, with sub-navigation per section for **Attendance** (student-wise marking) and **Gradebook** (student-wise marks entry). This gives faculty a focused, section-centric view separate from the course-level workspace.

---

## Architecture Context

| Layer | Tech                                   | Location                                  |
| ----- | -------------------------------------- | ----------------------------------------- |
| DB    | Prisma + PostgreSQL                    | `libs/database/prisma/schema.prisma`      |
| API   | NestJS                                 | `apps/api/src/modules/faculty/`           |
| SDK   | Axios client                           | `packages/sdk/src/client/faculty-api.ts`  |
| Hooks | React Query                            | `packages/hooks/src/api/faculty.hooks.ts` |
| UI    | Next.js + `@student-erp/ui` + Tailwind | `apps/web/src/app/faculty/sections/`      |

---

## 1. Schema — Relevant Models (No Changes Needed)

All data comes from existing models:

| Model               | Purpose                                | Key Fields                                                                |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `CourseAssignment`  | Maps faculty → course → section → term | `facultyId`, `courseId`, `sectionId`, `termId`, `isPrimary`               |
| `Course`            | Course metadata                        | `code`, `name`, `creditValue`, `departmentId`                             |
| `Section`           | Section/group info                     | `name`, `code`, `capacity`, `programId`, `batchId`, `academicYearId`      |
| `Enrollment`        | Student enrollment in section          | `studentId`, `sectionId`, `courseId`, `status`                            |
| `Student`           | Student info                           | `rollNumber`, `admissionNumber`, `userId`                                 |
| `User`              | User profile                           | `firstName`, `lastName`, `email`, `phone`                                 |
| `AttendanceSession` | attendance session per class           | `courseId`, `sectionId`, `facultyId`, `date`, `startTime`, `endTime`      |
| `AttendanceRecord`  | Per-student attendance                 | `attendanceSessionId`, `studentId`, `status`                              |
| `Exam`              | Exam definition                        | `name`, `examType`, `status`, `termId`                                    |
| `ExamCourse`        | Exam linked to course                  | `examId`, `courseId`, `maxMarks`, `passingMarks`                          |
| `Mark`              | Student mark per exam                  | `examCourseId`, `studentId`, `marksObtained`, `grade`, `resultStatus`     |
| `TimetableEntry`    | Scheduled classes                      | `courseId`, `sectionId`, `facultyId`, `dayOfWeek`, `startTime`, `endTime` |
| `AcademicTerm`      | Term/semester                          | `name`, `startDate`, `endDate`, `status`                                  |
| `Program`           | Program info                           | `name`, `code`, `level`                                                   |

---

## 2. Backend

### 2.1 New Endpoints

| Method | Endpoint                                                                       | Purpose                                                     |
| ------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| GET    | `/faculty/sections`                                                            | List all assigned sections with summary stats               |
| GET    | `/faculty/sections/:sectionId/course/:courseId`                                | Section detail: students, attendance summary, grade summary |
| GET    | `/faculty/sections/:sectionId/course/:courseId/attendance`                     | Attendance records for section                              |
| GET    | `/faculty/sections/:sectionId/course/:courseId/attendance/sessions`            | List attendance sessions                                    |
| POST   | `/faculty/sections/:sectionId/course/:courseId/attendance/sessions`            | Create attendance session                                   |
| PATCH  | `/faculty/sections/:sectionId/course/:courseId/attendance/sessions/:sessionId` | Update attendance session (mark/fix)                        |
| GET    | `/faculty/sections/:sectionId/course/:courseId/gradebook`                      | Gradebook: all students × exams matrix                      |
| POST   | `/faculty/sections/:sectionId/course/:courseId/gradebook/marks`                | Bulk save marks for an exam                                 |
| GET    | `/faculty/sections/:sectionId/course/:courseId/students`                       | Student roster with attendance % and current marks          |

### 2.2 Service: Section Listing

**GET /faculty/sections**

Query `CourseAssignment` for the faculty, join course + section + term + enrollments:

```typescript
// Response shape:
{
  id: string;
  course: {
    id: string;
    code: string;
    name: string;
    creditValue: number | null;
  };
  section: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    program: { id: string; name: string; code: string } | null;
    batch: { id: string; name: string } | null;
    enrollments: { id: string; status: string }[];
  };
  term: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  isPrimary: boolean;
  // Computed:
  totalStudents: number;
  attendanceRate: number;        // avg across all sessions for this course+section
  lastClassDate: string | null;  // most recent AttendanceSession date
  nextClass: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string | null;
  } | null;                      // from TimetableEntry
}
```

### 2.3 Service: Attendance Summary

**GET /faculty/sections/:sectionId/course/:courseId/attendance**

```typescript
// Response:
{
  course: {
    id: string;
    code: string;
    name: string;
  }
  section: {
    id: string;
    name: string;
    code: string;
  }
  students: {
    id: string;
    userId: string;
    name: string;
    rollNumber: string | null;
    admissionNumber: string | null;
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }
  [];
  sessions: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string | null;
    presentCount: number;
    absentCount: number;
    totalCount: number;
  }
  [];
  summary: {
    totalSessions: number;
    avgAttendance: number;
  }
}
```

**Query logic:**

1. Find all `AttendanceSession` where `courseId` + `sectionId` + `facultyId`
2. For each session, count `AttendanceRecord` by status
3. For each student in section (via `Enrollment`), count their records per status
4. Compute attendance % per student = (present + excused) / totalSessions * 100

### 2.4 Service: Mark Attendance

**POST /faculty/sections/:sectionId/course/:courseId/attendance/sessions**

Create a new attendance session:

```typescript
// Request:
{
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  topic?: string;
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[];
}
```

**PATCH /faculty/sections/:sectionId/course/:courseId/attendance/sessions/:sessionId**

Update existing session records (fix mistakes):

```typescript
// Request:
{
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[];
}
```

### 2.5 Service: Gradebook

**GET /faculty/sections/:sectionId/course/:courseId/gradebook**

```typescript
// Response:
{
  course: {
    id: string;
    code: string;
    name: string;
    maxMarks: number | null;
    passingMarks: number | null;
  }
  section: {
    id: string;
    name: string;
  }
  exams: {
    id: string;
    name: string;
    examType: string;
    examDate: string;
    maxMarks: number | null;
    passingMarks: number | null;
    status: string;
  }
  [];
  students: {
    id: string;
    userId: string;
    name: string;
    rollNumber: string | null;
    marks: {
      examCourseId: string;
      marksObtained: number | null;
      grade: string | null;
      gradePoint: number | null;
      resultStatus: string;
    }
    [];
    totalMarks: number;
    totalMaxMarks: number;
    percentage: number;
    sgpa: number | null;
  }
  [];
}
```

**Query logic:**

1. Find all `ExamCourse` where `courseId` + exam is in the current term
2. Find all `Enrollment` where `sectionId` + `courseId` + `status = ACTIVE`
3. For each student, find `Mark` for each `ExamCourse`
4. Compute totals and percentage

### 2.6 Service: Enter Marks

**POST /faculty/sections/:sectionId/course/:courseId/gradebook/marks**

Bulk save marks for an exam:

```typescript
// Request:
{
  examCourseId: string;
  marks: {
    studentId: string;
    marksObtained: number;
    remarks?: string;
  }[];
}

// Server-side logic:
// 1. Upsert Mark for each student
// 2. Auto-compute: percentage, grade, gradePoint, resultStatus
// 3. Grade mapping (institution-configurable, default):
//    >= 90: A+, 80-89: A, 70-79: B+, 60-69: B, 50-59: C, 40-49: D, <40: F
//    resultStatus = marksObtained >= passingMarks ? PASS : FAIL
```

---

## 3. Client — Pages and Components

### 3.1 File Structure

```
apps/web/src/app/faculty/sections/
├── page.tsx                                    # Section listing
└── [sectionId]/
    └── [courseId]/
        ├── page.tsx                            # Section detail (redirects to attendance)
        ├── attendance/
        │   ├── page.tsx                        # Attendance view + mark attendance
        │   └── [sessionId]/page.tsx            # Edit existing session
        ├── gradebook/
        │   └── page.tsx                        # Gradebook + marks entry
        └── students/
            └── page.tsx                        # Student roster

apps/web/src/components/faculty/sections/
├── section-list-card.tsx                       # Section card in listing
├── section-detail-header.tsx                   # Section header with stats
├── attendance-student-table.tsx                # Student-wise attendance table
├── attendance-session-list.tsx                 # Session history
├── attendance-mark-form.tsx                    # Mark attendance form (student grid)
├── gradebook-matrix.tsx                        # Students × Exams matrix
├── gradebook-marks-entry.tsx                   # Bulk marks entry form
└── student-roster-table.tsx                    # Roster with attendance + marks summary
```

### 3.2 Section Listing Page (`/faculty/sections/page.tsx`)

```
My Sections

[Search sections...]

┌──────────────────────────────────────────────────────────┐
│  Database Management Systems                       [A]  │
│  CS301 · B.Tech CSE · Semester 5                        │
│                                                          │
│  👥 32 students   📅 86% attendance   ⏰ Next: Mon 10:00 │
│                                                          │
│  [ Attendance ]  [ Gradebook ]  [ Students ]  [ Course → ]│
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Computer Networks                                [B]   │
│  CS302 · B.Tech CSE · Semester 5                        │
│                                                          │
│  👥 30 students   📅 89% attendance   ⏰ Next: Tue 11:00 │
│                                                          │
│  [ Attendance ]  [ Gradebook ]  [ Students ]  [ Course → ]│
└──────────────────────────────────────────────────────────┘
```

**Each card shows:**

- Course name + code
- Section badge
- Program + Term
- Student count
- Average attendance %
- Next scheduled class (from TimetableEntry)
- Quick action buttons: Attendance, Gradebook, Students, Course workspace

**Responsive:**

- Mobile: single column
- Tablet: 1 column, full width
- Desktop: 2-column grid

### 3.3 Section Detail Header

Shared across attendance/gradebook/students sub-pages:

```
Database Management Systems — Section A
CS301 · B.Tech CSE · Semester 5 · Academic Year 2026-27

[ Attendance ]  [ Gradebook ]  [ Students ]  [ Course Workspace → ]

Stats: 32 students | 18 sessions | 86% avg attendance
```

### 3.4 Attendance Page (`/faculty/sections/[sectionId]/[courseId]/attendance/page.tsx`)

#### Session History

```
Attendance Sessions

[ + New Session ]

| Date       | Time      | Topic          | Present | Absent | Rate  | Actions |
|------------|-----------|----------------|--------:|-------:|------:|---------|
| Sep 01     | 10:00-11:00 | Intro to DBMS | 30     | 2      | 94%   | [Edit]  |
| Sep 03     | 10:00-11:00 | Relational Model | 28  | 4      | 88%   | [Edit]  |
| Sep 05     | 10:00-11:00 | SQL Basics    | 31     | 1      | 97%   | [Edit]  |
```

#### Student-wise Attendance Summary

```
Student Attendance Summary

| # | Name          | Roll Number | Present | Absent | Late | Excused | Rate  |
|---|---------------|-------------|--------:|-------:|-----:|--------:|------:|
| 1 | John Doe      | CS-2024-001 | 16      | 1      | 1    | 0       | 89%   |
| 2 | Jane Smith    | CS-2024-002 | 18      | 0      | 0    | 0       | 100%  |
| 3 | Bob Johnson   | CS-2024-003 | 14      | 3      | 1    | 0       | 78%   |
```

- Click student name → opens student profile or filters their data
- Sortable columns
- Color-code rate: green (>=85%), yellow (70-84%), red (<70%)

#### Mark Attendance (New Session)

```
Mark Attendance

Date: [2026-09-08]
Start Time: [10:00]
End Time: [11:00]
Topic: [SQL Joins........]

| # | Name          | Roll Number | Status              | Remarks |
|---|---------------|-------------|---------------------|---------|
| 1 | John Doe      | CS-2024-001 | [Present ▾]         | [....]  |
| 2 | Jane Smith    | CS-2024-002 | [Present ▾]         | [....]  |
| 3 | Bob Johnson   | CS-2024-003 | [Absent ▾]          | [....]  |

[ Mark All Present ]  [ Save Attendance ]

Status dropdown: Present | Absent | Late | Excused
```

**Bulk actions:**

- "Mark All Present" — sets all to PRESENT (faculty adjusts exceptions)
- Keyboard navigation: Tab through status dropdowns

### 3.5 Gradebook Page (`/faculty/sections/[sectionId]/[courseId]/gradebook/page.tsx`)

#### Exam Selector

```
Gradebook

Exam: [Midterm ▾]  |  Max Marks: 100  |  Passing Marks: 40

[ Save All Marks ]  [ Export ]
```

#### Marks Matrix

```
| # | Name          | Roll Number | Midterm | Grade | Status | Remarks |
|---|---------------|-------------|--------:|-------|--------|---------|
| 1 | John Doe      | CS-2024-001 | [85]    | A     | PASS   | [....]  |
| 2 | Jane Smith    | CS-2024-002 | [72]    | B+    | PASS   | [....]  |
| 3 | Bob Johnson   | CS-2024-003 | [38]    | F     | FAIL   | [....]  |

Marks input: inline editable number fields
Grade: auto-computed on blur/save
Status: auto-computed (PASS/FAIL based on passing marks)
```

#### Summary Stats

```
Class Statistics

Total Students: 32
Average: 71.4
Highest: 95
Lowest: 28
Pass Rate: 87.5%
Grade Distribution:
  A+ (>=90):  4  ████
  A  (80-89): 8  ████████
  B+ (70-79): 10 ██████████
  B  (60-69): 5  █████
  C  (50-59): 3  ███
  F  (<40):   2  ██
```

#### Multi-Exam View (Tab or Dropdown)

Switch between exams to enter marks for different assessments:

```
[ Internal ]  [ Midterm ]  [ Final ]  [ Assignment ]
```

### 3.6 Students Roster Page (`/faculty/sections/[sectionId]/[courseId]/students/page.tsx`)

```
Student Roster — Section A

32 students enrolled

| # | Name          | Roll Number | Email              | Phone      | Attendance | Marks Avg |
|---|---------------|-------------|--------------------:|------------|-----------:|----------:|
| 1 | John Doe      | CS-2024-001 | john@college.edu   | 9876543210 | 89%        | 85        |
| 2 | Jane Smith    | CS-2024-002 | jane@college.edu   | 9876543211 | 100%       | 72        |
| 3 | Bob Johnson   | CS-2024-003 | bob@college.edu    | 9876543212 | 78%        | 65        |

[ Export CSV ]
```

Click student name → opens full student profile (read-only for faculty).

### 3.7 Navigation Integration

Add to faculty sidebar/layout:

```
Faculty
├── Dashboard
├── My Courses       → /faculty/courses
├── My Sections      → /faculty/sections      ← NEW
├── Timetable
├── Lesson Plans
├── Announcements
├── Calendar
└── Profile
```

---

## 4. Data Flow

### 4.1 Section Listing Flow

```
GET /faculty/sections
  ↓
1. Find Faculty by userId
2. Query CourseAssignment where facultyId
3. For each assignment:
   a. Join Course, Section (with Program, Batch), AcademicTerm
   b. Count Enrollment (status = ACTIVE) in section for this course
   c. Compute attendance rate: avg of all AttendanceRecord for this course+section+faculty
   d. Find next TimetableEntry from today onward
4. Return SectionCard[]
```

### 4.2 Attendance Flow

```
Mark Attendance:
  1. Faculty clicks "+ New Session"
  2. Form loads all enrolled students for section+course
  3. Faculty sets date, time, topic
  4. Defaults all students to PRESENT
  5. Faculty marks exceptions (ABSENT, LATE, EXCUSED)
  6. Click "Save Attendance"
  7. Backend creates AttendanceSession + batch creates AttendanceRecord per student
  8. Frontend invalidates attendance query, updates stats
```

### 4.3 Gradebook Flow

```
Enter Marks:
  1. Faculty selects exam from dropdown
  2. Matrix loads: students × selected exam
  3. Faculty enters marks in inline fields
  4. Grade auto-computes on blur (client-side) or on save (server-side)
  5. Click "Save All Marks"
  6. Backend upserts Mark records, computes grade/percentage/resultStatus
  7. Frontend invalidates gradebook query, updates stats
```

---

## 5. Permissions

| Action                  | Faculty                      | Admin      |
| ----------------------- | ---------------------------- | ---------- |
| View sections           | READ (own assignments)       | READ (all) |
| View student roster     | READ (own sections)          | READ (all) |
| Mark attendance         | CREATE/UPDATE (own sections) | READ       |
| Edit attendance session | UPDATE (own sessions)        | READ       |
| View gradebook          | READ (own sections)          | READ (all) |
| Enter/edit marks        | CREATE/UPDATE (own courses)  | READ       |
| Export data             | READ                         | READ       |

---

## 6. Files

### Create

- `apps/web/src/app/faculty/sections/page.tsx`
- `apps/web/src/app/faculty/sections/[sectionId]/[courseId]/page.tsx`
- `apps/web/src/app/faculty/sections/[sectionId]/[courseId]/attendance/page.tsx`
- `apps/web/src/app/faculty/sections/[sectionId]/[courseId]/attendance/[sessionId]/page.tsx`
- `apps/web/src/app/faculty/sections/[sectionId]/[courseId]/gradebook/page.tsx`
- `apps/web/src/app/faculty/sections/[sectionId]/[courseId]/students/page.tsx`
- `apps/web/src/components/faculty/sections/section-list-card.tsx`
- `apps/web/src/components/faculty/sections/section-detail-header.tsx`
- `apps/web/src/components/faculty/sections/attendance-student-table.tsx`
- `apps/web/src/components/faculty/sections/attendance-session-list.tsx`
- `apps/web/src/components/faculty/sections/attendance-mark-form.tsx`
- `apps/web/src/components/faculty/sections/gradebook-matrix.tsx`
- `apps/web/src/components/faculty/sections/gradebook-marks-entry.tsx`
- `apps/web/src/components/faculty/sections/student-roster-table.tsx`
- `apps/api/src/modules/faculty/controllers/faculty-sections.controller.ts`
- `apps/api/src/modules/faculty/services/faculty-sections.service.ts`
- `apps/api/src/modules/faculty/dto/faculty-sections.dto.ts`
- `packages/sdk/src/client/faculty-sections-api.ts`
- `packages/hooks/src/api/faculty-sections.hooks.ts`

### Modify

- `apps/api/src/modules/faculty/faculty.module.ts` — Register sections controller + service
- `packages/sdk/src/client/index.ts` — Export new API
- `packages/hooks/src/api/index.ts` — Export new hooks
- `apps/web/src/app/faculty/layout.tsx` — Add "My Sections" nav item

### No Schema Changes

All data comes from existing models: `CourseAssignment`, `Course`, `Section`, `Enrollment`, `Student`, `User`, `AttendanceSession`, `AttendanceRecord`, `Exam`, `ExamCourse`, `Mark`, `TimetableEntry`, `AcademicTerm`, `Program`.
