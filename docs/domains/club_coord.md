# Club Coordinator — Detailed User Journey

_Persona source: `personas.md` §18 (Student Activities). Base journey source: `user_journey.md` §18.1. Functional scope: `functional_requirements.md` §19 (Student Activities & Clubs, P2). App boundary: `project_structure.md` — `app-student-activities` (standalone)._

---

## Persona Snapshot

| Attribute                                                                         | Value                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persona category                                                                  | Institution-facing, functional-department staff (§18 in `personas.md`)                                                                                                        |
| Primary app                                                                       | `app-student-activities`                                                                                                                                                      |
| Priority tier of module                                                           | **P2 — Advanced/Optional** (`functional_requirements.md` §19)                                                                                                                 |
| Role type                                                                         | Job-title-independent; typically a staff member or faculty member given the "Club Coordinator" role/permission set, per the Person/Role/Job Title separation in `personas.md` |
| Core responsibilities                                                             | Clubs, competitions, extracurricular activities                                                                                                                               |
| Directly named collaborators                                                      | Communication Staff (`user_journey.md` §18.1, §17.1)                                                                                                                          |
| Reasonably inferred collaborators (not yet detailed in source docs — see §9 Gaps) | Students, Facilities Staff, IT Staff, Finance Staff, Faculty advisors                                                                                                         |

---

## 1. Onboarding

1. **Account provisioning** — IT Staff provisions the Club Coordinator's account and assigns the Club Coordinator role/permission set (`functional_requirements.md` §17 "Role and permission assignment"; `user_journey.md` §16.1).
2. **First login** — Authenticates through the shared Authentication Service (`user_journey.md` §21.1), landing in `app-student-activities`.
3. **Context load** — Since the app is `type:standalone`, it holds no direct read access to Core student/academic data (`project_structure.md` boundary rules). Any student roster or eligibility data the Coordinator needs is pulled through `libs/shared/sdk` or event-bus subscriptions rather than a shared database table.
4. **Orientation** — Reviews existing club/society registry (if migrating from a prior system) or starts from an empty catalog for a new tenant/institution.

---

## 2. Club & Society Setup

_(`functional_requirements.md` §19: "Club/society registration and management")_

1. **Registration** — Creates a new club/society record: name, category, description, faculty advisor (if applicable), membership rules.
2. **Membership management** — Opens/closes membership, sets eligibility criteria if any, and approves or rejects student membership requests submitted from the Student Portal ("registers for events and clubs" — `functional_requirements.md` §7 Communication; `user_journey.md` §4.2 step 6).
3. **Ongoing maintenance** — Updates club rosters, deactivates inactive clubs, archives defunct ones.

---

## 3. Event & Competition Lifecycle

_(`functional_requirements.md` §19: "Event creation and registration"; "Competition/extracurricular activity tracking")_

1. **Creation** — Defines a new event or competition: type, date/time, eligibility (open to all vs. club-members-only), capacity limits.
2. **Registration** — Opens registration; students register for events/clubs via the Student Portal (`user_journey.md` §4.2, §7 Communication section).
3. **Promotion (cross-persona)** — Coordinates with **Communication Staff** to promote the event institution-wide, via announcements, targeted notifications, or newsletters (`user_journey.md` §18.1 step 3, §17.1 step 3: "coordinating with the Club Coordinator on student-activity events").
4. **Day-of logistics** — Runs the event/competition.
5. **Results/outcomes** — Records competition outcomes, standings, or winners where applicable.

---

## 4. Routine Operations

_(`functional_requirements.md` §19: "Attendance/participation tracking for activities"; "Certificates for participation/achievement")_

1. **Attendance/participation tracking** — Logs which students attended or participated in each club session, event, or competition.
2. **Certificate issuance** — Generates and issues participation or achievement certificates to students, tied to the tracked participation record (`user_journey.md` §18.1 step 2).
3. **Reporting** — Reviews participation trends per club/event to plan future activities (implicit extension of the tracking requirement; no dedicated cross-module dashboard is currently specified for this module — see §9).

---

## 5. Coordination & Cross-Persona Touchpoints

| Counterpart                                       | Nature of interaction                                                                                                   | Source                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Communication Staff**                           | Joint promotion of club events/competitions across institution/department/campus channels                               | `user_journey.md` §17.1 step 3, §18.1 step 3                                                                                           |
| **Student**                                       | Registers for clubs/events; receives certificates and notifications                                                     | `user_journey.md` §4.2 step 6; `functional_requirements.md` §7                                                                         |
| **Notification Service** (machine actor)          | Dispatches event-driven notifications (e.g., event reminders) once an event/registration is created                     | `user_journey.md` §21.3 — note: club/event triggers are not explicitly enumerated in the current event list and would need to be added |
| **IT Staff**                                      | Provisions/deprovisions the Coordinator's own account and role permissions                                              | `user_journey.md` §16.1                                                                                                                |
| Facilities Staff, Finance Staff, Faculty advisors | Plausible touchpoints (venue booking, event budget, advisor sign-off) but **not currently documented** for this persona | See §9 Gaps                                                                                                                            |

**Boundary note:** Because `app-student-activities` is a `type:standalone` app, none of the above coordination happens via direct database access to Core modules. Per `project_structure.md`, integration must occur through the event bus (e.g., an `EventCreated` or `ParticipationRecorded` style event) or through the published `libs/shared/sdk` contract.

---

## 6. Periodic / Exception Flows

1. **Low registration / event cancellation** — Coordinator cancels or reschedules an event; must re-trigger Communication Staff to notify registered students.
2. **Certificate correction/reissue** — Handles requests to correct or reissue a certificate after an error in the participation record.
3. **Membership disputes** — Resolves disputed club membership eligibility or removes a member for policy violations (escalation path to a higher administrator is not specified in current docs — see §9).
4. **Competition disputes** — Handles disputes over competition results or standings.

---

## 7. Offboarding

1. **Role change/departure** — When a Club Coordinator leaves the role, IT Staff deprovisions the account or reassigns the role to a successor (`user_journey.md` §16.1, general pattern from §9.1 HR exit workflow does not directly apply since this is a role reassignment, not necessarily an employment exit).
2. **Handover** — Club/society and event records persist independently of the individual Coordinator account, so a successor can be assigned without data loss — consistent with the Person/Role/Job Title separation principle in `personas.md`.
3. **Archival** — Inactive clubs, past events, and historical participation/certificate records are retained for future reference (e.g., alumni verifying past participation).

---

## 8. System & Data Boundaries

- **App:** `apps/app-student-activities` (`project_structure.md`)
- **Boundary tag:** `type:standalone`
- **Rule:** Cannot import `libs/core/*` (student, academic, attendance, etc.) directly. All cross-boundary data (e.g., verifying a student exists, checking eligibility, notifying a guardian) must flow through:
  - the **event bus** (e.g., analogous to `FeeChargeRequested`/`AttendanceRecorded` patterns used elsewhere), or
  - the **published API surface** in `libs/shared/sdk`.
- **Why it matters for this journey:** the Coordinator's actions (registering members, tracking participation, issuing certificates) generate events/records that other modules (Communication, Notification Service, Student Portal) consume — they do not read or write a shared Core table.

---

## 9. Gaps / Open Items for Further Definition

These are called out explicitly rather than assumed, since the source docs don't yet specify them:

- **Venue/resource booking for club events** — Facilities Staff manages "classroom/resource booking requests" (`functional_requirements.md` §16), but no documented flow connects Club Coordinator event creation to a Facilities booking request.
- **Budget/funding for clubs and competitions** — No fee head, budget line, or Finance Staff touchpoint is defined for club activities in `functional_requirements.md` §6 or §19.
- **Faculty advisor role** — Clubs commonly have a faculty advisor/sponsor, but this relationship isn't modeled as a distinct interaction in `personas.md` or `user_journey.md`.
- **Escalation path** — No documented escalation authority (e.g., Student Activities disputes going to Department Administrator or Institution Administrator) exists for this module, unlike Attendance or Examination which have explicit escalation/monitoring paths via the Rules & Monitoring Engine (`functional_requirements.md` §23).
- **Notification Service event catalog** — The current machine-actor event list (`user_journey.md` §21.3) does not include club/event-specific triggers (e.g., "event registration confirmed," "certificate issued"); these would need to be added if automated notifications are expected for this module.
- **Guardian visibility** — Guardians receive notifications for "attendance shortages, fee dues, results, and emergencies" (`user_journey.md` §5.1) but not explicitly for club/event participation or achievement.

Since Student Activities & Clubs is scoped as **P2 (Advanced/Optional)** in the build priority summary, these gaps are consistent with it being a lower-priority module to be fleshed out after P0/P1 modules are stable — but they should be resolved before detailed permission-matrix or API-contract work begins for `app-student-activities`.
