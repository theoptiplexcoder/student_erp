# Student ERP - Release Notes

**Version:** Student Portal v1.0  
**Release Date:** August 25, 2026  
**Codename:** Student Portal

---

## Overview

This release introduces the full **Student Portal** experience -- a self-service dashboard for enrolled students alongside robust **admin** and **tenant-admin** management interfaces. The system covers the complete student lifecycle: admissions, enrollment, academics, attendance, certificates, and grievance management.

---

## 1. Student Portal (`/student`)

The student-facing portal is a role-gated application (`requireRoleOrRedirect('STUDENT')`) with a responsive layout featuring a collapsible sidebar, top navbar, and mobile navigation drawer.

### 1.1 Dashboard (`/student`)

The main landing page displays a personalized greeting and quick-action buttons, with a grid of live data cards:

| Component                | Purpose                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StudentWelcomeHeader`   | Personalized greeting ("Good morning, {name}"), program/semester/section info, quick links to Timetable, Courses, Attendance, Certificates                  |
| `TodayScheduleCard`      | Chronological list of today's classes with live status (PAST / CURRENT / UPCOMING), faculty name, and room. Highlights the current class with a "Now" badge |
| `AttendanceOverviewCard` | Overall attendance percentage across all courses with per-course breakdown (top 3). Warns with red indicators when below 75% threshold                      |
| `UpcomingDeadlinesCard`  | List of upcoming assignment/exam deadlines with course name, due date, and publication status badge                                                         |
| `UpcomingEventsCard`     | Upcoming campus events with date, time, and location                                                                                                        |
| `RecentAnnouncements`    | Recent institutional announcements with timestamps and "View all" link to notifications                                                                     |

### 1.2 My Profile (`/student/profile`)

A comprehensive, **self-editable** profile page with five sections, each featuring inline edit dialogs:

| Section                          | Editable Fields                                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile Banner**               | Profile photo upload (Supabase Storage `student_profile_bucket`), displays full name, student code, lifecycle status, program, department, email, phone, address |
| **Personal Information**         | Bio                                                                                                                                                              |
| **Contact Information**          | Phone number                                                                                                                                                     |
| **Address**                      | Full address, city, state, postal code, country                                                                                                                  |
| **Academic Details**             | Read-only display: Student ID, admission number, roll number, program, department, section, status, admission date                                               |
| **Guardian / Emergency Contact** | Guardian name, guardian phone                                                                                                                                    |

All edits use the `useUpdateStudentProfile` mutation hook.

### 1.3 Timetable (`/student/timetable`)

- **Desktop:** Full weekly grid (Mon-Sat) with color-coded course blocks, faculty names, room numbers, and time slots
- **Mobile:** Day-by-day list view with card-style entries
- Week navigation (Prev/Next) for browsing different weeks
- **Subjects & Faculty** reference table below the grid showing course name, code, faculty, and credits
- Course blocks are uniquely color-coded (7-color palette) with dark mode support

### 1.4 My Courses (`/student/courses`)

- Responsive card grid (1-4 columns depending on breakpoint) showing all enrolled courses
- Each card displays: course name, code, credit value, and a **live attendance progress bar** with percentage
- Color-coded top accent bars (5-color rotation)
- "Open Course" link to the course detail page

#### Course Detail Workspace (`/student/courses/[courseId]`)

A tabbed interface with three sections:

| Tab             | Content                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Overview**    | Course description, recent announcements, attendance progress bar                              |
| **Assignments** | List of assignments with due dates, submission status (SUBMITTED/PENDING), submit/view actions |
| **Attendance**  | Full attendance module (see below)                                                             |

#### Attendance Module (per course)

| Component               | Description                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `AttendanceSummary`     | Overall attendance percentage, threshold display (default 75%), present/absent/late/total counts                        |
| `AttendanceFilters`     | Filter pills: All / Present / Absent / Late / Excused                                                                   |
| `AttendanceSessionList` | Sorted list (newest first) of attendance records filtered by active filter                                              |
| `AttendanceSessionItem` | Individual session row with formatted date, time range, and color-coded status badge (P=green, A=red, L=orange, E=blue) |

### 1.5 Calendar (`/student/calendar`)

- Monthly calendar grid view with day cells
- **Filters sidebar:** All Events, Academic, Exams, Deadlines
- **Upcoming sidebar:** Next 5 upcoming events with dates
- Event markers on calendar days (red highlights for deadlines)
- Today highlighting, month/year header with navigation

### 1.6 Certificates (`/student/certificates`)

- Card grid of requested certificates showing type, status badge (ISSUED/PENDING), and request date
- **Request Certificate Dialog** for submitting new certificate requests
- Download button (enabled only when status is ISSUED)
- Processing state indicator for pending certificates

### 1.7 Notifications (`/student/notifications`)

- Full notification center page with timestamped entries
- "Mark All as Read" bulk action
- Notification bell widget in the navbar with unread count badge, click-to-mark-read, and popup dialog
- Relative time display using `date-fns` `formatDistanceToNow`

### 1.8 Clubs & Societies (`/student/clubs`)

- **Tabbed interface:** "My Clubs" and "Available Clubs"
- My Clubs: Shows memberships with role badge, description, and "View Activity" action
- Available Clubs: Browse and join clubs with "Join Club" action
- Empty states for no memberships / no available clubs

### 1.9 Feedback (`/student/feedback`)

- Displays active feedback forms in a card grid
- "Fill Feedback" action for each form
- Tracks locally submitted forms to filter them from the pending list

### 1.10 Grievance (`/student/grievance`)

A full grievance submission form with:

- **Categories:** Academic, Faculty/Teacher, Examination, Attendance, Timetable, Admission, Fees, Hostel, Library, Transport, Facilities, Misconduct, Other
- Required fields: Category, Subject, Description
- Optional: Related To (Course / Faculty / Attendance / Marks) with dynamic course selector
- **Anonymous submission** checkbox
- Success/error feedback messages

---

## 2. Admin Student Management (`/admin/students`)

### 2.1 Student List Page

A comprehensive, filterable, paginated student management interface:

- **Stats strip:** Total Students, Enrolled, Applicants, Other (with animated counters)
- **Advanced filters:** Search (debounced), Academic Year, Department, Program, Batch, Section, Status, Gender, Admission Date Range, Guardian Link Status -- all URL-synced with cascade-clear logic
- **Active filter pills** with individual remove and "Reset All"
- **More Filters** dialog for gender, date range, and guardian status
- **Responsive table:** Desktop table view with avatar initials, name, email, admission number, program, section, status badge; Mobile card view
- **Pagination:** Prev/Next with page info

### 2.2 New Student Admission (`/admin/students/new`)

A two-column form for quick student creation:

- **Personal Information:** First name, last name, email
- **Academic Assignment:** Admission number, program selector (fetched from API)
- Form validation, loading states, success redirect with confirmation animation

### 2.3 Student Detail Page (`/admin/students/[studentId]`)

A comprehensive profile view with tabbed interface:

- **Profile sidebar:** Avatar, name, program, email, admission number, section
- **Tabs:** Overview, Academics, Attendance (latter two as placeholder shells)
- **Overview tab sections:**
  - Personal Information (name, DOB, gender, blood group)
  - Contact Information (email, phone)
  - Address (full address)
  - Guardian Information (father/mother/guardian names and phones)
  - Admission Details (student ID, admission number, date, status)
  - Academic History (previous education records)
  - Documents (list with verification status badges)
- Quick actions: Edit Profile, View Transcript

---

## 3. Tenant Admin Student Management (`/tenant-admin/students`)

### 3.1 Student List Page

A feature-rich student management interface using composable feature components:

- **StudentToolbar:** Search, Refresh, Saved Views, Export, Import, Add Student actions
- **StudentFilters:**
  - Quick filter chips (14 preset views): All Students, Active Students, New Admissions, Applicants, Graduating This Year, Suspended, Withdrawn, Fee Due, Below Threshold, Missing Documents, Pending Verification, Certificate Requests, Scholarship Students, Recently Updated
  - Pinned filters: Admission Date, Program, Department, Batch, Section, Semester, Student Status, Academic Year, Guardian Phone, Email, Fee Status, Document Status, Attendance Status
  - **Advanced Filters** panel: Identification (name, ID, admission/roll/registration numbers, government ID), Admission Details (source, category, quota, type), Academic (graduation year, course, year of study), Contact & Guardian (mobile, city, state, guardian name)
- **StudentTable:** Paginated data table with avatar, name, student ID, program, semester, status, contact columns. Click-to-navigate to profile. Checkbox selection support.

### 3.2 Student Profile (`/tenant-admin/students/[studentId]`)

- **StudentHeader:** Breadcrumb navigation, large avatar, name, status badge, program/semester/batch info, quick actions (Edit, Print, Generate Certificate, More)
- **StudentTabs:** 12-tab interface:
  - Overview, Personal Info, Contact, Guardian, Admission, Academic, Attendance, Examination, Fee Summary, Documents, Certificates, Timeline
  - **Overview tab** implemented with full content
  - **Documents tab** implemented
  - **Timeline tab** implemented
  - Remaining tabs as shell placeholders for future API integration

### 3.3 New Student Registration (`/tenant-admin/students/new`)

A **multi-step registration wizard** with progress stepper:

| Step                | Icon      | Fields                                    |
| ------------------- | --------- | ----------------------------------------- |
| 1. Personal Info    | User      | First name, last name, DOB, gender, email |
| 2. Guardian Details | Users     | (Placeholder for production fields)       |
| 3. Academic Record  | BookOpen  | (Placeholder for production fields)       |
| 4. Documents        | FileCheck | (Placeholder for production fields)       |

- Animated step transitions, Previous/Next navigation, Submit Registration on final step

### 3.4 Admissions Dashboard (`/tenant-admin/students/admissions`)

- **Stats cards:** Total Active Campaigns, Overall Conversion Rate, Total Seats Filled, Pending Bulk Offers
- **AdmissionCyclesList** component for managing admission cycles
- **SeatMatrixTracker** for capacity monitoring
- **AdmissionsToolbar** and **AdmissionsFilters** for search and filtering

### 3.5 Applicant Profile (`/tenant-admin/students/admissions/[applicationId]`)

- Applicant header with avatar, name, application ID, applied date, status badge
- **ApplicantProfileTabs** (shared component) for detailed applicant review
- Actions: Reject, Approve & Offer

### 3.6 Applicants Dashboard (`/tenant-admin/students/applicants`)

- **Stats:** Applications Awaiting Review, Documents Pending Verification, Offers Awaiting Acceptance, Ready for Enrollment
- **ApplicantsToolbar**, **ApplicantsFilters**, **ApplicantsTable**
- Paginated table with Previous/Next navigation

### 3.7 Applicant Review (`/tenant-admin/students/applicants/[applicationId]`)

- Progress pipeline visualization: Application -> Verification & Decision -> Offers & Fees -> Enrollment Setup
- Actions: Assign Officer, Reject, Verify Documents
- **ApplicantProfileTabs** for full profile review

---

## 4. Shared UI Components

### Layout Components (`components/student/layout/`)

| Component          | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StudentSidebar`   | Collapsible desktop sidebar (64px collapsed, 256px expanded) with 9 navigation items, logo, and "Powered by Student ERP" footer. State managed via `useSidebarStore` |
| `StudentNavbar`    | Sticky top bar with mobile hamburger, breadcrumbs, notification bell, user avatar/name/code, and logout button                                                       |
| `StudentMobileNav` | Slide-in mobile drawer with backdrop overlay, body scroll lock, and same nav items as sidebar                                                                        |
| `NotificationBell` | Bell icon with unread count badge (99+ cap), popup dialog with notification list, mark-as-read (individual and bulk), relative timestamps                            |

### Dashboard Components (`components/student/dashboard/`)

All dashboard cards use the `useStudentDashboard` or `useStudentAttendanceSummary` hooks from `@student-erp/hooks` and include loading skeletons and error states.

---

## 5. API Layer & Data Hooks

### Feature API (`features/students/api/`)

| Hook                    | Endpoint                  | Purpose                                                                |
| ----------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `useStudentDashboard()` | `GET /student/dashboard`  | Aggregated dashboard data (schedule, deadlines, events, announcements) |
| `useStudentProfile()`   | `GET /student/me`         | Current student's full profile                                         |
| `useStudents(query)`    | `GET /admin/students`     | Paginated student list with filters                                    |
| `useStudent(id)`        | `GET /admin/students/:id` | Single student detail (admin)                                          |

### Shared Hooks (from `@student-erp/hooks`)

- `useStudentCourses`, `useStudentCourse`, `useStudentCourseAttendance`
- `useStudentTimetable`, `useStudentCalendar`
- `useStudentAttendanceSummary`
- `useStudentCertificates`, `useStudentNotifications`
- `useStudentFeedback`, `useStudentClubs`
- `useCreateGrievance`
- `useUpdateStudentProfile`
- `useMarkNotificationAsRead`, `useMarkAllNotificationsAsRead`
- `useAdminStudents`, `useAdminStudent`

---

## 6. Technical Highlights

- **Framework:** Next.js (App Router) with server-side role gating (`requireRoleOrRedirect`)
- **State Management:** React Query (TanStack Query) for server state; Zustand stores for sidebar state
- **UI Library:** Custom `@student-erp/ui` component library (Card, Badge, Button, Dialog, Table, Tabs, Skeleton, etc.)
- **Styling:** Tailwind CSS with CSS custom properties, dark mode support throughout
- **File Storage:** Supabase Storage for student profile photos (`student_profile_bucket`)
- **Responsive Design:** Every page and component supports both desktop (table/grid layouts) and mobile (card/list layouts) with breakpoint-aware rendering
- **Animations:** Framer Motion for stat card entrance animations, CSS transitions for sidebar and navigation
- **URL-Synced Filters:** Admin filters are persisted in URL search params for shareable/bookmarkable filter states

---

## 7. Page Inventory

### Student-Facing Routes (11 pages)

| Route                         | Page              |
| ----------------------------- | ----------------- |
| `/student`                    | Dashboard         |
| `/student/profile`            | Profile           |
| `/student/timetable`          | Timetable         |
| `/student/courses`            | My Courses        |
| `/student/courses/[courseId]` | Course Workspace  |
| `/student/calendar`           | Calendar          |
| `/student/certificates`       | Certificates      |
| `/student/notifications`      | Notifications     |
| `/student/clubs`              | Clubs & Societies |
| `/student/feedback`           | Feedback          |
| `/student/grievance`          | Grievance         |

### Admin Routes (9 pages)

| Route                                      | Page                                                |
| ------------------------------------------ | --------------------------------------------------- |
| `/admin/students`                          | Student List                                        |
| `/admin/students/new`                      | New Admission                                       |
| `/admin/students/[studentId]`              | Student Detail (Overview/Academics/Attendance tabs) |
| `/admin/students/[studentId]/profile`      | Profile (placeholder)                               |
| `/admin/students/[studentId]/documents`    | Documents (placeholder)                             |
| `/admin/students/[studentId]/academics`    | Academics (placeholder)                             |
| `/admin/students/[studentId]/attendance`   | Attendance (placeholder)                            |
| `/admin/students/[studentId]/history`      | History (placeholder)                               |
| `/admin/students/[studentId]/examinations` | Examinations (placeholder)                          |

### Tenant Admin Routes (7 pages)

| Route                                               | Page                               |
| --------------------------------------------------- | ---------------------------------- |
| `/tenant-admin/students`                            | Student List                       |
| `/tenant-admin/students/new`                        | Registration Wizard                |
| `/tenant-admin/students/[studentId]`                | Student Profile (12-tab interface) |
| `/tenant-admin/students/admissions`                 | Admissions Dashboard               |
| `/tenant-admin/students/admissions/[applicationId]` | Admission Applicant Review         |
| `/tenant-admin/students/applicants`                 | Applicants Dashboard               |
| `/tenant-admin/students/applicants/[applicationId]` | Applicant Review                   |

---

## 8. Component Inventory

### Student Components (22 components)

- **Layout (4):** `StudentSidebar`, `StudentNavbar`, `StudentMobileNav`, `NotificationBell`
- **Dashboard (6):** `StudentWelcomeHeader`, `TodayScheduleCard`, `AttendanceOverviewCard`, `UpcomingDeadlinesCard`, `UpcomingEventsCard`, `RecentAnnouncements`
- **Profile (2):** `ProfileBanner`, `AboutSection` (5 exported sections: Personal, Contact, Address, Academic, Guardian)
- **Courses/Attendance (5):** `CourseAttendance`, `AttendanceSummary`, `AttendanceFilters`, `AttendanceSessionList`, `AttendanceSessionItem`
- **Timetable (1):** `TimetableGrid`
- **Calendar (1):** `CalendarView`
- **Grievance (1):** `GrievanceForm`

### Feature Components (8 components)

- `StudentToolbar`, `StudentFilters`, `StudentTable`
- `StudentHeader`, `StudentTabs` (with `OverviewTab`, `DocumentsTab`, `TimelineTab`)
- `RegistrationWizard`

---

## 9. Known Limitations & Future Work

- Several admin sub-pages (profile, documents, academics, attendance, history, examinations) are placeholder shells returning `null`
- Registration wizard steps 2-4 are UI shells without production form fields
- Tenant-admin StudentTabs: 9 of 12 tabs are placeholder "Content not implemented" states
- Calendar uses a simplified month grid (not a full date library implementation)
- Feedback submission is client-side simulated (not persisted)
- Timetable week navigation buttons are present but not yet wired to date range changes
