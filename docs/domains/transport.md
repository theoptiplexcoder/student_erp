# Transport Staff — Detailed User Journey

*Companion deep-dive to `user_journey.md` §12 (Transport). Grounded in `personas.md` §12, `functional_requirements.md` §13 (Transport Management, P1), and the `app-transport` boundary defined in `project_structure.md`.*

---

## Persona Snapshot

| Attribute | Detail |
|---|---|
| Persona | Transport Staff |
| Category | Functional Department Staff (Institution-facing) |
| Primary app | `app-transport` (standalone) |
| Module | Transport Management — P1 |
| Reports to | Campus Administrator (day-to-day), Institution Administrator (policy) |
| Coordinates with | Finance Staff, Facilities Staff, Security Staff, IT Staff, Communication Staff |
| Student-facing counterparts | Student, Guardian |
| Key system integrations | Rules & Monitoring Engine, Notification Service, Payment Gateway (via Finance), Biometric/RFID device (optional boarding attendance), GPS/telematics feed (P2) |

**Architectural note:** `app-transport` is tagged `type:standalone` in `project_structure.md`. It never queries `libs/core/*` (Student, Finance, Academic) directly. Every cross-boundary interaction — checking who's enrolled, charging a fee, notifying a guardian — happens either through the event bus (`TransportSubscriptionRequested`, `FeeChargeRequested`, `BoardingRecorded`) or through the published API contract in `libs/shared/sdk`. This keeps Transport Staff's world self-contained even though their work touches Students, Finance, and Communication constantly.

---

## Phase 1 — Onboarding

1. **Account provisioning** — IT Staff creates the Transport Staff account and assigns the role/permission set (per the matrix in `personas.md`); access is scoped to the campus(es) they're assigned to.
2. **First login** — Transport Staff logs into `app-transport`, lands on a setup checklist rather than an empty dashboard (no routes/vehicles exist yet for a new tenant or new academic year).
3. **Campus context** — Confirms which campus(es) they operate on; if the institution is multi-campus, a Regional/Zonal Administrator or Campus Administrator may have pre-scoped their access.
4. **Baseline data import** — Bulk-imports any existing fleet, driver, and route data (CSV/Excel) if migrating from a legacy system, or starts fresh.

---

## Phase 2 — Setup (Start of Academic Year / Term)

1. **Route & stop configuration** — Defines routes, sequences stops in geographic order, sets estimated arrival/departure times per stop.
2. **Vehicle inventory** — Registers vehicles (capacity, registration number, permit/insurance expiry dates, fitness certificate).
3. **Driver assignment** — Assigns drivers (and conductors/attendants, where applicable) to vehicles and routes; records license validity and background-check status.
4. **Route-vehicle-driver mapping** — Locks in the route → vehicle → driver combination for the term, with a substitute pool for absences.
5. **Fee linkage** — Coordinates with Finance Staff so each route/distance-tier maps to a transport fee head in the Finance module (Transport Staff configures the route side; Finance Staff owns the actual fee amount — see Phase 5).
6. **GPS/device setup (P2, optional)** — If GPS tracking is enabled, works with IT Staff to pair each vehicle's telematics unit with its route record.
7. **Capacity check** — System flags routes where seat capacity is close to or below projected demand, prompting Transport Staff to add a vehicle or split a route before subscriptions open.

---

## Phase 3 — Routine Operations (Daily / Weekly)

1. **Daily dashboard** — Opens `app-transport` to a view of today's active routes, vehicle status (in-service / under maintenance / substitute in use), and driver assignments.
2. **Roster adjustments** — Handles last-minute changes: a driver calls in sick, a vehicle needs unscheduled maintenance — reassigns from the substitute pool and the system pushes an updated ETA to affected students/guardians via Notification Service.
3. **Stop-level monitoring** — Where GPS is enabled, watches live vehicle position against scheduled stop times; where it isn't, relies on driver/conductor check-ins.
4. **Ad hoc requests** — Handles day-of requests: a student needs a temporary stop change, a route needs a one-off diversion for road closure or event traffic.
5. **Communication loop** — Any delay, breakdown, or route change beyond a few minutes is pushed proactively rather than students/guardians discovering it by waiting at a stop.

---

## Phase 4 — Student Transport Subscription Workflow

1. **Request initiation** — A Student (or Guardian on their behalf) submits a transport subscription/reservation request through `web-student-portal`, selecting a route/stop.
2. **Event emitted** — This raises a `TransportSubscriptionRequested` event on the bus; `app-transport` picks it up rather than the student app writing directly into Transport's data.
3. **Eligibility & capacity check** — Transport Staff (or an automated rule, where configured) checks seat availability on the requested route; if full, the student is placed on a waitlist or redirected to a nearby stop/route.
4. **Approval** — Transport Staff approves the mapping, which:
   - Adds the student to the route/stop roster.
   - Triggers a `FeeChargeRequested` event to Finance for the transport fee head (see Phase 5).
   - Notifies the student/guardian of confirmation, route details, and pickup time.
5. **Mid-term changes** — Students changing address, hostel status, or stop preference submit a change request; Transport Staff re-maps them and any fee proration is handled by Finance.
6. **Withdrawal** — A student opting out of transport mid-term triggers de-registration from the roster and a corresponding fee adjustment/refund event to Finance.

---

## Phase 5 — Fee Integration with Finance (Boundary in Action)

This is the clearest illustration of the standalone-app boundary rule: Transport Staff never touches the Finance database.

1. **Fee structure ownership** — Finance Staff owns the actual transport fee amounts (per route/distance tier), configured in the Finance module per `functional_requirements.md` §6.
2. **Charge trigger** — When Transport Staff approves a subscription (Phase 4), `app-transport` emits `FeeChargeRequested` with the student ID and route/fee-head reference — it does not compute or store the fee amount itself.
3. **Confirmation loop** — Finance processes the charge and, on payment, the Payment Gateway emits `PaymentConfirmed`, which Transport Staff sees reflected as "active/paid" on the student's transport record.
4. **Defaulter handling** — If a student's transport fee goes into arrears, Finance's Rules & Monitoring Engine flags it; Transport Staff receives a notification and may be prompted (per institution policy) to suspend that student's boarding privileges until resolved — again via an event, not a direct database check.
5. **Reconciliation** — Monthly, Transport Staff cross-checks roster counts against Finance's transport-fee collection reports (pulled via the reporting layer) to catch mismatches — e.g., a student riding the bus without an active subscription.

---

## Phase 6 — Attendance & GPS Tracking

1. **Boarding/deboarding attendance (optional)** — Where enabled, a driver/conductor logs boarding and deboarding per stop (manual tap, RFID card, or biometric), emitting `BoardingRecorded` / `DeboardingRecorded` events.
2. **Guardian visibility** — Guardians with real-time tracking enabled see boarding confirmation and, where GPS is active, live vehicle position, directly addressing a common parent concern ("did my child get on the bus?").
3. **Discrepancy handling** — If a student is marked absent from their usual route for several consecutive days, Transport Staff can be alerted (via the Rules & Monitoring Engine) to check for an unreported subscription withdrawal or an issue needing follow-up.
4. **GPS exceptions (P2)** — Vehicle offline/no-signal, route deviation beyond a configured threshold, or a vehicle stationary mid-route for too long raises an alert to Transport Staff for investigation.

---

## Phase 7 — Monitoring, Alerts & Rules Engine Integration

Per `functional_requirements.md` §23, Transport plugs into the cross-cutting Rules & Monitoring Engine rather than building its own alerting logic:

- **Occupancy/capacity alerts** — Route nearing or exceeding safe capacity.
- **Compliance alerts** — Vehicle permit, insurance, or fitness certificate approaching expiry; driver license renewal due.
- **Fee-linked alerts** — Defaulter flags from Finance surfaced into the transport roster view.
- **Safety alerts** — Prolonged stop, route deviation, or missed check-in (where GPS/telematics available).

Each alert routes to Transport Staff first, with escalation to Campus Administrator for anything unresolved within a configured window.

---

## Phase 8 — Exception & Incident Flows

1. **Vehicle breakdown** — Transport Staff reassigns a substitute vehicle, updates the live schedule, and Notification Service informs affected students/guardians of the revised pickup time.
2. **Driver unavailability** — Pulls from the substitute driver pool; if none available, may need to merge/split routes for the day, communicated the same way.
3. **Route disruption (weather, road closure, local event)** — Publishes a temporary route change; coordinates with Communication Staff if the disruption is significant enough to warrant an institution-wide announcement.
4. **Safety incident** — Any accident, medical emergency, or security concern on a vehicle is logged as an incident; depending on severity, Security Staff and/or Health Staff are looped in, and Guardian notifications for affected students are triggered per emergency protocol.
5. **Capacity crunch mid-term** — A route consistently over-subscribed prompts Transport Staff to propose an additional vehicle or route split, which goes to Campus Administrator (budget/resource approval) or Regional/Zonal Administrator if it involves cross-campus resource reallocation.
6. **Permit/compliance lapse** — A vehicle whose permit or fitness certificate has expired is automatically taken out of the active roster by the system until Transport Staff confirms renewal — a hard stop rather than a soft alert, given the safety stakes.

---

## Phase 9 — Reporting

1. **Occupancy & utilization reports** — Route-wise fill rate, underused vs. over-subscribed routes.
2. **Fee collection cross-reference** — Transport-linked fee collection status, pulled from Finance via the reporting layer (not a direct query).
3. **Incident log summary** — Rolled up for Campus Administrator / Institution Administrator review.
4. **Compliance status report** — Upcoming permit/license/insurance renewals across the fleet.
5. **On-time performance (where GPS enabled)** — Scheduled vs. actual arrival times per route, useful for route redesign each term.

All reports export in PDF/Excel/CSV per the cross-cutting Reporting & Analytics capability (`functional_requirements.md` §25), and roll up into Campus/Regional/Institution-level dashboards without Transport Staff needing to build anything bespoke.

---

## Phase 10 — Offboarding / Season-End Transition

1. **Term-end wind-down** — Deactivates routes for the break period; retains vehicle/driver records for the next term rather than deleting them.
2. **Annual compliance refresh** — Renews vehicle permits, insurance, and driver licenses ahead of the new academic year; updates records before routes reactivate.
3. **Roster carry-forward or reset** — Decides, per institution policy, whether continuing students' subscriptions auto-renew (with a fresh Finance charge cycle) or require re-request each year.
4. **Fleet/vendor changes** — Onboards or decommissions vehicles (owned or third-party vendor-operated), updating `app-transport`'s inventory; vendor-operated fleets may involve the Vendor persona (`portal-vendor`) for invoicing.
5. **Data handoff** — If a Transport Staff member leaves the role, IT Staff deprovisions their account and reassigns route/vehicle ownership to the incoming staff member; historical incident and compliance records remain intact for audit purposes.

---

## Cross-Persona Touchpoints Summary

| Persona | Interaction |
|---|---|
| Student / Guardian | Subscription requests, route/stop selection, real-time notifications and (optional) live tracking |
| Finance Staff | Fee-head configuration, charge events, defaulter alerts, collection reconciliation |
| Campus Administrator | Resource approval (new vehicles/routes), incident escalation |
| Regional/Zonal Administrator | Cross-campus resource reallocation for shared fleets |
| Security Staff | Safety incidents involving vehicles or students in transit |
| Health Staff | Medical emergencies during transport |
| Communication Staff | Institution-wide alerts for major route disruptions |
| IT Staff | Account provisioning, GPS/telematics device integration, biometric/RFID setup |
| Vendor | Third-party vehicle/fleet procurement and invoicing (via `portal-vendor`) |
| Rules & Monitoring Engine | Occupancy, compliance, safety, and fee-defaulter alerting |
| Notification Service | Delay/breakdown/route-change communications to students and guardians |

---

## Summary: Why This Journey Looks the Way It Does

Transport Staff's day-to-day is operationally simple (routes, vehicles, drivers, students) but sits at a deliberate architectural seam: it's a **standalone app** that must stay useful even for institutions that don't run the full Core ERP, while still integrating cleanly with Finance (fees), Communication (alerts), and Security (incidents) when they're present. Every touchpoint in this journey that crosses into Core data — fee charges, student eligibility, guardian identity — goes through the event bus or the SDK contract, never a direct query. That's what lets Transport Management stay a P1 module that can be adopted independently, without becoming tightly coupled to (or a hidden shortcut into) the Core domains.
