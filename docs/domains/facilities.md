# Facilities & IT Staff — Combined User Journey

> Companion to `user_journey.md`, `personas.md`, and `functional_requirements.md`. Those documents treat **IT Staff** (personas.md §16, FR §17) and **Facilities Staff** (personas.md §15, FR §16) as separate personas with separate journeys. This document walks through where their day-to-day work actually meets, and defines the cross-functional workflows the ERP needs to support so a request never gets stuck at the seam between "physical" and "technical."

---

## Why these two personas are treated together

`functional_requirements.md` §16 (Facilities & Asset Management) covers the physical asset inventory — classrooms, labs, equipment, maintenance requests, preventive-maintenance reminders, and classroom/resource booking. §17 (IT Administration) covers user accounts, device/network assets, integration configuration, and audit logs.

Both personas are custodians of "assets," just at different layers:

- **Facilities Staff** owns the physical estate — the room, the furniture, the projector as a piece of equipment that occupies space and needs cleaning/repair.
- **IT Staff** owns the technical layer increasingly riding on top of that estate — the network drop feeding the projector, the smart-board's software, the biometric reader's firmware, the WiFi access point in the ceiling.

Nearly every "connected" piece of campus equipment — smart boards, biometric/RFID access readers, digital signage, lab instrumentation with data logging, IoT occupancy sensors — has both a Facilities Staff owner (the physical unit) and an IT Staff owner (the connectivity/software). If a requester (a Faculty member, an Office Staff member, a student) has to correctly guess which module to file a ticket in, tickets get misrouted and sit unresolved. The system should let anyone log "the smart board in Room 204 isn't working" and route it correctly — or to both — without the requester needing to know the org chart.

---

## 1. Personas at a Glance

|                       | IT Staff                                                                                                                                                                                                                  | Facilities Staff                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary app(s)**    | `web-admin-console` (IT module)                                                                                                                                                                                           | `app-facilities` (standalone)                                                                                                                                                                     |
| **Owns**              | User account provisioning/deprovisioning, role & permission assignment, device/network asset tracking, integration configuration (biometric devices, payment gateway, LMS, SMS/WhatsApp), SSO, system health & audit logs | Physical asset inventory (classrooms, labs, equipment), asset allocation/tracking, maintenance requests & scheduling, classroom/resource booking, vendor/service-provider tracking for facilities |
| **FR reference**      | §17 IT Administration                                                                                                                                                                                                     | §16 Facilities & Asset Management                                                                                                                                                                 |
| **Persona reference** | personas.md §16                                                                                                                                                                                                           | personas.md §15                                                                                                                                                                                   |
| **App boundary type** | `type:app` — part of the core admin console, sits on `libs/core/platform-admin`                                                                                                                                           | `type:standalone` — cannot import `libs/core/*` directly; integrates only via `libs/shared/sdk` or the event bus                                                                                  |
| **Escalates to**      | Institution Administrator (policy/permissions), Platform Operations (infra-level issues)                                                                                                                                  | Campus Administrator, then Regional/Zonal Administrator for cross-campus matters                                                                                                                  |
| **Shared surfaces**   | Rules & Monitoring Engine · `portal-vendor` · event bus · Reporting & Analytics                                                                                                                                           |

A structural note worth carrying forward: because `app-facilities` is a **standalone** app under the Nx boundary rules, it never queries Core's database directly, and IT's admin-console module doesn't reach into it directly either. Every cross-functional workflow below is expressed as events on the bus (e.g., `MaintenanceRequestRaised`, `AssetDecommissioned`) or calls through `libs/shared/sdk` — not a shared table. That's what keeps the "no functional overlap" property intact even as the two personas' work visibly overlaps in the physical world.

---

## 2. IT Staff Journey (detailed)

_Primary app(s): web-admin-console (IT module)_

### 2.1 Onboarding & Setup

1. IT Staff is provisioned by the Institution Administrator (or another IT Staff member with delegated rights) with access to the IT module of the admin console.
2. Reviews the institution's device/network baseline: existing IT asset register, network segments, SSO configuration, and any integrations already configured by a predecessor.
3. Sets up integration configuration for biometric devices, the payment gateway, the LMS, and SMS/WhatsApp providers — each of these touches a module owned by someone else (Security, Finance, Faculty, Communication Staff respectively).

### 2.2 Routine

1. Provisions and deprovisions user accounts as staff join, change roles, or leave (working from the role/permission matrix in `personas.md`).
2. Tracks IT devices/assets — laptops, desktops, servers, networking hardware, classroom AV controllers — as a separate register from Facilities' physical-asset inventory.
3. Manages network access: WiFi credentials, VLAN segmentation between staff/student/guest networks, VPN access for remote roles.
4. Monitors system health and audit logs across modules; is first responder for institution-level technical issues.

### 2.3 Exception Flows

1. Responds to integration failures (e.g., a biometric device goes offline, payment gateway webhook stops firing) — often discovered via Platform Operations' infra dashboards or a Facilities-side ticket about a specific device.
2. Investigates security-relevant anomalies in access logs, coordinating with Platform Security when an issue looks tenant-wide rather than institution-local.
3. Handles emergency access grants (e.g., temporary elevated permission for an auditor) with an auditable trail.

### 2.4 Offboarding (staff exit)

1. On notice from HR Staff's exit workflow, deprovisions the departing employee's accounts, SSO access, and VPN/network credentials.
2. Recovers or wipes IT-owned devices (laptop, access card if it doubles as a login token) — coordinating physical recovery with Facilities Staff (see §4.4).
3. Confirms closure back to HR Staff so payroll/benefits offboarding can proceed.

---

## 3. Facilities Staff Journey (detailed)

_Primary app(s): app-facilities_

### 3.1 Setup

1. Establishes the asset inventory: classrooms, labs, common areas, and the equipment inside them (furniture, whiteboards, projectors, lab instruments).
2. Classifies assets by type, location, and ownership/maintenance responsibility — this is where a "connected asset" needs a co-owner tag pointing at IT Staff (see §7).
3. Sets up vendor/service-provider records for AMC (annual maintenance contract) providers, cleaning contractors, and equipment suppliers, accessible to those vendors via `portal-vendor`.

### 3.2 Routine

1. Allocates and tracks assets against departments, courses, or events (e.g., a lab reserved for a research project, a hall booked for an exam).
2. Handles maintenance requests and scheduling — logged by Faculty, Office Staff, Laboratory Staff, or students via their respective portals, surfaced into `app-facilities`.
3. Manages classroom/resource booking requests, checking for scheduling conflicts against the Academic module's timetable.
4. Tracks vendors/service providers for ongoing contracts and one-off repair jobs.

### 3.3 Preventive Maintenance

1. Receives preventive-maintenance reminders from the Rules & Monitoring Engine (e.g., "HVAC filter due for replacement," "fire extinguisher inspection due," "AMC contract expiring in 30 days").
2. Schedules the work, assigns it to internal staff or a vendor, and logs completion — closing the loop back to the Rules Engine.

### 3.4 Exception Flows

1. Handles urgent facility issues (water leak, power outage, structural damage) with escalation to Campus Administrator if it affects operations institution-wide.
2. Coordinates with Security Staff on physical-safety incidents that touch facilities (e.g., a damaged gate, a broken perimeter fence).

### 3.5 Reporting

1. Produces occupancy, utilization, and maintenance-cost reports.
2. Surfaces asset-lifecycle data (age, repair history, replacement due) to Institution Administrator for budget planning.

---

## 4. Combined Cross-Functional Workflows

These are the scenarios where IT Staff and Facilities Staff jointly own the outcome. Each is written as an end-to-end flow, not a single persona's steps.

### 4.1 Scenario — New Smart Classroom Rollout

1. **Facilities Staff** creates the room record in the asset inventory (location, capacity, furniture) and marks it as "under setup."
2. **Facilities Staff** requests the physical equipment install (smart board, projector mount, cabling) via a vendor, tracked in `app-facilities`.
3. **IT Staff** provisions the network drop, configures the WiFi access point and any biometric/RFID access reader for the room, and registers the smart board/AV controller in the IT device register.
4. An event (`AssetProvisioned`) fires on the bus so both registers — Facilities' physical asset and IT's device register — link to the same room without either module reading the other's database directly.
5. **Facilities Staff** marks the room "bookable" once IT confirms connectivity is live; the room now appears in the Academic module's room-allocation pool.

### 4.2 Scenario — Broken Projector / AV Fault (Triage)

1. A Faculty member or Office Staff files "the projector in Room 204 isn't working" from their own portal — they shouldn't need to know if this is a hardware or connectivity issue.
2. The request lands in `app-facilities` as a `MaintenanceRequestRaised` event, tagged against the room's connected-asset record.
3. **Facilities Staff** does a first-pass check: if it's power/mounting/physical damage, they dispatch a technician or vendor directly.
4. If the fault looks like a connectivity/software issue (no signal, firmware crash), the ticket is routed to **IT Staff** via the shared touchpoint rather than reassigned by hand — the requester's original ticket stays open and visible to them either way.
5. Whichever persona resolves it logs the fix; the resolution feeds the asset's maintenance history, which in turn informs the Rules Engine's preventive-maintenance model (e.g., repeated AV faults in one room might trigger an early hardware-refresh reminder).

### 4.3 Scenario — Biometric / Access-Control Device Malfunction

1. A biometric reader (used for Attendance, gate access, or library circulation depending on placement) stops registering scans.
2. **Facilities Staff** may be the first to notice physical damage or tampering during a routine walkthrough and logs it against the asset.
3. **IT Staff** owns firmware/integration troubleshooting and re-syncs or replaces the device's configuration.
4. **Security Staff** is notified if the device gates physical access, so manual sign-in can cover the gap until it's fixed — this is a three-way touchpoint (Facilities, IT, Security) coordinated through the same maintenance-ticket thread rather than three separate ones.

### 4.4 Scenario — Staff Exit (Joint Offboarding)

1. HR Staff's exit workflow fires a `StaffOffboarded` event.
2. **IT Staff** deprovisions accounts, network/VPN access, and recovers or wipes IT-owned devices (laptop, any login token embedded in an access card).
3. **Facilities Staff** recovers physical access credentials (keys, physical access cards where separate from IT-issued tokens) and reallocates the vacated workspace/office.
4. Both confirm completion back to HR Staff independently — neither blocks on the other, but both are required before the exit workflow is marked closed.

### 4.5 Scenario — Preventive Maintenance & Contract Renewal

1. The Rules & Monitoring Engine fires a reminder for an expiring AMC contract on a piece of connected equipment (e.g., a smart-board fleet).
2. **Facilities Staff** handles the vendor-facing renewal/negotiation via `portal-vendor`.
3. **IT Staff** is looped in if the renewal includes a firmware/software update cycle, to plan a maintenance window that doesn't disrupt classes.

---

## 5. Shared System Touchpoints

| Touchpoint                    | Role it plays                                                                                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Rules & Monitoring Engine** | Fires preventive-maintenance reminders for both physical assets (Facilities) and device/contract lifecycles (IT); also carries the escalation workflow when a maintenance ticket goes unresolved.            |
| **Event bus**                 | Carries cross-boundary events (`AssetProvisioned`, `MaintenanceRequestRaised`, `AssetDecommissioned`, `StaffOffboarded`) so neither module queries the other's database directly, per the Nx boundary rules. |
| **`portal-vendor`**           | Used by both IT's hardware/software vendors and Facilities' AMC/service vendors — same portal, different vendor records.                                                                                     |
| **Reporting & Analytics**     | Cross-module dashboards (e.g., total cost of ownership per room, combining physical maintenance spend and IT hardware/software spend) drill down from Institution → Campus → Room/Asset.                     |

---

## 6. Permission & Escalation Boundaries

- **IT Staff** owns the network/software/integration layer and account provisioning; escalates policy or permission-matrix questions to the Institution Administrator.
- **Facilities Staff** owns the physical/space/hardware-maintenance layer; escalates facility-wide incidents to the Campus Administrator, and cross-campus resource questions to the Regional/Zonal Administrator.
- Neither persona has authority over the other's layer by default — a "connected asset" ticket is jointly owned, not owned by whichever persona happened to receive it first.
- Where a request is ambiguous at intake (see §4.2), the system should support reassigning ownership without losing the original requester's visibility into ticket status.

---

## 7. Open Questions for `functional_requirements.md`

- **Connected-asset concept**: FR §16 and §17 each define their own asset register. Consider whether the data model needs an explicit "connected asset" relationship — a physical asset (Facilities-owned) with an optional linked device/integration record (IT-owned) — so a single room/equipment entry can carry two owners without merging the registers.
- **Unified intake for physical + technical faults**: worth deciding whether maintenance-request intake is a single form with automatic/manual triage (as sketched in §4.2), or two separate intake points with a manual handoff. The former is better UX for requesters; the latter is simpler to build first.
- **Three-way incident threads**: §4.3 shows Facilities, IT, and Security all needing visibility into one incident. Confirm whether the Rules & Monitoring Engine's escalation workflow already supports multi-owner tickets, or whether this needs its own mechanism.

These are flagged here rather than resolved, consistent with how `functional_requirements.md` already tracks open items for further definition.
