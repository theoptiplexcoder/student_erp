# Code Audit Checklist

Living checklist of audited items across the Student ERP monorepo.
Items are categorized into five buckets with concrete file:line pointers and verifiable reasons.

## Summary Count

- **Broken**: 3 items (3 fixed)
- **Could be better**: 1 item (1 fixed)
- **Batch concept removal**: Complete across backend, database, and frontend (0 broken references)
- **Should be removed (Unwired / Dead Code)**: 6 items (6 removed, 0 side effects)
- **Preserved (Product Impacting / Retained)**: 3 items (Preserved by policy: `ApplicationsTable`, `apps/web/components/shared/auth/*`, and `apps/api/src/modules/admin/subjects`)

---

## 1. Broken

- [x] `apps/api/src/modules/admin/students/students.service.ts:642` — Missing import of `BadRequestException` fixed by adding it to `@nestjs/common` import. Verified with `tsc --noEmit`.
- [x] `apps/api/src/modules/admin/students/students.service.ts:217` — Property `usn` on `UpdateStudentDto` assigning `null` fixed by deleting the key instead of setting `null`. Verified with `tsc --noEmit`.
- [x] `apps/api/src/verify-student.ts:14` & `apps/api/src/verify-student.ts:21` — `user.institutionId` nullability guard added (`!user.institutionId`). Verified with `tsc --noEmit`.

## 2. Batch Concept Removal (Fully Executed)

- [x] **Prisma Database**: Removed `model Batch`, all foreign key columns (`batch_id`), and all relation mappings (`batches`, `batch`) across `Institution`, `Program`, `Section`, `CourseOffering`, `Enrollment`, and `FeeStructure`. Generated updated `@prisma/client`.
- [x] **Backend API**:
  - Deleted `apps/api/src/modules/admin/batches/` module, controller, service, and DTOs.
  - Unregistered `BatchesModule` from `AdminModule`.
  - Removed batch lookups, validations, cascade deletions, and query filters from `StudentsService`, `AdmissionsService`, `SectionsService`, `ProgramsService`, `FinanceService`, `FeePlanService`, `CourseOfferingsService`, `CurriculumTermsService`, `FacultyCoursesService`, and `FacultySectionsService`.
- [x] **Frontend Web & UI**:
  - Deleted `apps/web/src/app/admin/academics/batches/` pages and routes (`page.tsx`, `new/page.tsx`, `[batchId]/page.tsx`).
  - Deleted `apps/web/src/hooks/api/admin/useBatches.ts`.
  - Removed batch selection modals and batch fields from student admission wizard (`students/new/page.tsx`).
  - Removed batch filters from student directory (`student-filters.tsx` and `students/page.tsx`).
  - Removed batch selector from change program modal (`students/[studentId]/page.tsx`).
  - Removed batch column and dialog options from academics (`sections/page.tsx`, `sections/[sectionId]/page.tsx`, `academics/page.tsx`, `programs-tab.tsx`).
  - Removed batch filter and batch rollout options from finance (`finance/plans/page.tsx`, `finance/defaulters/page.tsx`, `finance/page.tsx`).
  - Removed `/admin/batches` redirect rule from `apps/web/next.config.js`.

## 3. Preserved (Product Impacting Components)

- [x] `apps/web/src/features/admissions/components/ApplicationsTable.tsx` — **Kept**: Linked to `/tenant-admin/students/admissions/[applicationId]`; retained as part of tenant-admin application review feature.
- [x] `apps/web/components/shared/auth/*` — **Kept**: Actively imported and rendered by auth pages `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`, `(auth)/reset-password`.
- [x] `apps/api/src/modules/admin/subjects/` — **Kept**: Registered in NestJS `AdminModule` routing tree (`/admin/subjects`).

## 4. Could be better

- [x] `packages/ui/src/status-badge.tsx:7` — Removed unused `AlertCircle` import causing ESLint warning.

## 5. Should be removed (Dead & Unwired Components — Zero Product Impact Verified)

- [x] `apps/web/src/components/admin/timetable/timetable-export-button.tsx` — Removed. Legacy component completely unreferenced; exports are handled directly in timetable toolbar.
- [x] `apps/web/src/components/admin/timetable/timetable-session-settings.tsx` — Removed. Superseded by `timetable-generation-modal.tsx`; never imported or mounted in timetable module.
- [x] `apps/web/src/components/admin/faculty/AssignSectionModal.tsx` — Removed. Standalone modal superseded by inline section assignment cards on the faculty detail page (`apps/web/src/app/admin/faculty/[facultyId]/page.tsx`).
- [x] `apps/web/src/app/admin/academics/overview-tab.tsx` — Removed. Dead file left over when overview tab was removed in commit `afbb5f7`.
- [x] `apps/web/src/features/dashboard/components/{WelcomeBanner,QuickActionCard,WorkQueueCard}.tsx` — Removed. Never imported or rendered by any dashboard page.
- [x] `apps/web/src/features/students/api/use-student-dashboard.ts` — Removed. Dead duplicate hooks superseded by `@student-erp/hooks`.
- [x] `apps/api/src/routes/students/` & empty 0-byte skeleton files in `apps/api/src/modules/students/` — Removed. Zero-byte leftover skeleton files never implemented or imported.
