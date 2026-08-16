# Guardian — Detailed User Journey

> Deep-dive companion to `user_journey.md` §5 (Guardians). The five-step summary there is expanded here into a full onboarding → routine → exception → offboarding journey, grounded in `personas.md` (persona definition), `functional_requirements.md` (module capabilities), and `project_structure.md` (app/library boundaries). Anything not explicitly stated in those three documents is flagged as **[inferred]** or **[open item]** rather than presented as settled fact.

---

## Persona Snapshot

| Field                                                    | Value                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persona                                                  | Guardian                                                                                                                                                   |
| Category                                                 | Guardians (`personas.md` §5) — its own top-level category, not folded into Students                                                                        |
| Relationship types                                       | Parent, Guardian, Sponsor (`personas.md`, `user_journey.md` §5.1)                                                                                          |
| Primary app(s)                                           | `web-student-portal` (guardian view), `mobile`                                                                                                             |
| Underlying libs touched (read-mostly, via API/event bus) | `libs/core/student`, `libs/core/attendance`, `libs/core/examination`, `libs/core/finance`, `libs/core/communication`                                       |
| Authorization model                                      | Permission-driven and **scoped to the linked student(s) only** — a Guardian is never granted institution-wide visibility (`personas.md`, Design Principle) |

**Journey shape:** Onboarding → Daily/Routine Monitoring → Notifications (cross-cutting) → Finance → Communication → Periodic/Exception Flows → Offboarding.

---

## 1. Onboarding

1. **Linkage at admission** — During the Applicant → Student conversion (`user_journey.md` §4.1, `functional_requirements.md` §1 "Store guardian/parent relationship links"), Office Staff or Admissions Staff record the Guardian's contact details and **relationship type** (parent / guardian / sponsor) against the student record.
2. **Invitation & account creation** — The Guardian receives an invitation (email/SMS, via the Notification Service) to activate a portal account. **[inferred]** The exact invitation mechanics aren't detailed in the FR doc, but this follows the same pattern as staff provisioning in §17 (IT Administration) adapted for an external, non-employee identity.
3. **Identity verification** — Institution policy determines the verification bar (e.g., matching the relationship declared on admission documents, `functional_requirements.md` §1 "Store documents ... with verification status"). Office Staff can correct a mismatched or unverified relationship record.
4. **Multi-student linkage** — If the Guardian has more than one child/ward at the same institution, their single account is linked to multiple student records. **[open item]** Neither `personas.md` nor the FR doc specifies a dashboard "switcher" UX for this — see §9 below.
5. **Notification preference setup** — The Guardian sets channel preferences (email, SMS, WhatsApp, push, in-app) per `functional_requirements.md` §9 "Notification preference management per user."
6. **Scope confirmation** — The account is provisioned with read/act permissions scoped strictly to the linked student(s) — no visibility into other students, faculty-only content, or administrative data (`personas.md` Design Principle: authorization is permission-driven, not persona-driven).

---

## 2. Daily / Routine Use

1. **Dashboard** — Logs into the guardian view of `web-student-portal` or the `mobile` app and lands on a summary of the linked student's status.
2. **Academic monitoring** — Reviews the student's academic dashboard, timetable, and course enrollments (`user_journey.md` §5.1 "Monitors the student's academic progress, attendance, and grades"; `functional_requirements.md` §7 Academic sub-section, viewed in a guardian-scoped read mode).
3. **Attendance monitoring** — Views attendance percentage and trend, mirroring the student-facing attendance view (`functional_requirements.md` §4 "Attendance percentage calculation," "Attendance reports").
4. **Grades & results** — Views published results and grades once released, subject to the same withholding rules that apply to the student (`functional_requirements.md` §5 "Result withholding rules (fee dues, disciplinary holds)").
5. **Profile visibility** — Can see (but not necessarily edit) the student's profile/contact info that the student maintains (`functional_requirements.md` §7 "View guardian information" is the mirror image on the student side; the reverse — guardian viewing student profile — is **[inferred]** as symmetrical).

---

## 3. Notifications & Alerts (cross-cutting — Rules & Monitoring Engine)

All of the following ride on the same infrastructure: the **Rules & Monitoring Engine** (`functional_requirements.md` §23) evaluates configurable conditions, and the **Notification Service** (`user_journey.md` §21.3) dispatches the alert across the Guardian's chosen channels.

1. **Attendance shortage** — "Notify guardians of repeated absences" (`functional_requirements.md` §4, Alerts & Notifications), triggered off the same threshold logic used for student/faculty alerts ("Attendance < 75% for 7 consecutive days" is the engine's own example rule).
2. **Fee dues** — "Fee defaulter identification and alerts (guardian/student notification)" (`functional_requirements.md` §6, Monitoring & Reporting).
3. **Results published** — Event-driven notification when grades are published (`functional_requirements.md` §9, "grades published" is listed among the event-driven notification triggers).
4. **Emergencies / medical** — "Integration with Guardian notifications for medical emergencies" (`functional_requirements.md` §14, Medical & Wellness) and "Logs incident/emergency reports and triggers Guardian notifications when needed" (`user_journey.md` §13.1).
5. **Channel & preference management** — The Guardian can adjust which of email/SMS/WhatsApp/push/in-app channels are used per notification type (`functional_requirements.md` §9).

---

## 4. Finance

1. **View fee structure & dues** — Sees the fee structure applicable to the student and the current outstanding balance (`functional_requirements.md` §6, Fee Structure & Billing / Monitoring & Reporting).
2. **Pay fees** — Pays on the student's behalf via the online Payment Gateway integration (`user_journey.md` §5.1 "Pays fees on the student's behalf"; the underlying flow is the `FeeChargeRequested` → `PaymentConfirmed` event pair described in `user_journey.md` §21.2 and `project_structure.md`'s event-bus integration pattern).
3. **Receipts** — Views/downloads receipts for payments made (`functional_requirements.md` §6, "Receipt generation").
4. **Partial payments / installments** — Can make partial payments where the fee structure allows installments (`functional_requirements.md` §6, "Partial payment and installment tracking").
5. **Scholarship/waiver visibility** — **[inferred]** The FR doc gives the Student the ability to "Apply for scholarships" (§7) but doesn't explicitly state whether the Guardian can also apply or only view status; treat guardian scholarship visibility as read-only unless institution policy says otherwise — flagged as an open item in §9.

---

## 5. Communication

1. **Messaging Faculty** — Sends/receives direct messages with Faculty, constrained by the configurable **Parent ↔ Faculty DM policy** (`functional_requirements.md` §9, Institution-wide Communication; `user_journey.md` §5.1 "Messages Faculty within the Parent ↔ Faculty DM policy").
2. **Announcements** — Receives institution/department/campus-level announcements targeted to the Guardian role or the student's batch/campus (`functional_requirements.md` §9, "Targeted notifications by role, batch, or campus").
3. **Course Workspace** — Does **not** get direct access to the Course Workspace itself (that's a Student/Faculty surface, `functional_requirements.md` §9) — the Guardian's channel into course activity is the notification layer (assignment graded, resource uploaded, etc.), not the workspace UI. **[inferred]** — the FR doc doesn't explicitly exclude this, but nothing in the Guardian's listed capabilities implies workspace access.
4. **Knowledge base** — Can consult the searchable institutional FAQ/knowledge base like any authenticated user (`functional_requirements.md` §9).

---

## 6. Periodic & Exception Flows

1. **New academic year / re-enrollment** — Guardian linkage persists automatically as the student progresses through terms/years; no re-onboarding is implied unless the relationship itself changes.
2. **Multiple children at the institution** — One Guardian account, multiple linked students. **[open item]** — dashboard/switching UX is not specified in the source docs; recommend defining this during detailed design.
3. **Multiple guardians per student (e.g., separated/divorced parents)** — More than one Guardian account can link to the same student, each independently scoped to that student. **[inferred]** — the persona doc supports multiple relationship types but doesn't describe conflict resolution when two guardians disagree (e.g., over communication settings or fee payment responsibility); this is a policy question for the Institution Administrator, not something the current docs resolve.
4. **Sponsor relationship** — Where the relationship type is "sponsor" rather than parent/guardian, the account likely carries a narrower scope (e.g., finance visibility without personal/medical data access). **[open item]** — the FR/persona docs name "sponsor" as a valid relationship type but don't define a reduced permission set; note this is distinct from the **Corporate Client Administrator** persona (`personas.md` §20), which is the B2B, company-level equivalent for institutional sponsorship of employees rather than an individual sponsor of one student.
5. **Revaluation / disputes** — The Guardian can see that a Student has requested revaluation and the resulting status (`functional_requirements.md` §5, "Revaluation/re-check request workflow"), but the request itself is a Student action (`user_journey.md` §4.2 "can request revaluation").
6. **Disciplinary holds / withheld results** — If results are withheld per policy (`functional_requirements.md` §5), the Guardian sees the same withheld state as the Student — the docs don't grant Guardians privileged visibility into the underlying disciplinary case.
7. **Relationship change / guardian replacement** — Office Staff or Institution Administrator update the relationship record; this is analogous to the record-update capability in `functional_requirements.md` §1 ("Audit trail of changes to student records") — a relationship change should itself be audit-logged.
8. **Emergency response flow** — On a Health Staff-logged incident, the notification fires to the Guardian as described in §3.4 above; this is the one flow where Guardian involvement is explicitly emergency-driven rather than routine.

---

## 7. Offboarding

1. **Student graduates → Alumni** — When the student transitions to Alumni status (`user_journey.md` §4.3), the Guardian's active monitoring relationship ends along with it. **[open item]** — the docs don't specify whether Guardian access is fully revoked at that point or downgraded to a limited/historical view; this should be defined alongside the Alumni Management module (`functional_requirements.md` §20).
2. **Student withdraws** — If the student record moves to Withdrawn status (`functional_requirements.md` §1 lifecycle: "Applicant → Enrolled → Active → Suspended → Graduated → Alumni → Withdrawn"), the Guardian relationship is deactivated accordingly.
3. **Relationship revoked** — Institution Administrator or Office Staff can revoke a Guardian's access directly (e.g., custody change, end of sponsorship) — this is an extension of the general "user offboarding, permission changes" capability held by the Institution Administrator (`user_journey.md` §2.1).
4. **Data retention** — Falls under the same institution-level data retention/export policy referenced for tenant offboarding (`user_journey.md` §1.1) — **[inferred]** at the individual-guardian level rather than the tenant level, since the source docs describe retention primarily at the tenant-decommissioning scale.

---

## 8. Permission Boundaries — What a Guardian Cannot Do

Consistent with the Design Principle that authorization is permission-driven and scoped (`personas.md`), a Guardian account does **not**:

- See any student other than the one(s) explicitly linked to their account.
- Access faculty-only surfaces: the Course Workspace, grading tools, question papers, or internal exam moderation data (`functional_requirements.md` §5, §8).
- View institution-wide dashboards, reports, or admin consoles (those belong to Institution Administration personas, `user_journey.md` §2).
- Take actions reserved for the Student themselves — e.g., submitting assignments, taking quizzes, requesting revaluation — the Guardian _monitors_, the Student _acts_ (`user_journey.md` §5.1 vs §4.2).
- Message anyone outside the configured Parent ↔ Faculty DM channel (e.g., cannot freely message other staff roles) (`functional_requirements.md` §9).

---

## 9. Cross-Persona & System Touchpoints

| Touchpoint                              | Counterpart persona / system                     | Reference                                                 |
| --------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Relationship linkage, record correction | Office Staff, Institution Administrator          | `user_journey.md` §2.1, §2.7                              |
| Fee payment processing                  | Payment Gateway (machine actor)                  | `user_journey.md` §21.2                                   |
| Attendance/fee/result alerts            | Rules & Monitoring Engine → Notification Service | `functional_requirements.md` §23; `user_journey.md` §21.3 |
| Messaging                               | Faculty                                          | `user_journey.md` §3.1, §5.1                              |
| Medical emergencies                     | Health Staff                                     | `user_journey.md` §13.1                                   |
| Withheld results / revaluation          | Examination Staff                                | `user_journey.md` §7.1                                    |

---

## 10. Open Items for Further Definition

These are gaps between what `personas.md` / `functional_requirements.md` establish and what a full guardian journey needs — carried forward for detailed design, not resolved here:

- Multi-child dashboard/switcher UX for a single Guardian account.
- Conflict handling when multiple guardians are linked to one student (e.g., differing notification or payment settings).
- A distinct, narrower permission set for the "sponsor" relationship type vs. "parent"/"guardian."
- Whether Guardians can _apply_ for scholarships/waivers or only view status.
- Whether Guardian portal access is revoked or downgraded (vs. read-only historical) once a student becomes Alumni or Withdrawn.
- Guardian-side data retention policy at the individual (non-tenant) level.
