# RESEARCH REPORT

## Executive Summary

This report details data-fetch latency issues found in the Student ERP repository. The investigation focused on Next.js/React Query hooks on the frontend, NestJS controllers/services on the backend, and Prisma schema modeling. We identified API waterfalls, oversized payloads, slow raw queries, duplicate fetches, and missing database indexes affecting `student`, `faculty`, and `admin` routes.

## 1. API Waterfalls

### Student Dashboard

**Location:** `apps/api/src/modules/students/services/student.service.ts`
**Function:** `getDashboardData` (Lines 58-105)
**Issue:** The service sequentially awaits multiple Prisma queries for the dashboard instead of running them concurrently.

```typescript
const timetable = await this.prisma.timetableEntry.findMany({...});
const enrollments = await this.prisma.enrollment.findMany({...});
const upcomingEvents = await this.prisma.calendarEvent.findMany({...});
const recentAnnouncements = await this.prisma.announcement.findMany({...});
const upcomingDeadlines = await this.prisma.assignment.findMany({...});
```

### Faculty Dashboard

**Location:** `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts`
**Function:** `getDashboard` (Lines 25-63)
**Issue:** Similar sequential awaiting for dashboard widgets.

```typescript
const courseAssignments = await this.prisma.courseAssignment.findMany({...});
const todaysClasses = await this.prisma.timetableEntry.findMany({...});
const announcements = await this.prisma.announcement.findMany({...});
```

## 2. Oversized API Payloads / Overfetching

### Faculty Students List

**Location:** `apps/api/src/modules/faculty/services/faculty-students.service.ts`
**Function:** `getStudents` (Lines 19-30)
**Issue:** The service queries `this.prisma.enrollment.findMany` with deeply nested includes (`student.user`, `student.program`, `student.section`). This transfers duplicated student data over the network for every enrolled course, which is then manually deduplicated in JavaScript (`studentMap`). This creates an oversized payload and excessive memory usage on the Node.js server.

### Course Offerings List

**Location:** `apps/api/src/modules/academic/services/course-offerings.service.ts`
**Function:** `findAll` (Lines 17-29)
**Issue:** The `findAll` method includes `enrollments: true` for every course offering. Fetching the full array of enrollments for listing endpoints creates massive unpaginated payload bottlenecks. It should either omit this relation or use `_count: { select: { enrollments: true } }`.

## 3. Missing Database Indexes (Prisma)

**Location:** `libs/database/prisma/schema.prisma`

### `AttendanceRecord`

**Issue:** Missing composite index on `[institutionId, status]`.
**Impact:** In `apps/api/src/modules/admin/dashboard/dashboard.service.ts` (lines 62-66), `groupBy` is used on `status` where `institutionId` is the only filter. This results in a full table scan.
**Recommendation:** Add `@@index([institutionId, status])`.

### `Enrollment`

**Issue:** Missing index on `[institutionId, sectionId, status]`.
**Impact:** In `faculty-students.service.ts`, enrollments are queried using `sectionId: { in: sectionIds }` and `status: 'ACTIVE'`. Without an index on `sectionId`, the DB must scan all enrollments for the institution.
**Recommendation:** Add `@@index([institutionId, sectionId, status])`.

## 4. Slow Raw Queries

### Low Attendance Students Count

**Location:** `apps/api/src/modules/admin/dashboard/dashboard.service.ts`
**Function:** `getLowAttendanceStudentsCount` (Lines 135-149)
**Issue:** A raw SQL query computes attendance percentages by grouping all `attendance_records` by `student_id` across the entire institution. It executes `SUM(CASE WHEN...)` operations dynamically on unindexed records. As the attendance table grows, this query will severely degrade the admin dashboard's performance.

## 5. Client-Side Duplicate Fetches

**Location:** `apps/web/src/app/student/page.tsx`
**Issue:** Four independent components on the page (`TodayScheduleCard`, `UpcomingDeadlinesCard`, `UpcomingEventsCard`, `RecentAnnouncements`) all invoke the monolithic `useStudentDashboard()` hook. While React Query (`packages/hooks/src/api/student.hooks.ts`) dedupes the network requests in the browser, the architecture couples all widgets to a heavy API endpoint. Each component receives the entire dashboard payload rather than fetching only the specific data it needs, propagating the backend waterfall latency directly to component render times.
