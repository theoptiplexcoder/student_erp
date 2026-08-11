# Student ERP — MVP Definition

This document defines a **viable, buildable MVP** carved out of the full product scope described in `project_structure.md`, `personas.md`, `functional_requirements.md`, `user_journey.md`, `schemas.md`, and the per-persona journey docs. The full product is a 49-persona, 25-module, multi-tenant platform designed to scale from a small coaching center to a full university. The MVP's job is to prove the core loop — **a student's academic life, run digitally, for one institution, for one term** — with the smallest slice that is genuinely usable in production, not a demo.

**Guiding cut rule:** keep anything a single-campus institution needs to run one term end-to-end (enroll → attend class → get graded → pay fees → see results); defer anything that's an optional department (library, hostel, transport, placement, HR, security, clubs), an advanced integration (biometric, GPS, proctoring, LMS sync), or a scale feature (multi-campus, regional ops, B2B portals).

---

## 1. Target customer for v1

One **single-campus institution** (the smallest end of the stated range — e.g., a coaching center or a small college with one program cluster), not a multi-campus university.

Consequences of this choice:
- No Regional/Zonal Administrator, no cross-campus reporting, no campus-level config inheritance.
- No franchise/multi-tenant-per-institution complexity beyond basic tenant isolation.
- One academic calendar, one fee currency, one branding profile.

This is the same "coaching center" end of the spectrum the Course Workspace design rationale in `functional_requirements.md` §9 explicitly designs toward — the MVP takes that rationale at its word.

---

## 2. In-scope personas (9 of 49)

| Persona | Why it's in the MVP |
|---|---|
| **Platform Super Admin** | Someone has to provision the one tenant and seed the first admin. Kept minimal — no billing/subscription self-serve. |
| **Institution Administrator** | Owns setup: institution profile, campus/department/program hierarchy (single campus), user invites, role assignment. |
| **Academic Administrator** | Defines academic year/terms, programs/courses, sections/batches, faculty-to-course assignment. *(Can be the same human as Institution Administrator wearing a second role — the permission model supports this from day one.)* |
| **Faculty** | Attendance, grading, resource upload, Course Workspace. The one role that has to feel great, since it's the daily-use core. |
| **Student** | The primary consumer: portal for attendance, resources, assignments, grades, fees. |
| **Guardian** | Read-only visibility + fee payment for their linked student. Kept because fee payment is a top guardian use case and it's cheap to include once Student exists. |
| **Admissions Staff** | Runs the one conversion flow that populates everything else: applicant → enrolled student. |
| **Finance Staff** | Configures fee structure, reconciles payments, tracks dues. |
| **Examination Staff** *(folded into Faculty + a lightweight admin function, not a separate portal)* | Marks entry/moderation and result publishing exist as workflows, not a dedicated persona UI, in v1. |

**Everything else in `personas.md` is deferred** — see §5.

---

## 3. In-scope modules

Feature lists below are **trimmed subsets** of the corresponding `functional_requirements.md` sections — not the full P0 list. Anything not mentioned here is out of scope for MVP even if the source doc marks it P0.

### 3.1 Platform & Institution Administration
- Manual tenant provisioning (Platform Super Admin creates one tenant, seeds Institution Administrator) — no self-serve signup, no subscription plan picker UI
- Institution profile: name, logo, single campus, academic year/terms
- User invite + role assignment (a person can hold multiple roles, per the Person/Role/Job Title model)
- Basic audit log (who changed what, when) — table-level, not a UI report builder yet

*Deferred:* subscription billing, feature-flag tiers, tenant suspension/migration tooling, SSO, multi-campus hierarchy.

### 3.2 Student Information
- Student record: ID, demographics, contact info, photo, program/course/batch/section
- Lifecycle status: Applicant → Enrolled → Active → Graduated/Withdrawn *(Suspended and Alumni states exist in the schema but have no dedicated workflow yet)*
- Guardian relationship link
- Student search/filter by program, batch, status

*Deferred:* bulk CSV import/export, ID card generation, custom fields, record merge/de-dup, document verification workflow, transfer-credit history.

### 3.3 Admissions
- Configurable online application form (one program at a time is fine)
- Application fee payment (via Payment Gateway)
- Status tracking: Submitted → Under Review → Offer → Accepted → Enrolled → Rejected
- Manual conversion: accepted applicant → enrolled Student record (triggers `ApplicantConvertedToStudent`)

*Deferred:* eligibility-rule engine, quotas/reservations, interview scheduling, waitlist automation, application dedup, admissions funnel analytics beyond a basic count.

### 3.4 Academic & Curriculum
- Academic year/term definition, academic calendar (holidays/breaks)
- Programs, courses, credit structure (flat, one level — no versioning yet)
- Section/batch creation and student allocation
- Faculty-to-course assignment
- **Manual** timetable entry (no auto-generation, no room-conflict solver)

*Deferred:* curriculum/syllabus versioning, prerequisite mapping, elective selection workflow, auto-timetabling, room/resource allocation engine.

### 3.5 Attendance
- Manual attendance recording by Faculty, per session
- Attendance percentage calculation
- One configurable threshold (e.g., 75%) with a simple "below threshold" flag — this is a hardcoded rule, not the full Rules & Monitoring Engine
- Attendance report: per student, per course

*Deferred:* biometric/RFID/QR/GPS/facial capture, LMS attendance sync, offline sync, correction/approval workflow, consecutive-absence pattern detection, escalation workflows, exam-eligibility gating.

### 3.6 Examination & Assessment
- Marks entry (manual, per course/exam)
- One configurable grading scheme (percentage or letter grade — pick one, not both)
- Result publishing (visible to Student + Guardian)
- Basic pass/fail computation

*Deferred:* hall tickets, seating arrangement, invigilator allocation, online/remote exam sessions, proctoring integration, moderation/re-evaluation workflow, transcript/certificate generation, digital verification, result analytics.

### 3.7 Finance & Fee Management
- Configurable fee structure per program/batch (tuition only — no hostel/transport fee heads yet, since those modules don't exist)
- One-time + installment fee due dates
- Online payment (Payment Gateway) + manual offline recording (cash/bank transfer)
- Receipt generation
- Outstanding-dues view for Finance Staff, Student, and Guardian

*Deferred:* discounts/waivers/scholarships, late-fee automation, refund processing, payroll, budgeting, vendor payments, financial statement export, reconciliation dashboards.

### 3.8 Student Portal
- Dashboard: timetable, attendance %, enrolled courses
- Course Workspace access: announcements, resources, assignments
- Submit assignments, view grades and results
- Pay fees online, view receipts and dues
- Profile view/edit (contact info)

*Deferred:* practice quizzes, service request ticketing, library/hostel booking, counseling scheduling, digital ID card download, application-status tracking (pre-enrollment is covered by the Admissions flow, not a portal view).

### 3.9 Faculty Portal & Course Workspace
- View assigned courses/sections/timetable
- Take attendance
- Enter/manage grades
- Create and grade assignments
- Upload resources organized by course → unit/chapter (notes, PDFs, slides, videos, links)
- Publish/unpublish resources
- Course-level announcements and a simple Q&A discussion thread

*Deferred:* quizzes/tests as a distinct assessment type, resource versioning, access/download tracking, resource tagging by learning outcome, mentoring/advisee tracking, leave management for faculty.

### 3.10 Communication (institution-wide, thin slice)
- Institution-wide announcements (one channel: in-app + email)
- Event-driven notifications for the events the MVP actually emits: assignment graded, grades published, fee due, attendance shortage, resource uploaded
- Per-user notification on/off toggle (not full per-channel preference granularity)

*Deferred:* SMS/WhatsApp/push channels, configurable DM policy matrix, direct messaging between roles, institution knowledge base/FAQ.

### 3.11 Reporting (minimum viable)
Three dashboards, not a report builder:
- Attendance % by course/batch
- Fee collection status (collected vs. outstanding)
- Admissions funnel (applied → offered → enrolled counts)

*Deferred:* cross-module report builder, scheduled report email delivery, PDF/Excel export, drill-down by campus/department, predictive at-risk indicators.

---

## 4. In-scope machine actors (3 of 8)

| Actor | MVP scope |
|---|---|
| **Authentication Service** | Login/session for the 9 in-scope personas. No SSO. |
| **Payment Gateway** | Application fees + tuition fee payments. One provider integration. |
| **Notification Service** | Email + in-app only. Consumes the 5 events listed in §3.10. |

*Deferred:* AI Assistant, Biometric Device, LMS Integration, ERP/API Integration, Proctoring Service.

---

## 5. Explicitly deferred (post-MVP)

**Entire modules:** HR, Library, Hostel, Transport, Medical & Wellness, Placement & Career, Facilities & Asset Management, IT Administration (beyond basic user provisioning), Security & Access Control, Student Activities & Clubs, Alumni Management, Regional/Cross-Campus Operations, all External/B2B Portals (Corporate Client, Auditor, Accrediting Body, Government, Vendor), Rules & Monitoring Engine as a *configurable* engine (MVP hardcodes the one attendance threshold instead).

**Personas:** all 32 institution-facing personas not listed in §2, plus all 6 External Users, plus 5 of 8 machine actors.

**Cross-cutting features deferred everywhere:** multi-channel notifications beyond email/in-app, PDF/Excel export, scheduled reports, audit-trail UI (the data is captured; the report isn't built), custom fields, bulk import/export, digital certificate/ID generation, any biometric/RFID/GPS/facial capture, online proctoring, predictive analytics.

---

## 6. Architecture scope for MVP

From `project_structure.md`, the MVP builds:

**Apps:**
- `web-student-portal`
- `web-faculty-portal`
- `web-admin-console` (serves Platform Super Admin, Institution Administrator, Academic Administrator, Admissions Staff, Finance Staff — one console, permission-gated views, rather than separate apps)
- `api-gateway`

*Not built yet:* `mobile`, all `app-*` standalone modules, all `portal-*` external apps.

**Core libs:**
- `libs/core/student`
- `libs/core/academic`
- `libs/core/attendance`
- `libs/core/examination`
- `libs/core/finance`
- `libs/core/communication` (Course Workspace slice only)
- `libs/core/platform-admin` (tenant + institution setup only)

*Not built yet:* `libs/core/rules-engine` (hardcoded rule instead), `libs/core/reporting` (three dashboards live directly in the consuming apps instead of a generalized reporting lib), `libs/regional-ops`.

**Shared libs:**
- `libs/shared/ui`, `auth`, `database`, `types`, `config`
- `libs/shared/notifications` (email + in-app channel only)
- `libs/shared/integrations` (payment gateway only)

*Not built yet:* `libs/shared/ai`, `libs/shared/sdk` (no external B2B/API consumers yet).

**Services:**
- Minimal `services/scheduler` for fee-due and attendance-threshold checks (the one hardcoded rule from §3.5/§3.10 needs *something* to run it on a schedule).

*Not built yet:* `services/worker` (no bulk import/export yet), `services/ingestion` (no biometric/RFID data source yet).

The event bus / SDK boundary pattern from `project_structure.md` should still be honored even at MVP scale (event names below), so that adding standalone apps later doesn't require re-architecting Core.

**Events actually emitted/consumed in MVP** (subset of `schemas.md` §24):
`ApplicationSubmitted`, `ApplicationFeeChargeRequested`, `PaymentConfirmed`, `OfferIssued`, `ApplicantConvertedToStudent`, `AttendanceRecorded`, `ResultPublished`, `FeeChargeRequested`.

---

## 7. Core MVP user journey (the one story that has to work end-to-end)

1. **Platform Super Admin** provisions the tenant and seeds an Institution Administrator account.
2. **Institution Administrator** sets up the institution profile, one campus, and invites an Academic Administrator, Admissions Staff, Finance Staff, and a Faculty member.
3. **Academic Administrator** defines the academic year/term, a program, a course, and a section; assigns the Faculty member to teach it.
4. **Admissions Staff** publishes an application form; an **Applicant** applies and pays the application fee; Admissions Staff reviews, makes an offer, and converts the accepted applicant into an enrolled **Student** — who is automatically placed in the section.
5. A **Guardian** is linked to the Student.
6. **Finance Staff** configures the term's tuition fee structure; the Student/Guardian pays online; a receipt is generated.
7. **Faculty** takes attendance for a class session, uploads a lecture resource to the Course Workspace, and creates an assignment.
8. **Student** logs in, checks the timetable and attendance %, downloads the resource, and submits the assignment.
9. **Faculty** grades the assignment and later enters exam marks; results are published.
10. **Student** and **Guardian** see the published result and get a notification.

If all ten steps work for one institution, one term, one course — the MVP is viable.

---

## 8. Success criteria

The MVP is "viable" when a single-campus institution can:
- Run one full term without needing a spreadsheet or paper process for: enrollment, attendance, grading, fee collection, or resource distribution.
- Have every one of the 9 in-scope personas log in and complete their part of §7 without staff needing engineering support.
- Trust that data survives (audit fields, soft deletes) even though the reporting/export layer isn't built yet.

It is **not** a failure of the MVP that a hostel, a library, a transport route, or a second campus can't be managed — those are explicitly out of scope, not oversights.

---

## 9. Suggested next phases (not part of this MVP)

- **Phase 2:** Library, Hostel, Transport (the next-most-common departments after core academics/finance), Rules & Monitoring Engine as a real configurable engine, bulk import/export, PDF/Excel export, multi-channel notifications (SMS/WhatsApp).
- **Phase 3:** HR, Placement, Facilities, Security, Regional/Cross-Campus Operations, multi-campus support.
- **Phase 4:** External/B2B portals (Corporate Client, Auditor, Vendor, Recruiter), Student Activities/Clubs, Alumni Management, AI Assistant, biometric/GPS/proctoring integrations, predictive analytics.

This phasing follows the same priority ladder already implied by the P0/P1/P2 split in `functional_requirements.md`'s Build Priority Summary — the MVP is simply P0 with a second, sharper cut applied on top of it.
