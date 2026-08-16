# Student ERP — User Journeys

This document walks through the end-to-end journey of every persona defined in `personas.md`, grounded in the capabilities described in `functional_requirements.md` and mapped to the apps/portals in `project_structure.md`.

**How to read this document**

- Each journey moves roughly in order: **onboarding → routine use → periodic/exception flows → offboarding** (where applicable).
- _Primary app(s)_ points to the `apps/` entry in `project_structure.md` the persona mostly lives in. Many personas touch more than one app via the API gateway.
- A single human being can hold several personas at once (see `personas.md`'s Alice example: Faculty + Department Administrator + Examination Staff). Where that matters, it's called out.
- Machine actors (Section 21) don't have "journeys" in the human sense — they have **interaction flows**, written from the system's point of view.

---

## Table of Contents

1. [Platform Roles (SaaS)](#1-platform-roles-saas)
2. [Institution Administration](#2-institution-administration)
3. [Faculty](#3-faculty)
4. [Students](#4-students)
5. [Guardians](#5-guardians)
6. [Admissions](#6-admissions)
7. [Examination Office](#7-examination-office)
8. [Finance](#8-finance)
9. [Human Resources](#9-human-resources)
10. [Library](#10-library)
11. [Hostel](#11-hostel)
12. [Transport](#12-transport)
13. [Medical & Wellness](#13-medical--wellness)
14. [Placement & Career](#14-placement--career)
15. [Facilities](#15-facilities)
16. [IT](#16-it)
17. [Communication & Events](#17-communication--events)
18. [Student Activities](#18-student-activities)
19. [Security](#19-security)
20. [External Users](#20-external-users)
21. [System Integrations (Machine Actors)](#21-system-integrations-machine-actors)
22. [Cross-Persona Journey: A Multi-Role User](#22-cross-persona-journey-a-multi-role-user)

---

## 1. Platform Roles (SaaS)

### 1.1 Platform Super Admin

_Primary app(s): web-admin-console (platform-level surface)_

1. **Onboarding** — Granted the highest-privilege platform account outside any tenant; sets up global platform configuration (feature flags, default module entitlements per subscription tier).
2. **Tenant provisioning** — Creates a new institution tenant, selects subscription plan, and seeds the first Institution Administrator account.
3. **Routine** — Monitors the tenant list, subscription health, and platform-wide dashboards; reviews escalations from Platform Support and Platform Security.
4. **Exception flows** — Suspends, migrates, or decommissions a tenant; approves emergency access grants; arbitrates cross-tenant incidents.
5. **Offboarding a tenant** — Oversees contract-end data export/backup and tenant deletion per data retention policy.

### 1.2 Platform Support

_Primary app(s): web-admin-console_

1. **Trigger** — Receives a support ticket from an institution's staff (any persona) via the helpdesk channel.
2. **Investigation** — Looks up tenant context, reproduces the issue, and (with an auditable, time-boxed impersonation trail) views the institution-side experience if needed.
3. **Collaboration** — Hands infrastructure-level issues to Platform Operations, and suspicious-activity cases to Platform Security.
4. **Resolution** — Closes the ticket, documents the fix, and feeds recurring issues into an internal knowledge base.

### 1.3 Platform Operations

_Primary app(s): web-admin-console + services/worker, services/scheduler, services/ingestion_

1. **Routine** — Watches infrastructure dashboards: job queue health (bulk import/export, biometric/RFID ingestion), deployment pipelines, uptime.
2. **Deployment** — Ships and, if necessary, rolls back releases across tenants.
3. **Exception flows** — Responds to infra alerts (scaling events, failed ingestion batches, backup failures); escalates user-facing impact to Platform Support.

### 1.4 Platform Billing

_Primary app(s): web-admin-console (billing surface)_

1. **Setup** — Defines subscription plans/pricing tiers available to Platform Super Admin during tenant provisioning.
2. **Routine** — Tracks per-tenant invoicing and platform subscription payment status (distinct from student-fee billing owned by Finance Staff).
3. **Exception flows** — Handles plan upgrades/downgrades and dunning workflows for overdue tenant subscriptions.
4. **Reporting** — Surfaces platform revenue/churn metrics to Platform Super Admin.

### 1.5 Platform Security

_Primary app(s): web-admin-console (security surface)_

1. **Routine** — Monitors platform-wide auth anomalies and access logs across all tenants.
2. **Governance** — Maintains platform-level compliance posture (encryption, data residency policies).
3. **Exception flows** — Investigates incidents escalated by Support or automated alerts; can lock down a tenant pending investigation.
4. **External touchpoint** — Coordinates with external Auditors when a review touches platform infrastructure rather than a single institution.

---

## 2. Institution Administration

### 2.1 Institution Administrator

_Primary app(s): web-admin-console_

1. **Onboarding** — Receives tenant credentials from Platform Super Admin; completes institution profile (branding, letterhead templates, academic calendar defaults).
2. **Setup** — Configures the campus/department/program hierarchy; invites and assigns roles to Academic Administrator, Finance Staff, HR Staff, IT Staff, etc.
3. **Routine** — Manages institution-wide policy: DM policy between roles, attendance thresholds, fee-structure sign-off, module entitlements available under the subscription.
4. **Oversight** — Reviews audit logs and cross-module reports; approves major configuration changes proposed by other administrators.
5. **Ongoing** — Handles user offboarding, permission changes, data import/export, and backup verification.

### 2.2 Institution Head

_Primary app(s): web-admin-console (strategic dashboard, mostly read-only)_

1. **Routine** — Reviews institution-wide dashboards: admissions funnel, attendance trends, finance summaries, placement statistics.
2. **Decisions** — Approves policies escalated by the Institution Administrator or Academic Administrator (new programs, fee revisions, calendar changes).
3. **External-facing** — Represents the institution to Accrediting Bodies and Government Officials during compliance reviews, using compiled compliance reports.
4. **Cadence** — Engages periodically (board-level reviews) rather than day-to-day; does no data entry.

### 2.3 Academic Administrator

_Primary app(s): web-admin-console_

1. **Setup** — Defines academic years, terms/semesters, and the academic calendar; defines programs, courses, subjects, and credit structure.
2. **Curriculum** — Manages curriculum/syllabus versioning and course prerequisite mapping.
3. **Routine** — Approves faculty-to-course assignments and elective-selection workflows; coordinates with Department Administrators on section/batch creation and timetable generation.
4. **Oversight** — Monitors curriculum change history and reviews academic dashboards across the institution.

### 2.4 Regional/Zonal Administrator

_Primary app(s): web-admin-console (scoped to assigned campuses)_

1. **Access** — Logs into a cross-campus dashboard scoped strictly to the campuses assigned to them.
2. **Routine** — Reviews cross-campus reporting (attendance, fees, occupancy) across the cluster.
3. **Action** — Reallocates resources — staff, budget, seats — across campuses within scope.
4. **Escalation** — Routes anything outside their assigned scope to the Institution Administrator.

### 2.5 Department Administrator

_Primary app(s): web-admin-console_

1. **Routine** — Manages department operations: faculty assignments within the department, department budget requests.
2. **Coordination** — Works with the Academic Administrator on timetable/room allocation for department courses.
3. **Oversight** — Reviews department-wise attendance and performance reports.
4. **Escalation handling** — Resolves department-specific student/faculty issues escalated from Office Staff.

### 2.6 Campus Administrator

_Primary app(s): web-admin-console_

1. **Setup** — Manages single-campus operations: local user provisioning, campus settings that inherit from institution-level configuration (with permitted overrides).
2. **Routine** — Oversees Office Staff and coordinates with Facilities, Security, Hostel, and Transport staff on that campus.
3. **Escalation** — Handles campus-level incidents; escalates cross-campus matters to the Regional/Zonal Administrator.

### 2.7 Office Staff

_Primary app(s): web-admin-console_

1. **Routine** — Performs day-to-day data entry: student record updates, document verification, bulk import/export.
2. **Front-of-house** — Assists walk-in students, guardians, and applicants with routine queries.
3. **Output** — Generates standard letters/reports (bonafide certificates, ID cards) from the Student Information module.
4. **Escalation** — Passes complex issues to the Department or Campus Administrator.

---

## 3. Faculty

### 3.1 Faculty

_Primary app(s): web-faculty-portal, mobile_

1. **Daily** — Logs in, views assigned courses/sections/timetable.
2. **Attendance** — Takes attendance manually or via biometric/RFID/QR sync.
3. **Content** — Uploads chapter-wise resources (notes, PPTs, videos, code) organized course → unit → chapter; schedules publish/unpublish dates; tags by topic and learning outcome; version-controls materials.
4. **Assessment** — Creates and grades assignments and quizzes; enters/moderates exam marks alongside Examination Staff.
5. **Communication** — Posts announcements and answers Q&A threads in the Course Workspace; messages students within the configured DM policy.
6. **Mentoring** — Tracks advisees' progress; submits own leave requests and reviews own attendance/leave record.

### 3.2 Teaching Assistant

_Primary app(s): web-faculty-portal_

1. **Routine** — Assists assigned Faculty: helps grade assignments, monitors discussion threads, takes attendance for lab/tutorial sections.
2. **Scope** — Operates with a narrower permission set than Faculty (typically cannot finalize official grades unless explicitly delegated).
3. **Escalation** — Refers grading disputes back to the supervising Faculty member.

### 3.3 Research Staff

_Primary app(s): web-faculty-portal (research extension)_

1. **Routine** — Maintains research project records, publication tracking, and grant applications/reporting.
2. **Collaboration** — Works with Faculty on lab-linked research and with Laboratory Staff on equipment access for experiments.

### 3.4 Laboratory Staff

_Primary app(s): web-faculty-portal + app-facilities_

1. **Routine** — Manages lab equipment inventory and scheduling; supports practical/lab sessions.
2. **Coordination** — Aligns lab session timetables with Faculty and logs equipment maintenance requests through the Facilities module.

---

## 4. Students

### 4.1 Applicant

_Primary app(s): web-student-portal (pre-enrollment mode)_

1. **Application** — Registers, completes the configurable online application form for a program, pays the application fee.
2. **Verification** — Uploads required documents; status is tracked through Submitted → Under Review → Shortlisted → Offer → Accepted → Enrolled/Rejected.
3. **Evaluation** — May be scheduled for interview/counseling; entrance/merit scores are linked automatically where applicable.
4. **Outcome** — Receives an offer letter (or is placed on a waitlist); accepts the offer and pays the confirmation fee.
5. **Conversion** — Is converted into an enrolled Student record once fee payment confirms admission.

### 4.2 Student

_Primary app(s): web-student-portal, mobile_

1. **Onboarding** — Profile is created automatically at admission conversion; downloads digital ID card.
2. **Daily** — Views academic dashboard, timetable, attendance percentage, course resources; submits assignments and takes practice quizzes.
3. **Exams** — Checks attendance-linked exam eligibility, downloads hall ticket, views results/grades, and can request revaluation.
4. **Finance** — Pays fees online, views receipts and outstanding dues, applies for scholarships.
5. **Services** — Requests certificates, books library resources, reserves hostel facilities, schedules counseling appointments.
6. **Communication** — Receives announcements/notifications, messages faculty within policy, joins course discussions, registers for events and clubs.
7. **Exit** — Transitions to Graduated status at program completion, downloads transcripts/certificates, and becomes an Alumni.

### 4.3 Alumni

_Primary app(s): web-student-portal (alumni view)_

1. **Transition** — Automatically moved from Student status upon graduation; retains limited portal access.
2. **Routine** — Requests degree/certificate verification, keeps the alumni directory profile current.
3. **Engagement** — Participates in alumni events and student-mentoring programs; optionally engages with donation/fundraising features.

---

## 5. Guardians

### 5.1 Guardian

_Primary app(s): web-student-portal (guardian view), mobile_

1. **Onboarding** — Linked to a student's record at admission, with a defined relationship type (parent/guardian/sponsor).
2. **Routine** — Monitors the student's academic progress, attendance, and grades.
3. **Notifications** — Receives alerts for attendance shortages, fee dues, results, and emergencies.
4. **Finance** — Pays fees on the student's behalf and views receipts.
5. **Communication** — Messages Faculty within the Parent ↔ Faculty DM policy.

---

## 6. Admissions

### 6.1 Admissions Staff

_Primary app(s): web-admin-console (admissions module)_

1. **Intake** — Reviews incoming applications, verifies documents, flags duplicate applicants.
2. **Evaluation** — Applies configurable eligibility rules (cutoffs, quotas, reservations) and manages the seat matrix by program/category/campus.
3. **Scheduling** — Books interviews/counseling sessions and records outcomes.
4. **Offer management** — Generates offer letters and manages waitlist movement.
5. **Conversion** — Converts accepted applicants into enrolled students once fee payment confirms the seat.
6. **Reporting** — Reviews admissions funnel and conversion-rate reports.

---

## 7. Examination Office

### 7.1 Examination Staff

_Primary app(s): web-admin-console (examination module)_

1. **Setup** — Defines exam types, builds the exam schedule/timetable, generates seating arrangements and hall tickets.
2. **Logistics** — Allocates rooms and invigilators; the system checks attendance eligibility before allowing exam registration.
3. **Conduct** — Oversees in-person invigilation and logs malpractice/incident reports.
4. **Evaluation** — Manages marks entry (manual and bulk), moderation/re-evaluation workflows, and grading scheme configuration.
5. **Results** — Publishes results (respecting withholding rules for fee dues or disciplinary holds) and processes revaluation requests.
6. **Certification** — Generates transcripts and QR-verifiable certificates.

### 7.2 Online Proctor

_Primary app(s): web-admin-console (proctoring review queue)_

1. **Trigger** — Reviews a queue of flags generated automatically by the Proctoring Service during remote exam sessions.
2. **Review** — Inspects flagged moments (video/log snippets) for potential malpractice.
3. **Authority** — Can flag or void an exam attempt, documenting the rationale.
4. **Handoff** — Escalates confirmed incidents to Examination Staff for follow-up (grade withholding, disciplinary action).

---

## 8. Finance

### 8.1 Finance Staff

_Primary app(s): web-admin-console (finance module)_

1. **Setup** — Configures fee structures by program/batch/category, sets due dates/installments, and configures discounts, waivers, and scholarships.
2. **Collection** — Monitors online and offline payments (cash, cheque, DD, bank transfer), issues receipts, manages partial payments and refunds.
3. **Monitoring** — Tracks outstanding dues and triggers defaulter alerts to students/guardians via the Rules & Monitoring Engine.
4. **Reporting** — Reconciles collections daily/monthly and reviews dashboards by campus.
5. **Back office** — Handles payroll processing with HR Staff, budgeting/expense tracking, vendor payments, and financial statement export.

---

## 9. Human Resources

### 9.1 HR Staff

_Primary app(s): app-hr_

1. **Onboarding** — Maintains employee records for faculty and non-teaching staff; runs recruitment/onboarding workflows.
2. **Routine** — Manages leave applications, approvals, and balance tracking; integrates staff attendance/timesheets.
3. **Payroll** — Runs payroll integration (salary structure, deductions, payslips) in coordination with Finance Staff.
4. **Oversight** — Tracks contract/tenure expiry alerts and performance appraisal workflows.
5. **Exit** — Runs the exit/offboarding workflow when staff leave the institution.

---

## 10. Library

### 10.1 Library Staff

_Primary app(s): app-library_

1. **Setup** — Maintains the book/media catalog.
2. **Routine** — Manages circulation (issue, return, renew, reserve) via barcode/RFID; issues and manages library cards.
3. **Monitoring** — Tracks overdue items and calculates fines, with overdue alerts dispatched via the Rules & Monitoring Engine.
4. **Other** — Manages digital library/e-resource access, runs inventory audits, and curates recommendations.

---

## 11. Hostel

### 11.1 Hostel Staff

_Primary app(s): app-hostel_

1. **Allocation** — Manages room/block inventory and allocates rooms (manual or rule-based) as students submit reservation requests via the portal.
2. **Routine** — Tracks occupancy/vacancy and manages mess operations (meal plans, attendance, menu).
3. **Resident services** — Handles visitor/leave management for residents and logs maintenance requests.
4. **Monitoring** — Watches for occupancy-violation alerts from the Rules Engine; hostel fees are integrated with the Finance module.

---

## 12. Transport

### 12.1 Transport Staff

_Primary app(s): app-transport_

1. **Setup** — Configures routes/stops and assigns vehicles/drivers.
2. **Routine** — Maps students to routes/stops and processes transport subscription requests.
3. **Integration** — Transport fees flow to the Finance module; optionally tracks GPS location and boarding/deboarding attendance.

---

## 13. Medical & Wellness

### 13.1 Health Staff

_Primary app(s): app-medical-wellness_

1. **Records** — Maintains student medical records under confidentiality controls.
2. **Routine** — Schedules appointments and counseling sessions, keeping session notes protected.
3. **Emergencies** — Logs incident/emergency reports and triggers Guardian notifications when needed.
4. **Preventive care** — Tracks immunization and health-check schedules.

---

## 14. Placement & Career

### 14.1 Placement Staff

_Primary app(s): app-placement_

1. **Setup** — Registers and manages recruiters/companies; posts job and internship openings.
2. **Routine** — Manages student eligibility and application workflows, schedules placement drives, tracks interview rounds.
3. **Outcomes** — Manages offer extension/acceptance tracking and produces placement statistics by program, batch, and company.
4. **Student-facing** — Supports the student resume/profile builder.

---

## 15. Facilities

### 15.1 Facilities Staff

_Primary app(s): app-facilities_

1. **Inventory** — Maintains the asset inventory (classrooms, labs, equipment) and tracks allocation.
2. **Maintenance** — Handles maintenance requests and scheduling; receives preventive-maintenance reminders from the Rules & Monitoring Engine.
3. **Bookings** — Manages classroom/resource booking requests and tracks vendors/service providers.

---

## 16. IT

### 16.1 IT Staff

_Primary app(s): web-admin-console (IT module)_

1. **Provisioning** — Provisions and deprovisions user accounts; assigns roles and permissions per the matrix in `personas.md`.
2. **Assets** — Tracks IT devices/assets and manages network access.
3. **Integrations** — Configures biometric devices, payment gateway, LMS, and SMS/WhatsApp providers; configures SSO.
4. **Monitoring** — Reviews system health and audit logs across modules; is the first responder for institution-level technical issues.

---

## 17. Communication & Events

### 17.1 Communication Staff

_Primary app(s): web-admin-console (communication module)_

1. **Publishing** — Publishes institution/department/campus-wide announcements and manages newsletters and social media.
2. **Targeting** — Configures targeted notifications by role, batch, or campus, and sets up multi-channel delivery (email, SMS, WhatsApp, push).
3. **Events** — Manages event creation and promotion, coordinating with the Club Coordinator on student-activity events.
4. **Knowledge base** — Maintains the institutional FAQ/knowledge base.

---

## 18. Student Activities

### 18.1 Club Coordinator

_Primary app(s): app-student-activities_

1. **Setup** — Registers and manages clubs/societies, creates competitions and extracurricular events.
2. **Routine** — Tracks attendance/participation for club activities and issues participation/achievement certificates.
3. **Coordination** — Works with Communication Staff to promote events.

---

## 19. Security

### 19.1 Security Staff

_Primary app(s): app-security_

1. **Routine** — Manages visitor registration and gate-pass issuance; checks visitors in and out.
2. **Access control** — Operates biometric device integration for gate access.
3. **Incidents** — Logs security incidents and coordinates with Communication Staff on emergency alert broadcasts.

---

## 20. External Users

### 20.1 Recruiter

_Primary app(s): app-placement (external-facing view)_

1. **Onboarding** — Onboarded by Placement Staff for a hiring cycle.
2. **Routine** — Posts job/internship openings and reviews eligible student applications.
3. **Drives** — Participates in placement drives, records interview outcomes, and manages the offers they extend.

### 20.2 Vendor

_Primary app(s): portal-vendor_

1. **Onboarding** — Approved as a vendor by Facilities, Finance, or IT staff.
2. **Routine** — Views purchase orders and submits invoices.
3. **Tracking** — Tracks payment status, integrated with Finance's accounts-payable process.

### 20.3 Auditor

_Primary app(s): portal-auditor_

1. **Access grant** — Granted scoped, read-only, typically time-boxed access by the Institution Administrator or Platform Security for an audit period.
2. **Review** — Examines compliance-relevant reports, financial statements, and audit trails across modules.
3. **Output** — Generates/exports scheduled regulatory reports.
4. **Offboarding** — Access is revoked once the audit period closes.

### 20.4 Accrediting Body

_Primary app(s): portal-auditor_

1. **Access grant** — Granted access to the accreditation documentation repository and relevant reports (curriculum, faculty qualifications, outcomes).
2. **Review** — Assesses the institution's accreditation compliance checks (surfaced by the Rules & Monitoring Engine).
3. **Output** — Records accreditation findings/certification status against the institution.

### 20.5 Government Official

_Primary app(s): portal-auditor (regulatory reporting view)_

1. **Access grant** — Granted read-only access to regulatory reporting features (enrollment statistics, compliance reports).
2. **Routine** — Requests and receives scheduled regulatory report exports.

### 20.6 Corporate Client Administrator

_Primary app(s): portal-corporate-client_

1. **Onboarding** — Onboarded when a company sponsors employees for training programs at the institution.
2. **Routine** — Views sponsored learners' enrollment, progress, and completion status (no access to grading or internal institution data).
3. **Finance** — Receives invoices for sponsored learners and tracks payment.

---

## 21. System Integrations (Machine Actors)

_These are interaction flows, not human journeys — written from the system's point of view._

### 21.1 Authentication Service

Handles login/identity verification for every human persona above; issues session tokens and SSO assertions; logs auth events that feed Platform Security's dashboards.

### 21.2 Payment Gateway

Processes online fee, application, hostel, and transport payments initiated by Students/Guardians/Applicants; emits events (e.g., `FeeChargeRequested` → `PaymentConfirmed`) over the event bus to the Finance module; also processes Platform Billing's subscription payments.

### 21.3 Notification Service

Consumes domain events — attendance shortage, grades published, fee due, assignment graded, resource uploaded, timetable changed, leave approved — and dispatches them via email, SMS, WhatsApp, push, or in-app channels according to each user's notification preferences.

### 21.4 AI Assistant

Powers automation and analytics: predictive at-risk indicators (attendance/grades/fee defaults), in-portal assistance for students and faculty, and report summarization for the Institution Head; feeds anomaly signals into the Rules & Monitoring Engine.

### 21.5 Biometric Device

Captures attendance and gate-access events (fingerprint/face) at the edge and pushes them through the ingestion service into the Attendance and Security modules.

### 21.6 LMS Integration

Synchronizes online-class attendance and course content between an external LMS and the Course Workspace, in either direction.

### 21.7 ERP/API Integration

Generic connector for external systems (government reporting portals, third-party HR/finance systems) via the published SDK/API surface in `libs/shared/sdk`; configured per institution by IT Staff.

### 21.8 Proctoring Service

Performs automated monitoring of remote exam sessions (face detection, tab-switch detection, etc.) and feeds flags into the Online Proctor's review queue for human adjudication.

---

## 22. Cross-Persona Journey: A Multi-Role User

`personas.md` is explicit that authorization is permission-driven, not persona-driven, and that one person can hold several roles. A worked example, following the doc's own "Alice" case (Faculty + Department Administrator + Examination Staff):

1. **Morning** — Logs in once; the portal surfaces a combined dashboard reflecting all three role's permissions rather than three separate accounts.
2. **As Faculty** — Takes attendance for her assigned section, uploads a lecture recording to the Course Workspace, and answers a student's discussion-thread question.
3. **As Department Administrator** — Reviews her department's attendance report and approves a room-allocation request from another faculty member.
4. **As Examination Staff** — Later in the term, enters and moderates marks for a course she doesn't teach, since that permission belongs to her Examination Staff role, not her Faculty one.
5. **Permission boundary** — She cannot approve her _own_ exam moderation request or grade her _own_ course's exam papers if institution policy walls off conflicts of interest — the system enforces this at the permission level, independent of which "hat" she's wearing when she logs in.

This is the practical payoff of separating **Person**, **Role**, and **Job Title**: the UI can present one unified identity while the permission engine underneath keeps each role's authority scoped and auditable.
