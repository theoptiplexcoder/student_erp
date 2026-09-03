# Faculty Timetable Mind Map — Implementation Plan

## Goal

Replace the current card-per-day layout at `/faculty/timetable` with a **faculty-specific weekly grid + load summary** — a "mind map" that shows the faculty's entire week at a glance, with section-aware coloring and load distribution.

## Current State

- **Backend complete**: `GET /faculty/timetable` returns `TimetableEntry[]` with `course`, `section`, `term`, `dayOfWeek`, `startTime`, `endTime`, `room` — no API changes needed.
- **Hooks complete**: `useFacultyTimetable()` in `packages/hooks/src/api/faculty.hooks.ts` — no hook changes needed.
- **SDK complete**: `FacultyApi.getTimetable()` in `packages/sdk/` — no SDK changes needed.
- **Frontend exists**: `apps/web/src/app/faculty/timetable/page.tsx` — card-per-day layout, to be replaced.
- **Student grid reference**: `apps/web/src/components/student/timetable/timetable-grid.tsx` (297 lines) — pattern to follow for the grid.

## Architecture

```
faculty/timetable/page.tsx          ← Page (orchestrator)
├── FacultyTimetableGrid            ← Weekly time-slot grid (New component)
└── FacultyLoadSummary              ← Load stats sidebar (New component)
```

**No backend changes. No hook changes. No SDK changes. Frontend-only work.**

---

## Phase 1: Build Components (Parallel)

Two independent components, no dependencies between them.

### Lane 1A: `FacultyTimetableGrid` Component

**File:** `apps/web/src/components/faculty/timetable/faculty-timetable-grid.tsx`

**What it does:**

- Weekly grid: Mon–Sat columns, time-slot rows (derived from entries)
- Each cell shows: course code, course name, section badge, room, "Session Workspace" link
- Color-coded by `courseId + sectionId` combo (so CS101-A and CS101-B get different colors)
- Today's column highlighted with a subtle background
- Responsive: desktop = grid table, mobile = card-per-day (same pattern as student grid)
- Empty cells left blank (no action needed — faculty is read-only here)

**Key decisions:**

- Reuse the `colors` array pattern from student grid (7 Tailwind color sets with dark mode support)
- Color key = `${entry.courseId}-${entry.sectionId}` so same course in different sections is visually distinct
- Time slots derived from entries (same approach as student grid: `Set<string>` of `"HH:MM-HH:MM"`)
- Session Workspace link: `/faculty/timetable/session?courseId=X&sectionId=Y&date=YYYY-MM-DD` (same as current page)
- Use `date-fns` `format()` for time display (already a dependency)

**Props:**

```ts
interface FacultyTimetableGridProps {
  entries: any[]; // from useFacultyTimetable()
  isLoading: boolean;
}
```

**Pattern to follow:** `apps/web/src/components/student/timetable/timetable-grid.tsx`

- Copy the structure (desktop table + mobile cards)
- Modify: remove "Subjects & Faculty" bottom table, add section badge to each cell, add "Session Workspace" button, highlight today column

### Lane 1B: `FacultyLoadSummary` Component

**File:** `apps/web/src/components/faculty/timetable/faculty-load-summary.tsx`

**What it does:**

- Card showing aggregate stats derived from timetable entries:
  - **Hours per day**: Mon 4h, Tue 3h, Wed 5h, etc. (bar chart or simple text)
  - **Hours per course**: CS101 6h, MATH201 3h, etc.
  - **Total weekly load**: X sessions, Y hours
  - **Section count**: how many distinct sections
- Uses existing `Card`, `Badge` from `@student-erp/ui`
- Pure computation from entries array — no new API calls

**Props:**

```ts
interface FacultyLoadSummaryProps {
  entries: any[]; // from useFacultyTimetable()
  isLoading: boolean;
}
```

**Implementation:**

- Compute in `useMemo` from entries:
  - Group by `dayOfWeek` → sum hours per day
  - Group by `courseId` → sum sessions per course, include course name/code
  - Total: `entries.length` sessions, sum of all durations
- Render as a `Card` with:
  - Header: "Weekly Load"
  - Body: simple stat rows (day, course, totals)
  - Use `Badge` for course labels with matching colors from the grid

---

## Phase 2: Wire Up Page

**File:** `apps/web/src/app/faculty/timetable/page.tsx` (replace existing)

**What changes:**

- Import `FacultyTimetableGrid` and `FacultyLoadSummary`
- Keep `useFacultyTimetable()` hook (already exists)
- Layout:
  - Desktop: 2-column — grid takes ~75%, summary takes ~25% sidebar
  - Mobile: stacked — grid on top, summary below
- Remove old card-per-day code entirely
- Keep loading/error states (same pattern)

**Layout structure:**

```
<div className="space-y-6 p-6">
  <header>Title + subtitle</header>
  <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
    <FacultyTimetableGrid entries={timetable} isLoading={isLoading} />
    <FacultyLoadSummary entries={timetable} isLoading={isLoading} />
  </div>
</div>
```

---

## Phase 3: Polish & Verify

- Test responsive behavior (desktop grid → mobile cards)
- Verify dark mode colors render correctly
- Confirm "Session Workspace" links work with correct params
- Check empty state (no entries yet)
- Ensure today-column highlight works

---

## File Manifest

| Action      | File                                                                   | Lines (est.) |
| ----------- | ---------------------------------------------------------------------- | ------------ |
| **New**     | `apps/web/src/components/faculty/timetable/faculty-timetable-grid.tsx` | ~250         |
| **New**     | `apps/web/src/components/faculty/timetable/faculty-load-summary.tsx`   | ~120         |
| **Replace** | `apps/web/src/app/faculty/timetable/page.tsx`                          | ~60          |

**Total: ~430 lines, 3 files, 0 backend changes.**

---

## Parallel Execution Plan

```
Phase 1 (parallel):
  ┌─ Lane 1A: @fixer → FacultyTimetableGrid component
  └─ Lane 1B: @fixer → FacultyLoadSummary component

Phase 2 (sequential, after Phase 1):
  └─ Lane 2: @fixer → Wire up page.tsx with both components

Phase 3 (after Phase 2):
  └─ Manual verification by orchestrator
```

Lane 1A and 1B can run simultaneously — they are independent components with no shared state or file conflicts.
