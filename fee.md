# Fee Management and Installment Tracking Implementation Plan

## 1. Overview
The goal is to implement a robust, centralized Fee Management module that handles configurable fee structures, multi-channel payment collection (online/offline), installment tracking, centralized billing (including transport and hostel fees), and automated defaulter management based on the functional requirements and existing Prisma architecture.

## 2. Database Schema Updates (`schema.prisma`)
The existing schema has basic `StudentFeePlan` and `FeeInstallment` models but lacks models for transactions and structural definitions. 

**Models to Add / Update:**
- **`FeeStructure` & `FeeComponent`:** To define standard fees by Program, Batch, and Academic Year (e.g., Tuition, Transport, Hostel, Misc).
- **`StudentFeePlan` (Update):** Needs to map directly to a `FeeStructure` and aggregate `FeeComponent`s so total amounts have a detailed breakdown.
- **`Payment` (Transaction):** Represents an actual payment attempt.
  - Fields: `amount`, `paymentDate`, `paymentMethod` (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `GATEWAY`), `transactionReference`, `status` (`SUCCESS`, `FAILED`, `PENDING`).
- **`PaymentAllocation`:** A bridge table mapping a single `Payment` to one or more `FeeInstallment`s (essential for partial payments or paying multiple installments at once).
- **`FeeWaiver` / `Discount`:** To track financial aid or scholarships applied to a specific `StudentFeePlan`.

## 3. Core Backend Services & Logic
- **Fee Generation Service:** Automatically generates a `StudentFeePlan` and constructs `FeeInstallment` schedules based on the assigned `FeeStructure` and the student's selected payment mode (ANNUAL vs INSTALLMENTS).
- **Payment Processing Engine:**
  - Validates incoming `Payment`.
  - Creates `PaymentAllocation` records to distribute the payment amount across pending `FeeInstallment`s.
  - Automatically updates `amountPaid` and transitions `FeeInstallment.status` (`PENDING` -> `PARTIAL` -> `PAID`).
- **Integration with Other Domains (Centralized Billing):** Expose internal services so Transport and Facilities modules can append components to the student's central fee plan rather than managing separate ledgers.
- **Rules & Monitoring Engine Integration:** 
  - Cron jobs/event listeners that scan for overdue `FeeInstallment`s.
  - Automates status changes to `OVERDUE`.
  - Dispatches events to the Notification Service to alert students/guardians.
  - Applies "Withhold Results" or "Service Block" flags to the `Student` profile.

## 4. API Endpoints
### Admin / Finance
- `POST /api/finance/fee-structures` - Create/manage fee rules.
- `GET /api/finance/fee-structures` - List structures by batch/program.
- `POST /api/finance/payments/offline` - Manually record cash/bank transfer payments.
- `GET /api/finance/defaulters` - Dashboard endpoint to fetch overdue accounts.
- `POST /api/finance/reconcile` - Reconcile payment gateway settlements.

### Student Portal / Admissions
- `GET /api/finance/my-dues` - Get outstanding installments and fee breakdowns.
- `POST /api/finance/payments/initiate` - Trigger payment gateway for online payment.
- `GET /api/finance/payments/:id/receipt` - Download payment receipt.

## 5. Frontend & UI Implementation
### Finance Staff UI
- **Setup Screens:** Interface to build fee structures, define installment intervals, and set due dates.
- **Collection Dashboard:** Charts for daily/monthly collections, pending dues grouped by campus/program.
- **Offline Payment Terminal:** A form for staff to enter manual payment receipts and allocate them to specific student installments.

### Student UI
- **Dues Dashboard:** Clear visibility of `ACTIVE` fee plans, upcoming `PENDING` installments, and overdue warnings.
- **Payment Gateway Flow:** Integrated UI to select installments to pay and redirect to the payment provider.

## 6. Execution Phases
1. **Phase 1: Prisma Modeling & Migrations** - Add `Payment`, `PaymentAllocation`, `FeeStructure`, and update existing models.
2. **Phase 2: Core Services** - Build the Fee Generation and Payment Processing/Allocation logic.
3. **Phase 3: APIs & Integration** - Implement API routes and connect the Admissions (Confirmation Fee triggers Applicant -> Student conversion) and Centralized Billing rules.
4. **Phase 4: Finance UI** - Build the configuration and offline payment dashboards.
5. **Phase 5: Student Portal** - Expose dues and integrate the online Payment Gateway.
6. **Phase 6: Defaulter Automation** - Wire up the rules engine for automated overdue alerts and academic restrictions.
