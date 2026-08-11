# Student ERP — Detailed User Journey: Applicant, Student, Alumni

This document expands the three-persona arc defined in `personas.md` (Section 4 — Students) and summarized in `user_journey.md` (Section 4) into a stage-by-stage journey, grounded in the capabilities in `functional_requirements.md` and mapped onto the apps/services in `project_structure.md`.

These three personas are really **one person moving through one continuous lifecycle**, not three separate accounts:

```
Applicant → (fee payment confirms admission) → Student → (program completion) → Alumni
                                                    │
                                                    ├── Suspended (disciplinary/administrative hold)
                                                    └── Withdrawn (drop-out / transfer-out)
```

This maps directly to the lifecycle status field owned by **Student Information & Lifecycle Management** (`functional_requirements.md` §1): *Applicant → Enrolled → Active → Suspended → Graduated → Alumni → Withdrawn*. All three personas below share the **same underlying student record** — `libs/core/student` (`project_structure.md`) — which merges Student Information, Admissions, and Alumni state into one bounded context, rather than three siloed tables.

**Primary apps:** `web-student-portal` (all three personas) and `mobile` (Student and Alumni; Applicant flow is supported but web-first). Both are `type:app` and reach the domain via `libs/core/*`, never directly touching another app.

---

## Part A — Applicant

*Persona reference: `personas.md` §4 — "Applies for admission." Journey reference: `user_journey.md` §4.1. Functional reference: `functional_requirements.md` §2 (Admissions Management) and §1 (Student Information & Lifecycle Management).*

### A.1 Registration & Application

1. **Account creation** — Registers on `web-student-portal` in pre-enrollment mode. No prior student record exists yet; this creates the seed identity that will later be promoted to a full Student record.
2. **Form completion** — Fills out the **configurable online application form for a program** (§2). Form fields, required documents, and eligibility questions are institution- and program-specific (configured earlier by Admissions Staff / Academic Administrator).
3. **Application fee** — Pays the application fee through the **Payment Gateway** machine actor (`user_journey.md` §21.2), which emits a `FeeChargeRequested` → `PaymentConfirmed` event pair over the event bus into the Finance module (`project_structure.md`).
4. **Deduplication check** — The system runs **application deduplication** (§2) in the background to detect repeat applicants across intake cycles — surfaced to Admissions Staff, not the applicant.

### A.2 Verification & Status Tracking

5. **Document upload** — Uploads required documents (prior transcripts, ID proof, category/reservation certificates, photos) into the document-verification workflow.
6. **Status progression** — The application status field advances through a fixed state machine, visible to the applicant in real time:

   `Submitted → Under Review → Shortlisted → Offer → Accepted → Enrolled` (or **Rejected** at any review gate)

7. **Verification actor** — Admissions Staff (`personas.md` §6) reviews documents and moves the status forward; Office Staff (`user_journey.md` §2.7) may assist with front-of-house document collection for walk-in applicants.

### A.3 Evaluation

8. **Entrance/merit scores** — Where the institution uses an entrance exam or merit list, scores are **linked automatically** to the applicant's record (§2) rather than manually re-keyed.
9. **Interview/counseling** — May be scheduled for an interview or counseling session by Admissions Staff; outcome is recorded against the application.
10. **Eligibility rules** — Behind the scenes, Admissions Staff apply **configurable eligibility rules** — cutoffs, quotas, reservations — and the applicant's seat is checked against the **seat matrix** by program/category/campus (§2). This is not visible to the applicant as a separate step, but determines whether they can be shortlisted at all.

### A.4 Offer & Conversion

11. **Offer letter** — On success, the applicant receives a system-generated **offer letter** (§2), or is placed on a **waitlist** with automated movement as seats free up.
12. **Confirmation fee** — Accepts the offer and pays the **confirmation fee**, again via Payment Gateway.
13. **Conversion trigger** — Fee payment confirmation is the single event that **converts the Applicant into an enrolled Student record** (§1, §2) — this is the exact moment the lifecycle status flips from `Applicant` to `Enrolled`. No separate manual "create student" step is needed; conversion is fee-payment-driven.
14. **Rejection/lapse path** — If rejected, or if the applicant fails to pay within the offer window, the record is closed out at `Rejected` with no further portal access beyond viewing the final status and any refund of the application fee per policy.

### A.5 Handoffs & Cross-Persona Touchpoints

| Stage | Other persona/system involved | Interaction |
|---|---|---|
| Application fee | Payment Gateway, Finance Staff | Payment processed; reconciled by Finance Staff |
| Document review | Admissions Staff, Office Staff | Verification, status advancement |
| Eligibility/seat matrix | Admissions Staff | Cutoff/quota rule application |
| Interview scheduling | Admissions Staff | Scheduling and outcome recording |
| Offer generation | Admissions Staff | Offer letter, waitlist management |
| Conversion | Finance module (event bus) | `PaymentConfirmed` → student record creation |

---

## Part B — Student

*Persona reference: `personas.md` §4 — "Learning, attendance, assignments, exams, fees." Journey reference: `user_journey.md` §4.2. Functional reference: `functional_requirements.md` §7 (Student Portal) plus the modules it draws on: §3 Academic, §4 Attendance, §5 Examination, §6 Finance, §9 Communication.*

### B.1 Onboarding

1. **Automatic profile creation** — The Student profile is created automatically at admission conversion (no re-entry of data already captured during the Applicant stage) (§1, §7 — Profile & Administration).
2. **Program/batch/section assignment** — Assigned to program, course, batch, and section per Academic & Curriculum Management (§3), typically by Academic Administrator / Department Administrator ahead of term start.
3. **Digital ID card** — Downloads a **digital ID card**; a physical card may also be issued by Office Staff (§1).
4. **Guardian linkage** — Guardian/parent relationship link is attached (if applicable), enabling the parallel Guardian journey (`user_journey.md` §5).

### B.2 Daily / Routine Use

5. **Academic dashboard** — Views academic dashboard, timetable, and attendance percentage (§7 — Academic).
6. **Course resources** — Accesses chapter-wise learning resources (notes, slides, e-books, videos, lab manuals) organized **course → unit → chapter** by Faculty, plus recommended reading and past question papers (§7, §8).
7. **Assignments & quizzes** — Submits assignments, views feedback, and takes practice quizzes.
8. **Course Workspace** — Participates in the per-course workspace: reads announcements, joins threaded Q&A discussions, sees assignments/quizzes/attendance/grades surfaced together in one place rather than a separate chat app (§9).
9. **Attendance capture** — Attendance is recorded against them via whichever capture method the institution uses — manual, biometric, RFID, QR, or LMS sync (§4) — and rolls up automatically into their attendance percentage.
10. **Progress tracking** — Tracks overall academic progress on the dashboard (§7).

### B.3 Periodic / Exam Cycle

11. **Eligibility check** — Before registering for an exam, the system runs the **attendance eligibility check** (§4, §5) automatically against configured minimum-attendance thresholds; ineligible students are blocked from registration.
12. **Hall ticket** — Downloads the hall ticket/admit card once eligible (§5).
13. **Assessment** — Sits internal, midterm, or final exams (in-person or remote); remote sessions are passively monitored by the **Proctoring Service**, with any flags routed to the human **Online Proctor** for adjudication (`user_journey.md` §7.2, §21.8) — this is invisible to the student unless a flag is confirmed.
14. **Results** — Views results/grades once published, subject to **result withholding rules** (fee dues or disciplinary holds) (§5) — a student with unpaid fees or an open disciplinary hold may see a "results withheld" state instead of the grade itself.
15. **Revaluation** — Can request revaluation/re-check, which routes to Examination Staff for moderation.
16. **Certification** — Once eligible, can retrieve transcripts and QR-verifiable certificates (§5, §7).

### B.4 Finance Cycle

17. **Fee payment** — Pays fees online via the Payment Gateway; views receipts and outstanding dues (§6, §7).
18. **Scholarships** — Applies for scholarships/financial aid; discounts, waivers, and scholarship rules are configured upstream by Finance Staff (§6).
19. **Defaulter monitoring** — If dues go unpaid past the configured threshold, the **Rules & Monitoring Engine** flags the student as a defaulter and triggers alerts to the student and Guardian (§6, §23) — this can cascade into exam-result withholding (see B.3.14) or service restrictions (e.g., hostel, library) depending on institution policy.

### B.5 Services

20. **Certificates & service requests** — Requests bonafide/other certificates and submits general service requests, typically fulfilled by Office Staff (§1, §7).
21. **Library** — Books library resources (search, reserve) through the Library module; is subject to overdue fine rules configured there (`functional_requirements.md` §11).
22. **Hostel** — Reserves hostel facilities if applicable — allocation may be manual or rule-based on the Hostel Staff side (§12).
23. **Transport** — May be mapped to a route/stop and subscribe to transport service (§13).
24. **Medical & wellness** — Schedules counseling appointments; medical records and session notes are held under confidentiality controls separate from the general academic record (§14).
25. **Placement** — As they approach graduation, builds a resume/profile, applies to postings, and tracks interview rounds and offers through the Placement module (§15).
26. **Student activities** — Registers for events and clubs, tracks participation, and can receive achievement certificates (§19).

### B.6 Communication

27. **Notifications** — Receives announcements and event-driven notifications (attendance shortage, grade published, fee due, assignment graded, resource uploaded, timetable changed) across email/SMS/WhatsApp/push/in-app per their own notification preferences (§9, `user_journey.md` §21.3).
28. **Messaging** — Messages faculty within the institution's configured DM policy; Student ↔ Student messaging is available only if the institution has enabled it (§9).

### B.7 Exception Flows

29. **Attendance shortage** — Automatic detection of low attendance, consecutive absences, or unusual patterns (§4) triggers a cascade: student notification → guardian notification (if repeated) → academic-administrator visibility for chronic cases → potential exam-eligibility block.
30. **Suspension** — Lifecycle status can move to `Suspended` for disciplinary or administrative reasons (§1), narrowing portal access until resolved.
31. **Withdrawal** — Lifecycle status can move to `Withdrawn` (drop-out/transfer-out), which is a terminal state distinct from graduation and does **not** lead to the Alumni transition below.
32. **Revaluation dispute** — Escalates from Student → Examination Staff moderation workflow (§5) if the student contests a published result.

### B.8 Exit / Transition

33. **Graduation** — On program completion, lifecycle status moves to `Graduated` (§1).
34. **Final documents** — Downloads transcripts/certificates while still in active/graduated status, subject to any outstanding-dues holds (§7).
35. **Automatic Alumni transition** — The record is **automatically moved to Alumni status** — there is no separate re-registration step (§1, `user_journey.md` §4.2.7, §4.3.1).

---

## Part C — Alumni

*Persona reference: `personas.md` §4 — "Degree verification, alumni activities." Journey reference: `user_journey.md` §4.3. Functional reference: `functional_requirements.md` §20 (Alumni Management, P2).*

### C.1 Transition

1. **Automatic move** — Moved from Student to Alumni status automatically at graduation; no manual conversion step, mirroring the Applicant→Student conversion pattern in Part A.
2. **Access narrowing** — Retains **limited** portal access to `web-student-portal` (alumni view) — most academic-module features (attendance, live coursework, exam registration) fall away; what remains is identity, verification, and community-oriented functionality.

### C.2 Routine

3. **Degree/certificate verification** — Requests degree/certificate verification — reusing the same certificate-generation and QR-verification machinery Examination Staff built for currently-enrolled students (§5, §20), now served against the closed academic record.
4. **Directory profile** — Keeps an alumni directory profile current (contact info, current employer/role, etc.) (§20).

### C.3 Engagement

5. **Alumni events** — Participates in alumni events managed through the Alumni Management module, coordinated in practice with Communication Staff's event tooling (§17, §20).
6. **Mentoring** — Optionally participates in student-mentoring programs, creating a direct (permissioned) touchpoint back to current Students — this is one of the few places an Alumni persona interacts with the active-student side of the system.
7. **Donations/fundraising** — Optionally engages with donation/fundraising tracking features (§20) — noted in `functional_requirements.md` as optional/P2.

### C.4 Boundaries

- Alumni Management is explicitly scoped as **P2 (Advanced/Optional)** in the build-priority summary — institutions can run the P0/P1 core (Student Information, Admissions, Academic, Attendance, Examination, Finance, Portals) without it; the Alumni experience is additive once resourced.
- No access to grading tools, live attendance, or fee-collection workflows — those belong to the closed Student-stage record, not the Alumni view.

---

## Part D — Cross-Cutting Integration Map

The Applicant → Student → Alumni arc is stitched together entirely through the event bus and shared services described in `project_structure.md` — none of the three personas' data lives in a bespoke table outside `libs/core/student`.

| Event / Trigger | Emitted by | Consumed by |
|---|---|---|
| `FeeChargeRequested` / `PaymentConfirmed` (application fee, confirmation fee, tuition, hostel, transport) | Payment Gateway | Finance module; triggers Applicant→Student conversion at confirmation-fee stage |
| `AttendanceRecorded` | Biometric Device / RFID / QR / manual entry / LMS Integration | Attendance module → Rules & Monitoring Engine → Notification Service |
| Attendance-shortage / defaulter flags | Rules & Monitoring Engine (§23) | Notification Service → Student, Guardian, Academic Administrator |
| Exam-eligibility check | Attendance module | Examination module (blocks/allows exam registration) |
| Grades published / results withheld | Examination module | Notification Service → Student; Finance/disciplinary holds can suppress the release |
| Resource uploaded, assignment graded, timetable changed, leave approved | Faculty Portal, Academic module | Notification Service, multi-channel delivery |
| Lifecycle transitions (`Applicant → Enrolled → Active → Suspended → Graduated → Alumni → Withdrawn`) | Student Information module (§1) | Every downstream module gates feature access off this single status field |

---

## Part E — Notes for Further Definition

Carried over from the "Open Items" in `functional_requirements.md`, the following would sharpen this journey further if pursued:

- Field-level data model for the Applicant→Student→Alumni record, including exactly which fields persist vs. reset at each transition.
- The precise permission set (of the ~250–600 total) each of the three personas holds at each lifecycle stage — e.g., what an `Applicant` can see of their own record vs. what a `Student` unlocks post-conversion.
- Whether "limited alumni access" should be defined as an explicit reduced permission set now, rather than left implicit.
