# Student ERP — Platform Roles (SaaS): Detailed User Journeys

This document expands Section 1 of `user_journey.md` into a fully detailed journey for the five **Platform (SaaS)** personas defined in `personas.md`:

- Platform Super Admin
- Platform Support
- Platform Operations
- Platform Billing
- Platform Security

These are the only personas that operate **above the tenant boundary** — everyone else in `personas.md` (Institution Administration through External Users) is scoped to a single institution. All five live primarily in `web-admin-console` (per `project_structure.md`), but each has a distinct read/write surface, and each interacts with the platform's `services/worker`, `services/scheduler`, and `services/ingestion` differently. None of them touch `libs/core/*` directly — their view of institution data is always through aggregated, cross-tenant reporting surfaces or the event bus, never through a tenant's operational tables.

**How to read this document**
- Each journey follows: **onboarding/setup → routine operation → collaboration with peer platform roles → exception handling → offboarding/closure** (where applicable).
- "Touches" lists the concrete apps/services/libs from `project_structure.md` involved at each stage.
- Cross-references to `functional_requirements.md` §24 ("Platform & Institution Administration") and §23 ("Rules & Monitoring Engine") are called out where relevant, since platform roles are the primary consumers of those cross-cutting capabilities at the SaaS layer.
- A running **Cross-Role Interaction Map** at the end shows how these five roles hand work off to one another and to Institution Administrators.

---

## Table of Contents
1. [Platform Super Admin](#1-platform-super-admin)
2. [Platform Support](#2-platform-support)
3. [Platform Operations](#3-platform-operations)
4. [Platform Billing](#4-platform-billing)
5. [Platform Security](#5-platform-security)
6. [Cross-Role Interaction Map](#6-cross-role-interaction-map)
7. [Shared Non-Functional Notes](#7-shared-non-functional-notes)

---

## 1. Platform Super Admin

**Persona summary (`personas.md`):** Manages the SaaS platform, tenants, subscriptions, and global settings. The highest-privilege account on the platform, sitting outside any single institution's permission scope.

**Primary app(s):** `web-admin-console` (platform-level surface), with visibility into `services/worker`, `services/scheduler`, `services/ingestion` dashboards and read access to Platform Billing's revenue views.

### 1.1 Onboarding (as a platform employee)
1. Provisioned by an existing Platform Super Admin or via a break-glass bootstrap process during initial platform deployment (there is no "self-serve" path to this role — it is the root of the permission tree in `personas.md`'s Core Role Hierarchy).
2. Configures MFA and any platform-level SSO requirements for their own account via `libs/shared/auth`.
3. Reviews the current global configuration: feature flags, default module entitlements per subscription tier, and active tenant list, to build situational awareness before making changes.

### 1.2 Global Platform Configuration (setup, recurring as needed)
4. Defines or edits **subscription tiers** and which modules/personas are entitled at each tier (e.g., a "Coaching Center" tier might exclude Hostel/Transport/HR entirely, per the module list in `functional_requirements.md`).
5. Sets **global feature flags** — capabilities that can be toggled per-tenant later by Institution Administrators, but whose ceiling is set here (e.g., whether GPS transport tracking or facial-recognition attendance, both flagged P2 in `functional_requirements.md`, are available at all on a given tier).
6. Configures platform-wide defaults that cascade into new tenants unless overridden (default DM policies, default data-retention windows).

### 1.3 Tenant Provisioning
7. Initiates a **new institution tenant**: enters institution legal name, primary contact, and selects the subscription plan (as defined by Platform Billing in §4.1 below).
8. Triggers tenant-scoped infrastructure setup (isolated data partition per the multi-tenancy model referenced in `functional_requirements.md`'s open items) — this call is handed to `services/worker`/`services/ingestion` for the actual provisioning job.
9. Seeds the tenant's **first Institution Administrator** account and sends onboarding credentials.
10. Confirms the tenant reaches an "Active" state and appears correctly in the tenant list with correct entitlements.

### 1.4 Routine Operations
11. Reviews the **tenant list dashboard**: active/trial/suspended/churned counts, tenant health indicators (login activity, error rates, storage growth).
12. Reviews **platform-wide dashboards** aggregating usage across tenants (without drilling into any single tenant's student-level data — that boundary is enforced by the same event-bus/API pattern described in `project_structure.md`'s Integration Pattern).
13. Reviews escalations surfaced by Platform Support (unresolved tickets needing platform-level decisions) and Platform Security (flagged anomalies needing tenant-level action).
14. Periodically reviews Platform Billing's revenue/churn reporting (§4.4) to inform go-to-market or tier-pricing decisions.

### 1.5 Exception Flows
15. **Tenant suspension** — suspends a tenant (e.g., for non-payment escalated by Platform Billing, or a security incident escalated by Platform Security), which cascades to a read-only or fully-locked state for every user in that institution.
16. **Tenant migration** — moves a tenant between infrastructure regions or plan tiers (e.g., data-residency requirement, or upgrade from a coaching-center tier to a full-university tier), coordinating the cutover with Platform Operations.
17. **Emergency access grants** — approves a time-boxed, audited elevated-access grant for Platform Support to impersonate an institution-side account during a critical investigation (see §2.2 below); this approval itself is logged for Platform Security's audit trail.
18. **Cross-tenant incident arbitration** — when an issue spans multiple tenants (e.g., a shared infrastructure fault reported by Platform Operations, or a vendor-integration failure), the Super Admin is the arbiter of priority and communication to affected institutions.

### 1.6 Offboarding a Tenant
19. Initiates tenant decommissioning at contract end (voluntary churn) or after a suspension period expires without resolution.
20. Oversees a **data export/backup** step so the institution can retain its records per the retention policy set in `functional_requirements.md` §24 ("Data import/export and backup").
21. Confirms final deletion (or archival, depending on jurisdictional/contractual requirement) and closes the tenant record; Platform Billing is notified to stop invoicing.

---

## 2. Platform Support

**Persona summary (`personas.md`):** Helps institutions with issues — the first human touchpoint when something goes wrong for any institution-side persona.

**Primary app(s):** `web-admin-console` (support/ticketing surface), with a scoped, audited impersonation capability into tenant-facing apps (`web-student-portal`, `web-faculty-portal`, mobile) when reproducing an issue.

### 2.1 Trigger
1. Receives a support ticket from **any** institution-side persona (Faculty, Student, Office Staff, Finance Staff, etc. — any of the 35 institution-facing personas in `personas.md`) via the in-app helpdesk channel.
2. Ticket auto-tags with tenant ID, reporting persona/role, and affected module, based on where in the product the ticket originated.

### 2.2 Investigation
3. Looks up **tenant context**: subscription tier, recent configuration changes, known open incidents for that tenant.
4. Attempts to reproduce the issue directly if it's environment-level (e.g., a broken report export affecting all tenants).
5. If reproduction requires seeing the institution-side experience exactly as the user sees it, requests a **time-boxed impersonation grant**. For sensitive tenants or actions this may require Platform Super Admin approval (per §1.5.17); all impersonation sessions are logged to Platform Security's audit trail regardless.
6. Distinguishes between a **product bug**, a **configuration/training issue** (the institution set something up in a way that doesn't work as they expect), and a **data issue** (e.g., a corrupted import from `services/ingestion`).

### 2.3 Collaboration
7. **Infrastructure-level issues** (slow queries, failed background jobs, degraded uptime) are hand-off to Platform Operations with reproduction steps and affected tenant list.
8. **Suspicious-activity cases** (repeated failed logins, data-access patterns that look like probing rather than legitimate use, a ticket that turns out to be a social-engineering attempt) are escalated to Platform Security rather than resolved as a normal support ticket.
9. **Billing-adjacent tickets** (an institution disputes an invoice, or a feature is missing because of a tier mismatch) are routed to Platform Billing.
10. Configuration/training issues that reveal a UX gap are logged for the product backlog rather than treated as a bug.

### 2.4 Resolution
11. Closes the ticket with a documented root cause and fix (or workaround, if the underlying fix requires an Operations deployment).
12. Feeds **recurring issues** into an internal knowledge base so future tickets of the same shape can be resolved faster or self-served by institution admins.
13. Confirms resolution with the reporting persona and closes the loop.

### 2.5 Exception Flow — No Clean Owner
14. When a ticket doesn't cleanly map to Operations, Security, or Billing (e.g., an ambiguous cross-module data inconsistency), Support escalates directly to the Platform Super Admin for triage rather than guessing at ownership.

---

## 3. Platform Operations

**Persona summary (`personas.md`):** Infrastructure, monitoring, deployments.

**Primary app(s):** `web-admin-console` (infra surface) + direct operational ownership of `services/worker`, `services/scheduler`, `services/ingestion`, and the `infrastructure/` layer (Docker, Kubernetes, Terraform).

### 3.1 Routine Monitoring
1. Watches **job-queue health**: BullMQ worker throughput and failure rate in `services/worker`, scheduled-job execution in `services/scheduler` (e.g., attendance-threshold evaluation runs feeding the Rules & Monitoring Engine per `functional_requirements.md` §23, nightly reminder dispatches).
2. Watches **bulk ingestion pipelines** in `services/ingestion` — bulk student import/export batches, biometric/RFID device data ingestion — for stuck or failed batches across tenants.
3. Watches **deployment pipeline health** and **uptime/SLO dashboards** across all tenant traffic.
4. Reviews capacity trends (storage growth per tenant, request volume) to plan scaling ahead of need rather than reactively.

### 3.2 Deployment
5. Ships new releases across the platform, following the Nx monorepo boundary rules (`type:app`, `type:core`, `type:standalone`, `type:portal`, `type:shared` in `project_structure.md`) so a deploy to one app surface can't accidentally break another's contract.
6. Runs staged/canary rollouts where available; monitors error-rate and latency deltas post-deploy.
7. **Rolls back** a release if post-deploy metrics regress, coordinating timing with Platform Support if the rollback affects tenants mid-session.

### 3.3 Exception Flows
8. Responds to **infrastructure alerts**: autoscaling events, failed ingestion batches (e.g., a biometric device dump that partially failed validation before hitting the Attendance module), backup job failures.
9. For anything with **user-facing impact** (a tenant seeing errors, a module unavailable), escalates awareness to Platform Support so Support can proactively manage institution-side communication rather than institutions independently filing duplicate tickets.
10. For infra incidents that look like they might be **externally caused** (e.g., a DDoS pattern, unexpected traffic from a single tenant's API key), loops in Platform Security immediately rather than treating it as a pure capacity problem.
11. Coordinates tenant **migration cutovers** initiated by the Platform Super Admin (§1.5.16), owning the actual infrastructure move and rollback plan if the cutover fails.

### 3.4 Reporting
12. Surfaces infrastructure health and incident postmortems to the Platform Super Admin, particularly where a recurring pattern suggests an architectural fix (e.g., a specific ingestion type failing repeatedly enough to warrant a `services/ingestion` redesign) rather than a one-off fix.

---

## 4. Platform Billing

**Persona summary (`personas.md`):** Subscription and payments — explicitly distinct from Finance Staff, who own **student-fee** billing inside a single institution (`user_journey.md` §8.1 draws this line explicitly).

**Primary app(s):** `web-admin-console` (billing surface), integrated with the Payment Gateway machine actor (`user_journey.md` §21.2) for platform-subscription charges specifically (as opposed to student fee/application/hostel/transport payments, which the same Payment Gateway also processes but routes to the Finance module instead).

### 4.1 Setup
1. Defines the **subscription plans and pricing tiers** that Platform Super Admin selects from during tenant provisioning (§1.3.7) — Billing owns the pricing/packaging definition; Super Admin owns the act of assigning a tenant to a plan.
2. Configures billing cycles (monthly/annual), currency handling for multi-region tenants, and tax/invoicing rules per jurisdiction.

### 4.2 Routine
3. Tracks **per-tenant invoicing**: generates recurring invoices per the tenant's plan and billing cycle.
4. Monitors **platform subscription payment status** per tenant (paid, pending, overdue) — a completely separate ledger from any institution's own student-fee collections.
5. Reconciles subscription payments received via the Payment Gateway against expected invoices.

### 4.3 Exception Flows
6. **Plan upgrade/downgrade**: processes a tenant's change in subscription tier (e.g., an institution outgrowing a coaching-center tier and needing Hostel/Transport modules), which also requires Platform Super Admin to update the tenant's module entitlements accordingly (§1.2.4) — Billing and Super Admin coordinate so payment and entitlement change land together.
7. **Dunning workflow**: manages overdue-subscription follow-up (reminders, grace periods); if an institution remains unpaid past the grace period, hands off to Platform Super Admin to action a suspension (§1.5.15).
8. Handles **billing disputes** routed from Platform Support (§2.3.9) — investigates the specific invoice line, corrects and reissues if warranted, or explains the charge back to Support for relay to the institution.

### 4.4 Reporting
9. Surfaces **platform revenue and churn metrics** (MRR/ARR, tenant churn rate, upgrade/downgrade trends, cohort retention by subscription tier) to the Platform Super Admin to inform pricing and go-to-market decisions.

---

## 5. Platform Security

**Persona summary (`personas.md`):** Security and compliance at the platform level.

**Primary app(s):** `web-admin-console` (security surface), with visibility into auth logs (via `libs/shared/auth` / Authentication Service, `user_journey.md` §21.1) across **all** tenants — the one role besides Super Admin with a genuinely cross-tenant view, here scoped specifically to security telemetry rather than operational data.

### 5.1 Routine Monitoring
1. Monitors **platform-wide auth anomalies**: unusual login patterns, credential-stuffing attempts, impossible-travel logins, repeated failed-MFA attempts — across every tenant, since a compromised account in one institution is a platform-level signal, not just that institution's problem.
2. Reviews **access logs** for privilege-escalation patterns or access outside a role's expected scope (cross-checked against the permission model in `personas.md`'s Design Principle — Person/Role/Job-Title separation, so anomalies are evaluated against actual granted permissions, not assumed ones).
3. Audits **impersonation sessions** initiated by Platform Support (§2.2.5) for scope creep or missing justification.

### 5.2 Governance
4. Maintains platform-level **compliance posture**: encryption standards at rest/in transit, data-residency policy enforcement per tenant region, retention-schedule compliance.
5. Reviews configuration changes made by Platform Super Admin (feature flags, default policies) for security implications before or shortly after they roll out.

### 5.3 Exception Flows
6. **Incident investigation**: takes escalations from Platform Support (suspicious-activity tickets, §2.3.8) and from Platform Operations (traffic patterns that look adversarial, §3.3.10).
7. **Tenant lockdown**: can lock down a single tenant pending investigation (a narrower, security-specific action than the Super Admin's full suspension in §1.5.15 — used when the concern is a possible active compromise rather than a business/payment decision).
8. Coordinates the **audit-trail evidence package** for the Super Admin when an incident requires tenant suspension or notification obligations.

### 5.4 External Touchpoint
9. When a compliance review or audit touches **platform infrastructure** rather than a single institution's records (e.g., a data-residency certification, a platform-wide penetration test result requested by a regulator), Platform Security is the counterpart to the external **Auditor** persona — as distinct from `portal-auditor`'s normal use, which is scoped to a single institution's compliance data (`user_journey.md` §20.3). Institution Head (`user_journey.md` §2.2) remains the counterpart for accreditation/compliance reviews that are institution-specific rather than platform-wide.

---

## 6. Cross-Role Interaction Map

These five roles rarely act in isolation. The table below summarizes the hand-offs referenced throughout §§1–5:

| From | To | When |
|---|---|---|
| Platform Support | Platform Operations | Ticket traces to infra (slow queries, failed jobs, degraded uptime) |
| Platform Support | Platform Security | Ticket shows suspicious activity rather than an ordinary bug |
| Platform Support | Platform Billing | Ticket is a billing dispute or tier/entitlement mismatch |
| Platform Support | Platform Super Admin | No clean owner among Operations/Security/Billing |
| Platform Operations | Platform Support | An infra fix or incident has user-facing impact needing institution-side communication |
| Platform Operations | Platform Security | Traffic/incident pattern looks externally/adversarially caused |
| Platform Operations | Platform Super Admin | Recurring incident pattern suggests an architectural decision is needed |
| Platform Billing | Platform Super Admin | Overdue dunning exhausted (needs suspension) or a plan-change needs entitlement update |
| Platform Security | Platform Super Admin | Incident requires tenant lockdown/suspension or external notification |
| Platform Super Admin | Platform Billing | New tenant provisioned (plan selection) or tenant offboarded (stop invoicing) |
| Platform Super Admin | Platform Support | Approves an emergency/impersonation access grant |
| Platform Super Admin | Institution Administrator | Tenant provisioned, seeded with first admin account; tenant suspended/decommissioned |
| Platform Security | Institution Administrator / Institution Head | Tenant-specific compliance findings communicated (vs. platform-wide, which stays with Security/Super Admin) |

A useful way to read this: **Support** is the intake funnel for anything institution-facing; **Operations** and **Security** are the two specialist responders (infrastructure vs. adversarial/compliance); **Billing** is the commercial layer running in parallel to all of it; and the **Super Admin** is the only role with authority to take platform-wide, irreversible action (suspend, migrate, decommission a tenant) — every other role escalates *to* that authority rather than exercising it directly.

---

## 7. Shared Non-Functional Notes

- **No direct core-data access.** Per `project_structure.md`'s boundary rules, none of these five roles read or write `libs/core/*` (Student, Academic, Attendance, Examination, Finance, Communication, Rules Engine, Reporting) directly. Their view of institution-level activity is always through aggregated cross-tenant dashboards, the event bus, or a scoped/audited impersonation session — never a raw query against a tenant's operational tables. This is what keeps the tenant-isolation guarantee intact even though these roles are, by definition, cross-tenant.
- **Everything is audited.** Impersonation (Support), configuration changes (Super Admin), lockdowns (Security), and plan changes (Billing) all write to an audit trail that Platform Security can review — this is a deliberate consequence of `personas.md`'s permission-driven (not persona-driven) authorization model applied at the platform layer.
- **Machine actors these roles depend on:** Authentication Service (§21.1, feeds Security's anomaly dashboards), Payment Gateway (§21.2, feeds Billing's reconciliation), and the job infrastructure behind `services/worker` / `services/scheduler` / `services/ingestion` (feeds Operations' monitoring). None of the five platform roles interacts with the Proctoring Service, Biometric Device, or LMS Integration machine actors — those are institution-scoped.
