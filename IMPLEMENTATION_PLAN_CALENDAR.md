# Institution Calendar to Student Calendar Synchronization Plan

## A. Current Architecture

**Admin Calendar:**
Admin UI (`apps/web/src/app/admin/administration/institution/calendar/page.tsx`)
→ API Client (`apiClient.post/put/delete('/admin/institution/calendar-events')`)
→ Controller (`apps/api/src/modules/admin/institution/institution.controller.ts`)
→ Service (`InstitutionService`)
→ Database (`Prisma CalendarEvent` table, filtered by `institutionId`)

**Student Calendar:**
Student UI (`apps/web/src/components/student/calendar/calendar-view.tsx`)
→ React Query (`useStudentCalendar` hook)
→ API Client (`StudentApi.getCalendar`)
→ Controller (`apps/api/src/modules/students/controllers/student.controller.ts`)
→ Service (`StudentService`)
→ Database (`Prisma CalendarEvent` table, filtered by `req.user.institutionId`)

## B. Existing Source of Truth

The `calendar_events` table in the database (represented by the Prisma `CalendarEvent` model) is the canonical source of truth for both admin and student calendars. Both read/write using the same `institutionId` tenant scoping.

## C. Current Problem

The student calendar is not guaranteed to reflect the admin calendar immediately because:

1. **Frontend Mock UI:** The student `CalendarView` uses a hardcoded, fake calendar grid (`Array.from({ length: 31 })`, fixed padding days) that ignores real month structures and timezones. It also ignores most event data by only displaying a single event per day using `.find()` instead of `.filter()`.
2. **Client-side Caching (React Query):** The student's calendar relies on React Query fetching. Since the admin and student use different browser sessions, a mutation in the admin browser invalidates the admin's React Query cache but does nothing to the student's cache. The student sees stale data until their React Query cache expires or the window refocuses.
3. **No Realtime Infrastructure Configured in UI:** While `@supabase/supabase-js` is available and used for auth, no client subscribes to Postgres changes for the `calendar_events` table.

## D. Exact Files

- `apps/web/src/components/student/calendar/calendar-view.tsx`
  - Needs to replace the hardcoded mock grid with `react-big-calendar` (the project's existing real calendar component) to accurately represent all events with correct date/time constraints.
  - Needs to implement a Supabase Realtime subscription to invalidate the `['student', 'calendar']` React Query cache when the backend data changes.
- `apps/web/src/app/student/calendar/page.tsx`
  - (No changes strictly needed, but `CalendarView` should be reviewed if it requires props).

## E. Minimal Correct Architecture

The single-source-of-truth flow is already partially correct at the database layer (both read `CalendarEvent`).
The minimal change is:

1. Replace the student's mock UI with `react-big-calendar` mapping all events accurately.
2. Add a `useEffect` inside `CalendarView` using the existing Supabase client to subscribe to `postgres_changes` for `calendar_events`.
3. When a change is detected, call `queryClient.invalidateQueries({ queryKey: ['student', 'calendar'] })`.

## F. Data Flow

Admin creates/updates/deletes event via NestJS API → Persistent `calendar_events` record changes in Postgres → Supabase Realtime broadcasts change → Student's `CalendarView` receives payload → React Query cache is invalidated → Student UI refetches from NestJS API → UI updates accurately.

## G. Realtime Strategy

The project already utilizes Supabase for authentication (`@supabase/ssr` / `@supabase/supabase-js`). This stack inherently provides Supabase Realtime (Postgres Changes). We will implement a `supabase.channel` listener in the student client component.
_Limitation Note:_ For this to function in production, the `calendar_events` table must be added to the Supabase replication publication (`ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;`). If it is not enabled in the database, the subscription will silently fail to receive events, and the system will gracefully fall back to React Query's default revalidation triggers (window focus). We are not introducing a new WebSocket/Redis server.
