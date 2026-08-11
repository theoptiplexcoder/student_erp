# Student ERP — Functional Requirements

This document defines the functional requirements for the multi-tenant Student ERP, organized by module. It complements `personas.md` (which defines *who* can act) by defining *what the system does*.

## Priority Legend

- **P0 — Core/Basic**: Required for any institution to run day-to-day operations. Build first.
- **P1 — Standard**: Expected in a competitive ERP; most institutions will need these.
- **P2 — Advanced/Optional**: Differentiators, scale features, or institution-type-specific needs.

---

## 1. Student Information & Lifecycle Management (P0)

The system of record for a student's identity and journey from applicant to alumni.

### Functional Requirements
- Create and maintain a unique student record (ID, demographics, contact info, photo)
- Track student lifecycle status: Applicant → Enrolled → Active → Suspended → Graduated → Alumni → Withdrawn
- Manage program/course/batch/section assignment
- Store academic history (previous institutions, transcripts, transfer credits)
- Store guardian/parent relationship links
- Store documents (ID proof, certificates, medical records) with verification status
- Bulk student import/export (CSV/Excel)
- Student ID card generation (physical and digital)
- Custom fields per institution (configurable schema)
- Merge/de-duplicate student records
- Student search and advanced filtering (by program, batch, status, campus)
- Audit trail of changes to student records

---

## 2. Admissions Management (P0)

### Functional Requirements
**Application**
- Online application form (configurable per program)
- Application fee collection
- Multi-step application status tracking (Submitted → Under Review → Shortlisted → Offer → Accepted → Enrolled → Rejected)
- Document upload and verification workflow
- Entrance exam / merit score integration
- Application deduplication (detect repeat applicants)

**Evaluation & Offer**
- Configurable eligibility rules (marks cutoffs, quotas, reservations)
- Interview/counseling scheduling
- Offer letter generation
- Waitlist management
- Seat matrix and quota tracking (by program, category, campus)

**Conversion**
- Convert accepted applicant to enrolled student record
- Fee payment linkage to confirm admission
- Admission reports (funnel, conversion rate, source-wise)

---

## 3. Academic & Curriculum Management (P0)

### Functional Requirements
- Define academic years, terms/semesters, and academic calendar
- Define programs, courses, subjects, and credit structure
- Curriculum/syllabus versioning
- Course prerequisite mapping
- Section/batch creation and student allocation
- Timetable/schedule creation (manual and auto-generated)
- Room and resource allocation for classes
- Faculty-to-course assignment
- Elective course selection workflow for students
- Academic calendar integration (holidays, exam periods, breaks)
- Curriculum change/versioning history

---

## 4. Attendance Management (P0)

### Attendance Capture
- Manual attendance recording
- Biometric attendance integration
- RFID attendance integration
- QR code attendance
- NFC attendance (optional)
- GPS/geofenced attendance (for field activities)
- Facial recognition integration (optional)
- LMS/online class attendance synchronization
- Bulk attendance upload
- Offline attendance synchronization

### Attendance Processing
- Attendance validation
- Attendance correction workflow
- Attendance approval workflow
- Leave adjustment
- Holiday and academic calendar integration
- Automatic attendance calculation
- Attendance percentage calculation
- Custom attendance policies (per course/institution)

### Automatic Attendance Monitoring
- Automatically detect low attendance based on configurable thresholds
- Automatically identify attendance defaulters
- Detect consecutive absences
- Detect prolonged absenteeism
- Detect unusual attendance patterns
- Detect late arrivals and early departures (where supported)
- Monitor attendance eligibility for examinations
- Monitor minimum attendance requirements by course or institution
- Automatically flag students requiring intervention
- Automatically identify at-risk students based on attendance trends

### Alerts & Notifications
- Notify students of attendance shortages
- Notify guardians of repeated absences
- Notify faculty of attendance anomalies
- Notify academic administrators of chronic defaulters
- Send automated reminder notifications before attendance falls below required thresholds
- Generate attendance warning letters/notices automatically
- Escalate unresolved attendance issues through configurable workflows

### Reporting & Analytics
- Attendance reports
- Daily attendance dashboard
- Course-wise attendance analytics
- Faculty-wise attendance reports
- Department-wise attendance reports
- Institution-wide attendance analytics
- Attendance trend analysis
- Defaulter reports
- Examination eligibility reports
- Attendance export (PDF, Excel, CSV)

---

## 5. Examination & Assessment Management (P0)

### Exam Setup
- Define exam types (internal, midterm, final, makeup, online)
- Exam scheduling and timetable generation
- Seating arrangement generation
- Hall ticket/admit card generation
- Room and invigilator allocation
- Attendance eligibility check before exam registration (integration with Attendance module)

### Conduct
- In-person invigilation support (attendance, malpractice reporting)
- Online/remote exam session support
- Automated exam monitoring (via Proctoring Service integration)
- Human review/flagging of remote sessions (Online Proctor role)
- Question paper upload and secure distribution
- Malpractice/incident reporting workflow

### Evaluation
- Marks entry (manual and bulk upload)
- Moderation/re-evaluation workflow
- Grace marks and rounding rules
- Grading scheme configuration (percentage, GPA, letter grade)
- Multi-evaluator/double-blind evaluation support
- Answer script scanning and digital evaluation (optional, P2)

### Results & Certification
- Result computation and publishing
- Result withholding rules (fee dues, disciplinary holds)
- Revaluation/re-check request workflow
- Transcript generation
- Certificate generation (provisional, degree, migration)
- Digital verification/QR-code-backed certificates
- Result analytics (pass %, grade distribution, topper lists)

---

## 6. Finance & Fee Management (P0)

### Fee Structure & Billing
- Configurable fee structure (by program, batch, category)
- One-time and recurring fee heads (tuition, hostel, transport, misc.)
- Fee due date and installment configuration
- Discounts, waivers, and scholarship application
- Late fee/penalty rules

### Collection
- Online payment gateway integration
- Offline payment recording (cash, cheque, DD, bank transfer)
- Receipt generation
- Partial payment and installment tracking
- Refund processing

### Monitoring & Reporting
- Outstanding dues tracking
- Fee defaulter identification and alerts (guardian/student notification)
- Fee collection dashboards (daily/monthly/by campus)
- Reconciliation reports
- Scholarship/financial aid disbursement tracking

### Accounting & Payroll
- General ledger / accounting integration
- Budgeting and expense tracking
- Payroll processing (linked to HR module)
- Vendor payments
- Financial statement/report export

---

## 7. Student Portal (P0)

### Academic
- View academic dashboard
- View timetable
- View attendance and attendance analytics
- View course enrollments
- Access syllabus
- Access chapter-wise learning resources (notes, slides, e-books, videos, lab manuals)
- View recommended reading and past question papers
- Take practice quizzes
- Submit assignments and view feedback
- View grades, exam schedule, and results
- Track academic progress

### Financial
- Pay fees online
- View fee receipts and outstanding dues
- Apply for scholarships

### Services
- Request certificates
- Submit service requests
- Book library resources
- Reserve hostel facilities (if applicable)
- Schedule counseling appointments

### Communication
- Receive announcements and notifications
- Message faculty (within configured DM policy)
- Participate in course discussions
- View academic calendar
- Register for events and clubs

### Profile & Administration
- Manage profile and contact information
- View guardian information
- Track application status (pre-enrollment)
- Download digital ID card
- Download transcripts/certificates (if eligible)

---

## 8. Faculty Portal & Teaching Tools (P0)

### Functional Requirements
- View assigned courses, sections, and timetable
- Take/manage attendance for assigned classes
- Enter and manage grades/marks
- Create and grade assignments
- Create and manage quizzes/tests
- **Upload chapter-wise resources**: organize by course → unit → chapter/topic
- Upload lecture notes, PDFs, PPTs, videos, links, and code files
- Schedule resource availability (publish/unpublish)
- Version control for learning materials
- Tag resources by topic and learning outcomes
- Track student access and downloads of resources
- Share resources with specific batches or sections
- Archive outdated resources
- Search and filter learning resources
- Mentoring/advisee tracking
- View own attendance/leave records
- Submit leave requests

---

## 9. Communication & Collaboration (P0/P1)

Modeled as a **Course Workspace** rather than a general chat/forum product — see design rationale below.

### Course Workspace (per course)
- Announcements feed (immutable/versioned, searchable)
- Chapter-wise resource repository (see Faculty module)
- Threaded discussions (Q&A style, not free-form chat)
- Assignments, quizzes, attendance, and grades surfaced in one place
- Course-level FAQ / knowledge base

### Institution-wide Communication
- Institution/department/campus-level announcements
- Targeted notifications by role, batch, or campus
- Direct messaging, constrained by configurable policy:
  - Student ↔ Faculty
  - Faculty ↔ Faculty
  - Student ↔ Student (optional, can be disabled by institution)
  - Parent ↔ Faculty
  - Administration ↔ Users
- Event-driven notifications (attendance shortage, grades published, fees due, assignment graded, resource uploaded, timetable changed, leave approved)
- Multi-channel delivery: email, SMS, WhatsApp, push, in-app
- Notification preference management per user
- Searchable institutional knowledge base (Q&A accumulated over time)

### Design Rationale (for reference)
A general-purpose chat/forum product was evaluated and rejected in favor of the Course Workspace model:
- **Simple messaging** — easy to build, good audit trail, but poor for academic content organization.
- **Discussion forums** — persist knowledge, but require moderation and feel disconnected from course structure.
- **Course Workspace (chosen)** — mirrors how students already think about a course (announcements, resources, discussions, assignments, quizzes, grades all in one place); messaging becomes a supporting capability rather than the center of the product. Scales from a small coaching center (announcements + resources only) to a full university (discussions, quizzes, LMS integration).

---

## 10. Human Resources Management (P1)

### Functional Requirements
- Employee record management (faculty and non-teaching staff)
- Recruitment/onboarding workflow
- Leave management (application, approval, balance tracking)
- Attendance/timesheet integration for staff
- Payroll integration (salary structure, deductions, payslips)
- Performance appraisal workflow
- Contract/tenure tracking (including expiry alerts)
- Employee document management
- Exit/offboarding workflow

---

## 11. Library Management (P1)

### Functional Requirements
- Book/media catalog management
- Circulation (issue, return, renew, reserve)
- Overdue tracking and fine calculation
- Digital library/e-resource access
- Barcode/RFID-based circulation
- Library card management
- Book recommendation and search
- Inventory audit
- Integration with Rules & Monitoring Engine for overdue alerts

---

## 12. Hostel Management (P1)

### Functional Requirements
- Room/block inventory management
- Room allocation (manual and rule-based)
- Occupancy tracking and vacancy reports
- Mess management (meal plans, attendance, menu)
- Hostel fee integration with Finance module
- Visitor/leave management for residents
- Maintenance request tracking
- Occupancy violation alerts (via Rules & Monitoring Engine)

---

## 13. Transport Management (P1)

### Functional Requirements
- Route and stop configuration
- Vehicle and driver assignment
- Student-to-route/stop mapping
- Transport fee integration with Finance module
- GPS-based vehicle tracking (optional, P2)
- Attendance on transport (boarding/deboarding, optional)
- Transport request/subscription workflow

---

## 14. Medical & Wellness (P1)

### Functional Requirements
- Student medical record management
- Appointment scheduling with health staff
- Counseling session scheduling and notes (confidentiality controls)
- Incident/emergency reporting
- Immunization/health-check tracking
- Integration with Guardian notifications for medical emergencies

---

## 15. Placement & Career Services (P1)

### Functional Requirements
- Recruiter/company registration and management
- Job/internship posting
- Student eligibility and application workflow
- Placement drive scheduling
- Interview round tracking
- Offer management and acceptance tracking
- Placement statistics and reporting (by program, batch, company)
- Resume/profile builder for students

---

## 16. Facilities & Asset Management (P1)

### Functional Requirements
- Asset inventory (classrooms, labs, equipment)
- Asset allocation and tracking
- Maintenance request and scheduling
- Preventive maintenance reminders (via Rules & Monitoring Engine)
- Classroom/resource booking
- Vendor/service provider tracking for facilities

---

## 17. IT Administration (P1)

### Functional Requirements
- User account provisioning/deprovisioning
- Role and permission assignment (see `personas.md`)
- Device/asset tracking for IT equipment
- Network access management
- Integration configuration (biometric devices, payment gateways, LMS, SMS/WhatsApp providers)
- System health and audit logs
- Single Sign-On (SSO) configuration

---

## 18. Security & Access Control (P1)

### Functional Requirements
- Visitor management (registration, gate pass issuance, check-in/out)
- Biometric device integration for gate access
- Incident logging
- CCTV/security system integration (optional, P2)
- Emergency alert broadcast

---

## 19. Student Activities & Clubs (P2)

### Functional Requirements
- Club/society registration and management
- Event creation and registration
- Competition/extracurricular activity tracking
- Attendance/participation tracking for activities
- Certificates for participation/achievement

---

## 20. Alumni Management (P2)

### Functional Requirements
- Alumni profile and directory
- Degree/certificate verification requests
- Alumni event management
- Alumni-student mentoring programs
- Donation/fundraising tracking (optional)

---

## 21. Regional/Cross-Campus Operations (P1 — multi-campus institutions)

### Functional Requirements
- Cross-campus reporting and dashboards
- Resource reallocation across campuses (staff, budget, seats)
- Campus-level configuration inheritance and overrides
- Scoped access limited to assigned campuses (Regional/Zonal Administrator)

---

## 22. External/B2B Portals (P1/P2)

### Corporate Client Portal
- View sponsored learners' enrollment, progress, and completion status
- Receive invoices for sponsored learners
- No access to grading or internal institution data

### Auditor / Accrediting Body / Government Reporting
- Read-only access to compliance-relevant reports
- Scheduled/regulatory report generation and export
- Accreditation documentation repository

### Vendor Portal
- Purchase order visibility
- Invoice submission
- Payment status tracking

---

## 23. Rules & Monitoring Engine (Cross-Cutting) (P1)

A reusable capability so monitoring logic isn't duplicated per module.

### Functional Requirements
- Configurable rule definition (e.g., "Attendance < 75% for 7 consecutive days")
- Rule evaluation scheduler (real-time and batch)
- Centralized alert/notification dispatch
- Escalation workflow configuration
- Applies across:
  - Attendance monitoring
  - Fee due monitoring
  - Assignment deadline monitoring
  - Low academic performance alerts
  - Leave policy violations
  - Hostel occupancy violations
  - Library overdue books
  - Asset maintenance reminders
  - Expiring employee contracts
  - Accreditation compliance checks
- Rule audit trail (who defined it, when it fired, what action resulted)

---

## 24. Platform & Institution Administration (P0)

### Platform-Level (SaaS)
- Tenant provisioning and lifecycle management
- Subscription and billing management
- Global platform configuration
- Platform-wide monitoring, security, and support tooling

### Institution-Level
- Institution profile and settings
- Campus/department/program hierarchy configuration
- User and role/permission management
- Academic calendar and policy configuration
- Branding/customization (logo, letterhead templates)
- Data import/export and backup
- Audit logs across modules

---

## 25. Reporting & Analytics (Cross-Cutting) (P0/P1)

### Functional Requirements
- Configurable dashboards per role
- Cross-module report builder
- Scheduled report generation and email delivery
- Export in PDF, Excel, CSV
- Drill-down analytics (institution → campus → department → course → student)
- Predictive/at-risk indicators (attendance, grades, fee defaults) — P2

---

## Build Priority Summary

| Priority | Modules |
|---|---|
| **P0 (Core)** | Student Information, Admissions, Academic & Curriculum, Attendance, Examination, Finance/Fees, Student Portal, Faculty Portal, Communication (Course Workspace), Platform/Institution Administration, Core Reporting |
| **P1 (Standard)** | HR, Library, Hostel, Transport, Medical/Wellness, Placement, Facilities, IT Administration, Security, Regional/Cross-Campus Ops, External/B2B Portals, Rules & Monitoring Engine |
| **P2 (Advanced)** | Student Activities/Clubs, Alumni Management, GPS vehicle tracking, facial recognition attendance, digital answer script evaluation, predictive analytics |

---

## Open Items for Further Definition

- Detailed field-level data model per module (separate document)
- Permission matrix mapping ~250–600 permissions to the 41 human personas in `personas.md` (35 institution-facing + 6 external B2B), plus scoped access rules for the 8 machine-actor personas
- API/integration specifications for third-party systems (payment gateways, biometric devices, LMS, SMS/WhatsApp providers)
- Non-functional requirements (performance, scalability, multi-tenancy isolation, data residency, accessibility)
