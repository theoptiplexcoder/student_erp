# Student ERP — Persona Model

This document defines the final, non-redundant persona set for the multi-tenant Student ERP.

## Design Principle

Separate **Person**, **Role**, and **Job Title**:

- **Person** — the individual (e.g., John Smith)
- **Role** — what the person can do in the ERP (e.g., Faculty, Finance Staff) — drives permissions
- **Job Title** — their organizational title (e.g., Professor, Principal, Vice Chancellor) — a display attribute, not a permission set

A single user can hold multiple roles (e.g., Alice = Faculty + Department Administrator + Examination Staff).

Authorization should be driven by **permissions**, not personas. Expect ~250–600 fine-grained permissions grouped into modules, mapped onto the persona set below: 41 human personas (35 institution-facing — Platform, Institution Administration, Faculty, Students, Guardians, and all functional-department staff/external roles combined — plus 8 machine actors modeled as system integrations, for 49 personas total).

---

## 1. Platform Roles (SaaS)

| Persona              | Responsibilities                                                   |
| -------------------- | ------------------------------------------------------------------ |
| Platform Super Admin | Manages the SaaS platform, tenants, subscriptions, global settings |
| Platform Support     | Helps institutions with issues                                     |
| Platform Operations  | Infrastructure, monitoring, deployments                            |
| Platform Billing     | Subscription and payments                                          |
| Platform Security    | Security and compliance                                            |

## 2. Institution Administration

| Persona                      | Responsibilities                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Institution Administrator    | Full control of institution settings, users, permissions, campuses                                                                             |
| Institution Head             | Approves policies, views reports, strategic decisions (title varies: Principal, Director, Chancellor, VC, President — same role)               |
| Academic Administrator       | Academic calendar, courses, departments, curriculum                                                                                            |
| Regional/Zonal Administrator | Manages a cluster of campuses within an institution; cross-campus reporting and resource reallocation; scope bounded to assigned campuses only |
| Department Administrator     | Manages department operations                                                                                                                  |
| Campus Administrator         | Manages one campus                                                                                                                             |
| Office Staff                 | General administrative tasks and data entry                                                                                                    |

## 3. Faculty

| Persona            | Responsibilities                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Faculty            | Teaching, attendance, grading, assignments, mentoring (title varies: Professor, Lecturer, Adjunct, etc.) |
| Teaching Assistant | Assists faculty                                                                                          |
| Research Staff     | Research projects, publications, grants                                                                  |
| Laboratory Staff   | Labs, equipment, practical sessions                                                                      |

## 4. Students

| Persona   | Responsibilities                               |
| --------- | ---------------------------------------------- |
| Applicant | Applies for admission                          |
| Student   | Learning, attendance, assignments, exams, fees |
| Alumni    | Degree verification, alumni activities         |

## 5. Guardians

| Persona  | Responsibilities                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Guardian | Monitor student progress, pay fees, receive notifications (relationship type: parent/guardian/sponsor) |

## 6. Admissions

| Persona          | Responsibilities                              |
| ---------------- | --------------------------------------------- |
| Admissions Staff | Admissions, counseling, document verification |

## 7. Examination Office

| Persona           | Responsibilities                                                                      |
| ----------------- | ------------------------------------------------------------------------------------- |
| Examination Staff | Exams, scheduling, evaluation, results, certificates, in-person invigilation          |
| Online Proctor    | Human review/monitoring of remote exam sessions; authority to flag or void an attempt |

## 8. Finance

| Persona       | Responsibilities                                   |
| ------------- | -------------------------------------------------- |
| Finance Staff | Fees, payroll, accounting, budgeting, scholarships |

## 9. Human Resources

| Persona  | Responsibilities                                          |
| -------- | --------------------------------------------------------- |
| HR Staff | Employee records, recruitment, leave, payroll integration |

## 10. Library

| Persona       | Responsibilities                    |
| ------------- | ----------------------------------- |
| Library Staff | Books, circulation, digital library |

## 11. Hostel

| Persona      | Responsibilities                            |
| ------------ | ------------------------------------------- |
| Hostel Staff | Room allocation, occupancy, mess management |

## 12. Transport

| Persona         | Responsibilities                             |
| --------------- | -------------------------------------------- |
| Transport Staff | Routes, vehicles, drivers, student transport |

## 13. Medical & Wellness

| Persona      | Responsibilities                          |
| ------------ | ----------------------------------------- |
| Health Staff | Medical records, appointments, counseling |

## 14. Placement & Career

| Persona         | Responsibilities                                   |
| --------------- | -------------------------------------------------- |
| Placement Staff | Placements, internships, recruiters, career events |

## 15. Facilities

| Persona          | Responsibilities                           |
| ---------------- | ------------------------------------------ |
| Facilities Staff | Assets, inventory, maintenance, classrooms |

## 16. IT

| Persona  | Responsibilities                              |
| -------- | --------------------------------------------- |
| IT Staff | User accounts, devices, network, integrations |

## 17. Communication & Events

| Persona             | Responsibilities                                 |
| ------------------- | ------------------------------------------------ |
| Communication Staff | Announcements, events, newsletters, social media |

## 18. Student Activities

| Persona          | Responsibilities                                |
| ---------------- | ----------------------------------------------- |
| Club Coordinator | Clubs, competitions, extracurricular activities |

## 19. Security

| Persona        | Responsibilities                                   |
| -------------- | -------------------------------------------------- |
| Security Staff | Visitor management, gate passes, biometric devices |

## 20. External Users

| Persona                        | Responsibilities                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recruiter                      | Placement drives                                                                                                                                                                                                                                                                                                                                                        |
| Vendor                         | Procurement and supplies                                                                                                                                                                                                                                                                                                                                                |
| Auditor                        | Audit and compliance                                                                                                                                                                                                                                                                                                                                                    |
| Accrediting Body               | Accreditation reviews                                                                                                                                                                                                                                                                                                                                                   |
| Government Official            | Regulatory reporting                                                                                                                                                                                                                                                                                                                                                    |
| Corporate Client Administrator | B2B portal role for a company sponsoring/tracking its employees' enrollment and progress at a training institute. Scope: view enrollment/progress/completion for sponsored learners, receive invoices. No access to grading or internal institution data. Modeled as tenant-adjacent, representing a separate legal entity (not a Guardian — no personal relationship). |

## 21. System Integrations (Machine Actors)

| Persona                | Responsibilities                                                        |
| ---------------------- | ----------------------------------------------------------------------- |
| Authentication Service | Login and identity                                                      |
| Payment Gateway        | Online payments                                                         |
| Notification Service   | Email, SMS, WhatsApp, push notifications                                |
| AI Assistant           | Automation and analytics                                                |
| Biometric Device       | Attendance                                                              |
| LMS Integration        | Learning management                                                     |
| ERP/API Integration    | External systems                                                        |
| Proctoring Service     | Automated exam monitoring; feeds flags to Online Proctor's review queue |

---

## Core Role Hierarchy

```
Platform
├── Platform Super Admin
├── Platform Support
├── Platform Operations
├── Platform Billing
└── Platform Security
      │
      ▼
Institution
├── Institution Administrator
├── Institution Head
├── Academic Administrator
│     │
│     ▼
│   Regional/Zonal Administrator
│     │
│     ▼
│   Campus Administrator
│     │
│     ▼
│   Department Administrator
│
├── Faculty
├── Student
├── Guardian
├── Admissions Staff
├── Examination Staff
├── Online Proctor
├── Finance Staff
├── HR Staff
├── Library Staff
├── Hostel Staff
├── Transport Staff
├── Health Staff
├── Placement Staff
├── Facilities Staff
├── IT Staff
├── Communication Staff
├── Club Coordinator
├── Security Staff
└── Office Staff

External (tenant-adjacent)
├── Recruiter
├── Vendor
├── Auditor
├── Accrediting Body
├── Government Official
└── Corporate Client Administrator
```

## Persona Count Summary

Kept here as a running check so this figure doesn't drift out of sync with the tables above as personas are added, merged, or deferred.

| Category                             | Sections | Count  |
| ------------------------------------ | -------- | ------ |
| Platform (SaaS)                      | 1        | 5      |
| Institution Administration           | 2        | 7      |
| Faculty                              | 3        | 4      |
| Students                             | 4        | 3      |
| Guardians                            | 5        | 1      |
| Admissions                           | 6        | 1      |
| Examination Office                   | 7        | 2      |
| Finance                              | 8        | 1      |
| Human Resources                      | 9        | 1      |
| Library                              | 10       | 1      |
| Hostel                               | 11       | 1      |
| Transport                            | 12       | 1      |
| Medical & Wellness                   | 13       | 1      |
| Placement & Career                   | 14       | 1      |
| Facilities                           | 15       | 1      |
| IT                                   | 16       | 1      |
| Communication & Events               | 17       | 1      |
| Student Activities                   | 18       | 1      |
| Security                             | 19       | 1      |
| **Institution-facing subtotal**      | 2–19     | **35** |
| External Users                       | 20       | 6      |
| **Human personas total**             | 1–20     | **41** |
| System Integrations (Machine Actors) | 21       | 8      |
| **Grand total**                      | 1–21     | **49** |

## Deferred / Not Included (by explicit decision)

The following were evaluated and intentionally excluded from this version:

- Registrar (folded into Academic Administrator)
- Institution-level DPO/Compliance Officer
- Board/Trustee Member
- Legal/Contracts Officer
- Franchise Partner
- Content Author / Instructional Designer
- Cross-cutting Report Viewer / Approval Authority (generic, permission-level, not modeled as a standalone persona)

These can be revisited if institution types or business models in scope expand (e.g., franchise-based coaching chains, universities with dedicated legal/compliance functions).
