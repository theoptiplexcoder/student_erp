# Admin Console Information Architecture & Implementation Plan

## 1. Current Route Inventory

Based on the file system analysis, the following routes currently exist under `apps/web/src/app/admin/`:

- `/admin`
- `/admin/dashboard`
- `/admin/academics`, `/admin/academics/courses`, `/admin/academics/programs`
- `/admin/admissions`, `/admin/admissions/applications`, `/admin/admissions/forms`, `/admin/admissions/settings`
- `/admin/alumni`
- `/admin/announcements`
- `/admin/attendance`, `/admin/attendance/courses`, `/admin/attendance/reports`, `/admin/attendance/students`
- `/admin/batches`
- `/admin/certificates`, `/admin/certificates/generate`
- `/admin/departments`
- `/admin/examinations`, `/admin/examinations/exams`, `/admin/examinations/grading`, `/admin/examinations/marks`, `/admin/examinations/results`, `/admin/examinations/timetable`
- `/admin/faculty`
- `/admin/institution`
- `/admin/people/students`
- `/admin/permissions`
- `/admin/programs`
- `/admin/promotions`, `/admin/promotions/pending`, `/admin/promotions/promoted`, `/admin/promotions/rules`
- `/admin/reports`, `/admin/reports/admissions`, `/admin/reports/attendance`, `/admin/reports/examinations`, `/admin/reports/faculty`, `/admin/reports/students`
- `/admin/roles`
- `/admin/sections`
- `/admin/settings/academic`, `/admin/settings/general`

## 2. Problems with Current Structure

- **Duplicate Routes:** Programs are duplicated under `/admin/academics/programs` and `/admin/programs`.
- **Top-Level Pollution:** Entities like `batches`, `sections`, `departments` are at the top level when they are inherently academic operational data.
- **Inconsistent Naming:** Students are under `/admin/people/students` instead of a canonical `/admin/students`.
- **Flat Settings & Administration:** Roles, permissions, institution, and settings are scattered at the top level instead of being grouped under `/admin/administration`.
- **Communication:** Announcements is at the top level, rather than organized under a Communication module.
- **Dashboard:** Exists at `/admin/dashboard` but `/admin` should be the canonical dashboard.

## 3. Proposed Information Architecture (Sidebar Hierarchy)

**OVERVIEW**

- Dashboard (`/admin`)

**ACADEMIC OPERATIONS**

- Admissions (`/admin/admissions`)
- Students (`/admin/students`)
- Academics (`/admin/academics`)
- Faculty (`/admin/faculty`)
- Attendance (`/admin/attendance`)
- Examinations (`/admin/examinations`)
- Promotions (`/admin/promotions`)
- Timetable (`/admin/timetable`)
- Certificates (`/admin/certificates`)

**INSIGHTS**

- Reports (`/admin/reports`)

**COMMUNICATION**

- Announcements (`/admin/communication/announcements`)

**ADMINISTRATION**

- Institution (`/admin/administration/institution`)
- Users & Access (`/admin/administration/users`)
- Settings (`/admin/administration/settings`)

## 4. Canonical URL Map

- `/admin` (Dashboard)
- `/admin/admissions` (Overview, Applications, Forms, Settings)
- `/admin/students` (List), `/admin/students/new`, `/admin/students/[studentId]` (with tabs for Academics, Attendance, etc.)
- `/admin/academics` (Overview), `/admin/academics/programs`, `/admin/academics/courses`, `/admin/academics/batches`, `/admin/academics/sections`, `/admin/academics/departments`, `/admin/academics/subjects`
- `/admin/faculty` (List), `/admin/faculty/new`, `/admin/faculty/[facultyId]` (with tabs for Profile, Academics, Courses, Timetable, History)
- `/admin/attendance` (Overview), `/admin/attendance/courses`, `/admin/attendance/students`, `/admin/attendance/reports`
- `/admin/examinations` (Exams, Timetable, Marks, Results)
- `/admin/promotions` (Pending, Promoted, Rules)
- `/admin/timetable` (Weekly, Faculty, Rooms)
- `/admin/certificates` (List, Generate)
- `/admin/reports` (Admissions, Students, Faculty, Attendance, Examinations)
- `/admin/communication/announcements`
- `/admin/administration/institution`
- `/admin/administration/users`
- `/admin/administration/roles`
- `/admin/administration/permissions`
- `/admin/administration/settings`

## 5. Route Migration Map

| Old Route                | New Canonical Route                                                                                                                              | Action           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `/admin/dashboard`       | `/admin`                                                                                                                                         | Move/Redirect    |
| `/admin/people/students` | `/admin/students`                                                                                                                                | Move             |
| `/admin/programs`        | `/admin/academics/programs`                                                                                                                      | Move/Consolidate |
| `/admin/batches`         | `/admin/academics/batches`                                                                                                                       | Move             |
| `/admin/sections`        | `/admin/academics/sections`                                                                                                                      | Move             |
| `/admin/departments`     | `/admin/academics/departments`                                                                                                                   | Move             |
| `/admin/institution`     | `/admin/administration/institution`                                                                                                              | Move             |
| `/admin/roles`           | `/admin/administration/roles`                                                                                                                    | Move             |
| `/admin/permissions`     | `/admin/administration/permissions`                                                                                                              | Move             |
| `/admin/settings/*`      | `/admin/administration/settings/*`                                                                                                               | Move             |
| `/admin/announcements`   | `/admin/communication/announcements`                                                                                                             | Move             |
| `/admin/alumni`          | `/admin/students/alumni` (tab) or Deferred? As per MVP, Alumni is deferred, but if existing, keep at `/admin/students/alumni` or `/admin/alumni` |

## 6. Detail-Page Tab Structure

**Student Detail (`/admin/students/[studentId]`)**

- Overview (Default)
- Academics
- Attendance
- Examinations
- Documents
- History

**Faculty Detail (`/admin/faculty/[facultyId]`)**

- Profile (Default)
- Academics
- Courses
- Timetable
- History

## 7. Role-Based Visibility Matrix

- **Institution Administrator:** Full access.
- **Academic Administrator:** Academics, Faculty, Attendance, Examinations, Promotions, Timetable, Reports.
- **Admissions Staff:** Admissions, Students.
- **Faculty / Examination Staff:** Dashboard, Examinations, Students, relevant Reports.

## 8. Files/Folders to Move (Implementation Steps)

1. `mv apps/web/src/app/admin/people/students apps/web/src/app/admin/students`
2. `mv apps/web/src/app/admin/programs apps/web/src/app/admin/academics/programs` (Resolve duplicates if any)
3. `mv apps/web/src/app/admin/batches apps/web/src/app/admin/academics/batches`
4. `mv apps/web/src/app/admin/sections apps/web/src/app/admin/academics/sections`
5. `mv apps/web/src/app/admin/departments apps/web/src/app/admin/academics/departments`
6. `mkdir -p apps/web/src/app/admin/administration`
7. `mv apps/web/src/app/admin/institution apps/web/src/app/admin/administration/institution`
8. `mv apps/web/src/app/admin/roles apps/web/src/app/admin/administration/roles`
9. `mv apps/web/src/app/admin/permissions apps/web/src/app/admin/administration/permissions`
10. `mv apps/web/src/app/admin/settings apps/web/src/app/admin/administration/settings`
11. `mkdir -p apps/web/src/app/admin/communication`
12. `mv apps/web/src/app/admin/announcements apps/web/src/app/admin/communication/announcements`
13. Replace `/admin/dashboard` contents into `/admin/page.tsx` and redirect.

## 9. Tests that need updating

- Playwright admin navigation tests
- Unit tests referencing old paths
- Route guards and middleware for RBAC

## 10. Risks and compatibility

- Need to update all internal `Link` tags and `useRouter` pushes to new canonical URLs.
- Will set up redirects in `next.config.js` or middleware to prevent breaking existing bookmarked links during migration.
