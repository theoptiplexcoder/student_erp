Based on your revised scope, this is no longer a **complete Student ERP**. It becomes a **Core Academic ERP**, focused on the institution's primary academic operations.

Your product should revolve around **five major domains**:

1. **Student Lifecycle**
2. **Teacher Lifecycle**
3. **Examinations, Marks & Promotions**
4. **Academic Documents**
5. **Academic Planning (Timetable)**

These align well with the lifecycle and academic management modules already defined in your project documents. fileciteturn0file43L13-L142 fileciteturn0file41L1-L90

# Product Requirements Document (Focused Version)

---

# Student ERP

## Product Requirements Document (Academic Core)

Version 1.0

---

# 1. Vision

Develop a modern cloud-based Student ERP that digitizes the complete academic lifecycle of students and teachers while simplifying institutional administration.

The system focuses on managing:

- Student lifecycle
- Teacher lifecycle
- Academic records
- Examination management
- Promotion
- Timetable
- Academic certificates

The ERP deliberately excludes finance, hostel, transport, library, placement, HR payroll, and other auxiliary departments in the initial version.

---

# 2. Product Goals

The system should enable an institution to:

- Admit students
- Manage student records until alumni
- Manage teacher records from recruitment until retirement
- Conduct examinations
- Publish marks
- Promote students
- Generate report cards
- Generate transfer certificates
- Generate study certificates
- Create academic timetables
- Maintain complete academic history

---

# 3. Primary Users

### Administration

- Institution Administrator
- Academic Administrator
- Office Staff
- Department Administrator

### Academic

- Teacher
- HOD

### Students

- Applicant
- Student
- Alumni

### Parents

- Guardian (Read Only)

These personas are a subset of the broader role model already defined for the ERP. fileciteturn0file48L9-L109

---

# 4. Product Scope

## Module 1

### Student Lifecycle

Applicant

↓

Admission

↓

Enrollment

↓

Active Student

↓

Semester Progression

↓

Promotion

↓

Graduation

↓

Alumni

Supported states:

- Applicant
- Admitted
- Active
- On Leave
- Suspended
- Graduated
- Alumni
- Withdrawn

Core capabilities include maintaining a unique student record, guardian linkage, program/batch assignment, document management, and lifecycle tracking. fileciteturn0file43L13-L30

---

## Module 2

### Teacher Lifecycle

Candidate

↓

Recruitment

↓

Verification

↓

Joining

↓

Faculty

↓

Department Allocation

↓

Course Assignment

↓

Promotion

↓

Transfer

↓

Retirement

Store

- Personal details
- Qualification
- Experience
- Joining history
- Promotion history
- Department history
- Subject expertise
- Employment history
- Retirement records

---

## Module 3

### Admissions

Features

- Online admission
- Admission workflow
- Admission approval
- Document verification
- Seat allocation
- Admission number generation
- Student ID generation
- Batch allocation
- Section allocation

The admissions workflow is based on applicant conversion into an enrolled student. fileciteturn0file43L32-L53

---

## Module 4

### Student Information Management

Store

- Personal Information
- Address
- Guardian
- Previous Education
- Medical Information
- Category
- Documents
- Academic Record
- Batch
- Section
- Roll Number
- Admission Number

---

## Module 5

### Faculty Management

Features

- Teacher Profiles
- Department Assignment
- Subject Assignment
- Timetable Assignment
- Class Teacher Assignment
- Academic History
- Promotion History
- Retirement

Faculty responsibilities include course assignments, attendance, grading, and teaching resources. fileciteturn0file47L30-L98

---

## Module 6

### Timetable Management

Support

- Academic Calendar
- Working Days
- Holidays
- Class Timetable
- Faculty Timetable
- Classroom Allocation
- Conflict Detection
- Manual Editing
- Auto Generation (Future)

Timetable creation is a core academic capability. fileciteturn0file43L55-L67

---

## Module 7

### Attendance

Student Attendance

Teacher Attendance

Support

- Daily attendance
- Period attendance
- Monthly reports
- Attendance percentage
- Leave adjustment
- Defaulter detection
- Attendance reports

---

## Module 8

### Examination Management

Features

- Exam Creation
- Exam Types
- Subjects
- Timetable
- Hall Allocation
- Hall Tickets
- Marks Entry
- Grade Calculation
- Result Publication

The examination module includes exam scheduling, marks entry, grading, and result publication. fileciteturn0file43L111-L143

---

## Module 9

### Marks Management

Features

- Internal Marks
- External Marks
- Practical Marks
- Viva Marks
- Grace Marks
- Grade Calculation
- GPA
- CGPA
- Subject-wise Analysis

---

## Module 10

### Student Promotion

Support

- Semester Promotion
- Year Promotion
- Promotion Rules
- Conditional Promotion
- Repeat Year
- Backlog Management
- Graduation Eligibility

---

## Module 11

### Certificates

Generate

- Transfer Certificate (TC)
- Study Certificate
- Bonafide Certificate
- Conduct Certificate
- Character Certificate
- Migration Certificate
- Degree Certificate
- Provisional Certificate

Every certificate should have

- QR Verification
- Digital Signature
- PDF Export
- Print Format

Certificate generation is part of the examination and student record workflows. fileciteturn0file43L132-L143

---

## Module 12

### Alumni

Features

- Alumni Directory
- Degree Verification
- Academic Transcript
- Contact Information
- Alumni Status
- Employment Information (Optional)

---

# 5. Student Journey

```
Applicant

↓

Admission

↓

Verification

↓

Enrollment

↓

Section Allocation

↓

Timetable

↓

Attendance

↓

Examinations

↓

Marks

↓

Promotion

↓

Next Semester

↓

Graduation

↓

Certificates

↓

Alumni
```

This follows the continuous applicant → student → alumni lifecycle defined in the project. fileciteturn0file41L1-L34

---

# 6. Teacher Journey

```
Recruitment

↓

Joining

↓

Department Assignment

↓

Subject Assignment

↓

Timetable

↓

Attendance

↓

Marks Entry

↓

Student Evaluation

↓

Promotion

↓

Transfer

↓

Retirement
```

---

# 7. Core Dashboards

### Administrator

- Admissions
- Students
- Faculty
- Attendance
- Examinations
- Promotions

---

### Teacher

- Today's Classes
- Timetable
- Attendance Pending
- Marks Pending
- Class Students

---

### Student

- Timetable
- Attendance
- Marks
- Results
- Certificates

---

### Parent

- Attendance
- Marks
- Timetable
- Notices

---

# 8. Development Priority

| Phase       | Features                                                    |
| ----------- | ----------------------------------------------------------- |
| **Phase 1** | Authentication, Roles, Student Lifecycle, Teacher Lifecycle |
| **Phase 2** | Admissions, Student Records, Faculty Management             |
| **Phase 3** | Timetable, Attendance                                       |
| **Phase 4** | Examination, Marks, Results                                 |
| **Phase 5** | Promotion, Certificates, Alumni                             |

---

## Recommendation

For this focused product, I would reduce the scope to **12 core modules** instead of the original 25+ modules. This gives you a much stronger academic ERP centered on the complete lifecycle of students and teachers, while leaving finance, transport, hostel, library, placement, and other operational departments as future extensions. This narrower scope is well suited to building a high-quality first release without the complexity of a full university ERP.
