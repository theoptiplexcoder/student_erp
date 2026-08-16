# Finance Staff — Detailed User Journey

This document expands the one-line journey for **Finance Staff** in `user_journey.md` (§8) into a full lifecycle walkthrough, grounded in the persona definition in `personas.md` (§8) and the module spec in `functional_requirements.md` (§6, plus cross-cutting §10, §23–25). It also proposes the multi-assignment/scoping model requested for this role.

_Primary app(s): web-admin-console (finance module)_
_Persona category: Finance (single persona table entry today; see §2 below for why it should support many people)_

---

## 1. Persona Summary

| Attribute                            | Detail                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Role                                 | Finance Staff                                                                                                                               |
| Drives permissions for               | Fee structure config, collections, refunds, payroll processing (with HR), budgeting, vendor payments, financial reporting                   |
| Job titles it maps to (display only) | Accountant, Bursar, Finance Officer, Fee Manager, Chief Financial Officer, etc. — per the Person/Role/Job Title separation in `personas.md` |
| Assigned by                          | Institution Administrator                                                                                                                   |
| Primary app                          | `web-admin-console` (finance module)                                                                                                        |
| Data domain                          | `libs/core/finance` (type:core — see `project_structure.md`)                                                                                |

---

## 2. Multi-Assignment & Scoping Model

`personas.md` already establishes that **Role is separate from Person** and that authorization is permission-driven, not persona-driven — so nothing in the data model stops an institution from assigning the Finance Staff role to more than one person today. What's missing is an explicit _assignment and scoping_ pattern, parallel to what already exists for Regional/Zonal Administrator. Recommended shape:

1. **Multiple assignees, no cap** — Institution Administrator can invite and assign the Finance Staff role to any number of people (§2.1 in `user_journey.md` already covers Institution Administrator "assigning roles" generically; this makes the finance case explicit).
2. **Optional campus scoping** — In multi-campus institutions, a Finance Staff account can be scoped to one or more specific campuses (mirroring the Regional/Zonal Administrator pattern in §2.4). A campus-scoped Finance Staff member sees and acts only on that campus's fee/collection data; an unscoped ("institution-wide") Finance Staff or a designated Finance Head sees the consolidated view.
3. **Optional functional scoping (permission bundles, not new personas)** — Because Finance covers several distinct back-office functions (collections, payroll liaison, budgeting/vendor payments, waiver/scholarship approval), an institution can split these across people without inventing new personas:
   - **Collections Staff** — front-of-house payment recording, receipts, dues follow-up
   - **Payroll Liaison** — coordinates the payroll cycle with HR Staff
   - **Budgeting/Accounts Payable** — budget tracking, vendor payments, GL entries
   - **Full Finance Staff** — all of the above (default when only one person is assigned)
4. **Approval hierarchy stays with the Institution Administrator** — regardless of how many Finance Staff accounts exist, fee-structure changes and policy-level waivers still route to the Institution Administrator for sign-off (per `user_journey.md` §2.1), so multiple assignees increase throughput without diluting oversight.
5. **Audit trail per person, not per role** — every finance action logs the acting Person, so multiple Finance Staff accounts remain individually auditable (ties into `functional_requirements.md` §24's institution-wide audit logs).

This keeps the persona count in `personas.md` unchanged (Finance Staff remains one row in §8) while making clear that "one persona" never meant "one person."

---

## 3. Detailed Journey

### 3.1 Onboarding

- Institution Administrator invites the person and assigns the Finance Staff role, optionally with a campus scope and/or a functional sub-scope (§2 above).
- Person logs in via the Authentication Service (SSO if configured by IT Staff).
- Sets notification preferences (email/SMS/WhatsApp/push) for defaulter alerts, payment failures, and refund approvals, consumed later by the Notification Service.
- Reviews any fee structure and chart of accounts inherited from institution setup, or starts configuring one if this is a new tenant.

### 3.2 Setup — Fee Structure Configuration (P0)

- Defines fee heads by program/batch/category: tuition, hostel, transport, misc. (`functional_requirements.md` §6).
- Sets due dates and installment schedules; configures late fee/penalty rules.
- Configures discounts, waivers, and scholarship rules — coordinating with the Academic Administrator where eligibility depends on academic criteria.
- Submits fee-structure changes for Institution Administrator sign-off (per `user_journey.md` §2.1, "fee-structure sign-off").
- Aligns hostel and transport fee heads into the central fee module with Hostel Staff and Transport Staff, since both modules integrate fees through Finance rather than billing separately (`functional_requirements.md` §12–13).

### 3.3 Daily / Routine — Collection & Monitoring

- Monitors online payments processed through the Payment Gateway; each payment flows as an event (`FeeChargeRequested` → `PaymentConfirmed`, per `user_journey.md` §21.2) into the finance ledger.
- Records offline payments (cash, cheque, DD, bank transfer) and generates receipts.
- Manages partial payments and installment tracking.
- Processes refund requests against policy.
- Reviews the outstanding-dues dashboard, filterable by campus, program, and batch.
- The Rules & Monitoring Engine (`functional_requirements.md` §23) automatically flags defaulters against configurable rules (e.g., "fee overdue > 14 days") and dispatches alerts to students/guardians via the Notification Service; Finance Staff reviews the resulting escalation queue and can manually intervene (payment plan, hold, waiver referral).
- Handles escalated dues queries passed up from Office Staff.

### 3.4 Periodic — Reconciliation & Reporting

- Daily reconciliation of payment-gateway settlements against the internal ledger.
- Monthly reconciliation report, broken down by campus.
- For multi-campus institutions, a consolidated cross-campus view feeds the Regional/Zonal Administrator's and Institution Head's dashboards (`user_journey.md` §2.4, §2.2).
- Exports financial statements (PDF/Excel/CSV) for the Institution Head and, where access has been granted, for Auditors and Government Officials via `portal-auditor` (`functional_requirements.md` §22).
- Tracks scholarship/financial-aid disbursement against budget.

### 3.5 Payroll Cycle — Cross-Module Collaboration

- Each pay cycle, coordinates with HR Staff (`app-hr`) on salary structure, deductions, and payslip generation.
- Because `app-hr` is a standalone app, it cannot query `libs/core/finance` directly — payroll data exchange happens through the published API surface / event bus (`project_structure.md` boundary rules), keeping HR and Finance data ownership clean.
- Posts payroll entries to the general ledger; handles exceptions such as arrears, bonuses, or tax adjustments.

### 3.6 Back Office — Budgeting & Vendor Payments

- Tracks department budget requests raised by Department Administrators and reconciles against allocations.
- Reviews vendor invoices submitted through `portal-vendor`, approves payments, and tracks payment status back to the Vendor (`user_journey.md` §20.2).
- Maintains the general ledger / accounting integration and produces expense reports.

### 3.7 Exception Flows

- **Fee disputes** — investigates the ledger on a student/guardian query and issues a correction or refund.
- **Result-withholding clearance** — Examination Staff withholds results for fee dues (`functional_requirements.md` §5); Finance Staff confirms due-clearance to release the hold.
- **Policy-level waivers** — escalates exceptions beyond configured thresholds to the Institution Administrator (or Institution Head for larger policy questions).
- **Gateway reconciliation mismatches** — investigates failed or disputed transactions flagged during daily reconciliation.
- **Hardship waivers** — coordinates with Health Staff and the Institution Administrator for emergency fee relief in medical or hardship cases.

### 3.8 External & B2B Touchpoints

- Generates invoices for sponsored learners on behalf of a Corporate Client Administrator via `portal-corporate-client`, and tracks payment (`user_journey.md` §8.1, §20.6).
- Supports an Auditor's scoped, time-boxed, read-only access to financial statements and audit trails (`user_journey.md` §20.3).
- Supports a Government Official's scheduled regulatory report exports (`user_journey.md` §20.5).
- These external roles reach Finance data only through `portal-auditor` / `portal-corporate-client`'s published API contracts — never direct database access (`project_structure.md` boundary rules for `type:portal`).

### 3.9 Offboarding

- When a Finance Staff member leaves, the Institution Administrator revokes their role assignment; any campus or functional scope they held is reassigned to a remaining or newly onboarded Finance Staff member.
- Because Person and Role are modeled separately, the audit trail retains the departed staff member's historical actions under their own identity even after the role assignment is revoked.

---

## 4. Cross-Persona Interaction Map

| Counterpart                                      | Nature of interaction                                                |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| Institution Administrator                        | Fee-structure sign-off; assigns/revokes Finance Staff role and scope |
| Academic Administrator                           | Scholarship eligibility criteria tied to academic standing           |
| HR Staff                                         | Payroll data exchange each pay cycle                                 |
| Hostel Staff / Transport Staff                   | Hostel and transport fee heads integrated into central billing       |
| Examination Staff                                | Fee-dues clearance to lift result-withholding holds                  |
| Office Staff                                     | Front-of-house payment assistance, escalated queries                 |
| Department Administrator                         | Department budget requests                                           |
| Regional/Zonal Administrator                     | Cross-campus fee reporting and reallocation                          |
| Institution Head                                 | Strategic finance dashboards and summaries                           |
| Auditor / Government Official / Accrediting Body | Scoped, read-only compliance and regulatory reporting                |
| Vendor                                           | Purchase-order/invoice/payment cycle                                 |
| Corporate Client Administrator                   | Sponsored-learner invoicing                                          |
| Student / Guardian                               | Fee payment, receipts, dues, waiver requests                         |
| Rules & Monitoring Engine                        | Automated defaulter detection and alert dispatch                     |
| Payment Gateway                                  | Online payment event stream                                          |
| Notification Service                             | Multi-channel dues/receipt/refund alerts                             |

---

## 5. System Boundaries (from `project_structure.md`)

- Finance's data lives in `libs/core/finance` (`type:core`), which may depend only on `libs/shared/*` — it does not reach into other core domains directly.
- Standalone apps (`app-hr`, `app-hostel`, `app-transport`) never query Finance's database directly; all fee/payroll integration flows through the event bus (e.g., `FeeChargeRequested`) or the published SDK.
- External portals (`portal-vendor`, `portal-corporate-client`, `portal-auditor`) reach Finance data only through published API contracts, never direct queries.

---

## 6. Open Items / Recommendations

- Formalize the four functional sub-scopes in §2 (Collections, Payroll Liaison, Budgeting/Accounts Payable, Full) as permission bundles in the eventual ~250–600 permission matrix, rather than as new personas.
- Define explicit refund/waiver approval thresholds (e.g., amounts above X require Institution Administrator sign-off) so multi-person Finance teams have a clear escalation line.
- Clarify how campus-level fee-structure overrides interact with institution-level defaults, consistent with the inheritance/override pattern already used for Campus Administrator settings.
