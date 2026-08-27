# FINAL GAP STATUS LEDGER

| Gap ID  | Priority | Status              | Dependency | Notes                                                                                               |
| ------- | -------- | ------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| GAP-002 | P0       | COMPLETED           | NONE       | Fixed major security and multitenancy bypass vulnerabilities in academic controllers.               |
| GAP-003 | P0       | COMPLETED           | NONE       | Built `Application` schema, Admissions funnel UI, and applicant conversion logic.                   |
| GAP-004 | P0       | COMPLETED           | NONE       | Added `Guardian` Prisma schema mapping and `UserRole.GUARDIAN` enum.                                |
| GAP-005 | P0       | COMPLETED           | NONE       | Implemented Faculty-to-Course assignment APIs and Admin UI within Section Details.                  |
| GAP-006 | P0       | ALREADY_IMPLEMENTED | GAP-005    | Scout incorrectly flagged as missing; functionality natively exists in `faculty/timetable/session`. |
| GAP-007 | P1       | COMPLETED           | GAP-005    | Built Faculty workspace (upload resources, create/grade assignments) and Student workspace UI.      |
| GAP-001 | P0       | DEFERRED            | NONE       | Finance Backend & Schema is explicitly Out of Scope.                                                |
| GAP-008 | P1       | NOT_STARTED         | GAP-005    | Admin Timetable UI grid page.                                                                       |

---

## Completed

- **GAP-002 (Multitenant Security):** Locked down `programs`, `course-offerings`, `enrollments`, and `curriculums` controllers. Enforced `institutionId` scoping from the JWT to strictly isolate cross-tenant data modification.
- **GAP-003 (Application Schema & Funnel):** Solved the missing admissions pipeline by appending the `Application` schema, creating a `SUBMITTED -> ACCEPTED -> ENROLLED` status flow, building the API conversion script, and adding the actual Review Kanban/List UI for Admissions Staff.
- **GAP-004 (Guardian Persona):** Added the `GUARDIAN` role to the authentication enums and built the `Guardian` database model mapping securely to multiple enrolled students.
- **GAP-005 (Faculty Assignments):** Developed the API endpoints and Section Admin UI allowing administrators to formally assign a faculty member to teach specific courses in specific terms.
- **GAP-007 (Course Workspace):** Completed the end-to-end assignment and resources loop. Faculty can now post material and assignments via their portal. Students can upload submission links (GitHub, Drive) from their portal. Faculty can then grade and append feedback to those submissions.

## Deferred

- **GAP-001 (Finance / Fee Management):**
  - **Reason:** Explicitly marked _DEFERRED — FINANCE BACKEND OUT OF CURRENT SCOPE_. Resolving this functionally requires heavy schema changes (`Transactions`, `Receipts`, `Payments`), which conflicts with the strict rule to not mutate finance database patterns during this phase.

## Blocked

None.

## Failed Verification

None.

## Remaining Work

1. **GAP-008 (Admin Timetable UI) - P1**
   - **Details:** The `TimetableEntry` schema exists, but `apps/web/src/app/admin/timetable/page.tsx` returns `null`. An interactive drag-and-drop or form-based schedule grid needs to be built for the Academic Administrator.
2. **GAP-001 (Finance UI)**
   - **Details:** Though the backend is deferred, the UI mockups for Student Fee Payments and Finance Admin tracking can be developed using static/mock hooks if instructed in future scope.

## Additional Discovered Issues

- **Missing Test Suites:** The monorepo has almost zero unit or integration tests (only 4 `spec.ts` files across the entire API). The codebase relies almost exclusively on manual compilation and runtime verification.
- **Dangling Route:** The `CourseOfferings` and `Enrollments` controllers originally used `any` types for all their inbound DTOs. These could benefit from strict Zod/class-validator schemas.
