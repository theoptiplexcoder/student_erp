# Placement Staff — Detailed User Journey

This document expands the high-level journey for **Placement Staff** (see `user_journey.md`, §14.1) into a full, step-by-step walkthrough, grounded in the persona definition in `personas.md` (§14) and the functional scope in `functional_requirements.md` (§15 — Placement & Career Services). It also traces where Placement Staff touches other personas and system boundaries defined in `project_structure.md`.

**Persona snapshot**

|                       |                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**              | Placement Staff                                                                                                                                                                                                                                                                                                                                                |
| **Section**           | `personas.md` §14 — Placement & Career                                                                                                                                                                                                                                                                                                                         |
| **Primary app**       | `app-placement` (standalone app)                                                                                                                                                                                                                                                                                                                               |
| **Priority tier**     | P1 — Standard (`functional_requirements.md` §15)                                                                                                                                                                                                                                                                                                               |
| **Related personas**  | Recruiter (external, §20.1 — shares `app-placement` via an external-facing view), Student (applies to openings, builds resume/profile), Institution Head (consumes placement statistics), Communication Staff (event/drive promotion), Academic Administrator (program/batch eligibility rules), IT Staff (provisions the role)                                |
| **Architecture note** | `app-placement` is tagged `type:standalone` in `project_structure.md`, meaning it **cannot import `libs/core/*` directly**. Anything Placement Staff needs from Student/Academic/Attendance/Finance (eligibility, program, batch, fee-hold status) arrives via the published API surface in `libs/shared/sdk` or the event bus — never a direct database read. |

---

## 1. Onboarding

1. **Account provisioning** — IT Staff (or the Institution/Campus Administrator) creates the Placement Staff account and assigns the role per the permission matrix; no self-registration.
2. **Scope assignment** — Placement Staff's access is scoped to the campus(es)/programs they serve; a Regional/Zonal Administrator may later widen or narrow this scope if the institution spans multiple campuses.
3. **First login** — Lands on the Placement & Career dashboard inside `app-placement`: empty-state prompts to register the first recruiter, configure the current placement season, and connect notification channels.
4. **Season configuration** — Sets up the placement season/cycle (e.g., academic year + "2026–27 Placement Season"), defines which batches/programs are eligible to participate this cycle, and sets default eligibility rules (minimum CGPA, active-backlog limits, attendance threshold) — these eligibility checks pull live data from Core's Student/Academic/Attendance domains through the SDK rather than being re-entered manually.

---

## 2. Recruiter & Company Management (Setup)

1. **Registration** — Registers a new recruiting company: legal name, industry, contact person(s), hiring history (if a returning recruiter), and compliance documents (MoU, NDA if required).
2. **Recruiter account creation** — Onboards one or more named Recruiter users for that company (`personas.md` §20.1), scoped to the current hiring cycle only — access is **not** indefinite; it is tied to the drive/cycle unless explicitly renewed.
3. **Vetting** — Reviews the company's profile, past offer-to-joining ratios (if returning), and any prior incident flags before approving them to post openings.
4. **Recruiter self-service boundary** — Once approved, a Recruiter can log into the external-facing view of `app-placement` and draft job/internship postings themselves — but Placement Staff retains an **approval gate** before anything goes live to students (see §3.2).
5. **Blacklisting/offboarding a recruiter** — If a company violates policy (e.g., repeated no-shows, discriminatory criteria, reneging on offers), Placement Staff suspends or blacklists the company, revokes the Recruiter account(s), and logs the reason for future-cycle reference.

---

## 3. Job & Internship Posting

1. **Draft intake** — Receives a posting either self-authored or submitted by a Recruiter (role, CTC/stipend, eligible programs/batches, required skills, number of openings, location, deadline).
2. **Eligibility rule mapping** — Attaches or edits the eligibility filter (program, minimum CGPA, backlog rule, campus) — this determines which students see the posting and are allowed to apply.
3. **Approval & publish** — Reviews for policy compliance (no discriminatory clauses, compensation disclosed per institution policy) and publishes; publication should trigger a notification to eligible students (see §9, Gap Note).
4. **Edits mid-cycle** — Can amend deadlines, headcount, or eligibility after publishing; students who already applied are notified of material changes.
5. **Closing a posting** — Manually closes or lets it auto-expire at the deadline; closed postings move into the drive-tracking pipeline (§5).

---

## 4. Student Eligibility & Application Workflow

1. **Eligibility computation** — For each posting, the system cross-checks each student's program/batch/CGPA/attendance/backlog status (sourced from Core via the SDK) against the posting's rule and marks the student Eligible / Not Eligible / Eligible-with-hold (e.g., fee dues pending, per Finance's withholding policy pattern used elsewhere in the ERP).
2. **Application review** — Placement Staff (or the Recruiter, depending on delegation) reviews the pool of applicants: resume/profile (built via the student-facing Resume/Profile Builder, §8), cover letter if required, and eligibility flags.
3. **Shortlisting** — Filters/shortlists applicants for the recruiter — either Placement Staff curates the shortlist and hands it to the Recruiter, or the Recruiter reviews the full eligible pool directly, per the institution's configured delegation model.
4. **Applicant communication** — Notifies shortlisted/rejected students of their status at each stage.
5. **Duplicate/withdrawal handling** — Handles a student withdrawing an application (e.g., after accepting another offer) and updates the recruiter-facing view accordingly.

---

## 5. Placement Drive Scheduling & Logistics

1. **Drive creation** — Schedules a placement drive (on-campus or virtual) tied to one or more recruiters/postings: date, venue/room (coordinated with Facilities Staff for room booking where on-campus), format (test → group discussion → interview rounds), and expected headcount.
2. **Student registration** — Confirms the registered/eligible student list for the drive; sends reminders as the date approaches.
3. **Day-of coordination** — Acts as point of contact on the drive day: manages check-in, room allocation, recruiter hospitality, and any last-minute rescheduling.
4. **Recruiter no-shows / cancellations** — Handles a recruiter cancelling or not showing up: notifies affected students, reschedules if the recruiter remains in good standing, or logs an incident against the company (feeding back into §2.5).
5. **Multi-round logistics** — For drives spanning several days (aptitude test → technical round → HR round), tracks which students clear which stage and carries the shortlist forward automatically rather than re-collecting applications.

---

## 6. Interview Round Tracking

1. **Round definition** — Defines the interview rounds for a drive (e.g., Online Test, Technical Interview, HR Interview) and the pass/fail or scoring criteria for each.
2. **Outcome recording** — Records outcomes per student per round — either entered by Placement Staff after receiving results from the recruiter, or entered directly by the Recruiter if delegated that permission for their own drive.
3. **Progression** — Automatically advances students who clear a round into the next round's candidate list; drops students who don't clear, with a status visible to the student (transparency without a formal appeal path unless the institution defines one).
4. **Dispute handling** — Fields disputes from students about round outcomes (e.g., a student claims they were told the wrong time) — this is a service-recovery flow, not a grade-appeal workflow like Examination's revaluation process.

---

## 7. Offer Management & Acceptance Tracking

1. **Offer extension** — Records offers extended by recruiters: role, CTC/stipend, joining date, offer type (full-time/internship/pre-placement offer), and any conditions (e.g., minimum CGPA at graduation).
2. **Student response window** — Tracks the student's response (Accept / Decline / Pending) within the recruiter's stipulated deadline.
3. **Multiple-offer conflict handling** — Where an institution enforces a "one company, one offer" or a "dream offer" policy, Placement Staff manages the resulting conflicts — e.g., a student holding two accepted offers must be walked through the institution's offer policy, and the second company is notified the slot has opened up.
4. **Offer withdrawal/reneging** — Handles a recruiter rescinding an offer post-acceptance (rare but must be logged and escalated — likely feeding into the recruiter blacklist/incident trail in §2.5) or a student reneging on an accepted offer (also logged, as some institutions penalize this).
5. **Joining confirmation** — Follows up post-graduation on actual joining status where the institution chooses to track it (offer accepted ≠ guaranteed joining).

---

## 8. Student-Facing Support: Resume/Profile Builder

1. **Template configuration** — Configures the resume/profile builder templates/fields available to students (not building resumes on students' behalf).
2. **Profile completeness monitoring** — Reviews which students have incomplete profiles ahead of a major drive and nudges them (directly or via a notification).
3. **Profile visibility control** — Controls which fields of a student's profile a given recruiter can see (e.g., hide guardian contact info, show only academic + resume fields) — consistent with the ERP-wide principle that external/partner-facing views never get raw access to Core student data.

---

## 9. Reporting & Analytics

1. **Drive/company-level reports** — Produces placement statistics by program, batch, and company (offer count, average CTC, acceptance rate) as specified in `functional_requirements.md` §15.
2. **Funnel view** — Tracks the full funnel: eligible students → applied → shortlisted → interviewed → offered → accepted, mirroring the funnel-reporting pattern used elsewhere in the ERP (e.g., Admissions' funnel reports).
3. **Institution-level rollup** — These statistics surface upward to the Institution Head's strategic dashboard (`user_journey.md` §2.2) and to Communication Staff for publicizing placement outcomes (e.g., "90% placement rate" marketing).
4. **Export** — Exports reports (PDF/Excel/CSV) for accreditation submissions — placement outcomes are a common input to Accrediting Body reviews (`user_journey.md` §20.4).

---

## 10. Season-End Wrap-Up

1. **Cycle closure** — Closes out the placement season: finalizes statistics, archives drive records, and marks unresolved applications as closed.
2. **Recruiter relationship carry-forward** — Flags which recruiters to re-invite next cycle and which are on probation/blacklisted, so next season's onboarding (§2) starts from an informed baseline rather than a blank slate.
3. **Recruiter access expiry** — Recruiter accounts tied to the closed cycle are deactivated (per §2.2's "cycle-scoped, not indefinite" access model) unless explicitly renewed for the next cycle.

---

## Cross-Persona Touchpoints

| Persona                         | Interaction with Placement Staff                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recruiter** (§20.1)           | Onboarded by Placement Staff; may self-post openings and record interview outcomes for their own drive, subject to Placement Staff's approval gate      |
| **Student** (§4.2)              | Applies to postings, builds resume/profile, receives offers — all mediated through eligibility rules Placement Staff configures                         |
| **Academic Administrator**      | Source of program/curriculum structure that eligibility rules key off of                                                                                |
| **Facilities Staff**            | Coordinates room/venue booking for on-campus drives                                                                                                     |
| **Communication Staff**         | Promotes drives/results institution-wide; consumes placement statistics for newsletters                                                                 |
| **Institution Head**            | Consumes rolled-up placement statistics for strategic/board reporting                                                                                   |
| **Finance Staff**               | Source of any fee-due holds that could gate a student's exam-style "eligibility" for placement (pattern reused from Examination's fee-withholding rule) |
| **Accrediting Body** (external) | Placement outcome data is a common accreditation input, exported via reporting                                                                          |

---

## System Integration Points

- **`libs/shared/sdk`** — `app-placement`, being `type:standalone`, reads student eligibility (program, batch, CGPA, attendance, fee-hold status) only through this published API surface, never by querying `libs/core/*` directly.
- **Event bus** — Following the same pattern as `FeeChargeRequested`/`AttendanceRecorded` in `project_structure.md`, placement actions are natural candidates for their own events (e.g., `OfferExtended`, `OfferAccepted`, `DriveScheduled`) so Notification Service and Reporting can react without direct coupling.
- **Notification Service** (`user_journey.md` §21.3) — The current documented event catalogue (attendance shortage, grades published, fee due, assignment graded, resource uploaded, timetable changed, leave approved) does **not yet explicitly list placement events**. This is a gap worth closing before build: drive reminders, shortlist notifications, and offer-deadline alerts are all placement-specific notification needs that should be added to that catalogue.
- **AI Assistant** (§21.4) — Could plausibly extend its "predictive at-risk indicators" concept to placement (e.g., flagging students at risk of missing eligibility for upcoming drives), though this isn't currently scoped in `functional_requirements.md` §15 and would need to be added deliberately rather than assumed.

---

## Open Gaps Identified While Writing This Journey

These aren't answered by the current docs and are worth resolving before detailed design:

1. **Delegation model** — Exactly which actions a Recruiter can perform unassisted (posting, shortlisting, recording round outcomes) versus which always require Placement Staff approval isn't specified — this journey assumes a configurable approval gate, but that's an assumption, not a documented decision.
2. **Offer-conflict policy** — Whether the institution enforces "one offer per student" or a "dream offer" tier is not defined in `functional_requirements.md`; it's treated here as an institution-configurable policy.
3. **Placement-specific notification events** — Flagged above; not yet in the Notification Service's documented event catalogue.
4. **Joining-status tracking** — Whether the ERP tracks actual post-graduation joining (vs. just offer acceptance) is not explicitly in scope in §15 and may be a P2 addition.
