# Communication Staff — Detailed User Journey

_Companion deep-dive to `user_journey.md` §17.1. Grounded in the role definition in `personas.md` §17, the capabilities in `functional_requirements.md` §9 (Communication & Collaboration) and §25 (Reporting & Analytics), and the module boundaries in `project_structure.md`._

**Primary app(s):** `web-admin-console` (communication module)
**Primary domain module:** `libs/core/communication` (institution-wide comms; the Course Workspace piece of this same lib is Faculty-owned, not Comms Staff-owned — see boundary note below)
**Supporting shared libs:** `libs/shared/notifications` (email/SMS/WhatsApp/push abstraction), `libs/core/rules-engine` (event-driven alert triggers), `libs/core/reporting` (engagement/delivery analytics)
**Machine actor counterpart:** Notification Service (`user_journey.md` §21.3) — actually dispatches every message Communication Staff composes or targets

---

## 1. Onboarding

1. **Provisioning** — Institution Administrator (or Campus/Department Administrator, if the role is scoped locally) creates the account and assigns the Communication Staff permission set, scoped to institution-wide, campus-wide, or department-wide reach depending on the hire.
2. **Context handoff** — Reviews institution branding assets already configured by the Institution Administrator (logo, letterhead templates, color/tone guidelines) so outgoing communication stays on-brand from day one.
3. **Channel audit** — Confirms with IT Staff which multi-channel providers (email, SMS, WhatsApp, push) are already live via `libs/shared/notifications`; flags any missing integration for IT Staff to configure.
4. **Inherited backlog** — Reviews any in-flight newsletters, scheduled announcements, and the existing FAQ/knowledge base to understand what's already live and who it was targeting.

## 2. Setup & Configuration

1. **Audience segmentation** — Defines the reusable targeting groups (by role, batch, campus, department) that announcements and notifications will be sent against, within the boundaries of institution-wide policy set by the Institution Administrator.
2. **DM policy awareness** — Does _not_ own the Student↔Faculty / Parent↔Faculty direct-messaging policy — that's configured by the Institution Administrator — but designs broadcast campaigns to respect it (e.g., not routing student replies into a channel the policy disallows).
3. **Template library** — Builds reusable message templates per event type (welcome, holiday notice, fee reminder framing, exam schedule release) so downstream automated triggers (see §4 below) look and read consistently.
4. **Calendar setup** — Establishes the newsletter and social-media publishing cadence (e.g., weekly digest, monthly newsletter) and an editorial calendar for recurring institutional events (admissions cycle, exam season, orientation).

## 3. Routine — Publishing

1. **Drafting** — Writes institution-, department-, or campus-wide announcements; selects the target audience (role/batch/campus) and the delivery channel mix (email/SMS/WhatsApp/push/in-app).
2. **Scheduling** — Schedules publish times, including holding drafts for a defined review window on sensitive topics (policy changes, fee-cycle reminders) before release.
3. **Newsletter production** — Solicits content from departments/clubs, compiles the newsletter, and publishes on the defined cadence.
4. **Social media** — Publishes and moderates the institution's social channels, coordinating tone with the Institution Head's public messaging where relevant.
5. **Knowledge base upkeep** — Adds new FAQ entries as recurring queries surface, edits stale articles, and retires outdated ones so the searchable institutional knowledge base stays trustworthy.

## 4. Routine — Targeted & Event-Driven Notifications

1. **Targeting configuration** — Sets up which role/batch/campus segments receive which recurring notification types, and which channels each segment prefers by default.
2. **Boundary with automated triggers** — Event-driven notifications (attendance shortage, grades published, fee due, assignment graded, timetable changed, leave approved) are _fired automatically_ by their originating module (Attendance, Examination, Finance, etc.) through the Rules & Monitoring Engine and dispatched by the Notification Service — Communication Staff doesn't originate these, but owns the message templates/wording and the multi-channel delivery configuration they use.
3. **Preference respect** — Ensures campaigns honor each user's own notification preference settings rather than overriding them, except for institution-mandated emergency broadcasts.

## 5. Event & Activity Coordination

1. **Club/society promotion** — Partners with the Club Coordinator to publicize club events, competitions, and extracurricular activities: builds the event listing, sends targeted invites, and tracks RSVP/registration counts.
2. **Cross-department events** — Supports Placement Staff, the Institution Head, or Academic Administrator in publicizing larger institutional events (placement drives, convocation, accreditation visits) where broad visibility is needed.
3. **Post-event follow-up** — Sends recap communications and, where relevant, feeds attendance/participation data back to the Club Coordinator for certificate issuance.

## 6. Exception Flows — Emergency & Crisis Communication

1. **Trigger** — Security Staff logs an incident (per `user_journey.md` §19.1) or the Institution Administrator/Institution Head flags a crisis (safety issue, natural event, campus lockdown) requiring an urgent broadcast.
2. **Rapid drafting & approval** — Drafts the emergency alert; for anything beyond routine severity, gets fast-track sign-off from the Institution Administrator or Institution Head before it goes out, given the reach and sensitivity.
3. **Broadcast** — Pushes the alert across every applicable channel to the affected role/batch/campus segments, overriding normal cadence and, where policy allows, individual notification-preference throttling for safety-critical messages.
4. **Audit trail** — Logs the alert (content, audience, channels, timestamp) for the institution's audit trail, coordinating with Security Staff on the incident record.
5. **Follow-up cadence** — Issues updates as the situation evolves and a final all-clear/resolution notice once closed.

## 7. Exception Flows — Ad Hoc & Urgent Announcements

1. **Off-cycle releases** — Handles urgent last-minute announcements that fall outside the normal review calendar (sudden timetable change, unscheduled holiday, exam postponement), typically originating from the Academic Administrator or Examination Staff and relayed through Communication Staff for institution-wide distribution.
2. **Correction/retraction** — Issues corrections or retractions when a prior announcement contained an error, tracked in the same audit trail as the original.

## 8. Reporting

1. **Engagement analytics** — Reports open rates, delivery success/failure by channel, and click-through on announcements and newsletters, drawing on `libs/core/reporting`.
2. **Knowledge base insight** — Surfaces top recurring FAQ queries to the Institution Administrator/Academic Administrator as a signal of where policy or process clarity is lacking.
3. **Escalation** — Flags systemic delivery failures (a channel provider degrading, a segment consistently unreachable) to IT Staff for remediation.

## 9. Offboarding

1. **Handover** — On exit or role change, ownership of scheduled announcements, the newsletter calendar, and knowledge-base maintenance is reassigned by the Institution Administrator to a successor.
2. **Deprovisioning** — IT Staff deprovisions the account per the standard user-offboarding workflow (`user_journey.md` §2.1, §16.1).

---

## Key Cross-Persona Touchpoints

| Persona                                    | Nature of interaction                                                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Institution Administrator                  | Sets institution-wide comms policy and DM policy; approves branding and sensitive/emergency broadcasts                            |
| Institution Head                           | Co-owns external-facing tone for major public messaging; escalation point for crisis comms                                        |
| Club Coordinator                           | Co-promotes club/society events and competitions                                                                                  |
| Security Staff                             | Joint owner of emergency alert broadcasts triggered by security incidents                                                         |
| IT Staff                                   | Configures and maintains the underlying SMS/WhatsApp/email/push provider integrations Communication Staff depends on              |
| Academic Administrator / Examination Staff | Source of urgent off-cycle announcements (timetable, exam schedule changes)                                                       |
| Notification Service (machine actor)       | Executes the actual multi-channel dispatch for everything Communication Staff authors or targets                                  |
| Students / Guardians / Faculty             | End recipients; manage their own notification preferences, which Communication Staff's campaigns must respect outside emergencies |

## Boundary Note (per `project_structure.md`)

The **Course Workspace** (per-course announcements, discussions, resources, Q&A) lives in the same `libs/core/communication` lib but is Faculty-owned, not Communication Staff-owned — Communication Staff's remit is institution/department/campus-wide communication, newsletters, social media, the institutional (not course-level) knowledge base, and event promotion, as scoped in `personas.md` §17 and `functional_requirements.md` §9.
