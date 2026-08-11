# Student ERP — Data Schemas (Academic Core)

This document defines the field-level data model (entities and attributes) for the focused **Core Academic ERP**, aligned with the Product Requirements Document (PRD.md). It encompasses the five major domains:

1. Student Lifecycle
2. Teacher Lifecycle
3. Examinations, Marks & Promotions
4. Academic Documents
5. Academic Planning (Timetable)

This schema is derived from and complements:
- `PRD.md` — Product scope and 12 core modules
- `personas.md` — the simplified persona set for the academic core
- `functional_requirements.md` — capabilities per module
- `project_structure.md` — app/library boundaries

**Scope note:** This schema excludes finance, hostel, transport, library, placement, HR payroll, and other auxiliary departments. Multi-tenancy, audit fields, soft deletes, and event-bus patterns follow the same conventions as the full ERP schema but are scoped to the academic core only.

---

## 0. Conventions

| Convention | Rule |
|---|---|
| **Primary keys** | `id` — UUID, on every table |
| **Multi-tenancy** | Every institution-scoped table carries `institution_id` |
| **Audit fields** | `created_at`, `updated_at` (datetime) and `created_by_person_id`, `updated_by_person_id` (FK → `Person`) on every table that supports create/update |
| **Soft delete** | `is_deleted` (boolean, default false), `deleted_at` (datetime, nullable) on Student, Teacher, Exam, Result, and Certificate records |
| **Scoping** | Campus/department/program scoping columns are nullable where a record can be institution-wide |
| **Enums** | Written as `enum(...)`; implement as database enum, check constraint, or lookup table per your migration tooling |
| **Documents/files** | Fields ending `_url` or `_document_url` point at object storage |

---

## Table of Contents

1. [Identity & Access Management](#1-identity--access-management)
2. [Institution Structure & Academic Configuration](#2-institution-structure--academic-configuration)
3. [Student Lifecycle](#3-student-lifecycle)
4. [Teacher Lifecycle](#4-teacher-lifecycle)
5. [Admissions Management](#5-admissions-management)
6. [Timetable Management](#6-timetable-management)
7. [Attendance Management](#7-attendance-management)
8. [Examination & Assessment](#8-examination--assessment)
9. [Marks Management](#9-marks-management)
10. [Student Promotion](#10-student-promotion)
11. [Certificates](#11-certificates)
12. [Alumni Management](#12-alumni-management)

---

## 1. Identity & Access Management

### Person

The single identity record underlying every user — Student, Teacher, Guardian, Administrator.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | FK → Institution |
| first_name | string | |
| last_name | string | |
| email | string | unique per tenant |
| phone | string | |
| date_of_birth | date | nullable |
| gender | string | nullable |
| photo_url | string | nullable |
| address | JSON | nullable |
| status | enum(active, inactive, locked) | account-level status |

### Role

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| name | string | e.g., "Administrator", "Faculty", "Student", "Guardian" |
| is_system_role | boolean | true for fixed roles |

### PersonRoleAssignment

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| person_id | UUID | FK → Person |
| role_id | UUID | FK → Role |
| assigned_by_person_id | UUID | FK → Person |
| assigned_at | datetime | |
| revoked_at | datetime | nullable |

### AuthCredential

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| person_id | UUID | FK → Person |
| password_hash | string | |
| last_login_at | datetime | nullable |
| failed_login_attempts | int | |

---

## 2. Institution Structure & Academic Configuration

### Institution

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| legal_name | string | |
| display_name | string | |
| logo_url | string | nullable |
| letterhead_template_url | string | nullable |
| branding | JSON | color/tone guidelines |
| academic_calendar_template_id | UUID | nullable, FK → AcademicCalendarTemplate |

### Campus

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | FK → Institution |
| name | string | |
| code | string | |
| address | JSON | |
| timezone | string | |
| is_active | boolean | |

### Department

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| campus_id | UUID | FK → Campus |
| name | string | |
| code | string | |
| head_faculty_person_id | UUID | nullable, FK → Person (Faculty) |

### Program

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| department_id | UUID | FK → Department |
| name | string | e.g., "B.Tech Computer Science" |
| code | string | |
| level | enum(undergraduate, postgraduate, diploma, certificate) | |
| duration_years | int | |
| total_credits_required | decimal | |

### AcademicYear

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| name | string | e.g., "2024–2025" |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |

### Semester

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| academic_year_id | UUID | FK → AcademicYear |
| name | string | e.g., "Semester 1" |
| sequence | int | |
| start_date | date | |
| end_date | date | |

### AcademicCalendarEvent

Holidays, exam periods, breaks.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| campus_id | UUID | nullable |
| semester_id | UUID | nullable, FK → Semester |
| event_type | enum(holiday, exam_period, break, orientation, other) | |
| name | string | |
| start_date | date | |
| end_date | date | |

### Course

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| program_id | UUID | FK → Program |
| code | string | |
| name | string | |
| credit_value | decimal | |
| description | text | nullable |

### CoursePrerequisite

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| course_id | UUID | FK → Course |
| prerequisite_course_id | UUID | FK → Course |

### Batch

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| program_id | UUID | FK → Program |
| academic_year_id | UUID | FK → AcademicYear |
| name | string | e.g., "2024 Intake" |
| intake_count | int | nullable |

### Section

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| batch_id | UUID | FK → Batch |
| name | string | e.g., "Section A" |
| capacity | int | |

### Room

Classrooms and exam halls.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| campus_id | UUID | FK → Campus |
| building | string | |
| floor | string | |
| room_number | string | |
| capacity | int | |
| room_type | enum(classroom, lab, exam_hall, auditorium) | |
| is_bookable | boolean | |

---

## 3. Student Lifecycle

### Student

The system of record spanning Applicant → Enrolled → Active → Graduation → Alumni.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| person_id | UUID | FK → Person |
| admission_number | string | assigned at enrollment |
| student_code | string | enrollment identifier |
| lifecycle_status | enum(applicant, admitted, enrolled, active, on_leave, suspended, graduated, alumni, withdrawn) | single field every module gates feature access off |
| program_id | UUID | FK → Program |
| batch_id | UUID | nullable, FK → Batch |
| section_id | UUID | nullable, FK → Section |
| campus_id | UUID | FK → Campus |
| admission_date | date | nullable |
| graduation_date | date | nullable |
| withdrawal_date | date | nullable |
| category | string | nullable — e.g., "General", "OBC", "SC", "ST" |
| is_deleted | boolean | default false |
| deleted_at | datetime | nullable |

### StudentDocument

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| document_type | enum(id_proof, prior_transcript, certificate, other) | |
| file_url | string | |
| verification_status | enum(pending, verified, rejected) | |
| verified_by_person_id | UUID | nullable |
| verified_at | datetime | nullable |

### Guardian

Guardian identity and relationship.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| person_id | UUID | FK → Person |
| institution_id | UUID | |

### GuardianLink

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| guardian_person_id | UUID | FK → Person |
| relationship_type | enum(parent, guardian, sponsor) | |
| is_primary | boolean | |
| linked_at | datetime | |
| revoked_at | datetime | nullable |

---

## 4. Teacher Lifecycle

### Teacher

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| person_id | UUID | FK → Person |
| teacher_code | string | unique employee identifier |
| department_id | UUID | FK → Department |
| employment_type | enum(full_time, part_time, adjunct, contract) | |
| hire_date | date | |
| exit_date | date | nullable |
| status | enum(active, on_leave, exited) | |
| is_deleted | boolean | default false |
| deleted_at | datetime | nullable |

### TeacherQualification

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| teacher_id | UUID | FK → Teacher |
| degree_name | string | e.g., "M.Tech" |
| institution_name | string | |
| year_of_completion | int | |
| document_url | string | nullable |

### TeacherExperience

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| teacher_id | UUID | FK → Teacher |
| employer_name | string | |
| position | string | |
| duration_years | decimal | |
| start_date | date | |
| end_date | date | nullable |

### FacultyCourseAssignment

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| faculty_person_id | UUID | FK → Person (Teacher) |
| course_id | UUID | FK → Course |
| section_id | UUID | FK → Section |
| semester_id | UUID | FK → Semester |
| assignment_role | enum(primary, co_faculty) | |

### ClassTeacherAssignment

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| faculty_person_id | UUID | FK → Person (Teacher) |
| section_id | UUID | FK → Section |
| semester_id | UUID | FK → Semester |

---

## 5. Admissions Management

### Application

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| applicant_person_id | UUID | FK → Person |
| program_id | UUID | FK → Program |
| campus_id | UUID | FK → Campus |
| batch_id | UUID | nullable, FK → Batch |
| status | enum(submitted, under_review, shortlisted, offer, accepted, enrolled, rejected) | |
| submitted_at | datetime | |
| decision_at | datetime | nullable |

### ApplicationFormField

Configurable per-program application form.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| program_id | UUID | FK → Program |
| field_key | string | |
| field_label | string | |
| field_type | enum(text, number, date, file, select) | |
| is_required | boolean | |

### ApplicationFormResponse

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| application_id | UUID | FK → Application |
| field_id | UUID | FK → ApplicationFormField |
| value | text | |

### EntranceScore

Entrance exam or merit-score linkage.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| application_id | UUID | FK → Application |
| exam_name | string | |
| score | decimal | |
| linked_at | datetime | |

### InterviewSchedule

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| application_id | UUID | FK → Application |
| scheduled_at | datetime | |
| mode | enum(in_person, remote) | |
| interviewer_person_id | UUID | nullable |
| outcome | text | nullable |
| outcome_recorded_at | datetime | nullable |

### OfferLetter

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| application_id | UUID | FK → Application |
| issued_at | datetime | |
| offer_expiry_at | datetime | |
| status | enum(issued, accepted, declined, expired) | |

### Waitlist

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| application_id | UUID | FK → Application |
| rank | int | |
| status | enum(waiting, advanced, exhausted) | |

### SeatMatrix

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| program_id | UUID | FK → Program |
| batch_id | UUID | FK → Batch |
| campus_id | UUID | FK → Campus |
| category | string | e.g., "General", "OBC" |
| total_seats | int | |
| filled_seats | int | |

---

## 6. Timetable Management

### Timetable

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| semester_id | UUID | FK → Semester |
| section_id | UUID | FK → Section |
| course_id | UUID | FK → Course |
| faculty_person_id | UUID | FK → Person |
| room_id | UUID | FK → Room |
| day_of_week | int | 0=Monday, 6=Sunday |
| start_time | time | |
| end_time | time | |

---

## 7. Attendance Management

### AttendanceSession

One taken-attendance event for a section/course on a given date.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| section_id | UUID | FK → Section |
| course_id | UUID | FK → Course |
| faculty_person_id | UUID | FK → Person |
| session_date | date | |
| start_time | time | |
| end_time | time | |
| capture_method | enum(manual, biometric, rfid, qr) | |
| approved_by_person_id | UUID | nullable |
| approved_at | datetime | nullable |

### AttendanceRecord

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| session_id | UUID | FK → AttendanceSession |
| student_id | UUID | FK → Student |
| status | enum(present, absent, late, excused) | |
| captured_at | datetime | |
| corrected_by_person_id | UUID | nullable |
| correction_reason | text | nullable |

### LeaveAdjustment

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| from_date | date | |
| to_date | date | |
| reason | text | |
| approved_by_person_id | UUID | |
| approved_at | datetime | |

### AttendanceMetric

Cached/computed attendance percentages per student per course/semester.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| course_id | UUID | FK → Course |
| semester_id | UUID | FK → Semester |
| attended_sessions | int | |
| total_sessions | int | |
| attendance_percentage | decimal | |
| last_updated_at | datetime | |

---

## 8. Examination & Assessment

### ExamType

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| name | enum(internal, midterm, final, makeup) | |
| max_marks | decimal | |
| weightage_percent | decimal | nullable |

### ExamSchedule

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| semester_id | UUID | FK → Semester |
| exam_type_id | UUID | FK → ExamType |
| course_id | UUID | FK → Course |
| exam_date | date | |
| start_time | time | |
| duration_minutes | int | |
| room_id | UUID | nullable, FK → Room |
| delivery_mode | enum(in_person, online) | |
| is_deleted | boolean | default false |
| deleted_at | datetime | nullable |

### HallTicket

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| exam_schedule_id | UUID | FK → ExamSchedule |
| eligibility_status | enum(eligible, not_eligible_attendance, not_eligible_other) | computed from Attendance module before issuance |
| issued_at | datetime | nullable |
| qr_code | string | nullable |

### SeatingArrangement

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| exam_schedule_id | UUID | FK → ExamSchedule |
| room_id | UUID | FK → Room |
| student_id | UUID | FK → Student |
| seat_number | string | |

### InvigilatorAssignment

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| exam_schedule_id | UUID | FK → ExamSchedule |
| room_id | UUID | FK → Room |
| invigilator_person_id | UUID | FK → Person (Faculty) |

### MalpracticeIncident

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| exam_schedule_id | UUID | FK → ExamSchedule |
| student_id | UUID | FK → Student |
| reported_by_person_id | UUID | |
| description | text | |
| severity | enum(minor, major) | |
| action_taken | text | nullable |

---

## 9. Marks Management

### MarksEntry

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| exam_schedule_id | UUID | FK → ExamSchedule |
| student_id | UUID | FK → Student |
| evaluator_person_id | UUID | FK → Person (Faculty) |
| marks_obtained | decimal | |
| max_marks | decimal | |
| entry_type | enum(manual, bulk_upload) | |
| entered_at | datetime | |

### InternalMarks

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| course_id | UUID | FK → Course |
| semester_id | UUID | FK → Semester |
| marks_obtained | decimal | |
| max_marks | decimal | |
| mark_type | enum(assignment, quiz, participation) | |

### GradingScheme

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| program_id | UUID | nullable |
| scheme_type | enum(percentage, gpa, letter_grade) | |
| grade_bands | JSON | e.g., `[{"min":90,"max":100,"grade":"A+"}]` |

### Result

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| course_id | UUID | FK → Course |
| semester_id | UUID | FK → Semester |
| internal_marks | decimal | nullable |
| external_marks | decimal | nullable |
| practical_marks | decimal | nullable |
| viva_marks | decimal | nullable |
| grace_marks | decimal | default 0 |
| total_marks | decimal | computed |
| max_marks | decimal | |
| grade | string | e.g., "A", "A+" |
| gpa | decimal | nullable |
| cgpa | decimal | nullable |
| status | enum(computed, published, withheld) | |
| is_deleted | boolean | default false |
| deleted_at | datetime | nullable |
| published_at | datetime | nullable |

---

## 10. Student Promotion

### PromotionRule

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| program_id | UUID | FK → Program |
| from_semester_id | UUID | FK → Semester |
| to_semester_id | UUID | FK → Semester |
| min_credits_required | decimal | |
| min_gpa_required | decimal | nullable |
| max_backlog_allowed | int | |

### Promotion

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| from_semester_id | UUID | FK → Semester |
| to_semester_id | UUID | FK → Semester |
| promotion_status | enum(promoted, conditional, repeat_year, terminated) | |
| reason | text | nullable |
| promoted_by_person_id | UUID | |
| promoted_at | datetime | |

### Backlog

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| course_id | UUID | FK → Course |
| semester_id | UUID | FK → Semester |
| reason | enum(failed_exam, incomplete_credits) | |
| created_at | datetime | |
| cleared_at | datetime | nullable |

---

## 11. Certificates

### CertificateTemplate

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| institution_id | UUID | |
| certificate_type | enum(transfer_certificate, study_certificate, bonafide_certificate, conduct_certificate, character_certificate, migration_certificate, degree_certificate, provisional_certificate) | |
| template_html | text | HTML template with placeholders |
| is_active | boolean | |

### Certificate

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → Student |
| certificate_type | enum(transfer_certificate, study_certificate, bonafide_certificate, conduct_certificate, character_certificate, migration_certificate, degree_certificate, provisional_certificate) | |
| certificate_number | string | unique |
| issued_at | datetime | |
| issued_by_person_id | UUID | FK → Person (Administrator) |
| qr_verification_code | string | |
| digital_signature | string | |
| document_url | string | PDF export |
| print_format_url | string | printable version |
| is_deleted | boolean | default false |
| deleted_at | datetime | nullable |

---

## 12. Alumni Management

### Alumni

Extension of the Student lifecycle.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | unique, FK → Student |
| current_employer | string | nullable |
| current_role | string | nullable |
| contact_info | JSON | updated contact details |
| directory_visibility | enum(public, alumni_only, private) | |
| transitioned_at | datetime | |

### AlumniDirectory

Searchable alumni registry (optional, if full visibility is needed).

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| alumni_id | UUID | FK → Alumni |
| batch_year | int | |
| program_id | UUID | FK → Program |
| search_tags | JSON | |

---

## Summary

This schema covers the **12 core modules** defined in PRD.md:

1. **Student Lifecycle** — Student, StudentDocument, Guardian, GuardianLink
2. **Teacher Lifecycle** — Teacher, TeacherQualification, TeacherExperience, FacultyCourseAssignment, ClassTeacherAssignment
3. **Admissions** — Application, ApplicationForm*, EntranceScore, Interview*, OfferLetter, Waitlist, SeatMatrix
4. **Timetable** — Timetable (with prerequisite entities: AcademicYear, Semester, Course, Batch, Section, Room)
5. **Attendance** — AttendanceSession, AttendanceRecord, LeaveAdjustment, AttendanceMetric
6. **Examination** — ExamType, ExamSchedule, HallTicket, SeatingArrangement, InvigilatorAssignment, MalpracticeIncident
7. **Marks** — MarksEntry, InternalMarks, GradingScheme, Result
8. **Promotion** — PromotionRule, Promotion, Backlog
9. **Certificates** — CertificateTemplate, Certificate (all 8 types)
10. **Alumni** — Alumni, AlumniDirectory

The schema omits:
- Finance, Hostel, Transport, Library, Placement, HR Payroll
- Direct event-bus/notification machinery (simplified for this core version)
- Rules & Monitoring Engine cross-cutting logic (included as implicit domain rules in promotion/attendance/grading)

This provides a complete academic ERP data model focused on the student and teacher lifecycle through certification and alumni engagement.
