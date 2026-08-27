# Latency Optimization Results

## Implemented Changes

1. **Eliminated API Waterfalls on Student Dashboard:** Refactored `apps/api/src/modules/students/services/student.service.ts` to fetch independent dashboard widgets (`timetable`, `enrollments`, `upcomingEvents`, `recentAnnouncements`, `upcomingDeadlines`) concurrently using `Promise.all()`.
2. **Eliminated API Waterfalls on Faculty Dashboard:** Refactored `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts` to fetch `courseAssignments` and `todaysClasses` concurrently using `Promise.all()`.
3. **Reduced Oversized Payloads in Course Offerings:** Refactored `apps/api/src/modules/academic/services/course-offerings.service.ts` to use `_count: { select: { enrollments: true } }` instead of fetching the complete list of students enrolled in every offering.
4. **Optimized DB Queries in Faculty Students:** Refactored `apps/api/src/modules/faculty/services/faculty-students.service.ts` to query `Student` directly with matching enrollments instead of fetching `Enrollment` with deeply nested includes and manually deduplicating.
5. **Added Missing DB Indexes:** Added `@@index([institutionId, sectionId, status])` to `Enrollment` and `@@index([institutionId, status])` to `AttendanceRecord` in `libs/database/prisma/schema.prisma` to prevent full table scans.

## Files Changed

- `apps/api/src/modules/students/services/student.service.ts`
- `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts`
- `apps/api/src/modules/faculty/services/faculty-students.service.ts`
- `apps/api/src/modules/academic/services/course-offerings.service.ts`
- `libs/database/prisma/schema.prisma`

## Functions Changed

- `getDashboardData` (StudentService)
- `getDashboard` (FacultyDashboardService)
- `getStudents` (FacultyStudentsService)
- `findAll` and `findOne` (CourseOfferingsService)

## Database Changes

- Added composite index on `Enrollment` for `[institutionId, sectionId, status]`.
- Added composite index on `AttendanceRecord` for `[institutionId, status]`.

## API Changes

- `/academic/course-offerings`: Now returns `_count: { enrollments: number }` instead of massive nested enrollment arrays.
- `/faculty/students`: Deduplicated via PostgreSQL, returning smaller payloads directly.
- `/student/dashboard` & `/faculty/dashboard`: Substantially faster execution times due to decoupled independent DB requests.

## Frontend Changes

- Zero frontend changes required; existing deduplication in React Query accurately handles widget rendering with the optimized dashboard backend endpoints.

## Remaining Bottlenecks

- Client-side loading waterfalls: Client components using `useStudentDashboard` still suffer from React network roundtrip. Migrating these to Next.js Server Components with Server Actions could further eliminate network overhead.

## Recommended Next Investigation

- Introduce Redis caching on the `/admin/dashboard` attendance raw SQL query to cache the slow dynamic metric computations, or replace with materialized views.
