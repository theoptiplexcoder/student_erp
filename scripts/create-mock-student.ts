import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = 'student@234.com';
  const password = 'wasdwasd12';

  console.log(`Creating user ${email} in Supabase...`);

  // 1. Create User in Supabase
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'STUDENT' },
  });

  if (authError) {
    if (
      authError.message.includes('already been registered') ||
      authError.code === 'email_exists'
    ) {
      console.log('User already exists in Supabase. Proceeding to find it...');
    } else {
      console.error('Error creating user in Supabase:', authError);
      process.exit(1);
    }
  }

  // Get user ID from supabase
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching users:', usersError);
    process.exit(1);
  }

  const authUser = usersData.users.find((u: any) => u.email === email);
  if (!authUser) {
    console.error('Could not find user in Supabase.');
    process.exit(1);
  }

  const authUserId = authUser.id;
  console.log(`Supabase User ID: ${authUserId}`);

  // 2. Fetch existing institution and relations
  const institution = await prisma.institution.findFirst();
  if (!institution) throw new Error('No institution found.');

  const program = await prisma.program.findFirst();
  const academicYear = await prisma.academicYear.findFirst();
  const term = await prisma.academicTerm.findFirst();
  const section = await prisma.section.findFirst();
  const faculty = await prisma.faculty.findFirst();
  const examCourse = await prisma.examCourse.findFirst();
  const assignment = await prisma.assignment.findFirst();
  const department = await prisma.department.findFirst();

  let curriculum = await prisma.curriculum.findFirst({
    where: { programId: program?.id },
  });
  if (!curriculum && program) {
    curriculum = await prisma.curriculum.create({
      data: {
        institutionId: institution.id,
        programId: program.id,
        name: 'Mock Curriculum',
        versionNumber: '1.0',
        effectiveFrom: new Date(),
        status: 'ACTIVE',
      },
    });
  }

  // 3. Create or Update Prisma User
  const user = await prisma.user.upsert({
    where: { authUserId },
    update: {},
    create: {
      authUserId,
      institutionId: institution.id,
      email,
      firstName: 'Mock',
      lastName: 'Student',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+1234567890',
    },
  });

  console.log(`Created DB User: ${user.id}`);

  // 4. Create or Update Student
  const student = await prisma.student.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      institutionId: institution.id,
      userId: user.id,
      admissionNumber: 'MOCK-1001',
      studentCode: 'ST-MOCK-001',
      lifecycleStatus: 'ACTIVE',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'MALE',
      bloodGroup: 'O+',
      address: '123 Mock Street',
      city: 'Mock City',
      state: 'Mock State',
      country: 'Mockland',
      postalCode: '12345',
      fatherName: 'John Doe Sr.',
      motherName: 'Jane Doe',
      guardianName: 'John Doe Sr.',
      guardianPhone: '+1987654321',
      admissionDate: new Date(),
      rollNumber: 'ROLL-123',
      bio: 'A highly motivated mock student.',
      profileCompletion: 100,
      programId: program?.id,
      sectionId: section?.id,
      curriculumId: curriculum?.id,
    },
  });

  console.log(`Created Student: ${student.id}`);

  // 4.5 Create 5 terms
  if (curriculum && academicYear) {
    for (let i = 1; i <= 5; i++) {
      const termStatus = i === 5 ? 'ACTIVE' : 'COMPLETED';
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + (i - 5) * 6);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 5);

      const termName = i === 5 ? `Active Term ${i}` : `Previous Term ${i}`;
      let aTerm = await prisma.academicTerm.findFirst({
        where: { institutionId: institution.id, academicYearId: academicYear.id, code: `MT${i}` },
      });
      if (!aTerm) {
        aTerm = await prisma.academicTerm.create({
          data: {
            institutionId: institution.id,
            academicYearId: academicYear.id,
            name: termName,
            code: `MT${i}`,
            termType: 'SEMESTER',
            startDate,
            endDate,
            status: termStatus,
          },
        });
      } else {
        aTerm = await prisma.academicTerm.update({
          where: { id: aTerm.id },
          data: { status: termStatus, startDate, endDate, name: termName },
        });
      }

      let cTerm = await prisma.curriculumTerm.findFirst({
        where: { institutionId: institution.id, curriculumId: curriculum.id, sequence: i },
      });
      if (!cTerm) {
        cTerm = await prisma.curriculumTerm.create({
          data: {
            institutionId: institution.id,
            curriculumId: curriculum.id,
            name: `Curriculum Term ${i}`,
            sequence: i,
            creditRequirement: 20,
          },
        });
      }

      let loopCourse = await prisma.course.findFirst({
        where: { institutionId: institution.id, code: `MCK-${i}01` },
      });
      if (!loopCourse) {
        loopCourse = await prisma.course.create({
          data: {
            institutionId: institution.id,
            code: `MCK-${i}01`,
            name: `Mock Course ${i}`,
            creditValue: 3,
            maxMarks: 100,
            passingMarks: 40,
            status: 'ACTIVE',
          },
        });
      }

      const currCourse = await prisma.curriculumCourse.findFirst({
        where: { curriculumTermId: cTerm.id, sequence: 1 },
      });
      if (!currCourse) {
        await prisma.curriculumCourse.create({
          data: {
            institutionId: institution.id,
            curriculumTermId: cTerm.id,
            courseId: loopCourse.id,
            sequence: 1,
            creditValue: 3,
            isMandatory: true,
          },
        });
      } else {
        await prisma.curriculumCourse.update({
          where: { id: currCourse.id },
          data: { courseId: loopCourse.id },
        });
      }

      const sTerm = await prisma.studentTerm.findFirst({
        where: { studentId: student.id, academicTermId: aTerm.id },
      });
      if (!sTerm) {
        await prisma.studentTerm.create({
          data: {
            institutionId: institution.id,
            studentId: student.id,
            academicTermId: aTerm.id,
            curriculumTermId: cTerm.id,
            status: termStatus,
            termGPA: i < 5 ? 3.5 : null,
          },
        });
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, termId: aTerm.id, courseId: loopCourse.id },
      });
      if (!enrollment) {
        await prisma.enrollment.create({
          data: {
            institutionId: institution.id,
            studentId: student.id,
            academicYearId: academicYear.id,
            termId: aTerm.id,
            courseId: loopCourse.id,
            curriculumId: curriculum.id,
            programId: program?.id,
            sectionId: section?.id,
            status: termStatus,
            rollNumber: 'ROLL-123',
          },
        });
      }
    }
    console.log(`Enrolled student to 5 terms and unique curriculum courses.`);
  }

  // 5. Create Mock Related Data for Previous Term (Mock Term 4) and Current
  const prevTerm = await prisma.academicTerm.findFirst({
    where: { institutionId: institution.id, code: 'MT4' },
  });
  const prevCourse = await prisma.course.findFirst({
    where: { institutionId: institution.id, code: 'MCK-401' },
  });

  if (prevTerm && academicYear && prevCourse) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: student.id, termId: prevTerm.id, courseId: prevCourse.id },
    });

    // Attendance for Previous Term
    if (faculty && section) {
      for (let day = 1; day <= 5; day++) {
        const date = new Date(new Date().setDate(new Date().getDate() - day * 7));
        let attendanceSession = await prisma.attendanceSession.findFirst({
          where: {
            institutionId: institution.id,
            courseId: prevCourse.id,
            sectionId: section.id,
            termId: prevTerm.id,
            topic: `Previous Term Topic ${day}`,
          },
        });

        if (!attendanceSession) {
          attendanceSession = await prisma.attendanceSession.create({
            data: {
              institutionId: institution.id,
              courseId: prevCourse.id,
              sectionId: section.id,
              facultyId: faculty.id,
              termId: prevTerm.id,
              date: date,
              startTime: new Date(),
              endTime: new Date(Date.now() + 3600000),
              topic: `Previous Term Topic ${day}`,
            },
          });
        }

        const attendanceRecord = await prisma.attendanceRecord.findFirst({
          where: {
            attendanceSessionId: attendanceSession.id,
            studentId: student.id,
          },
        });

        if (!attendanceRecord) {
          await prisma.attendanceRecord.create({
            data: {
              institutionId: institution.id,
              attendanceSessionId: attendanceSession.id,
              studentId: student.id,
              status: day % 4 === 0 ? 'ABSENT' : 'PRESENT',
              remarks: day % 4 === 0 ? 'Sick leave' : 'On time',
            },
          });
        }
      }
      console.log(`Created Multiple Attendance records for Previous Term.`);
    }

    // Exam & Marks for Previous Term
    let prevExam = await prisma.exam.findFirst({
      where: { termId: prevTerm.id },
    });
    if (!prevExam) {
      prevExam = await prisma.exam.create({
        data: {
          institutionId: institution.id,
          academicYearId: academicYear.id,
          termId: prevTerm.id,
          name: 'Final Exam Term 4',
          examType: 'FINAL',
          status: 'PUBLISHED',
        },
      });
    }

    let prevExamCourse = await prisma.examCourse.findFirst({
      where: { examId: prevExam.id, courseId: prevCourse.id },
    });
    if (!prevExamCourse) {
      prevExamCourse = await prisma.examCourse.create({
        data: {
          institutionId: institution.id,
          examId: prevExam.id,
          courseId: prevCourse.id,
          examDate: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          maxMarks: 100,
          passingMarks: 40,
        },
      });
    }

    const mark = await prisma.mark.findFirst({
      where: {
        examCourseId: prevExamCourse.id,
        studentId: student.id,
      },
    });

    if (!mark && enrollment) {
      await prisma.mark.create({
        data: {
          institutionId: institution.id,
          examCourseId: prevExamCourse.id,
          studentId: student.id,
          enrollmentId: enrollment.id,
          marksObtained: 92,
          percentage: 92,
          grade: 'A',
          gradePoint: 4.0,
          resultStatus: 'PASS',
          remarks: 'Excellent performance',
        },
      });
      console.log(`Created Mark record for Previous Term.`);
    } else {
      console.log(`Mark record already exists.`);
    }

    // Assignment & Submission for Previous Term
    let prevAssignment = await prisma.assignment.findFirst({
      where: { termId: prevTerm.id, courseId: prevCourse.id },
    });
    if (!prevAssignment && faculty) {
      prevAssignment = await prisma.assignment.create({
        data: {
          institutionId: institution.id,
          courseId: prevCourse.id,
          facultyId: faculty.id,
          termId: prevTerm.id,
          title: 'Final Project Term 4',
          dueDate: new Date(),
          maxMarks: 100,
          status: 'PUBLISHED',
        },
      });
    }

    if (prevAssignment) {
      const submission = await prisma.assignmentSubmission.findFirst({
        where: {
          assignmentId: prevAssignment.id,
          studentId: student.id,
        },
      });

      if (!submission) {
        await prisma.assignmentSubmission.create({
          data: {
            institutionId: institution.id,
            assignmentId: prevAssignment.id,
            studentId: student.id,
            submissionUrl: 'https://example.com/prev-submission.pdf',
            status: 'GRADED',
            marks: 95,
            feedback: 'Great project!',
            submittedAt: new Date(),
            gradedAt: new Date(),
          },
        });
        console.log(`Created Assignment Submission for Previous Term.`);
      } else {
        console.log(`Assignment submission already exists.`);
      }
    }
  }

  // Active Term (Mock Term 5)
  const activeTerm = await prisma.academicTerm.findFirst({
    where: { institutionId: institution.id, code: 'MT5' },
  });
  const activeCourse = await prisma.course.findFirst({
    where: { institutionId: institution.id, code: 'MCK-501' },
  });

  if (activeTerm && academicYear && activeCourse) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: student.id, termId: activeTerm.id, courseId: activeCourse.id },
    });

    if (faculty && section) {
      let attendanceSession = await prisma.attendanceSession.findFirst({
        where: {
          institutionId: institution.id,
          courseId: activeCourse.id,
          sectionId: section.id,
          termId: activeTerm.id,
          topic: 'Introduction to Current Term',
        },
      });

      if (!attendanceSession) {
        attendanceSession = await prisma.attendanceSession.create({
          data: {
            institutionId: institution.id,
            courseId: activeCourse.id,
            sectionId: section.id,
            facultyId: faculty.id,
            termId: activeTerm.id,
            date: new Date(),
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000),
            topic: 'Introduction to Current Term',
          },
        });
      }

      const attendanceRecord = await prisma.attendanceRecord.findFirst({
        where: {
          attendanceSessionId: attendanceSession.id,
          studentId: student.id,
        },
      });

      if (!attendanceRecord) {
        await prisma.attendanceRecord.create({
          data: {
            institutionId: institution.id,
            attendanceSessionId: attendanceSession.id,
            studentId: student.id,
            status: 'PRESENT',
            remarks: 'On time',
          },
        });
      }
      console.log(`Created Attendance record for Active Term.`);
    }

    let activeAssignment = await prisma.assignment.findFirst({
      where: { termId: activeTerm.id, courseId: activeCourse.id },
    });
    if (!activeAssignment && faculty) {
      activeAssignment = await prisma.assignment.create({
        data: {
          institutionId: institution.id,
          courseId: activeCourse.id,
          facultyId: faculty.id,
          termId: activeTerm.id,
          title: 'Initial Assignment Term 5',
          dueDate: new Date(Date.now() + 7 * 24 * 3600000),
          maxMarks: 50,
          status: 'PUBLISHED',
        },
      });
    }

    if (activeAssignment) {
      const submission = await prisma.assignmentSubmission.findFirst({
        where: {
          assignmentId: activeAssignment.id,
          studentId: student.id,
        },
      });

      if (!submission) {
        await prisma.assignmentSubmission.create({
          data: {
            institutionId: institution.id,
            assignmentId: activeAssignment.id,
            studentId: student.id,
            submissionUrl: 'https://example.com/submission-term5.pdf',
            status: 'SUBMITTED',
            submittedAt: new Date(),
          },
        });
        console.log(`Created Assignment Submission for Active Term.`);
      } else {
        console.log(`Assignment submission already exists.`);
      }
    }
  }

  // Certificate Request
  const certRequest = await prisma.certificateRequest.findFirst({
    where: { studentId: student.id, certificateType: 'BONAFIDE' },
  });
  if (!certRequest) {
    await prisma.certificateRequest.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        certificateType: 'BONAFIDE',
        purpose: 'Scholarship application',
        status: 'APPROVED',
        processedAt: new Date(),
        remarks: 'Approved by admin',
      },
    });
  }

  // Grievance
  const grievance = await prisma.grievance.findFirst({
    where: { studentId: student.id, subject: 'Wi-Fi issues in Hostel A' },
  });
  if (!grievance) {
    await prisma.grievance.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        category: 'HOSTEL',
        subject: 'Wi-Fi issues in Hostel A',
        description: 'The Wi-Fi in Hostel A is very slow and disconnects frequently.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      },
    });
  }

  // Service Request
  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { studentId: student.id, subject: 'Lost ID Card' },
  });
  if (!serviceRequest) {
    await prisma.serviceRequest.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        category: 'ID_CARD',
        subject: 'Lost ID Card',
        description: 'I lost my ID card yesterday and need a replacement.',
        status: 'OPEN',
        priority: 'HIGH',
      },
    });
  }

  // Document
  const studentDoc = await prisma.studentDocument.findFirst({
    where: { studentId: student.id, documentType: 'IDENTITY' },
  });
  if (!studentDoc) {
    await prisma.studentDocument.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        documentType: 'IDENTITY',
        title: 'National ID',
        fileUrl: 'https://example.com/id.pdf',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });
  }

  // Skill
  const studentSkill = await prisma.studentSkill.findFirst({
    where: { studentId: student.id, name: 'TypeScript' },
  });
  if (!studentSkill) {
    await prisma.studentSkill.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        name: 'TypeScript',
        level: 'ADVANCED',
      },
    });
  }

  // Achievement
  const studentAchievement = await prisma.studentAchievement.findFirst({
    where: { studentId: student.id, title: 'Hackathon Winner' },
  });
  if (!studentAchievement) {
    await prisma.studentAchievement.create({
      data: {
        institutionId: institution.id,
        studentId: student.id,
        title: 'Hackathon Winner',
        achievementDate: new Date(),
        issuer: 'TechCorp',
      },
    });
  }

  // Club and Membership
  const club = await prisma.club.findFirst();
  if (club) {
    const clubMembership = await prisma.clubMembership.findFirst({
      where: { studentId: student.id, clubId: club.id },
    });
    if (!clubMembership) {
      await prisma.clubMembership.create({
        data: {
          institutionId: institution.id,
          clubId: club.id,
          studentId: student.id,
          role: 'MEMBER',
        },
      });
      console.log(`Created Club Membership.`);
    } else {
      console.log(`Club membership already exists.`);
    }
  }

  // Notification
  const notification = await prisma.notification.findFirst({
    where: { userId: user.id, title: 'Welcome!' },
  });
  if (!notification) {
    await prisma.notification.create({
      data: {
        institutionId: institution.id,
        userId: user.id,
        title: 'Welcome!',
        message: 'Welcome to your student portal.',
        type: 'SYSTEM',
      },
    });
    console.log(`Created Notification.`);
  } else {
    console.log(`Notification already exists.`);
  }

  console.log('Successfully created mock student and all related mock data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
