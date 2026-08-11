# Student ERP — Faculty & Teaching Staff: Detailed User Journeys

This document expands Section 3 ("Faculty") of `user_journey.md` into full end-to-end journeys for the four teaching-side personas defined in `personas.md`: **Faculty**, **Teaching Assistant**, **Research Staff**, and **Laboratory Staff**. It is grounded in the capabilities in `functional_requirements.md` (primarily Modules 3, 4, 5, 8, and 9) and mapped to the apps/libs in `project_structure.md`.

**How to read this document**
- Each journey follows: **onboarding → daily/routine use → teaching & content workflows → assessment workflows → communication → periodic/exception flows → offboarding**.
- *Primary app(s)* and *Supporting libs* point to `project_structure.md` entries.
- *Permission scope* is qualitative — the actual permission matrix (~250–600 fine-grained permissions per `personas.md`) is a separate open item, but the boundaries described here are consistent with the role hierarchy and boundary rules already defined.
- All four personas sit under `libs/core/academic`, `libs/core/attendance`, `libs/core/examination`, and `libs/core/communication` — they are **Core** consumers, not standalone apps, so they interact with real institutional data directly rather than through the event bus/SDK boundary that `app-*` standalone apps use.
- One person can hold more than one of these roles simultaneously (e.g., a Professor who also supervises a research grant), consistent with the Person/Role/Job-Title separation in `personas.md`.

---

## Table of Contents
1. [Faculty](#1-faculty)
2. [Teaching Assistant](#2-teaching-assistant)
3. [Research Staff](#3-research-staff)
4. [Laboratory Staff](#4-laboratory-staff)
5. [Cross-Persona Interactions](#5-cross-persona-interactions)
6. [Permission & App-Touchpoint Summary](#6-permission--app-touchpoint-summary)

---

## 1. Faculty

**Persona snapshot**
- **Job title varies**, role stays constant: Professor, Lecturer, Adjunct Faculty, Assistant/Associate Professor, etc. (per `personas.md`, job title is a display attribute, not a permission set).
- **Primary app(s):** `web-faculty-portal`, `mobile`
- **Supporting libs:** `libs/core/academic`, `libs/core/attendance`, `libs/core/examination`, `libs/core/communication`, `libs/shared/ai` (assistant/summarization), `libs/shared/notifications`
- **Reports to / coordinates with:** Department Administrator (assignment, budget escalation), Academic Administrator (curriculum, timetable), Examination Staff (marks moderation)
- **Supervises:** Teaching Assistant (for assigned sections)

### 1.1 Onboarding
1. Institution Administrator or IT Staff provisions the account and assigns the Faculty role (per the role/permission matrix in `personas.md`).
2. Department Administrator or Academic Administrator assigns the faculty member to one or more courses/sections for the term.
3. Faculty completes profile setup: contact details, office hours, bio, and (optionally) research/lab affiliations that link to the Research Staff and Laboratory Staff modules.
4. Faculty reviews the institution's DM policy (Faculty ↔ Student, Faculty ↔ Faculty, Faculty ↔ Parent) configured by the Institution Administrator, since this governs what the Communication module will allow later.

### 1.2 Daily / Routine Use
1. Logs into `web-faculty-portal` or `mobile`; lands on a dashboard showing assigned courses, sections, and today's timetable (Module 3 — Academic & Curriculum).
2. Reviews any auto-generated timetable changes (room reassignment, elective-selection outcomes) pushed from the Academic Administrator's scheduling.
3. Checks the Course Workspace for each section: announcements feed, open Q&A threads, resource-access analytics (Module 9).

### 1.3 Attendance
1. Takes attendance manually, or attendance auto-populates from biometric/RFID/QR sync and the faculty member simply reviews/corrects it (Module 4).
2. Runs the attendance correction workflow if a device sync error or a late-arrival edge case needs adjusting.
3. Approves attendance for the session, which feeds:
   - The student's real-time attendance percentage
   - The Rules & Monitoring Engine (defaulter detection, shortage alerts)
   - Examination eligibility checks (Module 5) later in the term

### 1.4 Content & Teaching Workflows
1. Uploads chapter-wise resources organized **course → unit → chapter/topic**: notes, PPTs, videos, code files, e-books, past question papers.
2. Schedules publish/unpublish dates so material becomes visible at the right point in the term.
3. Tags each resource by topic and learning outcome for search/filter and curriculum-mapping purposes.
4. Version-controls updated materials; can archive outdated versions without deleting history.
5. Shares resources selectively with specific batches/sections when content needs to differ (e.g., a remedial group).
6. Reviews resource-access analytics (who viewed/downloaded what) to spot disengaged students — this can feed the AI Assistant's at-risk indicators.

### 1.5 Assessment & Grading
1. Creates assignments and quizzes; sets due dates and grading rubrics.
2. Grades submissions directly, or reviews/finalizes grades a Teaching Assistant has entered (see Section 2).
3. During the exam cycle, enters and moderates exam marks alongside Examination Staff (Module 5); this is a separate permission from day-to-day coursework grading.
4. Participates in moderation/re-evaluation workflows when a student requests revaluation, but cannot moderate or grade an exam that is her *own* submission or one she has a declared conflict of interest in — this boundary is enforced by the permission engine, not by role alone (see the "Alice" example in `user_journey.md` §22).

### 1.6 Communication
1. Posts announcements to the Course Workspace (versioned, searchable) and answers student questions in the threaded Q&A.
2. Messages students, parents, or other faculty within the configured DM policy — the system blocks any channel the institution has disabled (e.g., Student ↔ Student if turned off).
3. Receives event-driven notifications (assignment submitted, resource-access anomaly, discussion reply) via the Notification Service across the faculty member's chosen channels (email/SMS/WhatsApp/push/in-app).

### 1.7 Mentoring & Self-Service
1. Tracks assigned advisees' academic progress, attendance, and grade trends across their other courses (read access scoped to advisees only).
2. Submits her own leave requests and reviews her own attendance/leave record — the same HR-adjacent leave workflow used by other staff, surfaced inside the faculty portal.

### 1.8 Periodic / Exception Flows
1. **Elective/section changes mid-term** — coordinates with the Academic Administrator when enrollment shifts require re-timetabling.
2. **Malpractice or incident during her own exam session** — logs an initial report which routes to Examination Staff for formal handling.
3. **Room/resource conflict** — raises a booking request that surfaces through Facilities Staff via `app-facilities` (Faculty does not have direct write access to the facilities module; the request goes through the standard booking workflow).
4. **Curriculum change proposal** — can propose a syllabus revision, but final versioning/approval sits with the Academic Administrator (Module 3).

### 1.9 Offboarding (end of term / departure)
1. Finalizes and locks grades for the term once results are published.
2. Archives or hands off course materials to an incoming faculty member if she is not teaching the course again.
3. If leaving the institution entirely, IT Staff deprovisions the account per the exit workflow (parallel to the HR Staff exit process in `user_journey.md` §9), and course ownership/materials transfer to the Department Administrator for reassignment.

---

## 2. Teaching Assistant

**Persona snapshot**
- **Primary app(s):** `web-faculty-portal` (narrower permission set than Faculty)
- **Supporting libs:** `libs/core/attendance`, `libs/core/communication`
- **Reports to:** the supervising Faculty member for the section(s) they're assigned to

### 2.1 Onboarding
1. Provisioned by IT Staff / Institution Administrator with the Teaching Assistant role, then explicitly assigned to one or more Faculty members' sections (typically labs/tutorials).
2. Permission set is deliberately narrower than Faculty: by default cannot finalize official grades, publish official announcements as "faculty," or moderate exam marks — unless the supervising Faculty member explicitly delegates that specific permission.

### 2.2 Daily / Routine Use
1. Logs in and sees only the sections/sessions they've been assigned to assist with.
2. Takes attendance for lab/tutorial sections (Module 4) — same capture mechanisms (manual, biometric/RFID/QR) as Faculty, but scoped to their assigned sessions only.
3. Monitors discussion threads in the Course Workspace and answers routine student questions.

### 2.3 Grading Support
1. Grades assignments/quizzes in a draft or provisional state.
2. Submits graded work for the supervising Faculty member's review and sign-off, rather than finalizing marks directly (unless delegation has been granted).
3. If a student disputes a grade the TA entered, the TA refers the dispute back to the supervising Faculty member rather than resolving it themselves.

### 2.4 Periodic / Exception Flows
1. **Delegation expansion** — a Faculty member can extend the TA's permission set (e.g., to finalize grades for a specific assignment) for a defined period; this is logged for audit purposes.
2. **Coverage gaps** — if the assigned Faculty member is on leave, the TA's scope does not automatically expand; a Department Administrator must explicitly reassign or extend permissions.

### 2.5 Offboarding
1. At the end of the term (or contract), access to the specific sections is revoked; any provisional grades not yet finalized are flagged for the supervising Faculty member to resolve before the TA's account is deprovisioned.

---

## 3. Research Staff

**Persona snapshot**
- **Primary app(s):** `web-faculty-portal` (research extension)
- **Supporting libs:** likely a research-specific extension of `libs/core/academic`, plus `libs/shared/notifications` for grant/deadline reminders
- **Collaborates with:** Faculty (on lab-linked research), Laboratory Staff (on equipment access for experiments)

### 3.1 Onboarding
1. Provisioned with the Research Staff role, typically linked to a specific department, principal investigator (a Faculty member), or research group.
2. Gains access to the research-records module scoped to the project(s)/grant(s) they're attached to — not institution-wide research data.

### 3.2 Routine
1. Maintains research project records: objectives, milestones, team members, associated publications.
2. Tracks publications tied to the project (submission status, DOI/reference linkage once published).
3. Manages grant applications and the ongoing reporting obligations tied to active grants (progress reports, budget utilization, renewal deadlines).

### 3.3 Collaboration
1. Works with the supervising Faculty member on lab-linked research — sharing project records, aligning on publication authorship, and coordinating milestone timelines.
2. Coordinates with Laboratory Staff to book equipment/lab time for experiments; this request flows through the same booking mechanism Laboratory Staff use for practical sessions (Section 4), rather than a separate research-only queue.

### 3.4 Periodic / Exception Flows
1. **Grant deadline approaching** — receives an automated reminder (via the Rules & Monitoring Engine / Notification Service pattern used elsewhere in the ERP, e.g., contract-expiry or fee-due alerts) rather than needing to track deadlines manually.
2. **Equipment conflict** — if lab time can't be booked when needed, the request escalates through Laboratory Staff to the Facilities module for resolution.
3. **Publication or project handoff** — if a project's PI (Faculty) changes, Research Staff records are reassigned to the new PI, with change history retained for audit.

### 3.5 Offboarding
1. At project completion or contract end, ongoing obligations (final reports, publication tracking) are transferred to the Faculty PI or a successor Research Staff member before deprovisioning.

---

## 4. Laboratory Staff

**Persona snapshot**
- **Primary app(s):** `web-faculty-portal` + `app-facilities`
- **Note on boundaries:** `app-facilities` is a **standalone app** per `project_structure.md`'s boundary rules, meaning Laboratory Staff's equipment/maintenance actions there integrate with Core only via the event bus or `libs/shared/sdk` — never a direct query into Core's database.
- **Collaborates with:** Faculty (session alignment), Research Staff (equipment access for experiments), Facilities Staff (maintenance escalation)

### 4.1 Onboarding
1. Provisioned with the Laboratory Staff role, typically scoped to one or more labs/departments.
2. Given inventory-management access for the equipment under their assigned lab(s).

### 4.2 Routine
1. Manages lab equipment inventory: what exists, its condition, and its availability calendar.
2. Manages lab session scheduling — aligning available equipment/lab slots with the timetable Faculty and the Academic Administrator have set.
3. Supports practical/lab sessions in progress (setup, safety checks, materials).

### 4.3 Coordination
1. Aligns lab session timetables with Faculty, adjusting for elective changes, makeup sessions, or exam-period blackouts.
2. Books equipment time for Research Staff experiments, balancing teaching-session needs against research needs on shared equipment.
3. Logs equipment maintenance requests through the Facilities module (`app-facilities`) when something breaks or needs preventive service — this triggers the same maintenance-request/preventive-maintenance-reminder flow Facilities Staff use in Module 16 (`functional_requirements.md`).

### 4.4 Periodic / Exception Flows
1. **Equipment failure mid-session** — logs an incident/maintenance request immediately and notifies the affected Faculty member so the session can be adjusted or rescheduled.
2. **Overbooked lab slot** — resolves scheduling conflicts between two teaching sections, or between a teaching session and a research booking, escalating to the Department Administrator if it can't be resolved directly.
3. **Safety incident** — logs the incident; depending on severity this may also flow to Security Staff (`app-security`) or Health Staff (`app-medical-wellness`) per the institution's incident-escalation policy.

### 4.5 Offboarding
1. Equipment and inventory records under their custody are formally handed off to another Laboratory Staff member or the Department Administrator before deprovisioning.

---

## 5. Cross-Persona Interactions

These four personas form a tight cluster around teaching and research delivery. Key interaction points:

| From | To | Interaction |
|---|---|---|
| Faculty | Teaching Assistant | Assigns TA to section; reviews/finalizes TA-entered grades; can delegate limited grading authority |
| Teaching Assistant | Faculty | Escalates grade disputes; submits provisional grades for sign-off |
| Faculty | Research Staff | Acts as PI on research projects; co-authors publications; sets research direction |
| Research Staff | Laboratory Staff | Requests equipment/lab time for experiments |
| Faculty | Laboratory Staff | Aligns lab-session timetables for practical/lab coursework |
| Laboratory Staff | Facilities Staff (`app-facilities`) | Escalates equipment maintenance beyond in-lab fixes |
| All four | Examination Staff | Faculty and (with delegation) TAs feed marks into the exam moderation workflow; Research Staff and Laboratory Staff are not involved in this flow |
| All four | Communication module | Post/receive announcements and messages within the institution's DM policy |

**Multi-role note:** Consistent with the "Alice" example in `user_journey.md` §22, one person could plausibly hold Faculty + Research Staff simultaneously (a professor running her own grant), or Teaching Assistant + Research Staff (a graduate student). The permission engine evaluates each action against the specific role that grants it — e.g., grading authority comes from the Faculty or delegated-TA permission, not from holding a Research Staff title.

---

## 6. Permission & App-Touchpoint Summary

| Persona | Primary App(s) | Core Libs Touched | Grading Authority | Equipment/Inventory Access | Escalates To |
|---|---|---|---|---|---|
| Faculty | web-faculty-portal, mobile | academic, attendance, examination, communication | Full (own courses); exam moderation for assigned courses | None (requests via Facilities) | Department Administrator, Academic Administrator, Examination Staff |
| Teaching Assistant | web-faculty-portal | attendance, communication | Provisional only, unless delegated | None | Supervising Faculty |
| Research Staff | web-faculty-portal (research extension) | academic (research extension) | None | Requests only (via Laboratory Staff) | Faculty (PI) |
| Laboratory Staff | web-faculty-portal, app-facilities | academic (scheduling), facilities (via event bus/SDK) | None | Full, within assigned lab(s) | Facilities Staff, Department Administrator |

---

*Sources: `project_structure.md` (apps/libs and boundary rules), `personas.md` (role definitions, permission model, Person/Role/Job-Title separation), `functional_requirements.md` (Modules 3, 4, 5, 8, 9, 16), `user_journey.md` §3 and §22 (baseline journeys and the multi-role permission-boundary example).*
