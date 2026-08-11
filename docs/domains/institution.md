# Student ERP — Institution Administration: Detailed User Journeys

This document expands **Section 2 (Institution Administration)** of `user_journey.md` into full detail for the seven personas that run an institution day-to-day: **Institution Administrator, Institution Head, Academic Administrator, Regional/Zonal Administrator, Department Administrator, Campus Administrator, and Office Staff.**

It is grounded in:
- `personas.md` — persona definitions, the Person/Role/Job-Title separation, and the Core Role Hierarchy
- `functional_requirements.md` — the specific system capabilities each step relies on (cited by section number)
- `project_structure.md` — which app/lib each action ultimately touches

**How to read this document**
- Every persona section follows the same arc: **Onboarding → Setup → Routine → Periodic/Exception → Escalation → Reporting → Offboarding** (where applicable).
- *Primary app(s)* always resolves to `web-admin-console` (per `project_structure.md`), scoped by role permissions — there is one console, not seven apps.
- *Functional grounding* lines point to the exact capability in `functional_requirements.md` that makes the step possible, so this document never invents behavior the FR doc doesn't already define.
- Per `personas.md`'s design principle, **authorization is permission-driven, not persona-driven** — a single Person may hold several of these Roles at once (see the worked "Alice" example in `user_journey.md` §22). The journeys below describe what a Role can do, independent of how many Roles any one Person happens to hold.

---

## Table of Contents
1. [Institution Administration Hierarchy Overview](#1-institution-administration-hierarchy-overview)
2. [Institution Administrator](#2-institution-administrator)
3. [Institution Head](#3-institution-head)
4. [Academic Administrator](#4-academic-administrator)
5. [Regional/Zonal Administrator](#5-regionalzonal-administrator)
6. [Department Administrator](#6-department-administrator)
7. [Campus Administrator](#7-campus-administrator)
8. [Office Staff](#8-office-staff)
9. [Cross-Persona Collaboration Map](#9-cross-persona-collaboration-map)
10. [Consolidated Escalation Matrix](#10-consolidated-escalation-matrix)
11. [Functional Grounding Index](#11-functional-grounding-index)

---

## 1. Institution Administration Hierarchy Overview

Per `personas.md`'s Core Role Hierarchy, the institution-facing roles nest as follows:

```
Institution Administrator ── (peer, strategic) ── Institution Head
        │
        ▼
Academic Administrator
        │
        ▼
Regional/Zonal Administrator   (only in multi-campus institutions)
        │
        ▼
Campus Administrator
        │
        ▼
Department Administrator
        │
        ▼
Office Staff
```

Three things this hierarchy implies for every journey below:

1. **Scope narrows as you go down.** Institution Administrator sees everything; Regional/Zonal is bounded to assigned campuses; Campus Administrator to one campus; Department Administrator to one department within a campus; Office Staff typically to a single front-desk queue.
2. **Escalation flows up; delegation flows down.** An issue Office Staff can't resolve goes to Department or Campus Administrator; a policy decision made at Institution Administrator or Institution Head level flows down as configuration.
3. **Institution Head sits outside the operational chain.** It is a strategic, largely read-only role (per `personas.md`: "Approves policies, views reports... does no data entry") that receives escalations only for policy sign-off, not day-to-day incidents.

---

## 2. Institution Administrator

**Job titles this Role may carry:** Registrar (folded in per `personas.md`'s deferred list), ERP Administrator, Vice Principal (Administration) — title is a display attribute only.
**Primary app:** `web-admin-console`, full institution-wide scope.
**Reports to:** Platform Super Admin (for platform-level matters); peer of Institution Head for policy.

### 2.1 Onboarding
- Receives tenant credentials and an initial invitation from the **Platform Super Admin**, who seeded this account during tenant provisioning (`user_journey.md` §1.1).
- Completes the institution profile: legal name, branding (logo), letterhead templates, default academic-calendar template.
  *Functional grounding:* FR §24 Institution-Level — "Institution profile and settings," "Branding/customization (logo, letterhead templates)."
- Reviews the module entitlements enabled under the institution's subscription tier (set by Platform Super Admin) and decides which are activated for use (e.g., Hostel and Transport off for a day-school tenant).

### 2.2 Setup
- Builds the **campus → department → program hierarchy** that every other institution-facing role will be scoped against.
  *Functional grounding:* FR §24 — "Campus/department/program hierarchy configuration."
- Invites and assigns roles to the rest of the institution-facing personas: Academic Administrator, Regional/Zonal Administrator (if multi-campus), Campus Administrator(s), Department Administrator(s), Office Staff, and functional-department leads (Finance Staff, HR Staff, IT Staff, Examination Staff, Admissions Staff, etc.).
  *Functional grounding:* FR §24 — "User and role/permission management," cross-referenced against the ~250–600 fine-grained permissions described in `personas.md`.
- Sets the DM policy matrix (Student↔Faculty, Faculty↔Faculty, Student↔Student, Parent↔Faculty, Administration↔Users) that Communication Staff and every messaging surface will enforce.
  *Functional grounding:* FR §9 — "Direct messaging, constrained by configurable policy."
- Defines institution-wide attendance thresholds that feed the Rules & Monitoring Engine.
  *Functional grounding:* FR §4 "Custom attendance policies" + FR §23 "Configurable rule definition."
- Configures fee-structure sign-off requirements handed to Finance Staff.

### 2.3 Routine Operations
- Manages ongoing institution-wide policy changes: attendance thresholds, DM policy adjustments, fee-structure approval gates, module entitlement toggles.
- Handles day-to-day **user offboarding and permission changes** as staff join, leave, or change roles — always at the permission level, per the Person/Role/Job-Title separation in `personas.md`.
- Runs periodic **data import/export and backup verification**.
  *Functional grounding:* FR §24 — "Data import/export and backup."
- Reviews **audit logs and cross-module reports** flowing up from every campus/department.
  *Functional grounding:* FR §24 — "Audit logs across modules"; FR §25 Reporting & Analytics.

### 2.4 Exception / Periodic Flows
- Approves major configuration changes proposed by Regional/Zonal, Campus, or Department Administrators before they take effect institution-wide (e.g., a new fee category, a new DM policy exception).
- Arbitrates conflicts that Regional/Zonal Administrators or Campus Administrators can't resolve within their own scope.
- Handles emergency access grants (e.g., temporary elevated permission for an incident) — logged for audit.
- Coordinates with **Platform Security** and **IT Staff** during a security incident that crosses department or campus lines.
- Prepares for external audits: works with **Auditor** or **Accrediting Body** access grants (scoped, time-boxed, per `user_journey.md` §20.3–20.4) and briefs the **Institution Head** who represents the institution externally.

### 2.5 Escalation
- **Receives escalations from:** Regional/Zonal Administrator (cross-campus matters outside their scope), Campus Administrator (campus-level incidents beyond local authority), Department Administrator (department disputes), Office Staff (via the chain above).
- **Escalates to:** Institution Head for policy decisions requiring board-level sign-off (new programs, fee revisions, calendar changes); Platform Support/Security for platform-level or infrastructure issues outside institution control.

### 2.6 Offboarding (of other users, not self)
- Runs the offboarding workflow when any institution-facing staff member leaves: deprovisions accounts (in coordination with IT Staff), revokes permissions, reassigns ownership of records (e.g., a Department Administrator's pending approvals).

---

## 3. Institution Head

**Job titles this Role may carry:** Principal, Director, Chancellor, Vice Chancellor, President — all map to the same Role per `personas.md`.
**Primary app:** `web-admin-console`, strategic dashboard surface — largely read-only.
**Cadence:** Periodic (board-level reviews), not daily.

### 3.1 Onboarding
- Provisioned by Institution Administrator with dashboard-level access; no configuration responsibilities are assigned to this Role.

### 3.2 Routine
- Reviews institution-wide dashboards on a recurring cadence: admissions funnel, attendance trends, finance summaries, placement statistics.
  *Functional grounding:* FR §25 — "Configurable dashboards per role," "Drill-down analytics (institution → campus → department → course → student)."
- Consumes **AI-generated report summarization** rather than raw data tables where available.
  *Functional grounding:* `user_journey.md` §21.4 (AI Assistant — "report summarization for the Institution Head").

### 3.3 Decisions
- Approves or declines policies escalated by Institution Administrator or Academic Administrator: new academic programs, fee revisions, academic-calendar changes.
- Does not perform data entry or day-to-day configuration — every action in this Role is a review-and-decide action on something prepared by another Role.

### 3.4 External-Facing
- Represents the institution to **Accrediting Bodies** and **Government Officials** during compliance reviews, using compiled compliance reports generated via the Rules & Monitoring Engine's accreditation-compliance checks.
  *Functional grounding:* FR §23 — "Accreditation compliance checks"; `user_journey.md` §20.4.

### 3.5 Escalation
- **Receives escalations from:** Institution Administrator and Academic Administrator, exclusively for policy-level sign-off — never operational incidents.
- **Escalates to:** No one within the institution; this is the top of the institution-side hierarchy. For platform-level constraints (e.g., a subscription tier that blocks a desired feature), the request routes back through Institution Administrator to Platform Billing/Super Admin.

---

## 4. Academic Administrator

**Primary app:** `web-admin-console`, institution-wide academic scope.
**Reports to:** Institution Administrator (operationally); escalates policy matters toward Institution Head.

### 4.1 Setup
- Defines **academic years, terms/semesters, and the academic calendar**.
  *Functional grounding:* FR §3 — "Define academic years, terms/semesters, and academic calendar."
- Defines **programs, courses, subjects, and credit structure**.
  *Functional grounding:* FR §3 — "Define programs, courses, subjects, and credit structure."
- Establishes curriculum/syllabus versioning conventions and course prerequisite mapping.
  *Functional grounding:* FR §3 — "Curriculum/syllabus versioning," "Course prerequisite mapping."

### 4.2 Curriculum Management
- Manages ongoing curriculum change history — every syllabus revision is versioned, not overwritten.
- Reviews and approves prerequisite-map changes proposed by Department Administrators before they affect student elective-selection workflows.

### 4.3 Routine
- Approves **faculty-to-course assignments** proposed by Department Administrators.
  *Functional grounding:* FR §3 — "Faculty-to-course assignment."
- Approves the **elective-selection workflow** design for students each term.
  *Functional grounding:* FR §3 — "Elective course selection workflow for students."
- Coordinates with Department Administrators on **section/batch creation and timetable generation**, and with Campus Administrators on room/resource allocation for those timetables.
  *Functional grounding:* FR §3 — "Section/batch creation," "Timetable/schedule creation," "Room and resource allocation for classes."

### 4.4 Oversight
- Monitors curriculum change history institution-wide.
- Reviews academic dashboards (pass rates, grade distributions feeding from Examination module, course-load balance) via FR §25 drill-down analytics.

### 4.5 Exception Flows
- Adjudicates disputes over prerequisite mapping or elective-seat allocation that a Department Administrator escalates.
- Handles mid-term curriculum emergencies (e.g., a course cancellation) by re-triggering the section/batch and timetable workflows.

### 4.6 Escalation
- **Receives escalations from:** Department Administrator (course/timetable/prerequisite disputes), Campus Administrator (room-allocation conflicts across departments).
- **Escalates to:** Institution Administrator for anything requiring institution-wide policy change; Institution Head (via Institution Administrator) for new-program approval.

---

## 5. Regional/Zonal Administrator

*Applies only to multi-campus institutions.*
**Primary app:** `web-admin-console`, scoped strictly to assigned campuses.
**Reports to:** Institution Administrator.

### 5.1 Access & Scope
- Logs into a cross-campus dashboard that is bounded — by permission, not by UI convention — to the specific campuses assigned to them.
  *Functional grounding:* FR §21 — "Scoped access limited to assigned campuses."

### 5.2 Routine
- Reviews **cross-campus reporting**: attendance, fees, occupancy, aggregated across the cluster of assigned campuses.
  *Functional grounding:* FR §21 — "Cross-campus reporting and dashboards."
- Monitors how each Campus Administrator in scope is tracking against institution-wide policy set by Institution Administrator.

### 5.3 Action
- **Reallocates resources** — staff, budget, seats — across campuses within their assigned cluster, in response to enrollment shifts or capacity constraints.
  *Functional grounding:* FR §21 — "Resource reallocation across campuses (staff, budget, seats)."
- Approves campus-level configuration overrides proposed by a Campus Administrator, as long as they stay within institution-level inheritance rules.
  *Functional grounding:* FR §21 — "Campus-level configuration inheritance and overrides."

### 5.4 Exception Flows
- Investigates a cluster-wide anomaly (e.g., a sudden attendance dip across three campuses) that no single Campus Administrator would otherwise correlate.
- Mediates a resource conflict between two Campus Administrators within scope (e.g., both requesting the same budget allocation).

### 5.5 Escalation
- **Receives escalations from:** Campus Administrator, for anything beyond a single campus's authority or budget.
- **Escalates to:** Institution Administrator for anything outside their assigned scope — a new campus entering the cluster, a policy change, or a resource request that exceeds cluster-level budget authority.

---

## 6. Department Administrator

**Primary app:** `web-admin-console`, scoped to one department (within a campus).
**Reports to:** Campus Administrator (operationally) and coordinates with Academic Administrator (academically).

### 6.1 Routine
- Manages **faculty assignments within the department** — day-to-day teaching-load adjustments, substitutions, and section reassignment.
- Handles **department budget requests**, which flow up to Campus Administrator or Regional/Zonal Administrator for approval depending on amount/scope.

### 6.2 Coordination
- Works with the **Academic Administrator** on timetable and room allocation specifically for department courses — the Department Administrator proposes, the Academic Administrator approves institution-wide consistency.
- Works with **Faculty** directly on section/batch assignment and elective-seat balancing within the department.

### 6.3 Oversight
- Reviews **department-wise attendance and performance reports**.
  *Functional grounding:* FR §4 Reporting & Analytics — "Department-wise attendance reports"; FR §25 drill-down analytics.
- Monitors the Rules & Monitoring Engine's chronic-defaulter and low-performance alerts scoped to the department.
  *Functional grounding:* FR §4 — "Notify academic administrators of chronic defaulters" (Department Administrator is the first-line recipient before it escalates further).

### 6.4 Escalation Handling
- Resolves department-specific **student/faculty issues escalated from Office Staff** — the first stop above front-line staff.
- Handles grading-dispute escalations that a Teaching Assistant or Faculty member cannot resolve internally.

### 6.5 Escalation (upward)
- **Receives escalations from:** Office Staff (within the department), Faculty/Teaching Assistant (grading or resource disputes).
- **Escalates to:** Academic Administrator (curriculum/timetable/prerequisite matters), Campus Administrator (budget beyond department authority, cross-department disputes), or directly to Institution Administrator for matters the Campus Administrator can't resolve.

---

## 7. Campus Administrator

**Primary app:** `web-admin-console`, scoped to a single campus.
**Reports to:** Regional/Zonal Administrator (if one exists for the cluster) or directly to Institution Administrator (single-campus institutions).

### 7.1 Setup
- Manages **local user provisioning** for campus-based staff.
- Configures **campus settings that inherit from institution-level configuration**, applying permitted local overrides (e.g., a campus-specific holiday, a local fee surcharge).
  *Functional grounding:* FR §21 — "Campus-level configuration inheritance and overrides."

### 7.2 Routine
- Oversees **Office Staff** on the campus — workload distribution, quality of front-of-house service.
- Coordinates with **Facilities, Security, Hostel, and Transport staff** on that campus for day-to-day operational alignment (room readiness, gate access, room/block allocation, route scheduling).

### 7.3 Oversight
- Reviews campus-level dashboards (attendance, fees, occupancy) — narrower than the Regional/Zonal view, but the same underlying reports drilled down to one campus.

### 7.4 Escalation Handling
- Handles **campus-level incidents**: a facilities failure affecting classes, a security incident, a hostel occupancy dispute — coordinating with the relevant standalone-app staff (`app-facilities`, `app-security`, `app-hostel`, `app-transport`) via the event bus per `project_structure.md`'s integration pattern.
- Escalates **cross-campus matters** — anything that affects or requires coordination with another campus — to the Regional/Zonal Administrator (or directly to Institution Administrator if no Regional/Zonal Administrator exists).

### 7.5 Escalation
- **Receives escalations from:** Department Administrator (budget beyond department authority, cross-department disputes), Office Staff (complex queries beyond front-desk authority).
- **Escalates to:** Regional/Zonal Administrator (if applicable) or Institution Administrator.

---

## 8. Office Staff

**Primary app:** `web-admin-console`, front-of-house / data-entry scope — the narrowest permission set in the institution-administration chain.
**Reports to:** Department Administrator or Campus Administrator (per institution's org design).

### 8.1 Routine
- Performs day-to-day **data entry**: student record updates, document verification, bulk import/export.
  *Functional grounding:* FR §1 — "Bulk student import/export (CSV/Excel)," "Store documents... with verification status."
- **Front-of-house support:** assists walk-in students, guardians, and applicants with routine queries (fee receipts, status checks, document submission).

### 8.2 Output
- Generates standard letters/reports directly from the Student Information module: **bonafide certificates, ID cards**.
  *Functional grounding:* FR §1 — "Student ID card generation (physical and digital)."

### 8.3 Exception Flows
- Flags a record needing correction beyond standard data-entry permission (e.g., a merge/de-duplicate request) — this is a Department/Campus Administrator action, not something Office Staff executes directly.
  *Functional grounding:* FR §1 — "Merge/de-duplicate student records" (listed at the Student Information module level, gated by permission above Office Staff).

### 8.4 Escalation
- **Escalates to:** Department Administrator or Campus Administrator (per local org design) for anything beyond routine data entry — a policy exception, a disputed record, an angry walk-in escalation, or anything requiring elevated permission.
- **Receives escalations from:** No one — this is the front line.

---

## 9. Cross-Persona Collaboration Map

| Institution-Admin Persona | Collaborates most with | On |
|---|---|---|
| Institution Administrator | Platform Super Admin, Institution Head, IT Staff | Tenant setup, role provisioning, audit/backup |
| Institution Head | Institution Administrator, Academic Administrator, Accrediting Body, Government Official | Policy sign-off, external representation |
| Academic Administrator | Department Administrator, Campus Administrator, Faculty | Curriculum, timetable, room allocation, faculty assignment |
| Regional/Zonal Administrator | Campus Administrator(s) in scope, Institution Administrator | Cross-campus reporting, resource reallocation |
| Department Administrator | Academic Administrator, Faculty, Office Staff, Campus Administrator | Course/timetable proposals, budget requests, escalation triage |
| Campus Administrator | Facilities Staff, Security Staff, Hostel Staff, Transport Staff, Office Staff, Regional/Zonal Administrator | Campus-local operations and incidents |
| Office Staff | Department/Campus Administrator, Students, Guardians, Applicants | Front-of-house service, data entry, document generation |

---

## 10. Consolidated Escalation Matrix

| From ↓ / Escalates to → | Department Admin | Campus Admin | Regional/Zonal Admin | Academic Admin | Institution Admin | Institution Head |
|---|---|---|---|---|---|---|
| **Office Staff** | ✅ (complex query) | ✅ (per org design) | | | | |
| **Department Administrator** | | ✅ (budget, cross-dept) | | ✅ (curriculum/timetable) | ✅ (unresolved) | |
| **Campus Administrator** | | | ✅ (cross-campus, if exists) | | ✅ (if no Regional/Zonal) | |
| **Regional/Zonal Administrator** | | | | | ✅ (out of scope) | |
| **Academic Administrator** | | | | | ✅ (policy change) | ✅ (via Inst. Admin, new programs) |
| **Institution Administrator** | | | | | | ✅ (board-level sign-off) |
| **Institution Head** | | | | | | *(top of chain — no further escalation within institution)* |

---

## 11. Functional Grounding Index

Quick reference from persona to the `functional_requirements.md` sections their journeys draw on:

| Persona | Primary FR sections |
|---|---|
| Institution Administrator | §24 (Platform & Institution Administration), §9 (DM policy), §23 (Rules Engine setup), §25 (Reporting) |
| Institution Head | §25 (Reporting & Analytics), §23 (Accreditation compliance checks) |
| Academic Administrator | §3 (Academic & Curriculum Management), §25 (drill-down analytics) |
| Regional/Zonal Administrator | §21 (Regional/Cross-Campus Operations) |
| Department Administrator | §3 (timetable/faculty assignment, coordination), §4 (department-wise attendance reporting) |
| Campus Administrator | §21 (config inheritance/overrides), §16–19 (Facilities, IT, Security touchpoints) |
| Office Staff | §1 (Student Information & Lifecycle Management) |

---

*This document should be read alongside `personas.md` (persona/role/title model), `functional_requirements.md` (system capabilities), `project_structure.md` (technical boundaries), and `user_journey.md` (full 21-persona journey set, of which this document is a detailed expansion of §2).*
