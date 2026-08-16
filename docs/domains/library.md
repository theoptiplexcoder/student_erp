# Library Staff — Detailed User Journey

**Persona reference:** `personas.md` §10 (Library)
**Functional scope reference:** `functional_requirements.md` §11 (Library Management), §23 (Rules & Monitoring Engine — Cross-Cutting)
**System reference:** `project_structure.md` — `apps/app-library` (standalone app)
**Journey index reference:** `user_journey.md` §10, expanded here to full-flow detail

This document expands the one-paragraph journey in `user_journey.md` §10.1 into a complete, step-by-step walkthrough of everything Library Staff does in the system, plus every cross-module touchpoint that flow depends on.

---

## 1. Persona Snapshot

| Attribute                           | Value                                                                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persona                             | Library Staff                                                                                                                                                          |
| Category                            | Functional department staff (`personas.md` §10)                                                                                                                        |
| Primary app                         | `app-library` (standalone)                                                                                                                                             |
| App boundary type                   | `type:standalone` — cannot import `libs/core/*` directly; integrates only via `libs/shared/sdk` or the event bus (`project_structure.md`)                              |
| Reports to (org)                    | Campus Administrator / Department Administrator (escalation path per `user_journey.md` §2.5–2.6)                                                                       |
| Core responsibilities               | Catalog management, circulation, overdue/fine tracking, digital library access, inventory audit, recommendations (`personas.md` §10, `functional_requirements.md` §11) |
| Primary students-facing counterpart | Student Portal "book library resources" action (`user_journey.md` §4.2, `functional_requirements.md` §7)                                                               |

---

## 2. Journey Overview

Library Staff's journey runs across five recurring layers, with onboarding/offboarding as bookends:

```
Onboarding & Access
        │
        ▼
Setup (catalog, policy configuration)
        │
        ▼
Daily Routine  ──►  Circulation (issue / return / renew / reserve)
        │
        ▼
Monitoring  ──►  Overdue detection → Fines → Alerts → Escalation
        │
        ▼
Periodic  ──►  Inventory audit, digital library curation, reporting
        │
        ▼
Offboarding (card deactivation, catalog decommission)
```

Because `app-library` is a **standalone** app in the Nx boundary model, none of these steps read or write Core's databases directly. Every cross-boundary interaction — checking a student's enrollment status, charging a fine to the fee ledger, sending a notification — happens through a published event or the SDK, never a shared table (`project_structure.md`, "Integration pattern").

---

## 3. Onboarding & Access Provisioning

1. **Account creation** — IT Staff provisions the Library Staff account and assigns the `Library Staff` role per the permission matrix (`personas.md`, `functional_requirements.md` §17).
2. **Scope assignment** — Campus Administrator (or Institution Administrator for a single-campus institution) assigns the staff member to one or more campus libraries. Regional/Zonal Administrator scope applies only if the institution shares a catalog across a campus cluster.
3. **Initial configuration handoff** — Outgoing staff or Campus Administrator walks the new Library Staff member through existing catalog structure, fine policy, and any open inventory-audit items.
4. **Device enrollment** — IT Staff configures barcode/RFID scanner hardware and links it to the Library Staff's workstation login (`functional_requirements.md` §11, §17).

---

## 4. Setup — Catalog & Policy Configuration

| Step | Action                                                                                                                      | Notes                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 4.1  | Define catalog taxonomy (subject classification, genre, media type: book / journal / DVD / e-resource)                      | One-time, revisited periodically                                                        |
| 4.2  | Bulk-import catalog (CSV/Excel) or enter items individually                                                                 | Mirrors the bulk import pattern used institution-wide (`functional_requirements.md` §1) |
| 4.3  | Tag each physical item with a barcode or RFID identifier                                                                    | Required before circulation can use scan-based issue/return                             |
| 4.4  | Configure borrowing policy per persona type (Student, Faculty, Research Staff, etc.): loan period, max items, renewal limit | Different persona types typically get different limits                                  |
| 4.5  | Configure fine policy (per-day rate, grace period, cap)                                                                     | Feeds directly into the Rules & Monitoring Engine (§7 below)                            |
| 4.6  | Configure digital library/e-resource providers and access entitlements                                                      | May be scoped by program, batch, or role                                                |
| 4.7  | Set up library card issuance rules (validity period, replacement fee)                                                       | Replacement fee ties into Finance (§6)                                                  |

---

## 5. Daily Routine — Circulation Management

Circulation is the highest-frequency workflow. All four sub-flows are barcode/RFID-driven (`functional_requirements.md` §11).

### 5.1 Issue

1. Scan (or look up) the borrower's library card.
2. System checks eligibility: active status, no blocking hold (e.g., disciplinary or fee-related hold flagged elsewhere in the institution), borrowing limit not already reached.
3. Scan the item's barcode/RFID tag.
4. System calculates the due date from the configured loan policy and creates the circulation record.
5. Confirmation is shown to the borrower (in person) or reflected in their Student/Faculty portal.

### 5.2 Return

1. Scan the returned item.
2. Library Staff inspects physical condition; flags damage if present.
3. System checks the due date — if overdue, a fine is calculated per policy (§7).
4. If the item has an active reservation queue, the system notifies the next borrower in line.

### 5.3 Renew

1. Borrower requests renewal (in person, or self-service via Student Portal per `functional_requirements.md` §7).
2. System checks: no pending reservation from another borrower, renewal-count not exceeded.
3. Due date is extended; renewal count increments.

### 5.4 Reserve

1. Student or Faculty places a hold on a currently-issued item via their portal.
2. Item enters the reservation queue.
3. On return, the system automatically notifies the next person in queue (via Notification Service, §8) and holds the item for a configured pickup window.

---

## 6. Library Card Management

1. Issue a new card at first enrollment (triggered when a Student/Applicant record converts to enrolled, per `user_journey.md` §4.1–4.2) or at staff onboarding.
2. Reissue on loss — Library Staff records a lost-card request and triggers a replacement fee.
3. Deactivate cards on withdrawal, suspension, or exit — this is consumed as an event from Core/HR rather than looked up directly, consistent with the standalone boundary rule.
4. Reissue on card expiry per the validity period configured in §4.7.

---

## 7. Monitoring — Overdues, Fines & Escalation

This is where `app-library` leans most heavily on the cross-cutting **Rules & Monitoring Engine** (`functional_requirements.md` §23):

1. A scheduled evaluation (run by `services/scheduler`) checks all active loans against the configured overdue rule (e.g., "loan overdue by N days").
2. When triggered, the engine:
   - Calculates the fine per the policy configured in §4.5.
   - Dispatches an overdue alert through the Notification Service to the borrower (and Guardian, for students, if the institution's notification policy includes guardians — `user_journey.md` §5.1).
   - Logs the rule firing to the rule audit trail (who defined it, when it fired, what action resulted).
3. **Fine synchronization to Finance** — because Finance's fee ledger lives in `libs/core/finance`, and `app-library` cannot import Core directly, the fine is not written to Finance's database from the library app. Instead, `app-library` emits a fine-charge event onto the event bus (analogous to `FeeChargeRequested` in `project_structure.md`); Finance consumes it and reflects the charge in the student's outstanding-dues view (`functional_requirements.md` §6, §8.2).
4. **Chronic-defaulter escalation** — repeated or long-overdue cases are escalated per the configurable escalation workflow to the Department Administrator, mirroring the pattern used for attendance defaulters (`functional_requirements.md` §4, §23).

---

## 8. Digital Library & E-Resources

1. Manage subscriptions/licenses for e-resources (e-books, journals, databases).
2. Grant or revoke digital access by role, program, or batch.
3. Monitor e-resource usage analytics to inform renewal/curation decisions.
4. Surface e-resources alongside the physical catalog in the search/browse experience exposed to Students and Faculty (§9).

---

## 9. Search, Browse & Recommendations

1. Curate recommended-reading lists — optionally cross-referenced with course reading lists maintained by Faculty/Academic Administrator (read-only access via `libs/shared/sdk`, never a direct query into `libs/core/academic`).
2. Maintain the searchable catalog (title, author, subject, availability status) consumed by:
   - Student Portal — "book library resources" (`functional_requirements.md` §7)
   - Faculty Portal — resource lookups tied to course prep

---

## 10. Inventory Audit

1. Run a periodic physical stock verification, RFID-assisted where hardware supports it.
2. Reconcile scanned counts against the catalog; flag missing or damaged items.
3. Initiate a write-off workflow for lost/damaged items beyond repair — this may trigger a replacement-cost charge (via the same fine/charge event pattern as §7).
4. Generate an audit report for the Campus Administrator or Institution Administrator (`user_journey.md` §2.6, §2.1).

---

## 11. Reporting

1. Circulation reports (issue/return volume, most-borrowed titles).
2. Overdue/defaulter reports, sourced from the Rules & Monitoring Engine's audit trail.
3. E-resource usage analytics.
4. Inventory audit summaries.
5. All reports export in PDF/Excel/CSV and can roll up into institution-wide dashboards via the cross-cutting Reporting & Analytics module (`functional_requirements.md` §25), viewable by Institution Head, Academic Administrator, or Campus/Department Administrator depending on scope.

---

## 12. Exception Flows

| Scenario                       | Handling                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Damaged or lost item on return | Condition flagged at return; replacement fee charged via event to Finance                                                                        |
| Disputed fine                  | Library Staff reviews circulation history; can waive or adjust fine (subject to institution policy)                                              |
| End-of-term mass returns       | Bulk-return processing window, often paired with a temporary hold on new issues                                                                  |
| Multi-campus / shared catalog  | Applies only where a Regional/Zonal Administrator's campus cluster shares a single catalog; inter-library loan requests route through that scope |
| Card lost mid-loan             | Temporary card / manual lookup override so circulation isn't blocked while a replacement is issued                                               |

---

## 13. Cross-Persona Touchpoints

| Persona                         | Interaction with Library Staff's flow                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Student                         | Reserves/borrows resources via portal; receives overdue/reservation-ready alerts; sees library fines in outstanding-dues view |
| Guardian                        | Optionally receives repeated-overdue alerts, per notification policy                                                          |
| Faculty                         | Reserves resources; may link course reading lists to the catalog                                                              |
| Finance Staff                   | Consumes fine/replacement-charge events into the student fee ledger; reconciles library-related collections                   |
| IT Staff                        | Provisions Library Staff accounts; configures barcode/RFID hardware and SSO                                                   |
| Notification Service            | Dispatches overdue, reservation-ready, and defaulter alerts across email/SMS/WhatsApp/push/in-app                             |
| Rules & Monitoring Engine       | Evaluates overdue rules, drives escalation, maintains the rule audit trail                                                    |
| Campus/Department Administrator | Receives escalations for chronic defaulters; approves inventory write-offs and audit outcomes                                 |

---

## 14. System Integration Notes (for engineering reference)

- `app-library` is tagged `type:standalone` and is explicitly barred from importing `libs/core/*` (`project_structure.md`).
- All reads of Student/Faculty identity data go through `libs/shared/sdk`.
- All writes that affect Core domains (Finance, Notifications) go through the event bus. Representative events for this module:
  - `BookIssued`
  - `BookReturned`
  - `BookOverdue`
  - `LibraryFineIncurred` → consumed by Finance
  - `ReservationReady` → consumed by Notification Service
  - `LibraryCardDeactivated` (consumed on withdrawal/exit events raised by Core)

---

## 15. Offboarding

1. **Borrower offboarding** — when a Student/Staff record transitions to Withdrawn, Graduated, or Exited (consumed as an event from Core/HR), the library card is auto-deactivated and any outstanding items/fines are flagged for final clearance before certificate/transcript release, per the result/certificate withholding pattern used elsewhere (`functional_requirements.md` §5).
2. **Item offboarding** — items retired via the inventory-audit write-off workflow (§10) are removed from the active catalog.
3. **Staff offboarding** — when a Library Staff member exits, IT Staff deprovisions the account per the standard exit workflow (`user_journey.md` §9.1, §16.1).
