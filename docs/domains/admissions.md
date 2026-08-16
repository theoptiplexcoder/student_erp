# Admissions Staff — Detailed User Journey

This document expands Section 6 (`Admissions`) of `user_journey.md` into a full, step-by-step journey for the **Admissions Staff** persona, grounded in the capabilities defined in Section 2 (`Admissions Management`) of `functional_requirements.md`, the persona definition in `personas.md`, and the app/boundary model in `project_structure.md`.

---

## 1. Persona Snapshot

| Attribute                            | Value                                                                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persona                              | Admissions Staff                                                                                                                                                                                                             |
| Category                             | Section 6 — Admissions (`personas.md`)                                                                                                                                                                                       |
| Responsibilities (per `personas.md`) | Admissions, counseling, document verification                                                                                                                                                                                |
| Primary app                          | `web-admin-console` (admissions module)                                                                                                                                                                                      |
| Supporting apps/services             | `api-gateway`, `services/ingestion` (bulk document/data import), `services/worker` (async offer-letter/report generation), `services/scheduler` (interview reminders)                                                        |
| Core libs touched                    | `libs/core/student` (applicant → student conversion), `libs/core/finance` (application/confirmation fee linkage), `libs/core/reporting`, `libs/core/rules-engine` (duplicate/eligibility flags), `libs/shared/notifications` |
| Role vs. Job Title                   | "Admissions Staff" is a **Role** (permission set); the person holding it may carry any job title (e.g., Admissions Officer, Admissions Counselor) — per the Person/Role/Job Title separation in `personas.md`                |
| Multi-role note                      | An Admissions Staff account can be combined with other roles (e.g., also Office Staff) on the same Person record, per the Alice pattern in `user_journey.md` §22                                                             |

---

## 2. System Context

Per `project_structure.md`'s boundary rules, Admissions Staff operates entirely within `type:app` (`web-admin-console`) and never touches another app's database directly. Every cross-module effect — creating a student record, charging an application fee, notifying an applicant — happens through:

- **Event bus** — e.g., `ApplicationFeeChargeRequested`, `PaymentConfirmed`, `ApplicantConvertedToStudent`
- **`libs/shared/sdk`** — published API surface for any external integration (e.g., an institution's existing CRM feeding leads into Admissions)

This keeps Admissions' "no functional overlap" boundary intact with Student Information (`libs/core/student`), which owns the record once an applicant becomes a student.

---

## 3. Journey

### Phase 1 — Onboarding (to the role)

1. Institution Administrator or Campus Administrator provisions the Admissions Staff account and assigns campus/program scope (per `functional_requirements.md` §17, IT Administration handles the underlying provisioning; Institution Administrator/Campus Administrator assigns the role).
2. Admissions Staff logs into `web-admin-console`, landing on the **Admissions module** dashboard scoped to their assigned campus(es)/program(s).
3. Reviews institution-configured admissions settings already in place: active application cycles, program list, eligibility rule sets, and seat matrix — configured upstream by Academic Administrator (programs/courses) and Institution Administrator (policy sign-off).

### Phase 2 — Setup (per admissions cycle)

4. Confirms or requests activation of the **online application form** for each program (form fields are configurable per institution, per `functional_requirements.md` §2).
5. Verifies the **application fee** is correctly linked for online collection (fee config owned by Finance Staff; Admissions Staff consumes it, doesn't set it).
6. Confirms the **seat matrix** — total seats by program/category/campus, including reservation/quota splits — is current for the cycle.
7. Reviews the **eligibility rule set** (marks cutoffs, quota rules) configured for the cycle; flags any needed changes upward to Academic Administrator/Institution Administrator rather than editing rules directly if that's outside their permission scope.

### Phase 3 — Intake (routine, cycle-long)

8. Monitors the incoming applicant queue as **Applicants** (see `user_journey.md` §4.1) register, complete the application form, and pay the application fee — this payment flows through the **Payment Gateway** machine actor (`user_journey.md` §21.2), which emits `PaymentConfirmed` back into the Admissions queue.
9. Reviews each submitted application; **verifies uploaded documents** (ID proof, prior transcripts, certificates) against the required checklist for that program.
10. Runs **duplicate-applicant detection** — the system (via `libs/core/rules-engine`) flags likely repeat applicants (same person applying multiple times/programs) for manual reconciliation.
11. Updates each application's status through the standard pipeline: `Submitted → Under Review → Shortlisted → Offer → Accepted → Enrolled` (or `Rejected` at any gate), per `functional_requirements.md` §2 and the Applicant journey in `user_journey.md` §4.1.
12. Where entrance exams or external merit scores apply, confirms the **automatic score linkage** has attached correctly to the applicant's record; manually reconciles any mismatches.

### Phase 4 — Evaluation

13. Applies the **configurable eligibility rules** (cutoffs, quotas, reservations) to filter and rank applicants within each program/category/campus.
14. For programs requiring an interview or counseling session, **books the session** via the scheduling tool; the system (via `services/scheduler`) sends applicant/guardian reminders through the Notification Service (`user_journey.md` §21.3).
15. Conducts or records the outcome of interviews/counseling sessions directly against the applicant record.
16. Cross-checks the **seat matrix** in real time as shortlisting proceeds, to avoid over-offering against a category or campus quota.

### Phase 5 — Offer Management

17. Generates the **offer letter** for shortlisted/selected applicants (template/branding pulled from Institution Administrator's letterhead configuration).
18. Where seats are constrained, places excess eligible applicants on the **waitlist**, ordered per the configured ranking/eligibility rules.
19. Monitors offer responses; as offers lapse or are declined, **advances the waitlist** automatically or manually per institution policy, re-triggering the offer-letter and notification flow.
20. Applicant accepts the offer and pays the **confirmation fee** — again via Payment Gateway, closing the loop with a `PaymentConfirmed` event.

### Phase 6 — Conversion

21. On confirmed payment, Admissions Staff (or the automated flow) **converts the accepted applicant into an enrolled Student record** — this is the hard boundary crossing from the Admissions view into `libs/core/student`'s system of record, done through the published conversion API/event (`ApplicantConvertedToStudent`), never a direct database write.
22. The newly created Student record inherits demographics, documents, and guardian links already captured during the application, avoiding re-entry (per the Student Information requirements in `functional_requirements.md` §1).
23. The student is now visible to Office Staff, Academic Administrator (for section/batch allocation), and Finance Staff (for full fee-structure billing going forward) — Admissions Staff's involvement with that individual record effectively ends here, apart from historical reporting.

### Phase 7 — Reporting (continuous, and end-of-cycle)

24. Reviews the **admissions funnel report**: Submitted → Under Review → Shortlisted → Offer → Accepted → Enrolled, with drop-off at each gate.
25. Reviews **conversion-rate** and **source-wise** reporting (which channels/programs are converting best).
26. Surfaces cycle summaries upward to Institution Head (strategic dashboards, per `user_journey.md` §2.2) and Academic Administrator (for next cycle's seat-matrix/program planning).

### Phase 8 — Exception Flows

- **Duplicate applicant confirmed** — merges or rejects the duplicate record, coordinating with Office Staff if the duplicate has already partially progressed toward a student record.
- **Document verification failure** — returns the application to the applicant for re-submission, holding it at `Submitted`/`Under Review` rather than advancing it.
- **Quota/seat matrix conflict** — escalates to Academic Administrator or Institution Administrator if a category is oversubscribed beyond configured tolerance.
- **Payment failure or reversal on confirmation fee** — reverts the applicant's status from `Accepted` back to `Offer`, and the seat is returned to availability.
- **Waitlist exhaustion** — escalates unseated program capacity to Academic Administrator for a policy decision (hold seats, reopen applications, etc.).
- **Appeals/exceptions to eligibility rules** — routed to Institution Administrator or Institution Head for sign-off, since Admissions Staff operates within — not above — the configured rule set.

---

## 4. Cross-Persona Interaction Map

| Persona                      | Interaction with Admissions Staff                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Applicant                    | Source of all inbound applications, documents, and fee payments; receives offer/waitlist/rejection notifications       |
| Guardian                     | May be linked during application (relationship type captured); receives fee/offer notifications where configured       |
| Academic Administrator       | Owns programs/courses/credit structure and ultimately the seat matrix policy; consulted on quota conflicts             |
| Institution Administrator    | Signs off on eligibility-rule and fee-structure changes; owns escalation path for exceptions                           |
| Institution Head             | Consumes admissions funnel/conversion dashboards for strategic review                                                  |
| Finance Staff                | Owns fee-structure configuration (application + confirmation fees); Admissions Staff consumes, doesn't configure, this |
| Office Staff                 | May share front-of-house document-verification duties for walk-in applicants; overlaps at intake                       |
| Communication Staff          | Owns bulk/targeted messaging templates and channels that the Notification Service uses for offer/waitlist alerts       |
| Regional/Zonal Administrator | Reviews cross-campus admissions numbers where Admissions Staff spans multiple campuses in a cluster                    |

## 5. Machine Actors Involved

| Machine Actor                                                | Role in this journey                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Payment Gateway (`user_journey.md` §21.2)                    | Processes application and confirmation-fee payments; emits `PaymentConfirmed`                                 |
| Notification Service (§21.3)                                 | Sends offer letters, waitlist movement, interview reminders, rejection notices across email/SMS/WhatsApp/push |
| Rules & Monitoring Engine (`functional_requirements.md` §23) | Flags duplicate applicants and quota-threshold breaches                                                       |
| ERP/API Integration (§21.7)                                  | Optional inbound channel if an institution feeds leads from an external CRM via `libs/shared/sdk`             |

## 6. Key Events on the Bus

- `ApplicationSubmitted`
- `ApplicationFeeChargeRequested` → `PaymentConfirmed`
- `ApplicantShortlisted`
- `OfferIssued`
- `ConfirmationFeeChargeRequested` → `PaymentConfirmed`
- `ApplicantConvertedToStudent`
- `WaitlistAdvanced`
- `ApplicationRejected`

## 7. Related Documents

- `personas.md` — persona/role/job-title model; Admissions Staff definition (§6)
- `functional_requirements.md` — Admissions Management functional spec (§2), plus Student Information (§1), Finance (§6), Rules & Monitoring Engine (§23), Reporting (§25)
- `project_structure.md` — app/library boundaries; event-bus integration pattern
- `user_journey.md` — baseline Admissions Staff journey (§6), Applicant journey (§4.1), machine actor flows (§21)

## 8. Open Items

- Exact permission set for Admissions Staff within the ~250–600 permission matrix referenced in `personas.md` is not yet defined (tracked as an open item there).
- Whether Admissions Staff can directly edit eligibility rules/seat matrix, or can only request changes from Academic Administrator/Institution Administrator, needs an explicit permission decision.
- Interview/counseling scheduling tool specifics (calendar integration, video-link generation for remote interviews) are not detailed in `functional_requirements.md` and may need a follow-up spec.
