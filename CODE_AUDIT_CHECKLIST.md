# Code Audit Checklist

Living checklist of audited items across the Student ERP monorepo.
Items are categorized into five buckets with concrete file:line pointers and verifiable reasons.

## Summary Count

- **Broken**: 3 items (3 fixed)
- **Could be better**: 1 item (1 fixed)
- **Should be removed (Unwired / Dead Code)**: 6 items (6 removed, 0 side effects)
- **Preserved (Product Impacting / Retained)**: 3 items (Preserved by policy: `ApplicationsTable`, `apps/web/components/shared/auth/*`, and `apps/api/src/modules/admin/subjects`)

---

## 1. Broken

- [x] `apps/api/src/modules/admin/students/students.service.ts:642` — Missing import of `BadRequestException` fixed by adding it to `@nestjs/common` import. Verified with `tsc --noEmit`.
- [x] `apps/api/src/modules/admin/students/students.service.ts:217` — Property `usn` on `UpdateStudentDto` assigning `null` fixed by deleting the key instead of setting `null`. Verified with `tsc --noEmit`.
- [x] `apps/api/src/verify-student.ts:14` & `apps/api/src/verify-student.ts:21` — `user.institutionId` nullability guard added (`!user.institutionId`). Verified with `tsc --noEmit`.

## 2. Preserved (Product Impacting Components)

- [x] `apps/web/src/features/admissions/components/ApplicationsTable.tsx` — **Kept**: Linked to `/tenant-admin/students/admissions/[applicationId]`; retained as part of tenant-admin application review feature.
- [x] `apps/web/components/shared/auth/*` — **Kept**: Actively imported and rendered by auth pages `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`, `(auth)/reset-password`.
- [x] `apps/api/src/modules/admin/subjects/` — **Kept**: Registered in NestJS `AdminModule` routing tree (`/admin/subjects`).

## 3. Could be better

- [x] `packages/ui/src/status-badge.tsx:7` — Removed unused `AlertCircle` import causing ESLint warning.

## 4. Should be removed (Dead & Unwired Components — Zero Product Impact Verified)

- [x] `apps/web/src/components/admin/timetable/timetable-export-button.tsx` — Removed. Legacy component completely unreferenced; exports are handled directly in timetable toolbar.
- [x] `apps/web/src/components/admin/timetable/timetable-session-settings.tsx` — Removed. Superseded by `timetable-generation-modal.tsx`; never imported or mounted in timetable module.
- [x] `apps/web/src/components/admin/faculty/AssignSectionModal.tsx` — Removed. Standalone modal superseded by inline section assignment cards on the faculty detail page (`apps/web/src/app/admin/faculty/[facultyId]/page.tsx`).
- [x] `apps/web/src/app/admin/academics/overview-tab.tsx` — Removed. Dead file left over when overview tab was removed in commit `afbb5f7`.
- [x] `apps/web/src/features/dashboard/components/{WelcomeBanner,QuickActionCard,WorkQueueCard}.tsx` — Removed. Never imported or rendered by any dashboard page.
- [x] `apps/web/src/features/students/api/use-student-dashboard.ts` — Removed. Dead duplicate hooks superseded by `@student-erp/hooks`.
- [x] `apps/api/src/routes/students/` & empty 0-byte skeleton files in `apps/api/src/modules/students/` — Removed. Zero-byte leftover skeleton files never implemented or imported.
