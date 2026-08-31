# Faculty Dashboard — Today's Schedule Calendar

## Overview

Replace the current list-based "Today's Schedule" section on the faculty dashboard with a **calendar grid view**. The calendar displays today's timetable with **time slots on the x-axis** and **session numbers on the y-axis**, giving faculty a quick visual overview of their day.

---

## Architecture Context

| Layer | Tech                                   | Location                                                             |
| ----- | -------------------------------------- | -------------------------------------------------------------------- |
| DB    | Prisma + PostgreSQL                    | `libs/database/prisma/schema.prisma`                                 |
| API   | NestJS                                 | `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts` |
| SDK   | Axios client                           | `packages/sdk/src/client/faculty-api.ts`                             |
| Hooks | React Query                            | `packages/hooks/src/api/faculty.hooks.ts`                            |
| UI    | Next.js + `@student-erp/ui` + Tailwind | `apps/web/src/components/faculty/dashboard/`                         |

---

## 1. Schema — Relevant Models

No schema changes needed. Data comes from existing models:

| Model            | Purpose                          | Key Fields                                                                                    |
| ---------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| `TimetableEntry` | Stores scheduled classes per day | `facultyId`, `dayOfWeek`, `startTime`, `endTime`, `courseId`, `sectionId`, `room`, `building` |
| `Course`         | Course metadata                  | `code`, `name`                                                                                |
| `Section`        | Section/group info               | `name`, `code`                                                                                |
| `AcademicTerm`   | Active term filter               | `startDate`, `endDate`, `status`                                                              |

**Query:** Filter `TimetableEntry` by `facultyId`, `dayOfWeek` matching today, and active term date range. Order by `startTime`.

---

## 2. Backend

### 2.1 Service

**File:** `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts`

The existing `getDashboard()` already queries `todaysClasses` from `TimetableEntry`. The service needs no new endpoints — the calendar is a frontend rendering change.

```typescript
// Existing query in getDashboard() — no changes needed:
const todaysClasses = await this.prisma.timetableEntry.findMany({
  where: {
    facultyId: faculty.id,
    institutionId,
    dayOfWeek: dayOfWeekEnum,
    term: {
      startDate: { lte: todayEnd },
      endDate: { gte: todayStart },
    },
  },
  include: {
    course: true,
    section: true,
  },
  orderBy: { startTime: 'asc' },
});
```

**Return shape per entry:**

```typescript
{
  id: string;
  courseId: string;
  course: { code: string; name: string };
  sectionId: string;
  section: { name: string; code: string };
  dayOfWeek: 'MONDAY' | 'TUESDAY' | ...;
  startTime: string; // ISO time e.g. "09:00:00"
  endTime: string;   // ISO time e.g. "10:00:00"
  room: string | null;
  building: string | null;
}
```

### 2.2 Controller / SDK / Hooks

No changes. The existing `GET /faculty/dashboard` endpoint and `useFacultyDashboard()` hook already provide `todaysClasses`.

---

## 3. Client — Calendar Component

### 3.1 New Component

**File:** `apps/web/src/components/faculty/dashboard/todays-schedule-calendar.tsx`

Create a grid-based calendar component.

#### Grid Layout

```
             08:00   09:00   10:00   11:00   12:00   13:00   14:00   15:00   16:00
           ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐
Session 1  │       │ MATH  │ MATH  │       │ PHYS  │ PHYS  │       │       │       │
           │       │101-A  │101-A  │       │201-B  │201-B  │       │       │       │
           ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Session 2  │       │       │       │ CHEM  │ CHEM  │       │ COMP  │ COMP  │       │
           │       │       │       │102-A  │102-A  │       │301-A  │301-A  │       │
           ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Session 3  │       │       │       │       │       │       │       │ HIST  │ HIST  │
           │       │       │       │       │       │       │       │401-B  │401-B  │
           └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘
```

**X-axis:** Time slots (hourly from earliest class start to latest class end, e.g. 08:00–16:00)
**Y-axis:** Session number (Session 1, Session 2, Session 3… ordered by start time)

Each filled cell shows: **Course code** (bold) and **Section name** (muted).

#### 3.2 Grid Construction Logic

```typescript
function buildCalendarGrid(classes: TimetableEntry[]) {
  // 1. Determine time range
  //    - Find earliest startTime and latest endTime across all classes
  //    - Round to nearest hour boundaries (floor start, ceil end)
  //    - Generate time slot headers: ["08:00", "09:00", ..., "16:00"]

  // 2. Assign session rows
  //    - Sort classes by startTime ascending
  //    - Each class becomes one row (Session N)
  //    - Session number = index + 1

  // 3. For each class, calculate which time-slot columns it spans
  //    - classStartTime → column index
  //    - classEndTime → column span (duration / 1 hour slot width)
  //    - If a class spans 2 hours, it occupies 2 adjacent cells

  // 4. Build a 2D grid array:
  //    grid[sessionIndex][timeSlotIndex] = { course, section, span } | null

  return { timeSlots, sessions, grid };
}
```

#### 3.3 Cell Rendering

Each filled cell (a class in a time slot) should be a colored block:

- Background: course-specific color (use a rotating palette of 6–8 muted colors)
- Content: Course code (e.g. `MATH101`) on top, section code (e.g. `Sec-A`) below
- Occupies the full cell width (colspan) if the class spans multiple time slots
- Empty cells are blank with a subtle grid line

#### 3.4 Time Slot Width

- Use CSS Grid: `grid-template-columns: 80px repeat(N, 1fr)` where N = number of time slots
- First column: session labels (Session 1, Session 2…)
- Remaining columns: one per hour slot

#### 3.5 Handling Edge Cases

- **No classes today:** Show empty grid with "No classes scheduled" message
- **Classes spanning lunch hour:** Show as continuous block across slots
- **Short classes (< 1 hour):** Round to nearest slot boundaries, minimum 1 cell width
- **Overlapping classes:** (Shouldn't happen per timetable rules, but) stack with reduced height or show conflict badge

---

## 4. Page Integration

### 4.1 Update Dashboard Page

**File:** `apps/web/src/app/faculty/dashboard/page.tsx`

Replace the existing "Today's Schedule" card list with the calendar component:

```tsx
// Before (list view):
<Card>
  <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
  <CardContent>
    {todaysClasses.map(cls => <div>...</div>)}
  </CardContent>
</Card>

// After (calendar grid):
<Card>
  <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
  <CardContent>
    <TodaysScheduleCalendar classes={todaysClasses} />
  </CardContent>
</Card>
```

---

## 5. Files

### Create

- `apps/web/src/components/faculty/dashboard/todays-schedule-calendar.tsx`

### Modify

- `apps/web/src/app/faculty/dashboard/page.tsx` — Swap list for calendar component

### No Changes Needed

- `apps/api/src/modules/faculty/services/faculty-dashboard.service.ts` — Already returns `todaysClasses`
- `apps/api/src/modules/faculty/controllers/faculty-dashboard.controller.ts` — Same endpoint
- `packages/sdk/src/client/faculty-api.ts` — Same API call
- `packages/hooks/src/api/faculty.hooks.ts` — Same hook
- `libs/database/prisma/schema.prisma` — No schema changes

---

## 6. Testing

- [ ] Calendar renders with correct time slots on x-axis
- [ ] Session numbers appear on y-axis in order
- [ ] Classes appear at correct time-slot positions
- [ ] Multi-hour classes span correct number of cells
- [ ] Course code and section name display in each cell
- [ ] Empty day shows "No classes scheduled" message
- [ ] Calendar is responsive (scrolls horizontally on mobile)
- [ ] Color palette cycles through courses for visual distinction
