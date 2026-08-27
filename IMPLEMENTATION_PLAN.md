# Student ERP Latency Optimization Plan

## Goal

Reduce data-fetch latency without changing business behavior.

---

## Priority 1 — Critical

### Change 1

**Problem:** Sequential database queries causing API waterfalls.
**Exact files:** `apps/api/src/modules/students/services/student.service.ts`
**Exact functions:** `getDashboardData`
**Current flow:** Sequentially awaits `timetable`, `enrollments`, `upcomingEvents`, `recentAnnouncements`, and `upcomingDeadlines`.
**Root cause:** Awaiting multiple independent Prisma queries sequentially.
**Implementation:** Combine the independent queries (`timetable`, `enrollments`, `upcomingEvents`, `recentAnnouncements`) into a `Promise.all`. Wait for `enrollments` first to extract `courseIds`, then fetch `upcomingDeadlines` alongside the others, or refactor to fetch `upcomingDeadlines` using the `student.id` directly if the DB schema permits. Since `upcomingDeadlines` needs `courseId: { in: enrollments.map(e => e.courseId) }`, we can do two phases:

1. Fetch `enrollments` in parallel with `upcomingEvents` and `recentAnnouncements`.
2. Then fetch `timetable` (since it depends on `student.sectionId`, which is available from `student` fetched earlier) and `upcomingDeadlines` (which depends on `enrollments`) in parallel.
   **Validation:** Compare total execution time.

### Change 2

**Problem:** Sequential database queries causing API waterfalls.
**Exact files:** `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts`
**Exact functions:** `getDashboard`
**Current flow:** Sequentially awaits `courseAssignments`, `todaysClasses`, and `announcements`.
**Root cause:** Sequential `await` calls.
**Implementation:** `todaysClasses` depends only on `faculty.id`. `courseAssignments` depends only on `faculty.id`. `announcements` depends on `courseAssignments`.

1. Run `courseAssignments` and `todaysClasses` concurrently using `Promise.all`.
2. Wait for `courseAssignments` and then fetch `announcements`.
   **Validation:** Verify faculty dashboard load time.

---

## Priority 2 — High

### Change 3

**Problem:** Oversized API payloads returning unneeded relation lists.
**Exact files:** `apps/api/src/modules/academic/services/course-offerings.service.ts`
**Exact functions:** `findAll`
**Current flow:** Includes `enrollments: true` which pulls in the entire enrollment array for every course offering.
**Root cause:** Broad include fetching unused data.
**Implementation:** Replace `enrollments: true` with `_count: { select: { enrollments: true } }` so the payload only contains the count instead of full student arrays. If UI needs to know about full enrollments here (unlikely for a list), verify, but lists typically just need the count.
**Validation:** Check JSON response size of `/academic/course-offerings`.

### Change 4

**Problem:** Missing index on Enrollment causing full table scans.
**Exact files:** `libs/database/prisma/schema.prisma`
**Exact functions:** `apps/api/src/modules/faculty/services/faculty-students.service.ts` -> `getStudents`
**Root cause:** Querying `Enrollment` with `sectionId: { in: sectionIds }` and `status: 'ACTIVE'`, but there is no index starting with `sectionId`.
**Implementation:** Add `@@index([institutionId, sectionId, status])` to the `Enrollment` model.
**Validation:** Verify Prisma generates the migration.

### Change 5

**Problem:** Missing index on AttendanceRecord causing slow raw queries.
**Exact files:** `libs/database/prisma/schema.prisma`
**Exact functions:** `apps/api/src/modules/admin/dashboard/dashboard.service.ts` -> `getSummary` and `getLowAttendanceStudentsCount`
**Root cause:** `groupBy` and `COUNT` operations on `attendance_records` filter by `institutionId` and aggregate by `student_id` or `status`. Missing composite index.
**Implementation:** Add `@@index([institutionId, status])` and `@@index([institutionId, studentId])` to the `AttendanceRecord` model.
**Validation:** Generate Prisma migration.

---

## Priority 3 — Medium

### Change 6

**Problem:** Oversized API payloads and inefficient JS deduplication.
**Exact files:** `apps/api/src/modules/faculty/services/faculty-students.service.ts`
**Exact functions:** `getStudents`
**Current flow:** Fetches `enrollment` with `student.user`, `student.program`, `student.section`. Reconstructs unique students in a Map.
**Root cause:** Nested includes on the intermediate `Enrollment` table instead of fetching `Student` directly.
**Implementation:** Query `this.prisma.student.findMany` where they have an enrollment matching the section criteria. Include their matching enrollments with courses. This shifts deduplication to PostgreSQL and reduces JSON over the wire.
**Validation:** Verify faculty students list still correctly outputs students with their enrolled courses.

# Dependency Order

1. Generate Prisma migrations (Change 4, 5).
2. Fix backend API waterfalls (Change 1, 2).
3. Fix oversized payloads (Change 3, 6).
