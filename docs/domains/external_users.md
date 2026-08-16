# Student ERP — External Users: Detailed Combined Journey

### Recruiter · Vendor · Auditor · Corporate Client Administrator

This document expands Section 20 of `user_journey.md` for the four external B2B personas that transact most actively with the institution (as opposed to the two that are almost purely read-only regulatory viewers — Accrediting Body and Government Official, which are intentionally out of scope here). It is grounded in:

- `personas.md` — Section 20 (External Users) for role definitions and scope boundaries
- `functional_requirements.md` — Sections 15 (Placement & Career), 22 (External/B2B Portals) for feature scope
- `project_structure.md` — the `type:portal` boundary rule and the "no shared database" integration pattern
- `user_journey.md` — Section 20 for the baseline journeys this document elaborates

---

## 0. Shared Architectural Context

Before the individual journeys, three structural facts from `project_structure.md` shape _everything_ below:

1. **No direct Core access.** Portals (`portal-vendor`, `portal-auditor`, `portal-corporate-client`) are tagged `type:portal` and are explicitly denied access to `libs/core/examination` and `libs/core/academic` — i.e., grading and internal academic data. They read and write only through published API contracts.
2. **No shared database.** All cross-boundary interaction happens via the event bus (e.g., `FeeChargeRequested`, `PaymentConfirmed`) or the SDK in `libs/shared/sdk` — never a direct query into another module's tables. This is what keeps each external persona's data scope enforceable rather than convention-based.
3. **Recruiter is the odd one out.** Unlike the other three, Recruiter has no dedicated `portal-recruiter` app in `project_structure.md` — its primary surface is `app-placement (external-facing view)`, a standalone institution-facing app rather than a `type:portal` app. This is called out explicitly in Section 6 (Open Questions) because it's an asymmetry worth resolving deliberately rather than by accident.

| Persona                        | Primary App                     | App Type                                 | Write Access?                              | Data Scope Model                          |
| ------------------------------ | ------------------------------- | ---------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Recruiter                      | `app-placement` (external view) | `type:standalone` (external-facing mode) | Yes — postings, interview outcomes, offers | Scoped to own company's drives/candidates |
| Vendor                         | `portal-vendor`                 | `type:portal`                            | Yes — invoice submission                   | Scoped to own POs/invoices only           |
| Auditor                        | `portal-auditor`                | `type:portal`                            | No — strictly read-only                    | Scoped to audit mandate + time window     |
| Corporate Client Administrator | `portal-corporate-client`       | `type:portal`                            | No — view + payment tracking only          | Scoped to own sponsored-learner cohort    |

---

## 1. Recruiter

_Persona ref: `personas.md` §20.1 · Primary app: `app-placement` (external-facing view)_

### 1.1 Onboarding

1. Placement Staff creates the company/recruiter record in `app-placement` — company name, industry, hiring history (if a returning recruiter from a prior cycle), and the specific hiring cycle(s) they're being onboarded for.
2. Notification Service sends an invite (email/SMS per institution config) with a scoped account-setup link — scoped meaning it grants access to _this_ hiring cycle only, not a standing account across all cycles.
3. Recruiter authenticates via the Authentication Service and sets credentials.
4. Recruiter completes the remaining company profile fields not pre-filled by Placement Staff: logo, description, additional point-of-contact users if the company sends more than one representative.

### 1.2 Routine (per hiring cycle)

1. **Job posting** — Drafts job/internship openings (role, eligibility criteria, compensation band). Per `functional_requirements.md` §15, this typically goes through Placement Staff moderation before it's visible to students — the Recruiter doesn't self-publish directly to the student body.
2. **Candidate pool** — Browses only the subset of students who applied to their specific opening or who match eligibility criteria Placement Staff configured (program, batch, CGPA cutoff, etc.) — not the general student directory.
3. **Application review** — Reviews resumes/profiles for students who opted in to apply.
4. **Interview scheduling** — Requests interview slots; room/logistics booking is mediated by Placement Staff (Recruiter doesn't have direct Facilities-module access to book rooms itself).
5. **Interview outcomes** — Records pass/fail/hold per round, across multiple rounds if the drive has them.
6. **Offers** — Extends offers, tracks acceptance/decline status per candidate.
7. **Reporting** — Views drive-level statistics for their own drives (applicants, conversion, offers extended vs. accepted) — not institution-wide placement statistics, which belong to Placement Staff.

### 1.3 Exception Flows

- **Drive postponement/cancellation** — Communicated by Placement Staff/Communication Staff via Notification Service; Recruiter's posting is auto-updated to a "postponed" state rather than silently disappearing.
- **Student withdrawal mid-process** — Application status flips to Withdrawn; Recruiter is notified but cannot see the reason (student-side data stays internal).
- **Eligibility-criteria change request** — Recruiter cannot self-edit eligibility rules once a drive is published; must request a change through Placement Staff, who approves and republishes.
- **Offer dispute** — Handled by Placement Staff as intermediary; Recruiter and student don't negotiate directly through the platform.

### 1.4 Offboarding

- At hiring-cycle close, Placement Staff deactivates the Recruiter's session-level access for that cycle.
- If the company returns for a future cycle, its historical record is reactivated rather than recreated from scratch (retains hiring history for that company).
- For policy violations (e.g., misrepresented role, discriminatory posting), Placement Staff or Institution Administrator can revoke access mid-cycle, with an audit trail entry.

### 1.5 Integration Points

- Emits: `JobPostingCreated`, `OfferExtended`, `InterviewOutcomeRecorded`
- Consumes: `ApplicationSubmitted` (from Student side)
- **Gap worth flagging:** neither `functional_requirements.md` nor `user_journey.md` specifies whether Recruiter↔Student messaging is subject to the same configurable DM policy engine used for Faculty/Student/Parent communication (§9 of `functional_requirements.md`). This should be resolved explicitly rather than left implicit, since it's a different trust boundary (external party vs. internal role).

### 1.6 Permission Boundary

- No access to grades, attendance %, exam results, or fee/financial status of any student.
- No visibility into other recruiters' postings, candidate pools, or offer data at the same institution (competitive isolation).
- No access to `libs/core/academic` or `libs/core/examination` — consistent with the portal boundary rule even though Recruiter isn't formally a `type:portal` app.

---

## 2. Vendor

_Persona ref: `personas.md` §20.2 · Primary app: `portal-vendor`_

### 2.1 Onboarding

1. Approved as a vendor by Facilities, Finance, or IT Staff (per `personas.md`) — whichever department is the primary requisitioner. A vendor record is created: company details, tax/banking info, category of goods/services, contract terms.
2. Notification Service sends `portal-vendor` invite.
3. Vendor authenticates and completes onboarding — uploads business registration documents, certifications, banking details for payment.
4. If the vendor supplies across multiple departments (e.g., both Facilities and IT), each department's approving staff links the same vendor record rather than creating duplicates — otherwise reconciliation and payment tracking would fragment.

### 2.2 Routine

1. Views purchase orders (POs) issued against their vendor record by any approving department.
2. Submits invoices against a specific PO.
3. Tracks payment status end-to-end — from invoice submission through Finance's accounts-payable processing to settlement.
4. Receives notifications on PO status changes, invoice acceptance/rejection, and payment confirmation.

### 2.3 Exception Flows

- **Invoice discrepancy** — Flagged back to the originating department's staff (Facilities/IT/Finance) for resolution _before_ Finance processes payment; the invoice sits in a disputed state, not silently rejected.
- **PO amendment/cancellation** — Vendor is notified; any invoice already submitted against the old PO must be resubmitted or voided.
- **Payment delay inquiry** — Vendor raises a query routed to Finance Staff (this is institution-level, distinct from the platform-level Platform Support ticketing used by institutions themselves).
- **Vendor suspension/blacklisting** — Institution Administrator or Finance Staff revokes access; open POs are handled per the underlying contract terms (not automatically voided), and the action is logged in the audit trail.

### 2.4 Offboarding

- On contract termination, the approving department (or Finance Staff) marks the vendor inactive.
- A final settlement step closes out any outstanding invoices before portal access is fully revoked.
- Historical PO/invoice records are retained for audit purposes even after access removal.

### 2.5 Integration Points

- Emits: `InvoiceSubmitted`
- Consumes: `PurchaseOrderIssued`, `PaymentScheduled`, `PaymentConfirmed`
- **Distinction worth noting:** unlike the Payment Gateway machine actor (§21.2 of `user_journey.md`), which handles _online_ student/guardian fee payments, vendor payments are accounts-payable and may run through offline banking rails (bank transfer, cheque) rather than the same payment gateway integration — the event names are shared conceptually but the settlement mechanism differs.

### 2.6 Permission Boundary

- No access to `libs/core/academic` or `libs/core/examination` (portal boundary rule).
- No visibility into other vendors' POs, invoices, or pricing (vendor-scoped data isolation — each vendor sees only its own transactions, never competitor pricing or volume).

---

## 3. Auditor

_Persona ref: `personas.md` §20.3 · Primary app: `portal-auditor`_

> Note: `portal-auditor` is shared infrastructure — Accrediting Body (§20.4) and Government Official (§20.5) use the same portal with different report scopes. Only the Auditor journey is detailed here per your request; the other two are lighter-weight variants of the same access model.

### 3.1 Onboarding

1. Institution Administrator or Platform Security grants **scoped, read-only, time-boxed** access for a defined audit period — explicit start and end dates are set at grant time, not left open-ended.
2. The grant specifies which modules are in scope (e.g., Finance + Admissions for a financial audit; Attendance + Academic compliance summaries for an accreditation-adjacent review) and which campuses, if the institution is multi-campus.
3. Auditor receives `portal-auditor` credentials scoped to exactly that mandate.

### 3.2 Routine

1. Examines compliance-relevant reports: financial statements, audit trails across in-scope modules.
2. Reviews the audit-trail history (who changed what, when) as surfaced by the Reporting & Analytics module — in aggregated, read-only form, not raw table access.
3. Generates and exports scheduled regulatory reports (PDF/Excel/CSV).
4. Raises information requests or clarification questions — routed to the Institution Administrator rather than directly to individual department staff, keeping the audit interaction centralized and itself auditable.

### 3.3 Exception Flows

- **Scope expansion mid-audit** — If findings require access beyond the original grant, the Institution Administrator or Platform Security must approve an explicit extension; this is a fresh, logged grant, not an automatic widening.
- **Suspicious pattern discovered** — Escalated to Platform Security or Institution Head rather than acted on directly by the Auditor (Auditor has no write/action authority in the system).
- **Grant expiring mid-investigation** — Requires an explicit renewal request and approval; there is no auto-renewal, since time-boxing is a deliberate control, not a default that quietly persists.

### 3.4 Offboarding

- Access is **automatically revoked** when the audit period closes — system-enforced expiry, not dependent on someone remembering to deprovision.
- Exported reports/evidence are retained per the institution's data retention policy even after the portal session itself is gone.

### 3.5 Integration Points

- Auditor is a pull-only consumer of reporting views/read replicas — it does not emit domain events, since it has no write actions anywhere in the system.
- Explicitly walled off from `libs/core/examination` and `libs/core/academic` (grading/internal academic data) per the `project_structure.md` portal boundary table — this is the single clearest architectural guarantee protecting the audit relationship's integrity: the Auditor sees compiled compliance reports, never raw grade books or internal deliberation.

### 3.6 Permission Boundary

- Strictly read-only across the entire session — no create/update/delete anywhere.
- No access to individual student grading detail, or to confidentiality-controlled records (e.g., Medical & Wellness session notes) — only aggregated/compiled reporting.
- Scope is both time-boxed and module-boxed simultaneously; expiry of either dimension ends access.

---

## 4. Corporate Client Administrator

_Persona ref: `personas.md` §20.6 · Primary app: `portal-corporate-client`_

### 4.1 Onboarding

1. Onboarded when a company sponsors employees for training programs at the institution — triggered by a sponsorship agreement.

   > The source docs don't specify exactly which internal role initiates provisioning. Given the invoicing and enrollment linkage involved, Finance Staff and/or Institution Administrator are the most plausible owners — flagged here as an inference, not a stated fact, and worth confirming during detailed design.

2. Corporate Client Administrator receives `portal-corporate-client` credentials, linked specifically to their company's sponsored-learner cohort (a defined list of employee-students tied to enrollment records).
3. Reviews sponsorship terms as configured (invoicing cadence, payment terms) before routine use begins.

### 4.2 Routine

1. Views sponsored learners' enrollment, progress, and completion status — explicitly **aggregate/cohort-level progress**, not individual grading detail (per `personas.md`: "No access to grading or internal institution data").
2. Receives invoices for sponsored learners, generated per the Finance module's billing cycle.
3. Tracks payment status against those invoices.
4. Monitors cohort-level dashboards — e.g., completion rate across the sponsored group — rather than per-employee grade transcripts.

### 4.3 Exception Flows

- **New employee added mid-program** — Requires coordination with Admissions/Office Staff to enroll the new sponsored learner and update the cohort linkage; not self-service from the portal.
- **Employee leaves the sponsoring company mid-program** — Sponsorship status is updated for that individual; may trigger a billing adjustment (pro-rated invoice).
- **Payment dispute or delay** — Escalates to Finance Staff through the portal, distinct from the platform-level support channel used by the institution itself.
- **Contract renewal or cohort expansion** — Processed as a new/updated sponsorship agreement by Finance Staff/Institution Administrator, not by the Corporate Client Administrator directly.

### 4.4 Offboarding

- At program completion for the full cohort, or at contract end, the Institution Administrator retires that cohort's view.
- If the company relationship ends entirely, `portal-corporate-client` access is revoked outright.
- Historical invoices and progress records are retained for financial audit purposes.

### 4.5 Integration Points

- Consumes: `PaymentConfirmed` / invoice-generation events from Finance.
- **Distinction worth noting:** this is an accounts-**receivable** relationship (institution invoices the company) — the mirror image of the Vendor's accounts-**payable** relationship (institution pays the vendor). Same underlying Finance module, opposite cash-flow direction.

### 4.6 Permission Boundary

- Explicitly denied grading access and any "internal institution data" per `personas.md`.
- Modeled as **tenant-adjacent, representing a separate legal entity** — deliberately _not_ modeled as a Guardian, since there's no personal relationship, only a commercial sponsorship. This distinction matters for consent/notification design: a Corporate Client Administrator shouldn't receive the kind of personal-progress alerts a Guardian would (attendance shortage, disciplinary flags), only completion/billing-relevant status.

---

## 5. Cross-Persona Comparison

| Dimension                           | Recruiter                      | Vendor                                  | Auditor                                              | Corporate Client Admin                                 |
| ----------------------------------- | ------------------------------ | --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Provisioned by                      | Placement Staff                | Facilities / Finance / IT Staff         | Institution Administrator / Platform Security        | Institution Administrator / Finance Staff _(inferred)_ |
| Access duration                     | Per hiring cycle               | Ongoing (contract-bound)                | Time-boxed (audit period)                            | Ongoing (sponsorship-bound)                            |
| Write access                        | Yes (postings, offers)         | Yes (invoices)                          | No                                                   | No                                                     |
| Cash-flow direction                 | N/A                            | Accounts payable (institution → vendor) | N/A                                                  | Accounts receivable (company → institution)            |
| Sees other same-role parties' data? | No                             | No                                      | N/A (audit is inherently cross-cutting within scope) | No                                                     |
| Core academic/examination access    | None                           | None                                    | None                                                 | None                                                   |
| Offboarding trigger                 | Cycle close / policy violation | Contract end / suspension               | Automatic at grant expiry                            | Cohort completion / contract end                       |

---

## 6. Open Questions for Further Definition

1. **Recruiter's app type asymmetry** — Should Recruiter get a dedicated `portal-recruiter` app (`type:portal`) to match the architectural pattern used for Vendor, Auditor, and Corporate Client Administrator, rather than living inside `app-placement`'s external-facing view? This affects whether the same boundary-rule enforcement (`@nx/enforce-module-boundaries`) applies to it as cleanly as it does to the other three.
2. **Recruiter↔Student messaging boundary** — Not addressed in `functional_requirements.md` §9's DM policy list, which only covers internal-role pairs (Student↔Faculty, Faculty↔Faculty, etc.). Needs an explicit policy rather than an implicit gap.
3. **Corporate Client Administrator provisioning owner** — Not explicitly named in any source doc; recommend confirming whether Finance Staff, Institution Administrator, or a joint workflow owns this.
4. **Multi-contact companies** — Whether a single Vendor or Recruiter company can have multiple named user logins (e.g., one recruiter company sending three interviewers) isn't addressed, though it's clearly implied by "Corporate Client Administrator" being a per-company admin role that could plausibly have sub-users.
5. **Auditor request routing at scale** — For a large audit team, whether all auditors funnel clarification requests through a single Institution Administrator inbox, or whether this needs a dedicated audit-liaison role, is unspecified.
