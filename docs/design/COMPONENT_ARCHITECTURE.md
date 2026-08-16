# Student ERP — Complete Component Architecture

> **Version:** 1.0.0 | **Date:** 2026-08-05 | **Status:** Architecture Design (Pre-Implementation)  
> **Scope:** 4 Portals × 220 Screens × ~800 Components

---

## Table of Contents

1. [Product Analysis](#1-product-analysis)
2. [Design System Foundation](#2-design-system-foundation)
3. [Complete Component Inventory](#3-complete-component-inventory)
4. [Component Hierarchy Per Screen](#4-component-hierarchy-per-screen)
5. [Component Specifications](#5-component-specifications)
6. [shadcn Mapping](#6-shadcn-mapping)
7. [Component Ownership](#7-component-ownership)
8. [Reusability Matrix](#8-reusability-matrix)
9. [Folder Structure](#9-folder-structure)
10. [Dependency Graph](#10-dependency-graph)
11. [Form Architecture](#11-form-architecture)
12. [Table Architecture](#12-table-architecture)
13. [Dialog Architecture](#13-dialog-architecture)
14. [Loading States](#14-loading-states)
15. [Empty States](#15-empty-states)
16. [Error States](#16-error-states)
17. [Responsive Behavior](#17-responsive-behavior)
18. [Accessibility](#18-accessibility)
19. [Animations](#19-animations)
20. [Naming Conventions](#20-naming-conventions)
21. [Development Roadmap](#21-development-roadmap)
22. [Future Extensibility](#22-future-extensibility)

---

# 1. Product Analysis

## 1.1 Product Vision

A modern cloud-based Student ERP digitizing the complete academic lifecycle for educational institutions. The system serves 4 primary portals (Admin, Student, Faculty, Guardian) across 12 core modules with 220 defined screens.

## 1.2 Personas & Portals

| Portal       | Primary Personas                                                                                                | Secondary Personas                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Admin**    | Institution Administrator, Academic Administrator, Department Administrator, Campus Administrator, Office Staff | Admissions Staff, Examination Staff, Finance Staff, HR Staff, Communication Staff |
| **Student**  | Student, Applicant                                                                                              | Alumni                                                                            |
| **Faculty**  | Faculty, Teaching Assistant                                                                                     | Research Staff, Laboratory Staff                                                  |
| **Guardian** | Guardian (Parent/Sponsor)                                                                                       | —                                                                                 |

## 1.3 Core Modules

| Module                         | Screens | Priority | Components (Est.) |
| ------------------------------ | ------- | -------- | ----------------- |
| Platform Foundation            | 18      | P0       | ~90               |
| Institution Management         | 19      | P0       | ~95               |
| Admissions & Student Lifecycle | 24      | P0       | ~120              |
| Teacher Lifecycle              | 18      | P0       | ~90               |
| Attendance Management          | 16      | P0       | ~80               |
| Marks & Student Promotion      | 20      | P0       | ~100              |
| Timetable Generator            | 15      | P0       | ~75               |
| Certificate Issuing            | 18      | P1       | ~90               |
| Teacher Promotion              | 10      | P1       | ~50               |
| Transport                      | 12      | P2       | ~60               |
| Integrations                   | 10      | P2       | ~50               |
| Student Portal                 | 12      | P0       | ~60               |
| Faculty Portal                 | 12      | P0       | ~60               |
| Guardian Portal                | 8       | P0       | ~40               |
| Common Screens                 | 8       | P0       | ~40               |
| **Total**                      | **220** | —        | **~1,100**        |

## 1.4 User Goals Per Portal

### Admin Portal Goals

- Manage institution configuration (departments, programs, courses)
- Oversee student lifecycle (admissions → graduation)
- Monitor faculty assignments and performance
- Track attendance and examination results
- Generate reports and certificates
- Manage users, roles, and permissions

### Student Portal Goals

- View timetable and attendance
- Access marks and results
- Request and download certificates
- View academic history
- Receive notifications and announcements

### Faculty Portal Goals

- Mark student attendance
- Enter and manage marks
- View class schedules
- Access student lists and performance
- Submit assignments and evaluations

### Guardian Portal Goals

- Monitor ward's attendance and results
- View timetable
- Track fee payments
- Receive notifications

## 1.5 Navigation Patterns

| Pattern                | Used In             | Components                                                |
| ---------------------- | ------------------- | --------------------------------------------------------- |
| **Sidebar Navigation** | All portals         | AppSidebar, SidebarMenu, SidebarMenuItem, SidebarCollapse |
| **Top Bar**            | All portals         | AppHeader, SearchBar, NotificationBell, UserMenu          |
| **Breadcrumbs**        | All pages           | Breadcrumb, BreadcrumbItem                                |
| **Tab Navigation**     | Multi-section pages | Tabs, TabsList, TabsTrigger                               |
| **Command Palette**    | Admin, Faculty      | CommandDialog, CommandInput, CommandList                  |
| **Bottom Navigation**  | Mobile              | MobileNav, MobileNavItem                                  |

## 1.6 Repeated UI Patterns

| Pattern                 | Frequency   | Current Solution                                      |
| ----------------------- | ----------- | ----------------------------------------------------- |
| Data table with filters | 80+ screens | DataTable + FilterBar                                 |
| Entity detail page      | 40+ screens | EntityHeader + EntityDetails                          |
| Stats dashboard         | 15+ screens | StatsGrid + StatCard                                  |
| Form with validation    | 60+ screens | FormField + FormSection                               |
| Status workflow         | 30+ screens | StatusBadge + StatusTimeline                          |
| CRUD operations         | 50+ screens | EntityList + CreateDialog + EditDialog + DeleteDialog |
| Search and filter       | 40+ screens | SearchBar + FilterBar + ActiveFilters                 |
| Activity timeline       | 20+ screens | ActivityTimeline + TimelineItem                       |
| File upload/management  | 25+ screens | FileUploader + FileList + FilePreview                 |
| Export/Import           | 30+ screens | ExportMenu + ImportDialog                             |

## 1.7 Accessibility Concerns

| Concern                  | Mitigation                                               |
| ------------------------ | -------------------------------------------------------- |
| Screen reader navigation | ARIA landmarks, labels, live regions                     |
| Keyboard navigation      | Focus management, tab order, keyboard shortcuts          |
| Color contrast           | WCAG AA minimum (4.5:1 text, 3:1 UI)                     |
| Reduced motion           | `prefers-reduced-motion` media query                     |
| Focus indicators         | Visible focus rings on all interactive elements          |
| Form validation          | Inline error messages with `aria-describedby`            |
| Data tables              | Proper `scope`, `caption`, sortable column announcements |
| Modal management         | Focus trap, `aria-modal`, escape to close                |
| Loading states           | `aria-busy`, `aria-live="polite"`                        |

---

# 2. Design System Foundation

## 2.1 Design Tokens

```
Colors:
  - Primary:     Blue scale (shadcn default)
  - Secondary:   Slate scale
  - Success:     Green scale
  - Warning:     Amber scale
  - Error:       Red scale
  - Info:        Sky scale
  - Muted:       Gray scale

Typography:
  - Font Family: Inter (or system font stack)
  - Headings:    600-700 weight
  - Body:        400 weight
  - Mono:        JetBrains Mono (code)

Spacing:    4px base unit (Tailwind default)
Radius:     0.375rem (shadcn default)
Shadows:    sm, md, lg (shadcn default)
Animations: 150ms-300ms duration
```

## 2.2 Component Categories

```
components/
├── ui/                    # Category A: shadcn primitives + global shared
├── shared/                # Category B: shared business components
├── student/               # Category C: student persona
├── faculty/               # Category C: faculty persona
├── admin/                 # Category C: admin persona
├── guardian/              # Category C: guardian persona
└── features/              # Category D: feature modules
    ├── auth/
    ├── attendance/
    ├── academics/
    ├── examinations/
    ├── marks/
    ├── certificates/
    ├── timetable/
    ├── admissions/
    ├── students/
    ├── faculty/
    └── settings/
```

## 2.3 Component Type Classification

| Type          | Description         | Rendering     | Use Case                        |
| ------------- | ------------------- | ------------- | ------------------------------- |
| **Primitive** | Atomic UI elements  | Client        | Button, Input, Badge            |
| **Molecule**  | Composed primitives | Client/Server | SearchInput, StatusBadge        |
| **Organism**  | Complex UI sections | Server/Client | DataTable, DashboardStats       |
| **Template**  | Page layouts        | Server        | DashboardLayout, DetailLayout   |
| **Page**      | Route components    | Server        | StudentListPage, AttendancePage |

---

# 3. Complete Component Inventory

## 3.1 Category A — Global Shared UI Components

### 3.1.1 Primitives (shadcn)

| #   | Component      | shadcn? | Priority  | Files                   |
| --- | -------------- | ------- | --------- | ----------------------- |
| 1   | Button         | ✅ Yes  | Core      | component.tsx, types.ts |
| 2   | Card           | ✅ Yes  | Core      | component.tsx, types.ts |
| 3   | Input          | ✅ Yes  | Core      | component.tsx, types.ts |
| 4   | Select         | ✅ Yes  | Core      | component.tsx, types.ts |
| 5   | Checkbox       | ✅ Yes  | Core      | component.tsx, types.ts |
| 6   | RadioGroup     | ✅ Yes  | Core      | component.tsx, types.ts |
| 7   | Switch         | ✅ Yes  | Core      | component.tsx, types.ts |
| 8   | Textarea       | ✅ Yes  | Core      | component.tsx, types.ts |
| 9   | Label          | ✅ Yes  | Core      | component.tsx, types.ts |
| 10  | Badge          | ✅ Yes  | Core      | component.tsx, types.ts |
| 11  | Avatar         | ✅ Yes  | Core      | component.tsx, types.ts |
| 12  | Separator      | ✅ Yes  | Core      | component.tsx, types.ts |
| 13  | ScrollArea     | ✅ Yes  | Core      | component.tsx, types.ts |
| 14  | Tooltip        | ✅ Yes  | Core      | component.tsx, types.ts |
| 15  | Popover        | ✅ Yes  | Core      | component.tsx, types.ts |
| 16  | Dialog         | ✅ Yes  | Core      | component.tsx, types.ts |
| 17  | AlertDialog    | ✅ Yes  | Core      | component.tsx, types.ts |
| 18  | Sheet          | ✅ Yes  | Core      | component.tsx, types.ts |
| 19  | DropdownMenu   | ✅ Yes  | Core      | component.tsx, types.ts |
| 20  | ContextMenu    | ✅ Yes  | Important | component.tsx, types.ts |
| 21  | Tabs           | ✅ Yes  | Core      | component.tsx, types.ts |
| 22  | Accordion      | ✅ Yes  | Core      | component.tsx, types.ts |
| 23  | HoverCard      | ✅ Yes  | Important | component.tsx, types.ts |
| 24  | Command        | ✅ Yes  | Core      | component.tsx, types.ts |
| 25  | NavigationMenu | ✅ Yes  | Core      | component.tsx, types.ts |
| 26  | Breadcrumb     | ✅ Yes  | Core      | component.tsx, types.ts |
| 27  | Calendar       | ✅ Yes  | Core      | component.tsx, types.ts |
| 28  | Pagination     | ✅ Yes  | Core      | component.tsx, types.ts |
| 29  | Table          | ✅ Yes  | Core      | component.tsx, types.ts |
| 30  | Skeleton       | ✅ Yes  | Core      | component.tsx, types.ts |
| 31  | Progress       | ✅ Yes  | Core      | component.tsx, types.ts |
| 32  | Toast          | ✅ Yes  | Core      | component.tsx, types.ts |
| 33  | Form           | ✅ Yes  | Core      | component.tsx, types.ts |
| 34  | Resizable      | ✅ Yes  | Optional  | component.tsx, types.ts |
| 35  | ToggleGroup    | ✅ Yes  | Optional  | component.tsx, types.ts |
| 36  | Carousel       | ✅ Yes  | Optional  | component.tsx, types.ts |
| 37  | Chart          | ✅ Yes  | Important | component.tsx, types.ts |
| 38  | InputOTP       | ✅ Yes  | Optional  | component.tsx, types.ts |
| 39  | Sidebar        | ✅ Yes  | Core      | component.tsx, types.ts |

### 3.1.2 Global Shared Components (Custom)

| #   | Component          | Purpose                      | shadcn Used                                    | Priority  | Files                             |
| --- | ------------------ | ---------------------------- | ---------------------------------------------- | --------- | --------------------------------- |
| 40  | AppLogo            | Institution logo + name      | —                                              | Core      | component.tsx, types.ts           |
| 41  | ThemeSwitcher      | Dark/light mode toggle       | Button                                         | Core      | component.tsx, types.ts, hooks.ts |
| 42  | SearchInput        | Global search field          | Input, Button, Kbd                             | Core      | component.tsx, types.ts           |
| 43  | PhoneInput         | Phone with country code      | Input, Popover, Select                         | Core      | component.tsx, types.ts           |
| 44  | DatePicker         | Single date picker           | Calendar, Popover, Button                      | Core      | component.tsx, types.ts           |
| 45  | DateRangePicker    | Date range selection         | Calendar, Popover, Button                      | Core      | component.tsx, types.ts           |
| 46  | TimePicker         | Time selection               | Input, Popover, ScrollArea                     | Core      | component.tsx, types.ts           |
| 47  | FileUploader       | Drag-drop file upload        | Button, Card, Progress                         | Core      | component.tsx, types.ts, hooks.ts |
| 48  | RichTextEditor     | WYSIWYG editor               | —                                              | Important | component.tsx, types.ts           |
| 49  | CommandPalette     | Global command search        | Command, Dialog                                | Core      | component.tsx, types.ts, hooks.ts |
| 50  | StatCard           | Metric display card          | Card, Badge                                    | Core      | component.tsx, types.ts           |
| 51  | MetricCard         | Trending metric card         | Card, Badge, Progress                          | Core      | component.tsx, types.ts           |
| 52  | ChartContainer     | Chart wrapper                | Card, Skeleton                                 | Core      | component.tsx, types.ts           |
| 53  | DataTable          | Advanced data table          | Table, Input, Button, DropdownMenu, Pagination | Core      | component.tsx, types.ts, hooks.ts |
| 54  | FilterBar          | Multi-filter controls        | Button, Popover, Select, Badge                 | Core      | component.tsx, types.ts           |
| 55  | ActiveFilters      | Applied filter chips         | Badge, Button                                  | Core      | component.tsx, types.ts           |
| 56  | LoadingSkeleton    | Page/section skeleton        | Skeleton                                       | Core      | component.tsx, types.ts           |
| 57  | EmptyState         | No-data placeholder          | Button, Icon                                   | Core      | component.tsx, types.ts           |
| 58  | ErrorState         | Error display with retry     | Button, AlertTriangle                          | Core      | component.tsx, types.ts           |
| 59  | ConfirmDialog      | Confirmation modal           | AlertDialog, Button                            | Core      | component.tsx, types.ts           |
| 60  | DeleteDialog       | Delete confirmation          | AlertDialog, Button, AlertTriangle             | Core      | component.tsx, types.ts           |
| 61  | StatusBadge        | Colored status indicator     | Badge                                          | Core      | component.tsx, types.ts           |
| 62  | ActivityTimeline   | Activity feed                | —                                              | Core      | component.tsx, types.ts           |
| 63  | TimelineItem       | Single timeline entry        | Avatar, Badge, Separator                       | Core      | component.tsx, types.ts           |
| 64  | NotificationBell   | Notification indicator       | Badge, Popover, Button                         | Core      | component.tsx, types.ts, hooks.ts |
| 65  | UserMenu           | User dropdown menu           | DropdownMenu, Avatar, Button                   | Core      | component.tsx, types.ts           |
| 66  | SearchBar          | Enhanced search with filters | Command, Dialog, Input                         | Core      | component.tsx, types.ts           |
| 67  | PageHeader         | Page title + actions         | Button, Separator, Breadcrumb                  | Core      | component.tsx, types.ts           |
| 68  | SectionTitle       | Section heading              | —                                              | Core      | component.tsx, types.ts           |
| 69  | EntityHeader       | Entity detail header         | Avatar, Badge, Button, Separator               | Core      | component.tsx, types.ts           |
| 70  | PaginationControls | Advanced pagination          | Pagination, Select, Button                     | Core      | component.tsx, types.ts           |
| 71  | ExportMenu         | Export dropdown              | DropdownMenu, Button                           | Core      | component.tsx, types.ts, hooks.ts |
| 72  | ImportDialog       | CSV/Excel import             | Dialog, Button, Progress                       | Core      | component.tsx, types.ts, hooks.ts |
| 73  | BulkActionToolbar  | Bulk action bar              | Button, Checkbox, Separator                    | Core      | component.tsx, types.ts           |
| 74  | StickyActionBar    | Sticky bottom action bar     | Button, Separator                              | Core      | component.tsx, types.ts           |
| 75  | InfiniteScroll     | Lazy load on scroll          | Spinner                                        | Important | component.tsx, types.ts, hooks.ts |
| 76  | EntitySelector     | Searchable entity picker     | Command, Dialog, Avatar                        | Core      | component.tsx, types.ts, hooks.ts |
| 77  | PermissionGuard    | Role/permission wrapper      | —                                              | Core      | component.tsx, types.ts           |
| 78  | AuditLog           | Audit trail display          | Timeline, Badge                                | Important | component.tsx, types.ts           |
| 79  | HistoryDrawer      | Change history drawer        | Sheet, Timeline                                | Important | component.tsx, types.ts           |
| 80  | CommentPanel       | Comments/discussion          | Avatar, Button, Textarea                       | Important | component.tsx, types.ts, hooks.ts |
| 81  | NotesPanel         | Notes/remarks                | Textarea, Button                               | Important | component.tsx, types.ts           |
| 82  | ImageUploader      | Image upload with preview    | FileUploader, Avatar                           | Important | component.tsx, types.ts           |
| 83  | PDFViewer          | PDF document viewer          | —                                              | Optional  | component.tsx, types.ts           |
| 84  | AttachmentViewer   | File attachment list         | FileIcon, Button, ScrollArea                   | Core      | component.tsx, types.ts           |
| 85  | QuickAction        | Dashboard quick action       | Button, Icon                                   | Core      | component.tsx, types.ts           |
| 86  | QuickActionsGrid   | Grid of quick actions        | QuickAction                                    | Core      | component.tsx, types.ts           |
| 87  | DataGrid           | Spreadsheet-like grid        | Table, Input, Checkbox                         | Important | component.tsx, types.ts, hooks.ts |
| 88  | KanbanBoard        | Drag-drop kanban             | —                                              | Optional  | component.tsx, types.ts, hooks.ts |
| 89  | TreeNode           | Hierarchical tree item       | —                                              | Optional  | component.tsx, types.ts           |
| 90  | TreeView           | Tree structure               | TreeNode, ScrollArea                           | Optional  | component.tsx, types.ts           |

---

## 3.2 Category B — Shared Business Components

| #   | Component               | Purpose                    | shadcn Used                      | Priority  | Files                             |
| --- | ----------------------- | -------------------------- | -------------------------------- | --------- | --------------------------------- |
| 91  | ProfileCard             | User profile summary       | Card, Avatar, Badge              | Core      | component.tsx, types.ts           |
| 92  | AddressCard             | Address display/edit       | Card, Button                     | Core      | component.tsx, types.ts           |
| 93  | PersonAvatar            | Person with role badge     | Avatar, Badge                    | Core      | component.tsx, types.ts           |
| 94  | AuditTimeline           | Audit trail timeline       | ActivityTimeline, TimelineItem   | Important | component.tsx, types.ts           |
| 95  | DocumentUploader        | Document upload with types | FileUploader, Select, Badge      | Core      | component.tsx, types.ts, hooks.ts |
| 96  | DocumentViewer          | Document preview/download  | Dialog, Button                   | Core      | component.tsx, types.ts           |
| 97  | SearchFilters           | Advanced search controls   | Input, Select, Button, Popover   | Core      | component.tsx, types.ts           |
| 98  | EntityList              | Generic entity list        | DataTable, FilterBar, PageHeader | Core      | component.tsx, types.ts           |
| 99  | EntityDetails           | Generic entity detail      | EntityHeader, Tabs, Card         | Core      | component.tsx, types.ts           |
| 100 | EntityForm              | Generic entity form        | Form, Button, StickyActionBar    | Core      | component.tsx, types.ts           |
| 101 | CalendarView            | Monthly/weekly calendar    | Calendar, Button, Badge          | Core      | component.tsx, types.ts, hooks.ts |
| 102 | ScheduleView            | Time-slot schedule         | Table, Badge, Button             | Core      | component.tsx, types.ts           |
| 103 | NotificationCenter      | Notification list          | ScrollArea, Badge, Button        | Core      | component.tsx, types.ts, hooks.ts |
| 104 | ApprovalQueue           | Pending approval list      | Card, Button, Badge, Avatar      | Core      | component.tsx, types.ts, hooks.ts |
| 105 | StatusTimeline          | Status workflow timeline   | ActivityTimeline, Badge          | Core      | component.tsx, types.ts           |
| 106 | WorkflowStepper         | Multi-step workflow        | Steps, Button                    | Core      | component.tsx, types.ts           |
| 107 | PrintButton             | Print document             | Button                           | Core      | component.tsx, types.ts           |
| 108 | DownloadButton          | Download file              | Button                           | Core      | component.tsx, types.ts           |
| 109 | ShareButton             | Share entity               | Button, Dialog                   | Important | component.tsx, types.ts           |
| 110 | QRCodeDisplay           | QR code for verification   | —                                | Important | component.tsx, types.ts           |
| 111 | DigitalSignature        | Digital signature pad      | —                                | Optional  | component.tsx, types.ts           |
| 112 | NotificationPreferences | Notification settings      | Switch, Select, Card             | Core      | component.tsx, types.ts           |
| 113 | RoleBadge               | Role with color coding     | Badge                            | Core      | component.tsx, types.ts           |
| 114 | PermissionBadge         | Permission indicator       | Badge                            | Core      | component.tsx, types.ts           |
| 115 | StatusFlow              | Entity lifecycle status    | Steps, Badge, Button             | Core      | component.tsx, types.ts           |
| 116 | ComparisonView          | Side-by-side comparison    | Card, ScrollArea                 | Optional  | component.tsx, types.ts           |
| 117 | RevisionHistory         | Document revision history  | Timeline, Badge                  | Important | component.tsx, types.ts           |
| 118 | ConfirmationStep        | Multi-step confirmation    | Steps, Button, Card              | Important | component.tsx, types.ts           |

---

## 3.3 Category C — Persona Components

### 3.3.1 Student Persona

| #   | Component           | Purpose                   | shadcn Used         | Priority | Files                   |
| --- | ------------------- | ------------------------- | ------------------- | -------- | ----------------------- |
| 119 | StudentGreeting     | Welcome message with name | —                   | Core     | component.tsx, types.ts |
| 120 | StudentStatsCard    | Quick stats grid          | Card, Badge         | Core     | component.tsx, types.ts |
| 121 | AttendanceProgress  | Attendance ring/bar       | Progress, Card      | Core     | component.tsx, types.ts |
| 122 | FeeReminderCard     | Upcoming fee alert        | Card, Badge, Button | Core     | component.tsx, types.ts |
| 123 | UpcomingExamCard    | Next exam info            | Card, Badge         | Core     | component.tsx, types.ts |
| 124 | RecentAnnouncements | Latest announcements      | Card, Badge         | Core     | component.tsx, types.ts |
| 125 | TimetablePreview    | Today's schedule          | Card, Badge         | Core     | component.tsx, types.ts |
| 126 | PerformanceGraph    | Grade trend chart         | ChartContainer      | Core     | component.tsx, types.ts |
| 127 | NoticeBoard         | Notice display            | Card, ScrollArea    | Core     | component.tsx, types.ts |
| 128 | UpcomingAssignments | Assignment list           | Card, Badge, Button | Core     | component.tsx, types.ts |
| 129 | CGPACard            | CGPA display              | Card, Badge         | Core     | component.tsx, types.ts |
| 130 | SemesterSelector    | Semester picker           | Select, Tabs        | Core     | component.tsx, types.ts |
| 131 | StudentTimetable    | Personal timetable        | Table, Badge        | Core     | component.tsx, types.ts |
| 132 | StudentAssignments  | Assignment list           | DataTable, Badge    | Core     | component.tsx, types.ts |
| 133 | StudentCertificates | Certificate list          | EntityList, Card    | Core     | component.tsx, types.ts |
| 134 | StudentDocuments    | Document list             | AttachmentViewer    | Core     | component.tsx, types.ts |
| 135 | AcademicProgress    | Degree progress           | Progress, Card      | Core     | component.tsx, types.ts |
| 136 | EnrollmentStatus    | Enrollment info           | Badge, Card         | Core     | component.tsx, types.ts |

### 3.3.2 Faculty Persona

| #   | Component              | Purpose                 | shadcn Used                  | Priority | Files                             |
| --- | ---------------------- | ----------------------- | ---------------------------- | -------- | --------------------------------- |
| 137 | FacultySchedule        | Today's classes         | Table, Badge                 | Core     | component.tsx, types.ts           |
| 138 | StudentSubmissionCard  | Student submission      | Card, Avatar, Button         | Core     | component.tsx, types.ts           |
| 139 | ClassStatistics        | Class performance stats | Card, Chart                  | Core     | component.tsx, types.ts           |
| 140 | FacultyAttendanceTable | Attendance marking      | Table, Checkbox, Button      | Core     | component.tsx, types.ts, hooks.ts |
| 141 | CourseProgress         | Course completion       | Progress, Card               | Core     | component.tsx, types.ts           |
| 142 | MarksEntryForm         | Marks input form        | Form, Input, Button          | Core     | component.tsx, types.ts, hooks.ts |
| 143 | StudentListCard        | Student roster          | Card, Avatar, Badge          | Core     | component.tsx, types.ts           |
| 144 | TeachingLoad           | Course load display     | Card, Badge                  | Core     | component.tsx, types.ts           |
| 145 | AssignmentCreator      | Create assignment       | Form, RichTextEditor, Button | Core     | component.tsx, types.ts, hooks.ts |
| 146 | GradeBook              | Grade management        | DataTable, Badge             | Core     | component.tsx, types.ts           |
| 147 | ClassRoster            | Student class list      | DataTable, Avatar, Badge     | Core     | component.tsx, types.ts           |
| 148 | FacultyProfileCard     | Faculty info card       | Card, Avatar, Badge          | Core     | component.tsx, types.ts           |
| 149 | QualificationCard      | Qualification display   | Card, Badge                  | Core     | component.tsx, types.ts           |
| 150 | ExperienceCard         | Experience display      | Card, Badge                  | Core     | component.tsx, types.ts           |

### 3.3.3 Admin Persona

| #   | Component             | Purpose               | shadcn Used              | Priority  | Files                             |
| --- | --------------------- | --------------------- | ------------------------ | --------- | --------------------------------- |
| 151 | DepartmentOverview    | Department stats      | Card, Chart, Badge       | Core      | component.tsx, types.ts           |
| 152 | ApprovalQueueCard     | Pending approvals     | Card, Badge, Button      | Core      | component.tsx, types.ts           |
| 153 | AnalyticsPanel        | Analytics dashboard   | ChartContainer, Card     | Core      | component.tsx, types.ts           |
| 154 | RoleManagement        | Role/permission admin | DataTable, Dialog, Badge | Core      | component.tsx, types.ts, hooks.ts |
| 155 | SystemHealth          | System status         | Card, Badge              | Important | component.tsx, types.ts           |
| 156 | AuditDashboard        | Audit log viewer      | DataTable, FilterBar     | Core      | component.tsx, types.ts           |
| 157 | UserManagement        | User admin            | DataTable, Dialog, Badge | Core      | component.tsx, types.ts, hooks.ts |
| 158 | InstitutionSetup      | Institution config    | Form, Steps, Card        | Core      | component.tsx, types.ts           |
| 159 | AcademicCalendarSetup | Calendar admin        | CalendarView, Form       | Core      | component.tsx, types.ts           |
| 160 | EnrollmentStats       | Enrollment metrics    | Card, Chart              | Core      | component.tsx, types.ts           |
| 161 | FacultyStats          | Faculty metrics       | Card, Chart              | Core      | component.tsx, types.ts           |
| 162 | AttendanceStats       | Attendance metrics    | Card, Chart              | Core      | component.tsx, types.ts           |
| 163 | ExamStats             | Exam metrics          | Card, Chart              | Core      | component.tsx, types.ts           |
| 164 | PromotionStats        | Promotion metrics     | Card, Chart              | Core      | component.tsx, types.ts           |
| 165 | AdmissionPipeline     | Admission funnel      | Card, Chart              | Core      | component.tsx, types.ts           |
| 166 | StudentDirectory      | Student search/list   | EntityList, FilterBar    | Core      | component.tsx, types.ts           |
| 167 | FacultyDirectory      | Faculty search/list   | EntityList, FilterBar    | Core      | component.tsx, types.ts           |

### 3.3.4 Guardian Persona

| #   | Component             | Purpose                   | shadcn Used           | Priority | Files                   |
| --- | --------------------- | ------------------------- | --------------------- | -------- | ----------------------- |
| 168 | ChildPerformance      | Ward's academic overview  | Card, Badge, Progress | Core     | component.tsx, types.ts |
| 169 | FeeStatus             | Fee payment status        | Card, Badge, Progress | Core     | component.tsx, types.ts |
| 170 | AttendanceOverview    | Ward's attendance         | Card, Progress        | Core     | component.tsx, types.ts |
| 171 | TeacherMessages       | Messages from teachers    | Card, Avatar, Badge   | Core     | component.tsx, types.ts |
| 172 | GuardianDashboard     | Guardian home             | StatsGrid, Card       | Core     | component.tsx, types.ts |
| 173 | WardSelector          | Select ward (multi-child) | Select, Avatar        | Core     | component.tsx, types.ts |
| 174 | GuardianNotifications | Guardian notifications    | NotificationCenter    | Core     | component.tsx, types.ts |

---

## 3.4 Category D — Feature Components

### 3.4.1 Authentication

| #   | Component          | Purpose                     | shadcn Used               | Priority  | Files                             |
| --- | ------------------ | --------------------------- | ------------------------- | --------- | --------------------------------- |
| 175 | LoginForm          | Login form                  | Form, Input, Button, Card | Core      | component.tsx, types.ts, hooks.ts |
| 176 | ForgotPasswordForm | Password reset request      | Form, Input, Button, Card | Core      | component.tsx, types.ts, hooks.ts |
| 177 | ResetPasswordForm  | Password reset              | Form, Input, Button, Card | Core      | component.tsx, types.ts, hooks.ts |
| 178 | ChangePasswordForm | Change password             | Form, Input, Button, Card | Core      | component.tsx, types.ts, hooks.ts |
| 179 | AuthLayout         | Auth page layout            | Card                      | Core      | component.tsx, types.ts           |
| 180 | SocialLoginButtons | Social login options        | Button                    | Optional  | component.tsx, types.ts           |
| 181 | PasswordStrength   | Password strength indicator | Progress, Badge           | Core      | component.tsx, types.ts           |
| 182 | SessionManager     | Active sessions list        | DataTable, Button         | Important | component.tsx, types.ts, hooks.ts |

### 3.4.2 Attendance

| #   | Component               | Purpose                 | shadcn Used                | Priority  | Files                             |
| --- | ----------------------- | ----------------------- | -------------------------- | --------- | --------------------------------- |
| 183 | AttendanceMarkingGrid   | Mark attendance grid    | Table, Checkbox, Button    | Core      | component.tsx, types.ts, hooks.ts |
| 184 | AttendanceCalendar      | Monthly attendance view | CalendarView, Badge        | Core      | component.tsx, types.ts           |
| 185 | AttendanceStatsCard     | Attendance statistics   | Card, Progress, Badge      | Core      | component.tsx, types.ts           |
| 186 | AttendanceDefaulterList | Defaulters list         | DataTable, Badge           | Core      | component.tsx, types.ts           |
| 187 | AttendanceReportCard    | Attendance report       | Card, Chart                | Core      | component.tsx, types.ts           |
| 188 | LeaveRequestForm        | Leave application       | Form, DatePicker, Button   | Core      | component.tsx, types.ts, hooks.ts |
| 189 | LeaveApprovalCard       | Leave approval          | Card, Button, Badge        | Core      | component.tsx, types.ts           |
| 190 | AttendanceSettings      | Attendance config       | Form, Switch, Card         | Core      | component.tsx, types.ts, hooks.ts |
| 191 | AttendanceExport        | Export attendance       | ExportMenu, Dialog         | Core      | component.tsx, types.ts           |
| 192 | PeriodAttendanceGrid    | Period-wise attendance  | Table, Badge               | Core      | component.tsx, types.ts           |
| 193 | AttendanceAlertCard     | Low attendance alert    | Card, Badge, AlertTriangle | Core      | component.tsx, types.ts           |
| 194 | AttendanceTrend         | Attendance trend chart  | ChartContainer             | Important | component.tsx, types.ts           |

### 3.4.3 Academics

| #   | Component            | Purpose                | shadcn Used                 | Priority  | Files                             |
| --- | -------------------- | ---------------------- | --------------------------- | --------- | --------------------------------- |
| 195 | AcademicYearSelector | Year picker            | Select                      | Core      | component.tsx, types.ts           |
| 196 | AcademicTermSelector | Term picker            | Select                      | Core      | component.tsx, types.ts           |
| 197 | DepartmentSelector   | Department picker      | Select, Command             | Core      | component.tsx, types.ts, hooks.ts |
| 198 | ProgramSelector      | Program picker         | Select, Command             | Core      | component.tsx, types.ts, hooks.ts |
| 199 | CourseSelector       | Course picker          | Select, Command             | Core      | component.tsx, types.ts, hooks.ts |
| 200 | SubjectSelector      | Subject picker         | Select, Command             | Core      | component.tsx, types.ts, hooks.ts |
| 201 | SectionSelector      | Section picker         | Select                      | Core      | component.tsx, types.ts           |
| 202 | BatchSelector        | Batch picker           | Select                      | Core      | component.tsx, types.ts           |
| 203 | DepartmentForm       | Department create/edit | Form, Input, Button         | Core      | component.tsx, types.ts, hooks.ts |
| 204 | ProgramForm          | Program create/edit    | Form, Input, Button, Select | Core      | component.tsx, types.ts, hooks.ts |
| 205 | CourseForm           | Course create/edit     | Form, Input, Button, Select | Core      | component.tsx, types.ts, hooks.ts |
| 206 | SubjectForm          | Subject create/edit    | Form, Input, Button, Select | Core      | component.tsx, types.ts, hooks.ts |
| 207 | CurriculumBuilder    | Curriculum structure   | TreeView, Button, Dialog    | Important | component.tsx, types.ts, hooks.ts |
| 208 | CreditStructure      | Credit configuration   | Form, Input, Button         | Core      | component.tsx, types.ts           |
| 209 | PrerequisiteMapper   | Course prerequisites   | TreeView, Dialog            | Optional  | component.tsx, types.ts           |
| 210 | AcademicCalendarView | Calendar with events   | CalendarView, Badge         | Core      | component.tsx, types.ts           |

### 3.4.4 Examinations

| #   | Component         | Purpose                     | shadcn Used                 | Priority | Files                             |
| --- | ----------------- | --------------------------- | --------------------------- | -------- | --------------------------------- |
| 211 | ExamSetupForm     | Exam configuration          | Form, Input, Select, Button | Core     | component.tsx, types.ts, hooks.ts |
| 212 | ExamSchedule      | Exam timetable              | Table, Badge                | Core     | component.tsx, types.ts           |
| 213 | HallAllocation    | Seating arrangement         | Table, Badge, Button        | Core     | component.tsx, types.ts, hooks.ts |
| 214 | HallTicket        | Student hall ticket         | Card, Badge, QRCodeDisplay  | Core     | component.tsx, types.ts           |
| 215 | ExamAttendance    | Exam attendance marking     | Table, Checkbox, Button     | Core     | component.tsx, types.ts           |
| 216 | ExamTypeSelector  | Exam type picker            | Select                      | Core     | component.tsx, types.ts           |
| 217 | ExamCalendar      | Exam schedule calendar      | CalendarView, Badge         | Core     | component.tsx, types.ts           |
| 218 | ConflictDetector  | Schedule conflict detection | Badge, AlertTriangle        | Core     | component.tsx, types.ts           |
| 219 | ExamStatsCard     | Exam statistics             | Card, Chart                 | Core     | component.tsx, types.ts           |
| 220 | ResultPublication | Result publish flow         | Steps, Button, Card         | Core     | component.tsx, types.ts, hooks.ts |

### 3.4.5 Marks & Grades

| #   | Component          | Purpose                  | shadcn Used             | Priority | Files                             |
| --- | ------------------ | ------------------------ | ----------------------- | -------- | --------------------------------- |
| 221 | MarksEntryGrid     | Marks input grid         | DataGrid, Input, Button | Core     | component.tsx, types.ts, hooks.ts |
| 222 | GradeCalculator    | GPA/CGPA calculator      | Card, Badge, Button     | Core     | component.tsx, types.ts           |
| 223 | GradeScale         | Grade scale display      | Table, Badge            | Core     | component.tsx, types.ts           |
| 224 | ResultCard         | Student result card      | Card, Badge, Table      | Core     | component.tsx, types.ts           |
| 225 | TranscriptView     | Academic transcript      | Card, Table, Badge      | Core     | component.tsx, types.ts           |
| 226 | MarksDistribution  | Marks distribution chart | ChartContainer          | Core     | component.tsx, types.ts           |
| 227 | SubjectPerformance | Subject-wise analysis    | Card, Chart, Badge      | Core     | component.tsx, types.ts           |
| 228 | BacklogIndicator   | Backlog count display    | Badge, Card             | Core     | component.tsx, types.ts           |
| 229 | GradeChip          | Individual grade badge   | Badge                   | Core     | component.tsx, types.ts           |
| 230 | RevaluationForm    | Revaluation request      | Form, Button, Card      | Core     | component.tsx, types.ts, hooks.ts |
| 231 | MarksVerification  | Marks verification flow  | Steps, Button, Badge    | Core     | component.tsx, types.ts, hooks.ts |
| 232 | CGPAProgress       | CGPA trend               | ChartContainer, Card    | Core     | component.tsx, types.ts           |
| 233 | PerformanceRank    | Rank display             | Badge, Card             | Core     | component.tsx, types.ts           |

### 3.4.6 Promotion

| #   | Component             | Purpose              | shadcn Used                 | Priority | Files                             |
| --- | --------------------- | -------------------- | --------------------------- | -------- | --------------------------------- |
| 234 | PromotionRulesForm    | Promotion criteria   | Form, Input, Switch, Button | Core     | component.tsx, types.ts, hooks.ts |
| 235 | PromotionReviewList   | Students for review  | DataTable, Badge, Button    | Core     | component.tsx, types.ts, hooks.ts |
| 236 | PromotionApproval     | Approval workflow    | Steps, Button, Card         | Core     | component.tsx, types.ts           |
| 237 | PromotionHistory      | Promotion history    | DataTable, Badge            | Core     | component.tsx, types.ts           |
| 238 | FailedStudentsList    | Failed students      | DataTable, Badge            | Core     | component.tsx, types.ts           |
| 239 | GraduationEligibility | Graduation check     | Card, Badge, Progress       | Core     | component.tsx, types.ts           |
| 240 | PromotionStats        | Promotion statistics | Card, Chart                 | Core     | component.tsx, types.ts           |

### 3.4.7 Certificates

| #   | Component                 | Purpose              | shadcn Used              | Priority  | Files                             |
| --- | ------------------------- | -------------------- | ------------------------ | --------- | --------------------------------- |
| 241 | CertificateTemplate       | Certificate preview  | Card, Badge              | Core      | component.tsx, types.ts           |
| 242 | CertificateRequestForm    | Request certificate  | Form, Select, Button     | Core      | component.tsx, types.ts, hooks.ts |
| 243 | CertificatePreview        | Preview certificate  | Dialog, Button           | Core      | component.tsx, types.ts           |
| 244 | CertificateApproval       | Approval flow        | Steps, Button, Badge     | Core      | component.tsx, types.ts           |
| 245 | CertificateDownload       | Download certificate | Button, DropdownMenu     | Core      | component.tsx, types.ts           |
| 246 | CertificateHistory        | Certificate log      | DataTable, Badge         | Core      | component.tsx, types.ts           |
| 247 | QRVerification            | QR code verification | QRCodeDisplay, Card      | Core      | component.tsx, types.ts           |
| 248 | DigitalSigner             | Digital signature    | DigitalSignature, Button | Important | component.tsx, types.ts           |
| 249 | CertificateTemplateEditor | Template editor      | Form, RichTextEditor     | Optional  | component.tsx, types.ts           |
| 250 | BulkCertificateGenerator  | Bulk generation      | Steps, Button, Progress  | Important | component.tsx, types.ts, hooks.ts |

### 3.4.8 Timetable

| #   | Component           | Purpose                      | shadcn Used                | Priority | Files                             |
| --- | ------------------- | ---------------------------- | -------------------------- | -------- | --------------------------------- |
| 251 | TimetableGrid       | Timetable display            | Table, Badge               | Core     | component.tsx, types.ts           |
| 252 | TimetableSlot       | Single time slot             | Card, Badge, Button        | Core     | component.tsx, types.ts           |
| 253 | TimetableEditor     | Manual timetable editing     | Table, DragDrop, Button    | Core     | component.tsx, types.ts, hooks.ts |
| 254 | RoomAllocation      | Room assignment              | Table, Select, Button      | Core     | component.tsx, types.ts, hooks.ts |
| 255 | FacultyAvailability | Faculty availability         | CalendarView, Badge        | Core     | component.tsx, types.ts           |
| 256 | ConflictResolver    | Resolve scheduling conflicts | Dialog, Button, Badge      | Core     | component.tsx, types.ts           |
| 257 | TimetablePublish    | Publish timetable            | Steps, Button              | Core     | component.tsx, types.ts           |
| 258 | HolidayCalendar     | Holiday management           | CalendarView, Form, Button | Core     | component.tsx, types.ts, hooks.ts |
| 259 | TimetableSettings   | Timetable config             | Form, Switch, Card         | Core     | component.tsx, types.ts           |
| 260 | WeeklyView          | Week timetable view          | Table, Badge               | Core     | component.tsx, types.ts           |

### 3.4.9 Admissions

| #   | Component            | Purpose             | shadcn Used               | Priority | Files                             |
| --- | -------------------- | ------------------- | ------------------------- | -------- | --------------------------------- |
| 261 | AdmissionForm        | Online application  | Form, Steps, Button       | Core     | component.tsx, types.ts, hooks.ts |
| 262 | AdmissionPipeline    | Admission funnel    | Card, Chart, Badge        | Core     | component.tsx, types.ts           |
| 263 | DocumentVerification | Verify documents    | Card, Button, Badge       | Core     | component.tsx, types.ts, hooks.ts |
| 264 | AdmissionApproval    | Approval workflow   | Steps, Button, Card       | Core     | component.tsx, types.ts           |
| 265 | SeatAllocation       | Seat assignment     | Card, Badge, Button       | Core     | component.tsx, types.ts, hooks.ts |
| 266 | ApplicantProfile     | Applicant details   | EntityHeader, Card, Badge | Core     | component.tsx, types.ts           |
| 267 | AdmissionStats       | Admission metrics   | Card, Chart               | Core     | component.tsx, types.ts           |
| 268 | EnrollmentWizard     | Student enrollment  | Steps, Form, Button       | Core     | component.tsx, types.ts, hooks.ts |
| 269 | StudentIDGenerator   | Generate student ID | Card, Button, Avatar      | Core     | component.tsx, types.ts           |
| 270 | BatchAllocation      | Batch assignment    | Form, Select, Button      | Core     | component.tsx, types.ts           |

### 3.4.10 Settings

| #   | Component            | Purpose            | shadcn Used                 | Priority | Files                             |
| --- | -------------------- | ------------------ | --------------------------- | -------- | --------------------------------- |
| 271 | ProfileEditor        | Edit profile       | Form, Input, Button, Avatar | Core     | component.tsx, types.ts, hooks.ts |
| 272 | NotificationSettings | Notification prefs | Switch, Select, Card        | Core     | component.tsx, types.ts           |
| 273 | SecuritySettings     | Security config    | Form, Input, Switch         | Core     | component.tsx, types.ts, hooks.ts |
| 274 | AppearanceSettings   | Theme preferences  | RadioGroup, Card            | Core     | component.tsx, types.ts           |
| 275 | InstitutionSettings  | Institution config | Form, Tabs, Card            | Core     | component.tsx, types.ts, hooks.ts |
| 276 | RoleEditor           | Role permissions   | TreeView, Checkbox, Button  | Core     | component.tsx, types.ts, hooks.ts |
| 277 | UserInviteForm       | Invite user        | Form, Select, Button        | Core     | component.tsx, types.ts, hooks.ts |

### 3.4.11 Notifications

| #   | Component               | Purpose                 | shadcn Used                  | Priority  | Files                             |
| --- | ----------------------- | ----------------------- | ---------------------------- | --------- | --------------------------------- |
| 278 | NotificationList        | Notification feed       | ScrollArea, Badge, Button    | Core      | component.tsx, types.ts           |
| 279 | NotificationCard        | Single notification     | Card, Badge, Avatar          | Core      | component.tsx, types.ts           |
| 280 | NotificationPreferences | Notification settings   | Switch, Select, Card         | Core      | component.tsx, types.ts           |
| 281 | AnnouncementCard        | Announcement display    | Card, Badge, Button          | Core      | component.tsx, types.ts           |
| 282 | NotificationComposer    | Create notification     | Form, Select, RichTextEditor | Core      | component.tsx, types.ts, hooks.ts |
| 283 | BulkNotification        | Send bulk notifications | Form, Steps, Button          | Important | component.tsx, types.ts, hooks.ts |

### 3.4.12 Alumni

| #   | Component       | Purpose        | shadcn Used           | Priority  | Files                   |
| --- | --------------- | -------------- | --------------------- | --------- | ----------------------- |
| 284 | AlumniDirectory | Alumni search  | EntityList, FilterBar | Important | component.tsx, types.ts |
| 285 | AlumniProfile   | Alumni details | EntityHeader, Card    | Important | component.tsx, types.ts |
| 286 | AlumniStats     | Alumni metrics | Card, Chart           | Optional  | component.tsx, types.ts |

---

## 3.5 Layout & Navigation Components

| #   | Component       | Purpose               | shadcn Used                  | Priority | Files                   |
| --- | --------------- | --------------------- | ---------------------------- | -------- | ----------------------- |
| 287 | AppShell        | Main app layout       | Sidebar, ScrollArea          | Core     | component.tsx, types.ts |
| 288 | AppSidebar      | Sidebar navigation    | Sidebar, NavigationMenu      | Core     | component.tsx, types.ts |
| 289 | SidebarMenuItem | Menu item             | Button, Tooltip, Badge       | Core     | component.tsx, types.ts |
| 290 | SidebarCollapse | Collapsible sidebar   | Button, Tooltip              | Core     | component.tsx, types.ts |
| 291 | AppHeader       | Top header bar        | Button, Input, Badge, Avatar | Core     | component.tsx, types.ts |
| 292 | MobileNav       | Mobile bottom nav     | Button                       | Core     | component.tsx, types.ts |
| 293 | MobileNavItem   | Mobile nav item       | Button, Badge                | Core     | component.tsx, types.ts |
| 294 | DashboardLayout | Dashboard page layout | Card, ScrollArea             | Core     | component.tsx, types.ts |
| 295 | DetailLayout    | Detail page layout    | ScrollArea, Separator        | Core     | component.tsx, types.ts |
| 296 | FormLayout      | Form page layout      | Card, Button, Separator      | Core     | component.tsx, types.ts |
| 297 | AuthLayout      | Auth page layout      | Card                         | Core     | component.tsx, types.ts |
| 298 | SettingsLayout  | Settings page layout  | Tabs, ScrollArea             | Core     | component.tsx, types.ts |
| 299 | SplitLayout     | Split view layout     | Resizable                    | Optional | component.tsx, types.ts |
| 300 | TabbedLayout    | Tabbed page layout    | Tabs, ScrollArea             | Core     | component.tsx, types.ts |

---

## 3.6 Dashboard Components

| #   | Component          | Purpose              | shadcn Used               | Priority | Files                   |
| --- | ------------------ | -------------------- | ------------------------- | -------- | ----------------------- |
| 301 | StatsGrid          | Grid of stat cards   | StatCard                  | Core     | component.tsx, types.ts |
| 302 | DashboardChart     | Dashboard chart      | ChartContainer            | Core     | component.tsx, types.ts |
| 303 | ActivityFeed       | Activity feed        | ActivityTimeline          | Core     | component.tsx, types.ts |
| 304 | RecentActivity     | Recent activity list | TimelineItem              | Core     | component.tsx, types.ts |
| 305 | QuickActionsPanel  | Quick actions        | QuickActionsGrid          | Core     | component.tsx, types.ts |
| 306 | UpcomingEvents     | Upcoming events      | Card, Badge, CalendarView | Core     | component.tsx, types.ts |
| 307 | AnnouncementBanner | Announcement banner  | Card, Badge, Button       | Core     | component.tsx, types.ts |
| 308 | WeatherWidget      | Weather display      | Card                      | Optional | component.tsx, types.ts |
| 309 | ClockWidget        | Current time         | Card                      | Optional | component.tsx, types.ts |
| 310 | DashboardHeader    | Dashboard title area | PageHeader                | Core     | component.tsx, types.ts |

---

## 3.7 Portal-Specific Dashboard Compositions

### Admin Dashboard

```
AdminDashboard
├── DashboardHeader
│   ├── PageHeader
│   └── DateRangePicker
├── StatsGrid
│   ├── StatCard (Total Students)
│   ├── StatCard (Total Faculty)
│   ├── StatCard (Attendance Today)
│   └── StatCard (Active Courses)
├── AdmissionPipeline
│   └── ChartContainer
├── ApprovalQueue
│   └── ApprovalQueueCard[]
├── AttendanceStats
│   └── ChartContainer
├── ActivityFeed
│   └── TimelineItem[]
├── QuickActionsPanel
│   └── QuickAction[]
└── AnnouncementBanner
```

### Student Dashboard

```
StudentDashboard
├── DashboardHeader
│   └── StudentGreeting
├── StatsGrid
│   ├── AttendanceProgress
│   ├── CGPACard
│   └── EnrollmentStatus
├── TimetablePreview
│   └── TimetableSlot[]
├── UpcomingExamCard
├── UpcomingAssignments
├── RecentAnnouncements
├── NoticeBoard
├── PerformanceGraph
│   └── ChartContainer
└── FeeReminderCard
```

### Faculty Dashboard

```
FacultyDashboard
├── DashboardHeader
│   └── PageHeader
├── StatsGrid
│   ├── StatCard (Today's Classes)
│   ├── StatCard (Pending Marks)
│   ├── StatCard (Students)
│   └── StatCard (Courses)
├── FacultySchedule
│   └── Table
├── ClassStatistics
│   └── ChartContainer
├── StudentSubmissionCard[]
├── ActivityFeed
└── QuickActionsPanel
```

### Guardian Dashboard

```
GuardianDashboard
├── DashboardHeader
│   ├── PageHeader
│   └── WardSelector
├── ChildPerformance
│   ├── AttendanceOverview
│   ├── FeeStatus
│   └── PerformanceGraph
├── TimetablePreview
├── TeacherMessages
├── RecentAnnouncements
└── QuickActionsPanel
```

---

# 4. Component Hierarchy Per Screen

## 4.1 Student Management Module

### 4.1.1 Student Directory (Admin)

```
StudentDirectoryPage
├── PageHeader
│   ├── PageTitle
│   ├── PageSubtitle
│   └── ActionsGroup
│       ├── ImportButton
│       ├── ExportMenu
│       └── CreateButton
├── SearchFilters
│   ├── SearchInput
│   ├── FilterBar
│   │   ├── FilterButton (Department)
│   │   ├── FilterButton (Program)
│   │   ├── FilterButton (Batch)
│   │   ├── FilterButton (Section)
│   │   ├── FilterButton (Status)
│   │   └── FilterButton (Year)
│   └── ActiveFilters
├── DataTable
│   ├── TableHeader
│   │   ├── SelectAllCheckbox
│   │   ├── SortableColumn (Name)
│   │   ├── SortableColumn (ID)
│   │   ├── SortableColumn (Department)
│   │   ├── SortableColumn (Program)
│   │   ├── SortableColumn (Status)
│   │   ├── SortableColumn (CGPA)
│   │   └── ActionsColumn
│   ├── TableBody
│   │   └── TableRow[]
│   │       ├── Checkbox
│   │       ├── PersonAvatar
│   │       ├── StudentName (link)
│   │       ├── StudentID
│   │       ├── DepartmentBadge
│   │       ├── ProgramBadge
│   │       ├── StatusBadge
│   │       ├── CGPAChip
│   │       └── DropdownMenu
│   │           ├── ViewAction
│   │           ├── EditAction
│   │           ├── AttendanceAction
│   │           ├── MarksAction
│   │           ├── DocumentsAction
│   │           └── DeleteAction
│   └── TableFooter
│       ├── BulkActionToolbar
│       ├── PaginationControls
│       └── PageSizeSelector
├── BulkActionToolbar (when selected)
│   ├── SelectedCount
│   ├── ExportSelected
│   ├── AssignBatch
│   ├── ChangeStatus
│   └── DeleteSelected
└── LoadingSkeleton / EmptyState / ErrorState
```

### 4.1.2 Student Profile (Admin)

```
StudentProfilePage
├── EntityHeader
│   ├── PersonAvatar (large)
│   ├── EntityName
│   ├── EntityID
│   ├── StatusBadge
│   ├── RoleBadge
│   └── ActionsGroup
│       ├── EditButton
│       ├── PrintIDButton
│       ├── SendNotificationButton
│       └── DropdownMenu
│           ├── DeactivateAction
│           ├── TransferAction
│           └── DeleteAction
├── Tabs
│   ├── TabsList
│   │   ├── TabTrigger (Overview)
│   │   ├── TabTrigger (Academic)
│   │   ├── TabTrigger (Attendance)
│   │   ├── TabTrigger (Marks)
│   │   ├── TabTrigger (Guardian)
│   │   ├── TabTrigger (Documents)
│   │   ├── TabTrigger (Timeline)
│   │   └── TabTrigger (Settings)
│   └── TabsContent
│       ├── OverviewTab
│       │   ├── ProfileCard
│       │   ├── AddressCard
│       │   ├── EnrollmentStatus
│       │   ├── AcademicProgress
│       │   └── QuickStats
│       ├── AcademicTab
│       │   ├── SemesterSelector
│       │   ├── AcademicProgress
│       │   ├── CGPACard
│       │   ├── BacklogIndicator
│       │   └── SubjectTable
│       ├── AttendanceTab
│       │   ├── AttendanceStatsCard
│       │   ├── AttendanceCalendar
│       │   ├── AttendanceTrend
│       │   └── AttendanceDefaulterList
│       ├── MarksTab
│       │   ├── SemesterSelector
│       │   ├── ResultCard
│       │   ├── TranscriptView
│       │   ├── PerformanceGraph
│       │   └── SubjectPerformance
│       ├── GuardianTab
│       │   ├── GuardianCard[]
│       │   └── EmergencyContactCard
│       ├── DocumentsTab
│       │   ├── DocumentUploader
│       │   └── DocumentViewer
│       ├── TimelineTab
│       │   └── ActivityTimeline
│       └── SettingsTab
│           ├── StudentStatusForm
│           └── NotificationPreferences
└── LoadingSkeleton / EmptyState / ErrorState
```

### 4.1.3 Create/Edit Student (Admin)

```
CreateStudentPage
├── PageHeader
│   ├── PageTitle
│   └── Breadcrumb
├── WorkflowStepper
│   ├── Step (Personal Info)
│   ├── Step (Academic Info)
│   ├── Step (Guardian Info)
│   ├── Step (Documents)
│   └── Step (Review)
├── FormLayout
│   ├── PersonalInfoSection
│   │   ├── StudentNameField
│   │   ├── DateOfBirthField
│   │   ├── GenderSelect
│   │   ├── BloodGroupSelect
│   │   ├── NationalityField
│   │   ├── ReligionField
│   │   ├── CategorySelect
│   │   ├── PhoneInput
│   │   ├── EmailField
│   │   └── PhotoUploader
│   ├── AddressSection
│   │   ├── PermanentAddress
│   │   │   ├── AddressLine1
│   │   │   ├── AddressLine2
│   │   │   ├── CityField
│   │   │   ├── StateField
│   │   │   ├── CountryField
│   │   │   └── PostalCodeField
│   │   └── CurrentAddress
│   │       └── (same fields)
│   ├── AcademicInfoSection
│   │   ├── DepartmentSelect
│   │   ├── ProgramSelect
│   │   ├── BatchSelect
│   │   ├── SectionSelect
│   │   ├── RollNumberField
│   │   ├── AdmissionNumberField
│   │   └── AdmissionDateField
│   ├── GuardianInfoSection
│   │   ├── GuardianDetails
│   │   │   ├── GuardianName
│   │   │   ├── RelationshipSelect
│   │   │   ├── PhoneInput
│   │   │   ├── EmailField
│   │   │   └── OccupationField
│   │   └── EmergencyContactSection
│   │       ├── EmergencyName
│   │       ├── EmergencyPhone
│   │       └── EmergencyRelation
│   ├── DocumentsSection
│   │   ├── DocumentUploader (Photo)
│   │   ├── DocumentUploader (ID Proof)
│   │   ├── DocumentUploader (Marksheets)
│   │   └── DocumentUploader (Other)
│   └── ReviewSection
│       └── ReviewCard (read-only summary)
├── StickyActionBar
│   ├── PreviousButton
│   ├── SaveDraftButton
│   ├── NextButton / SubmitButton
│   └── CancelButton
└── LoadingSkeleton / ErrorState
```

## 4.2 Attendance Module

### 4.2.1 Mark Attendance (Faculty)

```
MarkAttendancePage
├── PageHeader
│   ├── PageTitle
│   └── DateRangePicker
├── AttendanceMarkingGrid
│   ├── ClassSelector
│   │   ├── SubjectSelect
│   │   ├── SectionSelect
│   │   └── PeriodSelect
│   ├── StudentTable
│   │   ├── TableHeader
│   │   │   ├── StudentName
│   │   │   ├── RollNumber
│   │   │   ├── Status (Present/Absent/Late/Leave)
│   │   │   └── Remarks
│   │   ├── TableBody
│   │   │   └── AttendanceRow[]
│   │   │       ├── Checkbox
│   │   │       ├── PersonAvatar
│   │   │       ├── StudentName
│   │   │       ├── RollNumber
│   │   │       ├── RadioGroup (Present/Absent/Late/Leave)
│   │   │       └── Input (Remarks)
│   │   └── TableFooter
│   │       ├── SummaryBar
│   │       │   ├── PresentCount
│   │       │   ├── AbsentCount
│   │       │   ├── LateCount
│   │       │   └── LeaveCount
│   │       └── ActionButtons
│   │           ├── SaveDraftButton
│   │           ├── SubmitButton
│   │           └── CancelButton
│   └── QuickActions
│       ├── MarkAllPresent
│       ├── MarkAllAbsent
│       └── ImportAttendance
└── LoadingSkeleton / ErrorState
```

### 4.2.2 Attendance Dashboard (Admin)

```
AttendanceDashboardPage
├── PageHeader
│   ├── PageTitle
│   └── DateRangePicker
├── StatsGrid
│   ├── StatCard (Today's Attendance %)
│   ├── StatCard (Present Today)
│   ├── StatCard (Absent Today)
│   └── StatCard (Defaulters)
├── Tabs
│   ├── TabsList
│   │   ├── TabTrigger (Overview)
│   │   ├── TabTrigger (By Department)
│   │   ├── TabTrigger (By Faculty)
│   │   ├── TabTrigger (Defaulters)
│   │   └── TabTrigger (Reports)
│   └── TabsContent
│       ├── OverviewTab
│       │   ├── AttendanceTrend
│       │   │   └── ChartContainer
│       │   ├── AttendanceCalendar
│       │   └── RecentAlerts
│       ├── DepartmentTab
│       │   └── DataTable
│       │       └── DepartmentAttendanceRow[]
│       ├── FacultyTab
│       │   └── DataTable
│       │       └── FacultyAttendanceRow[]
│       ├── DefaultersTab
│       │   ├── AttendanceDefaulterList
│       │   └── AlertCard[]
│       └── ReportsTab
│           ├── ReportFilters
│           ├── ReportChart
│           └── ExportButton
└── LoadingSkeleton / EmptyState / ErrorState
```

## 4.3 Examination Module

### 4.3.1 Examination Setup (Admin)

```
ExaminationSetupPage
├── PageHeader
│   ├── PageTitle
│   └── Breadcrumb
├── ExamSetupForm
│   ├── ExamInfoSection
│   │   ├── ExamNameField
│   │   ├── ExamTypeSelect
│   │   ├── AcademicYearSelect
│   │   ├── AcademicTermSelect
│   │   └── DescriptionField
│   ├── ScheduleSection
│   │   ├── ExamCalendar
│   │   │   └── CalendarView
│   │   ├── AddExamSlotButton
│   │   └── ExamSlotList
│   │       └── ExamSlotCard[]
│   │           ├── SubjectSelect
│   │           ├── DateField
│   │           ├── TimeRangeField
│   │           ├── RoomSelect
│   │           └── RemoveButton
│   ├── EligibilitySection
│   │   ├── AttendanceCutoffField
│   │   ├── FeeCutoffSwitch
│   │   └── MinimumCredsField
│   └── SettingsSection
│       ├── MaxMarksField
│       ├── PassingMarksField
│       ├── GradeScaleSelect
│       └── GraceMarksField
├── StickyActionBar
│   ├── CancelButton
│   ├── SaveDraftButton
│   └── PublishButton
└── LoadingSkeleton / ErrorState
```

### 4.3.2 Marks Entry (Faculty)

```
MarksEntryPage
├── PageHeader
│   ├── PageTitle
│   └── ExamSelector
├── MarksEntryGrid
│   ├── FilterBar
│   │   ├── SubjectSelect
│   │   ├── SectionSelect
│   │   └── ExamTypeSelect
│   ├── DataGrid
│   │   ├── ColumnHeaders
│   │   │   ├── StudentName
│   │   │   ├── RollNumber
│   │   │   ├── InternalMarks
│   │   │   ├── ExternalMarks
│   │   │   ├── PracticalMarks
│   │   │   ├── TotalMarks
│   │   │   ├── Grade
│   │   │   └── Status
│   │   ├── GridBody
│   │   │   └── MarksRow[]
│   │   │       ├── PersonAvatar
│   │   │       ├── StudentName
│   │   │       ├── RollNumber
│   │   │       ├── NumberInput (Internal)
│   │   │       ├── NumberInput (External)
│   │   │       ├── NumberInput (Practical)
│   │   │       ├── ComputedTotal
│   │   │       ├── GradeChip
│   │   │       └── StatusBadge
│   │   └── GridFooter
│   │       ├── SummaryStats
│   │       └── ActionButtons
│   └── ValidationMessages
├── StickyActionBar
│   ├── SaveDraftButton
│   ├── SubmitForVerificationButton
│   └── ExportButton
└── LoadingSkeleton / ErrorState
```

---

## 4.4 Certificate Module

### 4.4.1 Certificate Request (Student)

```
CertificateRequestPage
├── PageHeader
│   ├── PageTitle
│   └── Breadcrumb
├── CertificateRequestForm
│   ├── CertificateTypeSelect
│   │   └── CertificateCard[]
│   │       ├── CertificateIcon
│   │       ├── CertificateName
│   │       └── CertificateDescription
│   ├── PurposeField
│   ├── CopiesField
│   ├── DeliveryMethodSelect
│   │   ├── DownloadRadio
│   │   ├── CollectRadio
│   │   └── MailRadio
│   ├── AddressSection (if mail)
│   │   └── AddressFields
│   └── SupportingDocuments
│       └── DocumentUploader
├── StickyActionBar
│   ├── CancelButton
│   └── SubmitRequestButton
└── LoadingSkeleton / ErrorState
```

### 4.4.2 Certificate Dashboard (Admin)

```
CertificateDashboardPage
├── PageHeader
│   ├── PageTitle
│   └── ActionsGroup
│       ├── TemplateManager
│       └── BulkGenerate
├── StatsGrid
│   ├── StatCard (Pending Requests)
│   ├── StatCard (Generated Today)
│   ├── StatCard (Total Issued)
│   └── StatCard (Rejected)
├── Tabs
│   ├── TabsList
│   │   ├── TabTrigger (Requests)
│   │   ├── TabTrigger (Templates)
│   │   ├── TabTrigger (History)
│   │   └── TabTrigger (Settings)
│   └── TabsContent
│       ├── RequestsTab
│       │   ├── FilterBar
│       │   └── DataTable
│       │       └── CertificateRequestRow[]
│       ├── TemplatesTab
│       │   └── CertificateTemplateGrid
│       │       └── CertificateTemplate[]
│       ├── HistoryTab
│       │   └── CertificateHistory
│       └── SettingsTab
│           └── CertificateSettings
└── LoadingSkeleton / EmptyState / ErrorState
```

## 4.5 Timetable Module

### 4.5.1 Timetable View (Student)

```
StudentTimetablePage
├── PageHeader
│   ├── PageTitle
│   └── WeekSelector
├── TimetableGrid
│   ├── TimeColumn
│   │   └── TimeSlot[]
│   ├── DayColumns
│   │   └── DayColumn[]
│   │       ├── DayHeader
│   │       └── TimetableSlot[]
│   │           ├── SubjectName
│   │           ├── FacultyName
│   │           ├── RoomNumber
│   │           ├── TimeRange
│   │           └── TypeBadge
│   └── CurrentTimeIndicator
├── LegendBar
│   ├── LectureBadge
│   ├── TutorialBadge
│   ├── PracticalBadge
│   └── BreakBadge
└── LoadingSkeleton / EmptyState / ErrorState
```

---

# 5. Component Specifications

## 5.1 Spec: StatCard

| Property             | Detail                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Display a single metric with trend                                                                                                                                                                         |
| **Responsibilities** | Render metric value, label, trend indicator, optional icon                                                                                                                                                 |
| **Props**            | `title: string`, `value: string \| number`, `trend?: { value: number, direction: 'up' \| 'down' }, icon?: LucideIcon`, `description?: string`, `variant?: 'default' \| 'success' \| 'warning' \| 'danger'` |
| **Events**           | `onClick?: () => void`                                                                                                                                                                                     |
| **State**            | None (pure presentation)                                                                                                                                                                                   |
| **Accessibility**    | `role="article"`, `aria-label` with metric name and value                                                                                                                                                  |
| **Loading**          | Skeleton variant                                                                                                                                                                                           |
| **Empty**            | N/A                                                                                                                                                                                                        |
| **Error**            | N/A                                                                                                                                                                                                        |
| **Responsive**       | Full width on mobile, 1/4 on desktop grid                                                                                                                                                                  |
| **shadcn**           | Card, Badge, Skeleton                                                                                                                                                                                      |
| **Related**          | MetricCard, StatsGrid, DashboardStats                                                                                                                                                                      |

## 5.2 Spec: DataTable

| Property             | Detail                                                                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Display tabular data with sorting, filtering, pagination                                                                                                                                                                                                       |
| **Responsibilities** | Render table, handle sort, filter, paginate, bulk select, column visibility                                                                                                                                                                                    |
| **Props**            | `columns: ColumnDef<T>[]`, `data: T[]`, `loading?: boolean`, `totalRows?: number`, `page?: number`, `pageSize?: number`, `onPageChange`, `onSort`, `onFilter`, `onBulkAction`, `enableSelection?: boolean`, `enableExport?: boolean`, `emptyState?: ReactNode` |
| **Events**           | `onRowClick`, `onBulkAction`, `onExport`, `onColumnVisibilityChange`                                                                                                                                                                                           |
| **State**            | Selection set, sort state, filter state, column visibility, page, pageSize                                                                                                                                                                                     |
| **Accessibility**    | `role="table"`, `aria-sort`, `aria-selected`, keyboard navigation                                                                                                                                                                                              |
| **Loading**          | Skeleton rows (configurable count)                                                                                                                                                                                                                             |
| **Empty**            | EmptyState component                                                                                                                                                                                                                                           |
| **Error**            | ErrorState component                                                                                                                                                                                                                                           |
| **Responsive**       | Horizontal scroll on mobile, full on desktop                                                                                                                                                                                                                   |
| **shadcn**           | Table, Input, Button, DropdownMenu, Checkbox, Pagination, Skeleton                                                                                                                                                                                             |
| **Related**          | FilterBar, BulkActionToolbar, PaginationControls                                                                                                                                                                                                               |

## 5.3 Spec: EntityHeader

| Property             | Detail                                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Display entity summary with actions                                                                                                                             |
| **Responsibilities** | Render avatar, name, ID, status, role badges, action buttons                                                                                                    |
| **Props**            | `name: string`, `id: string`, `avatar?: string`, `status?: StatusType`, `role?: string`, `badges?: Badge[]`, `actions?: Action[]`, `breadcrumbs?: Breadcrumb[]` |
| **Events**           | Action click handlers                                                                                                                                           |
| **State**            | None (pure presentation)                                                                                                                                        |
| **Accessibility**    | `role="banner"`, semantic heading, `aria-label`                                                                                                                 |
| **Loading**          | Skeleton with avatar + text placeholders                                                                                                                        |
| **Empty**            | N/A                                                                                                                                                             |
| **Error**            | N/A                                                                                                                                                             |
| **Responsive**       | Stack on mobile, row on desktop                                                                                                                                 |
| **shadcn**           | Avatar, Badge, Button, Separator, Breadcrumb                                                                                                                    |
| **Related**          | ProfileCard, PageHeader                                                                                                                                         |

## 5.4 Spec: FilterBar

| Property             | Detail                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Provide filtering controls for data views                                                                   |
| **Responsibilities** | Render filter buttons, manage active filters, show active filter chips                                      |
| **Props**            | `filters: FilterConfig[]`, `activeFilters: ActiveFilter[]`, `onFilterChange`, `onClearFilter`, `onClearAll` |
| **Events**           | Filter selection, filter removal, clear all                                                                 |
| **State**            | Open popover per filter                                                                                     |
| **Accessibility**    | `role="toolbar"`, `aria-label="Filters"`                                                                    |
| **Loading**          | Skeleton buttons                                                                                            |
| **Empty**            | N/A (no filters available)                                                                                  |
| **Error**            | N/A                                                                                                         |
| **Responsive**       | Horizontal scroll on mobile, wrap on desktop                                                                |
| **shadcn**           | Button, Popover, Select, Badge, ScrollArea                                                                  |
| **Related**          | ActiveFilters, SearchInput, DataTable                                                                       |

## 5.5 Spec: StatusBadge

| Property             | Detail                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Purpose**          | Display entity status with color coding                                                                |
| **Responsibilities** | Render colored badge based on status type                                                              |
| **Props**            | `status: StatusType`, `variant?: 'solid' \| 'outline'`, `size?: 'sm' \| 'md' \| 'lg'`, `dot?: boolean` |
| **Events**           | None                                                                                                   |
| **State**            | None (pure presentation)                                                                               |
| **Accessibility**    | `role="status"`, `aria-label` with status text                                                         |
| **Loading**          | N/A                                                                                                    |
| **Empty**            | N/A                                                                                                    |
| **Error**            | N/A                                                                                                    |
| **Responsive**       | Consistent across breakpoints                                                                          |
| **shadcn**           | Badge                                                                                                  |
| **Related**          | RoleBadge, PermissionBadge                                                                             |

## 5.6 Spec: PageHeader

| Property             | Detail                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Page title with breadcrumbs and actions                                                                          |
| **Responsibilities** | Render title, subtitle, breadcrumbs, action buttons                                                              |
| **Props**            | `title: string`, `subtitle?: string`, `breadcrumbs?: Breadcrumb[]`, `actions?: Action[]`, `backButton?: boolean` |
| **Events**           | Back button click, action click handlers                                                                         |
| **State**            | None                                                                                                             |
| **Accessibility**    | `role="banner"`, `<h1>` for title, `aria-label`                                                                  |
| **Loading**          | Skeleton text lines                                                                                              |
| **Empty**            | N/A                                                                                                              |
| **Error**            | N/A                                                                                                              |
| **Responsive**       | Stack on mobile, row on desktop                                                                                  |
| **shadcn**           | Button, Separator, Breadcrumb                                                                                    |
| **Related**          | EntityHeader, DashboardHeader                                                                                    |

---

# 6. shadcn Mapping

## 6.1 Complete Mapping

| Component Category | shadcn Components Used                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Data Display**   | Table, Card, Badge, Avatar, Separator, ScrollArea, Tabs, Accordion                   |
| **Forms**          | Form, Input, Select, Textarea, Checkbox, RadioGroup, Switch, Label, Calendar, Button |
| **Navigation**     | Breadcrumb, NavigationMenu, Tabs, DropdownMenu, Command, Sidebar                     |
| **Feedback**       | Toast, AlertDialog, Dialog, Sheet, Tooltip, Popover, Progress, Skeleton              |
| **Layout**         | Card, Separator, ScrollArea, Resizable, Tabs                                         |
| **Data Entry**     | Input, Select, Textarea, Checkbox, RadioGroup, Switch, Calendar, InputOTP            |
| **Actions**        | Button, DropdownMenu, ContextMenu, Dialog, AlertDialog, Sheet                        |
| **Charts**         | Chart (recharts wrapper)                                                             |

## 6.2 Custom Components (Not in shadcn)

| Component        | Reason for Custom                                               |
| ---------------- | --------------------------------------------------------------- |
| DataTable        | Complex table with sorting, filtering, pagination, bulk actions |
| FilterBar        | Multi-filter popover controls                                   |
| StatCard         | Metric display with trend                                       |
| StatusBadge      | Colored status with dot variant                                 |
| ActivityTimeline | Activity feed layout                                            |
| SearchInput      | Enhanced search with keyboard shortcuts                         |
| FileUploader     | Drag-drop upload zone                                           |
| CommandPalette   | Global command search                                           |
| EntityHeader     | Entity detail header layout                                     |
| PageHeader       | Page title with actions                                         |
| WorkflowStepper  | Multi-step wizard                                               |
| PermissionGuard  | Role/permission wrapper                                         |
| RichTextEditor   | WYSIWYG editing                                                 |
| QRCodeDisplay    | QR code generation                                              |
| DigitalSignature | Signature pad                                                   |

---

# 7. Component Ownership

## 7.1 Ownership Matrix

| Component             | Owner Package            | Import Path                             |
| --------------------- | ------------------------ | --------------------------------------- |
| All shadcn primitives | `@student-erp/ui`        | `@student-erp/ui/components/[name]`     |
| Global shared UI      | `@student-erp/ui`        | `@student-erp/ui/components/[name]`     |
| Shared business       | `@student-erp/ui`        | `@student-erp/ui/shared/[name]`         |
| Student persona       | `web-student`            | `@/components/student/[name]`           |
| Faculty persona       | `web-faculty`            | `@/components/faculty/[name]`           |
| Admin persona         | `web-admin`              | `@/components/admin/[name]`             |
| Guardian persona      | `web-guardian`           | `@/components/guardian/[name]`          |
| Feature components    | Each app                 | `@/features/[module]/components/[name]` |
| Hooks                 | `@student-erp/hooks`     | `@student-erp/hooks/[category]`         |
| Types                 | `@student-erp/types`     | `@student-erp/types/[domain]`           |
| Schemas               | `@student-erp/schemas`   | `@student-erp/schemas/[domain]`         |
| Constants             | `@student-erp/constants` | `@student-erp/constants/[category]`     |
| Utils                 | `@student-erp/utils`     | `@student-erp/utils/[category]`         |

## 7.2 Dependency Rules

```
✅ Allowed:
  app → shared/ui → shadcn primitives
  app → shared/business → shared/ui
  app → features → shared/ui, shared/business
  features → hooks, types, schemas, constants, utils

❌ Forbidden:
  shared/ui → features
  shared/ui → shared/business
  shared/business → features
  Any circular dependency between packages
  Any app → another app
```

---

# 8. Reusability Matrix

## 8.1 Components Used Across Multiple Portals

| Component         | Admin | Student | Faculty | Guardian | Reuse Score |
| ----------------- | ----- | ------- | ------- | -------- | ----------- |
| PageHeader        | ✅    | ✅      | ✅      | ✅       | 100%        |
| DataTable         | ✅    | ✅      | ✅      | ✅       | 100%        |
| FilterBar         | ✅    | ✅      | ✅      | —        | 75%         |
| StatusBadge       | ✅    | ✅      | ✅      | ✅       | 100%        |
| StatCard          | ✅    | ✅      | ✅      | ✅       | 100%        |
| EntityHeader      | ✅    | ✅      | ✅      | —        | 75%         |
| LoadingSkeleton   | ✅    | ✅      | ✅      | ✅       | 100%        |
| EmptyState        | ✅    | ✅      | ✅      | ✅       | 100%        |
| ErrorState        | ✅    | ✅      | ✅      | ✅       | 100%        |
| ConfirmDialog     | ✅    | ✅      | ✅      | ✅       | 100%        |
| SearchInput       | ✅    | ✅      | ✅      | ✅       | 100%        |
| Breadcrumb        | ✅    | ✅      | ✅      | ✅       | 100%        |
| ExportMenu        | ✅    | —       | ✅      | —        | 50%         |
| BulkActionToolbar | ✅    | —       | ✅      | —        | 50%         |
| ActivityTimeline  | ✅    | ✅      | ✅      | —        | 75%         |
| NotificationBell  | ✅    | ✅      | ✅      | ✅       | 100%        |
| UserMenu          | ✅    | ✅      | ✅      | ✅       | 100%        |
| DatePicker        | ✅    | ✅      | ✅      | —        | 75%         |
| ProfileCard       | ✅    | ✅      | ✅      | ✅       | 100%        |
| AvatarUploader    | ✅    | ✅      | ✅      | —        | 75%         |

## 8.2 Duplicate Prevention Report

| Potential Duplicate                     | Resolution                                               |
| --------------------------------------- | -------------------------------------------------------- |
| StudentCard vs StudentProfileCard       | Use ProfileCard (shared) + StudentStatsCard (persona)    |
| FacultyCard vs FacultyProfileCard       | Use ProfileCard (shared) + FacultyStatsCard (persona)    |
| AttendanceForm vs AttendanceMarkingGrid | Single component: AttendanceMarkingGrid                  |
| MarksEntry vs MarksEntryGrid            | Single component: MarksEntryGrid                         |
| CertificateCard vs CertificateTemplate  | Use CertificateTemplate (feature)                        |
| ExamCard vs ExamSchedule                | Use ExamSchedule (feature)                               |
| NotificationCard vs AnnouncementCard    | Keep separate: different data models                     |
| SearchBar vs SearchInput                | SearchInput (primitive) used inside SearchBar (composed) |

---

# 9. Folder Structure

## 9.1 Complete Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── students/
│   │   │   ├── page.tsx (list)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx (profile)
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── faculty/
│   │   │   ├── page.tsx (list)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx (profile)
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── attendance/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── mark/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── academics/
│   │   │   ├── departments/
│   │   │   │   └── page.tsx
│   │   │   ├── programs/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   └── page.tsx
│   │   │   ├── subjects/
│   │   │   │   └── page.tsx
│   │   │   ├── sections/
│   │   │   │   └── page.tsx
│   │   │   ├── batches/
│   │   │   │   └── page.tsx
│   │   │   └── calendar/
│   │   │       └── page.tsx
│   │   ├── examinations/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── setup/
│   │   │   │   └── page.tsx
│   │   │   ├── marks/
│   │   │   │   └── page.tsx
│   │   │   ├── results/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   ├── timetable/
│   │   │   ├── page.tsx (view)
│   │   │   ├── editor/
│   │   │   │   └── page.tsx
│   │   │   └── rooms/
│   │   │       └── page.tsx
│   │   ├── promotions/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── rules/
│   │   │   │   └── page.tsx
│   │   │   └── review/
│   │   │       └── page.tsx
│   │   ├── certificates/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── requests/
│   │   │   │   └── page.tsx
│   │   │   ├── templates/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── admissions/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── applications/
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── enrollment/
│   │   │       └── page.tsx
│   │   ├── guardians/
│   │   │   ├── page.tsx (list)
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx (profile)
│   │   │   ├── security/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── appearance/
│   │   │   │   └── page.tsx
│   │   │   ├── institution/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   └── reports/
│   │       ├── page.tsx
│   │       └── [reportId]/
│   │           └── page.tsx
│   ├── layout.tsx (root)
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   │   ├── primitives/
│   │   ├── shared/
│   │   │   ├── data-display/
│   │   │   ├── forms/
│   │   │   ├── navigation/
│   │   │   ├── feedback/
│   │   │   ├── layout/
│   │   │   ├── filters/
│   │   │   ├── actions/
│   │   │   ├── display/
│   │   │   └── composed/
│   │   └── index.ts
│   ├── student/
│   ├── faculty/
│   ├── admin/
│   ├── guardian/
│   └── dashboard/
│
├── features/
│   ├── auth/
│   ├── attendance/
│   ├── academics/
│   ├── examinations/
│   ├── marks/
│   ├── certificates/
│   ├── timetable/
│   ├── admissions/
│   ├── promotions/
│   ├── settings/
│   └── notifications/
│
├── hooks/
├── lib/
├── providers/
├── stores/
├── services/
├── styles/
├── types/
└── config/
```

---

# 10. Dependency Graph

## 10.1 Package Dependencies

```
@student-erp/ui
  ├── shadcn primitives (Radix UI)
  ├── @student-erp/types
  └── @student-erp/utils

@student-erp/hooks
  ├── react
  └── @student-erp/types

@student-erp/types
  └── (no dependencies)

@student-erp/schemas
  ├── zod
  └── @student-erp/types

@student-erp/constants
  └── (no dependencies)

@student-erp/utils
  └── (no dependencies)

@student-erp/sdk
  ├── axios
  └── @student-erp/types

@student-erp/config
  └── (no dependencies)
```

## 10.2 Atomic Design Dependency Flow

```
Primitive → Molecule → Organism → Template → Page

Examples:

Button → StatusBadge → EntityHeader → DetailLayout → StudentProfilePage
Input → SearchInput → SearchBar → FilterBar → StudentDirectoryPage
Card → StatCard → StatsGrid → DashboardLayout → AdminDashboardPage
Table → DataTable → EntityList → DashboardLayout → StudentDirectoryPage
```

---

# 11. Form Architecture

## 11.1 Form Patterns

All forms follow this pattern:

```
FormContainer (react-hook-form + zod)
├── FormSection (logical grouping)
│   ├── FormField (label + input + error)
│   │   └── Input / Select / Textarea / etc.
│   └── FormField
├── FormSection
│   └── FormField
└── FormActions (sticky bar)
    ├── CancelButton
    ├── SaveDraftButton
    └── SubmitButton
```

## 11.2 Reusable Form Fields

| Field Component  | Purpose                 | shadcn Used            |
| ---------------- | ----------------------- | ---------------------- |
| TextField        | Text input with label   | Input, Label           |
| EmailField       | Email input             | Input, Label           |
| PhoneField       | Phone with country code | PhoneInput, Label      |
| NumberField      | Number input            | Input, Label           |
| PasswordField    | Password with toggle    | Input, Label, Button   |
| SelectField      | Dropdown select         | Select, Label          |
| MultiSelectField | Multi-select            | Select, Label          |
| DateField        | Date picker             | DatePicker, Label      |
| DateRangeField   | Date range              | DateRangePicker, Label |
| TimeField        | Time picker             | TimePicker, Label      |
| TextareaField    | Multi-line text         | Textarea, Label        |
| CheckboxField    | Single checkbox         | Checkbox, Label        |
| RadioField       | Radio group             | RadioGroup, Label      |
| SwitchField      | Toggle switch           | Switch, Label          |
| FileField        | File upload             | FileUploader, Label    |
| ImageField       | Image upload            | ImageUploader, Label   |
| RichTextField    | Rich text editor        | RichTextEditor, Label  |

## 11.3 Form Section Components

| Section                 | Fields                                                                               | Used In                    |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| PersonalInfoSection     | Name, DOB, Gender, Blood Group, Nationality, Religion, Category, Phone, Email, Photo | Student, Faculty           |
| AddressSection          | Line 1, Line 2, City, State, Country, Postal Code (×2 for permanent/current)         | Student, Faculty, Guardian |
| AcademicInfoSection     | Department, Program, Batch, Section, Roll Number, Admission Number, Admission Date   | Student                    |
| GuardianInfoSection     | Guardian Name, Relationship, Phone, Email, Occupation, Emergency Contact             | Student                    |
| MedicalInfoSection      | Blood Group, Allergies, Conditions, Medications, Emergency Contact                   | Student                    |
| QualificationSection    | Degree, Institution, Year, Percentage, Specialization                                | Faculty                    |
| ExperienceSection       | Organization, Designation, From, To, Duration, Description                           | Faculty                    |
| EmergencyContactSection | Name, Relationship, Phone, Address                                                   | All                        |
| DocumentUploadSection   | Document type, File, Description                                                     | All                        |

## 11.4 Validation Schema Pattern

```typescript
// Each feature has its own schema file
// e.g., features/students/validators/student.schema.ts

import { z } from 'zod';

export const createStudentSchema = z.object({
  // Personal
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other']),

  // Academic
  departmentId: z.string().min(1, 'Department is required'),
  programId: z.string().min(1, 'Program is required'),
  batchId: z.string().min(1, 'Batch is required'),
  sectionId: z.string().optional(),

  // Guardian
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(10),
  guardianEmail: z.string().email(),
  relationship: z.string().min(1),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
```

---

# 12. Table Architecture

## 12.1 DataTable Composition

```
DataTable
├── DataTableToolbar
│   ├── SearchInput
│   ├── FilterButton[]
│   ├── ColumnVisibilityToggle
│   ├── DensityToggle
│   └── RefreshButton
├── TableHeader
│   ├── SelectAllCheckbox
│   ├── SortableColumnHeader[]
│   └── ActionsHeader
├── TableBody
│   ├── TableRow[] (data)
│   │   ├── Checkbox
│   │   ├── Cell components (avatar, badge, text, etc.)
│   │   └── RowActions (dropdown menu)
│   └── TableRow (empty state)
├── TableFooter
│   ├── BulkActionToolbar (when items selected)
│   ├── PaginationControls
│   │   ├── PageNumberDisplay
│   │   ├── PreviousButton
│   │   ├── NextButton
│   │   └── PageSizeSelector
│   └── ExportButton
└── LoadingState (skeleton rows)
```

## 12.2 Column Definition Pattern

```typescript
// Each column definition follows this pattern
{
  id: 'name',
  header: ({ table }) => (
    <DataTableColumnHeader table={table} column={column} title="Name" />
  ),
  cell: ({ row }) => (
    <div className="flex items-center gap-3">
      <PersonAvatar name={row.original.name} avatar={row.original.avatar} />
      <span className="font-medium">{row.original.name}</span>
    </div>
  ),
  accessorKey: 'name',
  enableSorting: true,
  enableHiding: true,
}
```

## 12.3 Table Types

| Table Type        | Features                     | Used In                |
| ----------------- | ---------------------------- | ---------------------- |
| BasicTable        | Simple data display          | Small lists            |
| SortableTable     | Column sorting               | Any list               |
| FilterableTable   | Filters + search             | Directory pages        |
| SelectableTable   | Row selection + bulk actions | Management pages       |
| EditableTable     | Inline editing               | Marks entry            |
| HierarchicalTable | Expandable rows              | Course → Subject tree  |
| GroupableTable    | Column grouping              | Statistics             |
| VirtualizedTable  | Virtual scrolling            | Large datasets (1000+) |

---

# 13. Dialog Architecture

## 13.1 Dialog Inventory

| Dialog                   | Type           | Purpose                   | Trigger              |
| ------------------------ | -------------- | ------------------------- | -------------------- |
| CreateStudentDialog      | Sheet (right)  | Create new student        | "Create" button      |
| EditStudentDialog        | Sheet (right)  | Edit student details      | "Edit" action        |
| DeleteStudentDialog      | AlertDialog    | Confirm delete            | "Delete" action      |
| StudentDetailDrawer      | Sheet (right)  | Quick view student        | Row click            |
| AttendanceHistoryDrawer  | Sheet (right)  | View attendance history   | "History" action     |
| TranscriptPreviewDialog  | Dialog         | Preview transcript        | "Preview" action     |
| SubjectSelectorDialog    | Dialog         | Select subjects           | "Add Subject" button |
| DepartmentPicker         | Dialog         | Pick department           | Department field     |
| FacultyProfileDrawer     | Sheet (right)  | Quick view faculty        | Row click            |
| CourseAssignmentDialog   | Dialog         | Assign courses            | "Assign" action      |
| ConfirmSubmitDialog      | AlertDialog    | Confirm form submit       | Submit button        |
| ConfirmPublishDialog     | AlertDialog    | Confirm publish           | Publish button       |
| ImportDialog             | Dialog         | Import data               | "Import" button      |
| ExportDialog             | Dialog         | Export options            | "Export" button      |
| FilterDialog             | Sheet (bottom) | Advanced filters (mobile) | Filter button        |
| BulkActionDialog         | AlertDialog    | Confirm bulk action       | Bulk action          |
| CertificatePreviewDialog | Dialog         | Preview certificate       | "Preview" action     |
| HallTicketDialog         | Dialog         | View hall ticket          | "Print" action       |
| AdmissionDetailDialog    | Dialog         | View application          | Row click            |
| UserInviteDialog         | Dialog         | Invite user               | "Invite" button      |
| RoleEditorDialog         | Dialog         | Edit role permissions     | "Edit" action        |
| SettingsDialog           | Dialog         | Quick settings            | "Settings" action    |
| SessionExpiredDialog     | Dialog         | Session timeout           | Auto-trigger         |
| UnsavedChangesDialog     | AlertDialog    | Warn unsaved changes      | Navigation away      |
| QRScanDialog             | Dialog         | Scan QR code              | "Scan" button        |
| PrintPreviewDialog       | Dialog         | Print preview             | "Print" button       |

## 13.2 Dialog Composition Pattern

```
DialogWrapper
├── DialogHeader
│   ├── DialogTitle
│   ├── DialogDescription
│   └── DialogClose
├── DialogBody (ScrollArea)
│   └── [Content varies per dialog]
└── DialogFooter
    ├── CancelButton
    └── ConfirmButton
```

---

# 14. Loading States

## 14.1 Loading Patterns

| Pattern             | When                         | Implementation               |
| ------------------- | ---------------------------- | ---------------------------- |
| **Skeleton Cards**  | Dashboard stats loading      | 4× StatCard skeletons        |
| **Skeleton Table**  | DataTable loading            | 8× TableRow skeletons        |
| **Skeleton Form**   | Form data loading            | Form field skeletons         |
| **Skeleton Chart**  | Chart loading                | Chart area skeleton          |
| **Skeleton Detail** | Profile/detail loading       | EntityHeader + Tab skeletons |
| **Spinner**         | Button actions               | Button with Spinner          |
| **Full Page**       | Initial page load            | Full screen skeleton         |
| **Inline**          | Section loading              | Section-level skeleton       |
| **Progress Bar**    | File upload, long operations | Progress component           |

## 14.2 Skeleton Components

```
SkeletonCard
  ├── SkeletonAvatar
  ├── SkeletonText (2-3 lines)
  └── SkeletonBadge

SkeletonTable
  ├── SkeletonTableHeader
  └── SkeletonTableRow[] (5-8 rows)

SkeletonForm
  ├── SkeletonFormField[] (4-6 fields)
  └── SkeletonButton

SkeletonChart
  ├── SkeletonChartArea
  └── SkeletonChartLegend

SkeletonDetail
  ├── SkeletonEntityHeader
  └── SkeletonTabs
```

## 14.3 Optimistic UI Patterns

| Scenario      | Optimistic Behavior                              |
| ------------- | ------------------------------------------------ |
| Toggle switch | Immediate visual toggle, rollback on error       |
| Like/favorite | Immediate badge update, rollback on error        |
| Mark as read  | Immediate removal from unread, rollback on error |
| Inline edit   | Immediate text update, rollback on error         |
| Delete row    | Immediate row removal, rollback on error         |
| Reorder       | Immediate reorder, rollback on error             |

---

# 15. Empty States

## 15.1 Empty State Inventory

| Empty State       | Icon          | Title                  | Description                                 | Action              |
| ----------------- | ------------- | ---------------------- | ------------------------------------------- | ------------------- |
| No Students       | Users         | No students yet        | Add your first student to get started       | Create Student      |
| No Faculty        | GraduationCap | No faculty members     | Add faculty to begin teaching operations    | Create Faculty      |
| No Attendance     | CalendarCheck | No attendance recorded | Start marking attendance for your classes   | Mark Attendance     |
| No Results        | Trophy        | No results published   | Results will appear once exams are graded   | Setup Exam          |
| No Certificates   | FileText      | No certificates issued | Request or generate certificates            | Request Certificate |
| No Notifications  | Bell          | All caught up!         | No new notifications at this time           | —                   |
| No Search Results | Search        | No results found       | Try adjusting your search criteria          | Clear Filters       |
| No Data           | Database      | No data available      | Data will appear once records are added     | —                   |
| No Permissions    | Shield        | Access denied          | You don't have permission to view this page | Contact Admin       |
| No Internet       | WifiOff       | Connection lost        | Please check your internet connection       | Retry               |
| Empty Timetable   | Clock         | No classes scheduled   | Your timetable will appear once published   | —                   |
| No Announcements  | Megaphone     | No announcements       | Check back later for updates                | —                   |
| No Assignments    | ClipboardList | No assignments         | Assignments will appear once created        | —                   |
| No Documents      | FolderOpen    | No documents uploaded  | Upload documents to keep them organized     | Upload              |
| No Activity       | Activity      | No recent activity     | Activity will appear as you use the system  | —                   |

---

# 16. Error States

## 16.1 Error Patterns

| Error Type           | Component                | Actions                |
| -------------------- | ------------------------ | ---------------------- |
| **404 Not Found**    | ErrorState (NotFound)    | Go Home, Go Back       |
| **403 Forbidden**    | ErrorState (Forbidden)   | Contact Admin          |
| **500 Server Error** | ErrorState (ServerError) | Retry, Contact Support |
| **Network Error**    | ErrorState (Network)     | Retry                  |
| **Timeout**          | ErrorState (Timeout)     | Retry                  |
| **Validation Error** | Inline error messages    | Fix and resubmit       |
| **Rate Limited**     | ErrorState (RateLimit)   | Wait and retry         |
| **Offline**          | ErrorState (Offline)     | Check connection       |

## 16.2 Error Boundary

```typescript
// Each major section should have an error boundary
<ErrorBoundary fallback={<ErrorState />}>
  <Suspense fallback={<LoadingSkeleton />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

---

# 17. Responsive Behavior

## 17.1 Breakpoint Strategy

| Breakpoint  | Width       | Layout                                             |
| ----------- | ----------- | -------------------------------------------------- |
| **Mobile**  | < 640px     | Single column, bottom nav, stacked cards           |
| **Tablet**  | 640-1024px  | 2 columns, collapsed sidebar, horizontal scroll    |
| **Desktop** | 1024-1440px | Full sidebar, 3-4 column grid                      |
| **Wide**    | > 1440px    | Full sidebar, 4-5 column grid, max-width container |

## 17.2 Component Responsive Behavior

| Component       | Mobile                        | Tablet                 | Desktop         |
| --------------- | ----------------------------- | ---------------------- | --------------- |
| AppSidebar      | Hidden (bottom nav)           | Collapsed (icons only) | Expanded (full) |
| AppHeader       | Simplified                    | Standard               | Standard        |
| DataTable       | Card view / horizontal scroll | Horizontal scroll      | Full table      |
| FilterBar       | Sheet (bottom)                | Horizontal scroll      | Horizontal row  |
| StatsGrid       | 1 column                      | 2 columns              | 4 columns       |
| FormLayout      | Full width                    | 2 columns              | 2-3 columns     |
| Dialog          | Full screen                   | Sheet                  | Dialog          |
| PageHeader      | Stacked                       | Row                    | Row             |
| StickyActionBar | Full width bottom             | Full width bottom      | Right-aligned   |

## 17.3 Mobile-Specific Components

| Component         | Purpose                     |
| ----------------- | --------------------------- |
| MobileNav         | Bottom navigation bar       |
| MobileNavItem     | Nav item with icon + label  |
| MobileFilterSheet | Bottom sheet for filters    |
| MobileSearchBar   | Full-width search           |
| MobileCardView    | Card替代table on mobile     |
| SwipeableRow      | Swipe actions on list items |
| PullToRefresh     | Pull to refresh data        |

## 17.4 Desktop-Specific Components

| Component       | Purpose                             |
| --------------- | ----------------------------------- |
| AppSidebar      | Full sidebar navigation             |
| CommandPalette  | Keyboard-driven command search (⌘K) |
| ResizablePanels | Resizable split views               |
| ContextMenu     | Right-click context menus           |
| Tooltip         | Hover tooltips                      |
| HoverCard       | Hover preview cards                 |

---

# 18. Accessibility

## 18.1 Accessibility Checklist

### Per Component

- [ ] All interactive elements have visible focus indicators
- [ ] All buttons have accessible names (text or aria-label)
- [ ] All images have alt text
- [ ] All form fields have associated labels
- [ ] All form errors are announced to screen readers
- [ ] All modals trap focus correctly
- [ ] All modals can be closed with Escape key
- [ ] All decorative icons have aria-hidden="true"
- [ ] All data tables have proper headers and scope
- [ ] All color-coded information has text alternative
- [ ] All animations respect prefers-reduced-motion
- [ ] All clickable elements are keyboard accessible

### Per Page

- [ ] Page has exactly one h1
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Landmark regions are properly defined
- [ ] Skip navigation link is present
- [ ] Page title is descriptive
- [ ] Focus management on page navigation
- [ ] Loading states are announced
- [ ] Error states are announced
- [ ] Empty states are announced

### Global

- [ ] All ARIA live regions are properly configured
- [ ] All keyboard shortcuts are documented
- [ ] All color contrasts meet WCAG AA
- [ ] All text is resizable up to 200%
- [ ] All touch targets are at least 44x44px
- [ ] All animations can be disabled

## 18.2 Keyboard Navigation

| Key         | Action                               |
| ----------- | ------------------------------------ |
| Tab         | Move to next interactive element     |
| Shift+Tab   | Move to previous interactive element |
| Enter/Space | Activate button/link                 |
| Escape      | Close modal/dropdown                 |
| Arrow Keys  | Navigate within groups               |
| Home/End    | Move to first/last item              |
| ⌘K / Ctrl+K | Open command palette                 |
| ⌘/ / Ctrl+/ | Open keyboard shortcuts              |

## 18.3 ARIA Patterns Used

| Pattern    | Component                   |
| ---------- | --------------------------- |
| combobox   | SearchInput, EntitySelector |
| dialog     | Dialog, Sheet, AlertDialog  |
| grid       | DataTable, DataGrid         |
| listbox    | Select, MultiSelect         |
| menu       | DropdownMenu, ContextMenu   |
| menubar    | Menubar                     |
| navigation | AppSidebar, Breadcrumb      |
| tablist    | Tabs                        |
| tree       | TreeView                    |
| alert      | Toast, Alert                |
| status     | StatusBadge                 |
| progress   | Progress                    |

---

# 19. Animations

## 19.1 Animation Specifications

| Element              | Animation                   | Duration | Easing      |
| -------------------- | --------------------------- | -------- | ----------- |
| **Hover**            | Scale 1.02, shadow increase | 150ms    | ease-out    |
| **Press**            | Scale 0.98                  | 100ms    | ease-in     |
| **Page Transition**  | Fade in + slight slide up   | 200ms    | ease-out    |
| **Dialog Open**      | Fade in + scale from 0.95   | 200ms    | ease-out    |
| **Dialog Close**     | Fade out + scale to 0.95    | 150ms    | ease-in     |
| **Sheet Open**       | Slide in from edge          | 250ms    | ease-out    |
| **Sheet Close**      | Slide out to edge           | 200ms    | ease-in     |
| **Dropdown Open**    | Fade in + slide down        | 150ms    | ease-out    |
| **Accordion**        | Height transition           | 200ms    | ease-in-out |
| **Table Row Hover**  | Background color            | 150ms    | ease-out    |
| **Card Hover**       | Shadow increase             | 200ms    | ease-out    |
| **Badge Pop**        | Scale from 0                | 150ms    | spring      |
| **Skeleton Shimmer** | TranslateX loop             | 1.5s     | linear      |
| **Toast Enter**      | Slide in from right + fade  | 300ms    | ease-out    |
| **Toast Exit**       | Slide out to right + fade   | 200ms    | ease-in     |
| **Progress Fill**    | Width transition            | 300ms    | ease-out    |
| **Sidebar Toggle**   | Width transition            | 200ms    | ease-in-out |
| **Tab Switch**       | Fade transition             | 150ms    | ease-out    |
| **Spinner**          | Rotate 360°                 | 1s       | linear      |
| **Loading Bar**      | Width 0→100%                | 2s       | ease-in-out |

## 19.2 Reduced Motion

All animations wrapped in:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 20. Naming Conventions

## 20.1 File Naming

| Type      | Convention                   | Example                |
| --------- | ---------------------------- | ---------------------- |
| Component | kebab-case                   | `stat-card.tsx`        |
| Page      | kebab-case                   | `student-profile.tsx`  |
| Hook      | kebab-case with `use`        | `use-attendance.ts`    |
| Service   | kebab-case with `.service`   | `auth.service.ts`      |
| Schema    | kebab-case with `.schema`    | `student.schema.ts`    |
| Type      | kebab-case with `.types`     | `attendance.types.ts`  |
| Constant  | kebab-case with `.constants` | `routes.constants.ts`  |
| Utility   | kebab-case with `.utils`     | `date.utils.ts`        |
| Config    | kebab-case with `.config`    | `navigation.config.ts` |

## 20.2 Component Naming

| Pattern   | Convention           | Example                 |
| --------- | -------------------- | ----------------------- |
| Component | PascalCase           | `StatCard`              |
| Prop type | PascalCase + Props   | `StatCardProps`         |
| Context   | PascalCase + Context | `DataTableContext`      |
| Hook      | camelCase + use      | `useDataTable`          |
| Service   | PascalCase + Service | `StudentService`        |
| Schema    | camelCase + Schema   | `createStudentSchema`   |
| Type      | PascalCase           | `Student`, `Attendance` |
| Constant  | UPPER_SNAKE_CASE     | `MAX_PAGE_SIZE`         |

## 20.3 CSS/Tailwind Naming

| Pattern         | Convention        | Example                   |
| --------------- | ----------------- | ------------------------- |
| Component class | kebab-case        | `stat-card`               |
| Utility class   | Tailwind defaults | `flex`, `items-center`    |
| Custom utility  | `erp-` prefix     | `erp-gradient`            |
| Animation class | `animate-` prefix | `animate-fade-in`         |
| State class     | `is-` prefix      | `is-loading`, `is-active` |

## 20.4 Route Naming

| Pattern         | Convention      | Example                         |
| --------------- | --------------- | ------------------------------- |
| Route segment   | kebab-case      | `/students`, `/attendance/mark` |
| Dynamic segment | `[param]`       | `/students/[id]`                |
| Route group     | `(name)`        | `(auth)`, `(dashboard)`         |
| Layout          | `layout.tsx`    | `dashboard/layout.tsx`          |
| Page            | `page.tsx`      | `students/page.tsx`             |
| Loading         | `loading.tsx`   | `students/loading.tsx`          |
| Error           | `error.tsx`     | `students/error.tsx`            |
| Not found       | `not-found.tsx` | `not-found.tsx`                 |

---

# 21. Development Roadmap

## 21.1 Phase 1: Foundation (Weeks 1-4)

| Priority          | Component              | Complexity | Est. Hours     |
| ----------------- | ---------------------- | ---------- | -------------- |
| Core              | shadcn primitives (39) | Low        | 8              |
| Core              | ThemeProvider          | Low        | 2              |
| Core              | QueryProvider          | Low        | 2              |
| Core              | AuthProvider           | Medium     | 8              |
| Core              | AppShell               | Medium     | 8              |
| Core              | AppSidebar             | Medium     | 12             |
| Core              | AppHeader              | Medium     | 8              |
| Core              | MobileNav              | Medium     | 6              |
| Core              | PageHeader             | Low        | 4              |
| Core              | LoadingSkeleton        | Low        | 4              |
| Core              | EmptyState             | Low        | 4              |
| Core              | ErrorState             | Low        | 4              |
| Core              | ConfirmDialog          | Low        | 4              |
| Core              | StatusBadge            | Low        | 2              |
| Core              | SearchInput            | Medium     | 4              |
| Core              | DataTable              | High       | 24             |
| Core              | FilterBar              | High       | 16             |
| Core              | StatCard               | Low        | 4              |
| Core              | PaginationControls     | Medium     | 6              |
| Core              | ExportMenu             | Medium     | 6              |
| Core              | ImportDialog           | Medium     | 8              |
| Core              | BulkActionToolbar      | Medium     | 6              |
| Core              | EntityHeader           | Medium     | 6              |
| Core              | ActivityTimeline       | Medium     | 8              |
| Core              | NotificationBell       | Medium     | 6              |
| Core              | UserMenu               | Medium     | 4              |
| Core              | CommandPalette         | Medium     | 8              |
| Core              | PermissionGuard        | Medium     | 4              |
| Core              | DatePicker             | Medium     | 6              |
| Core              | DateRangePicker        | Medium     | 8              |
| Core              | FileUploader           | High       | 12             |
| Core              | PhoneInput             | Medium     | 6              |
| Core              | ProfileCard            | Low        | 4              |
| Core              | PersonAvatar           | Low        | 2              |
| Core              | AuditLog               | Medium     | 8              |
| Core              | HistoryDrawer          | Medium     | 6              |
| Core              | CommentPanel           | Medium     | 8              |
| Core              | NotesPanel             | Low        | 4              |
| Core              | AttachmentViewer       | Medium     | 6              |
| Core              | QuickAction            | Low        | 2              |
| Core              | QuickActionsGrid       | Low        | 2              |
| Core              | StickyActionBar        | Low        | 4              |
| Core              | EntitySelector         | High       | 12             |
| Core              | WorkflowStepper        | Medium     | 8              |
| Core              | StatusTimeline         | Medium     | 6              |
| Core              | CalendarView           | High       | 16             |
| Core              | ScheduleView           | High       | 12             |
| Core              | NotificationCenter     | Medium     | 8              |
| Core              | ApprovalQueue          | Medium     | 8              |
| Core              | ChartContainer         | Medium     | 6              |
| Core              | DataGrid               | High       | 24             |
| Core              | PrintButton            | Low        | 2              |
| Core              | DownloadButton         | Low        | 2              |
| Core              | ShareButton            | Medium     | 4              |
| Core              | QRCodeDisplay          | Medium     | 6              |
| Core              | ImageUploader          | Medium     | 6              |
| Core              | RichTextEditor         | High       | 16             |
| Core              | DashboardLayout        | Low        | 4              |
| Core              | DetailLayout           | Low        | 4              |
| Core              | FormLayout             | Low        | 4              |
| Core              | AuthLayout             | Low        | 2              |
| Core              | SettingsLayout         | Low        | 4              |
| Core              | TabbedLayout           | Low        | 4              |
| Core              | StatsGrid              | Low        | 2              |
| Core              | DashboardChart         | Medium     | 4              |
| Core              | ActivityFeed           | Low        | 2              |
| Core              | RecentActivity         | Low        | 2              |
| Core              | QuickActionsPanel      | Low        | 2              |
| Core              | UpcomingEvents         | Medium     | 4              |
| Core              | AnnouncementBanner     | Low        | 2              |
| Core              | DashboardHeader        | Low        | 2              |
| Core              | Form fields (17)       | Low        | 16             |
| Core              | Form sections (9)      | Low        | 12             |
| Core              | Hooks (12)             | Low        | 12             |
| Core              | Auth feature (8)       | Medium     | 16             |
| **Phase 1 Total** |                        |            | **~480 hours** |

## 21.2 Phase 2: Core Features (Weeks 5-12)

| Priority          | Component                              | Complexity | Est. Hours     |
| ----------------- | -------------------------------------- | ---------- | -------------- |
| P0                | Student directory/profile              | High       | 24             |
| P0                | Student CRUD                           | High       | 20             |
| P0                | Faculty directory/profile              | High       | 24             |
| P0                | Faculty CRUD                           | High       | 20             |
| P0                | Department/Program/Course/Subject CRUD | High       | 32             |
| P0                | Attendance marking                     | High       | 20             |
| P0                | Attendance dashboard                   | High       | 16             |
| P0                | Attendance reports                     | Medium     | 12             |
| P0                | Leave management                       | Medium     | 12             |
| P0                | Timetable view                         | High       | 20             |
| P0                | Timetable editor                       | High       | 24             |
| P0                | Academic calendar                      | Medium     | 12             |
| P0                | Admin dashboard                        | Medium     | 12             |
| P0                | Student dashboard                      | Medium     | 12             |
| P0                | Faculty dashboard                      | Medium     | 12             |
| P0                | Guardian dashboard                     | Medium     | 8              |
| P0                | Settings (all)                         | Medium     | 16             |
| P0                | Notifications                          | Medium     | 12             |
| P0                | Search (global)                        | Medium     | 8              |
| **Phase 2 Total** |                                        |            | **~316 hours** |

## 21.3 Phase 3: Examination & Marks (Weeks 13-18)

| Priority          | Component             | Complexity | Est. Hours     |
| ----------------- | --------------------- | ---------- | -------------- |
| P0                | Exam setup            | High       | 16             |
| P0                | Exam schedule         | Medium     | 12             |
| P0                | Hall allocation       | High       | 16             |
| P0                | Hall ticket           | Medium     | 8              |
| P0                | Marks entry           | High       | 20             |
| P0                | Marks verification    | Medium     | 8              |
| P0                | Grade calculator      | Medium     | 8              |
| P0                | Result publication    | Medium     | 8              |
| P0                | Result view (student) | Medium     | 8              |
| P0                | Transcript view       | Medium     | 8              |
| P0                | Marks distribution    | Medium     | 6              |
| P0                | Subject performance   | Medium     | 6              |
| P0                | Exam reports          | Medium     | 8              |
| **Phase 3 Total** |                       |            | **~132 hours** |

## 21.4 Phase 4: Promotion & Certificates (Weeks 19-24)

| Priority          | Component              | Complexity | Est. Hours     |
| ----------------- | ---------------------- | ---------- | -------------- |
| P0                | Promotion rules        | Medium     | 8              |
| P0                | Promotion review       | High       | 16             |
| P0                | Promotion approval     | Medium     | 8              |
| P0                | Graduation eligibility | Medium     | 6              |
| P1                | Certificate templates  | Medium     | 12             |
| P1                | Certificate request    | Medium     | 8              |
| P1                | Certificate approval   | Medium     | 8              |
| P1                | Certificate generation | High       | 16             |
| P1                | QR verification        | Medium     | 6              |
| P1                | Digital signature      | High       | 12             |
| P1                | Bulk certificate       | Medium     | 8              |
| P1                | Admission pipeline     | High       | 16             |
| P1                | Admission form         | High       | 20             |
| P1                | Document verification  | Medium     | 8              |
| P1                | Enrollment wizard      | High       | 16             |
| **Phase 4 Total** |                        |            | **~168 hours** |

## 21.5 Phase 5: Advanced Features (Weeks 25-30)

| Priority          | Component           | Complexity | Est. Hours     |
| ----------------- | ------------------- | ---------- | -------------- |
| P1                | Teacher promotion   | Medium     | 12             |
| P1                | Alumni directory    | Medium     | 8              |
| P1                | Alumni profile      | Low        | 4              |
| P2                | Transport module    | High       | 40             |
| P2                | Integrations module | High       | 40             |
| P2                | Library module      | High       | 40             |
| P2                | KanbanBoard         | High       | 24             |
| P2                | TreeView            | High       | 16             |
| P2                | ComparisonView      | Medium     | 8              |
| P2                | PDFViewer           | High       | 16             |
| **Phase 5 Total** |                     |            | **~208 hours** |

---

# 22. Future Extensibility

## 22.1 Plugin Architecture

The component system should support future plugin extensions:

```typescript
// Plugin interface
interface Plugin {
  name: string;
  version: string;
  components: Record<string, React.ComponentType>;
  hooks: Record<string, Function>;
  routes: RouteConfig[];
  permissions: PermissionConfig[];
}
```

## 22.2 Theme Extensibility

```typescript
// Theme configuration
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  spacing: {
    unit: number;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

## 22.3 Internationalization (i18n)

All text-based components should support i18n:

```typescript
// Component with i18n
<StatCard
  title={t('stats.totalStudents')}
  value={studentCount}
  trend={{ value: 12, direction: 'up' }}
/>
```

## 22.4 Component Composition Patterns

| Pattern                 | Example                                                            | Use Case                     |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------- |
| **Compound Components** | `<Tabs><TabsList><TabsTrigger>...</TabsTrigger></TabsList></Tabs>` | Complex UI with shared state |
| **Render Props**        | `<DataTable renderRow={(row) => <CustomRow />} />`                 | Custom rendering             |
| **HOC**                 | `withAuth(DashboardComponent)`                                     | Cross-cutting concerns       |
| **Custom Hooks**        | `useDataTable(config)`                                             | Reusable logic               |
| **Providers**           | `<ThemeProvider><App /></ThemeProvider>`                           | Global state                 |
| **Slots**               | `<Card header={<CustomHeader />} body={<CustomBody />} />`         | Flexible composition         |

## 22.5 Performance Optimization Strategies

| Strategy               | Implementation                               | Impact                |
| ---------------------- | -------------------------------------------- | --------------------- |
| **Code Splitting**     | Dynamic imports per route                    | Faster initial load   |
| **Lazy Loading**       | `React.lazy()` for heavy components          | Reduced bundle        |
| **Memoization**        | `React.memo()`, `useMemo()`, `useCallback()` | Fewer re-renders      |
| **Virtual Scrolling**  | `@tanstack/react-virtual` for large lists    | Better performance    |
| **Image Optimization** | Next.js `Image` component                    | Faster images         |
| **Font Optimization**  | `next/font`                                  | Faster text rendering |
| **Prefetching**        | `next/link` prefetch                         | Faster navigation     |
| **Streaming**          | React 19 Suspense + streaming SSR            | Faster TTFB           |
| **ISR/SSG**            | Static generation where possible             | Better performance    |

---

# Appendix A: Component Count Summary

| Category                              | Count    | Priority Distribution                  |
| ------------------------------------- | -------- | -------------------------------------- |
| **Category A: Global Shared**         | 90       | Core: 70, Important: 15, Optional: 5   |
| **Category B: Shared Business**       | 28       | Core: 18, Important: 8, Optional: 2    |
| **Category C: Student Persona**       | 18       | Core: 18                               |
| **Category C: Faculty Persona**       | 14       | Core: 14                               |
| **Category C: Admin Persona**         | 17       | Core: 15, Important: 2                 |
| **Category C: Guardian Persona**      | 7        | Core: 7                                |
| **Category D: Auth Feature**          | 8        | Core: 6, Important: 1, Optional: 1     |
| **Category D: Attendance Feature**    | 12       | Core: 10, Important: 2                 |
| **Category D: Academics Feature**     | 16       | Core: 12, Important: 2, Optional: 2    |
| **Category D: Exams Feature**         | 10       | Core: 10                               |
| **Category D: Marks Feature**         | 13       | Core: 13                               |
| **Category D: Promotion Feature**     | 7        | Core: 7                                |
| **Category D: Certificate Feature**   | 10       | Core: 7, Important: 2, Optional: 1     |
| **Category D: Timetable Feature**     | 10       | Core: 10                               |
| **Category D: Admissions Feature**    | 10       | Core: 10                               |
| **Category D: Settings Feature**      | 7        | Core: 7                                |
| **Category D: Notifications Feature** | 6        | Core: 5, Important: 1                  |
| **Category D: Alumni Feature**        | 3        | Important: 2, Optional: 1              |
| **Layout & Navigation**               | 14       | Core: 12, Optional: 2                  |
| **Dashboard**                         | 10       | Core: 8, Optional: 2                   |
| **TOTAL**                             | **~310** | Core: 255, Important: 35, Optional: 20 |

---

# Appendix B: Development Estimates

| Phase                             | Duration     | Hours            | Components          |
| --------------------------------- | ------------ | ---------------- | ------------------- |
| Phase 1: Foundation               | Weeks 1-4    | ~480             | ~80                 |
| Phase 2: Core Features            | Weeks 5-12   | ~316             | ~50                 |
| Phase 3: Examination & Marks      | Weeks 13-18  | ~132             | ~25                 |
| Phase 4: Promotion & Certificates | Weeks 19-24  | ~168             | ~35                 |
| Phase 5: Advanced Features        | Weeks 25-30  | ~208             | ~20                 |
| **Total**                         | **30 weeks** | **~1,304 hours** | **~210 components** |

---

# Appendix C: Technology Stack Integration

| Technology                  | Integration Point           | Component Examples                     |
| --------------------------- | --------------------------- | -------------------------------------- |
| **Next.js App Router**      | Routing, layouts, SSR       | All page components, layout components |
| **React 19**                | Server Components, Suspense | All server-rendered components         |
| **TypeScript**              | Type safety                 | All component props, hooks, services   |
| **Tailwind CSS v4**         | Styling                     | All component styles                   |
| **shadcn/ui**               | UI primitives               | 39 shadcn components                   |
| **Radix UI**                | Accessible primitives       | Underlying shadcn components           |
| **Lucide Icons**            | Icon system                 | All icon usage                         |
| **React Hook Form**         | Form management             | All form components                    |
| **Zod**                     | Schema validation           | All form validation                    |
| **TanStack Table**          | Table management            | DataTable, DataGrid                    |
| **TanStack Query**          | Server state                | All data-fetching hooks                |
| **date-fns**                | Date utilities              | DatePicker, Calendar                   |
| **recharts**                | Charts                      | ChartContainer, DashboardChart         |
| **@tanstack/react-virtual** | Virtual scrolling           | VirtualizedTable                       |
| **react-day-picker**        | Calendar                    | DatePicker, Calendar                   |

---

**End of Component Architecture Document**

_This document should be reviewed and updated as the project evolves. All component specifications are subject to change based on implementation requirements and stakeholder feedback._
