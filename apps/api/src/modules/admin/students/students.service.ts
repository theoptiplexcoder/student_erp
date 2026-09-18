import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId: string, query: StudentQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      search,
      departmentId,
      programId,
      academicYearId,
      batchId,
      sectionId,
      termId,
      status,
      gender,
      admissionDateFrom,
      admissionDateTo,
      guardianLinked,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {
      institutionId,
      ...(status && { lifecycleStatus: status }),
      ...(gender && { gender }),
      ...(programId && { programId }),
      ...(departmentId && { program: { departmentId } }),
      ...((batchId || academicYearId || termId) && {
        enrollments: {
          some: {
            status: 'ACTIVE',
            ...(batchId && { batchId }),
            ...(academicYearId && { academicYearId }),
            ...(termId && { termId }),
          },
        },
      }),
      ...(sectionId && { sectionId }),
      ...((admissionDateFrom || admissionDateTo) && {
        admissionDate: {
          ...(admissionDateFrom && { gte: new Date(admissionDateFrom) }),
          ...(admissionDateTo && { lte: new Date(admissionDateTo) }),
        },
      }),
      ...(guardianLinked !== undefined && {
        ...(guardianLinked
          ? {
              OR: [
                { AND: [{ guardianName: { not: null } }, { guardianName: { not: '' } }] },
                { AND: [{ fatherName: { not: null } }, { fatherName: { not: '' } }] },
                { AND: [{ motherName: { not: null } }, { motherName: { not: '' } }] },
              ],
            }
          : {
              AND: [
                { OR: [{ guardianName: null }, { guardianName: '' }] },
                { OR: [{ fatherName: null }, { fatherName: '' }] },
                { OR: [{ motherName: null }, { motherName: '' }] },
              ],
            }),
      }),
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { studentCode: { contains: search, mode: 'insensitive' } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              photoUrl: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          section: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: sortBy === 'name' ? { user: { firstName: sortOrder } } : { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private resolveIdentifier(identifier: string) {
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        identifier,
      );
    return isUuid ? { id: identifier } : { studentCode: identifier };
  }

  async findOne(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(id), institutionId },
      include: {
        user: true,
        program: true,
        section: true,
        enrollments: {
          include: {
            course: true,
            term: true,
          },
        },
        attendanceRecords: {
          take: 5,
          orderBy: { markedAt: 'desc' },
        },
        studentDocuments: true,
        studentPreviousEducations: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let suggestedUsn: string | null = null;
    if (student.programId) {
      const prefix = student.program?.code || student.program?.name || '';
      const existingUsns = await this.prisma.student.findMany({
        where: {
          institutionId,
          programId: student.programId,
          usn: { not: null },
        },
        select: { usn: true },
      });
      const usnSet = new Set(existingUsns.map((s) => s.usn));
      let seq = 1;
      while (usnSet.has(prefix ? `${prefix}-${seq}` : `${seq}`)) {
        seq++;
      }
      suggestedUsn = prefix ? `${prefix}-${seq}` : `${seq}`;
    }

    return {
      ...student,
      suggestedUsn,
    };
  }

  async updateStudent(institutionId: string, id: string, data: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(id), institutionId },
      include: { user: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const { firstName, lastName, phone, ...studentData } = data;

    if (studentData.usn !== undefined) {
      const trimmedUsn = studentData.usn ? studentData.usn.trim() : null;
      if (trimmedUsn) {
        const existing = await this.prisma.student.findFirst({
          where: {
            institutionId,
            usn: trimmedUsn,
            NOT: { id: student.id },
          },
        });
        if (existing) {
          throw new ConflictException(
            `A student with USN "${trimmedUsn}" already exists in the university.`,
          );
        }
        studentData.usn = trimmedUsn;
      } else {
        studentData.usn = null;
      }
    }

    if (
      firstName !== undefined ||
      lastName !== undefined ||
      phone !== undefined ||
      Object.keys(studentData).length > 0
    ) {
      await this.prisma.$transaction(async (tx) => {
        if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
          const userUpdate: any = {};
          if (firstName !== undefined) userUpdate.firstName = firstName;
          if (lastName !== undefined) userUpdate.lastName = lastName;
          if (phone !== undefined) userUpdate.phone = phone;

          await tx.user.update({
            where: { id: student.userId },
            data: userUpdate,
          });
        }

        if (Object.keys(studentData).length > 0) {
          const mappedData: any = { ...studentData };
          if (mappedData.dateOfBirth) {
            mappedData.dateOfBirth = new Date(mappedData.dateOfBirth);
          }
          await tx.student.update({
            where: { id: student.id },
            data: mappedData,
          });
        }
      });
    }

    return this.findOne(institutionId, id);
  }

  async addDocument(
    institutionId: string,
    studentId: string,
    data: { fileName: string; fileUrl: string; mimeType?: string; size?: number },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(studentId), institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.studentDocument.create({
      data: {
        institutionId,
        studentId: student.id,
        documentType: 'OTHER',
        title: data.fileName,
        fileUrl: data.fileUrl,
        verificationStatus: 'PENDING',
      },
    });
  }

  async updatePhoto(institutionId: string, studentId: string, photoUrl: string) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(studentId), institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.user.update({
      where: { id: student.userId },
      data: { photoUrl },
    });
  }

  async getAcademicProgress(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(id), institutionId },
      include: {
        program: true,
        curriculum: {
          include: {
            programs: {
              orderBy: { code: 'asc' },
              include: {
                courses: {
                  orderBy: { code: 'asc' },
                },
              },
            },
            curriculumTerms: {
              orderBy: { sequence: 'asc' },
              include: {
                curriculumCourses: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
        enrollments: {
          include: {
            course: true,
            program: true,
            marks: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        marks: {
          include: {
            examCourse: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let curriculum = student.curriculum;

    // If student doesn't have a direct curriculum linked, check if their program belongs to a curriculum
    if (!curriculum && student.programId) {
      curriculum = await this.prisma.curriculum.findFirst({
        where: {
          institutionId,
          programs: {
            some: { id: student.programId },
          },
        },
        include: {
          programs: {
            orderBy: { code: 'asc' },
            include: {
              courses: {
                orderBy: { code: 'asc' },
              },
            },
          },
          curriculumTerms: {
            orderBy: { sequence: 'asc' },
            include: {
              curriculumCourses: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });
    }

    // Map existing enrollments and marks for fast course lookup
    const enrollmentByCourseId = new Map<string, any>();
    for (const enr of student.enrollments) {
      if (enr.courseId) {
        enrollmentByCourseId.set(enr.courseId, enr);
      }
    }

    const marksByCourseId = new Map<string, any>();
    // Collect from student's direct marks
    for (const m of student.marks) {
      const courseId = m.examCourse?.courseId || m.examCourse?.course?.id;
      if (courseId && (!marksByCourseId.has(courseId) || m.grade)) {
        marksByCourseId.set(courseId, m);
      }
    }
    // Also collect from enrollment marks
    for (const enr of student.enrollments) {
      if (enr.courseId && enr.marks && enr.marks.length > 0) {
        const bestMark = enr.marks[0];
        if (!marksByCourseId.has(enr.courseId) || bestMark.grade) {
          marksByCourseId.set(enr.courseId, bestMark);
        }
      }
    }

    // Determine programs list:
    // If curriculum exists, use curriculum programs
    // Otherwise, fallback to student's program and any other programs student has enrollments for
    let rawPrograms: any[] = [];
    if (curriculum?.programs && curriculum.programs.length > 0) {
      rawPrograms = curriculum.programs;
    } else if (student.program) {
      // Find all programs in institution or linked to student's department/level
      const progWithCourses = await this.prisma.program.findUnique({
        where: { id: student.program.id },
        include: { courses: { orderBy: { code: 'asc' } } },
      });
      if (progWithCourses) {
        rawPrograms = [progWithCourses];
      }
    }

    // Identify current program index/position to know previous vs current vs future
    const currentProgramId = student.programId;

    let totalCurriculumCredits = 0;
    let totalCreditsEarned = 0;
    let totalGradePoints = 0;
    let gradedCreditsCount = 0;
    let totalCoursesCount = 0;
    let completedCoursesCount = 0;
    let inProgressCoursesCount = 0;

    const programs = rawPrograms.map((prog) => {
      const isCurrent = prog.id === currentProgramId;

      // Combine direct program courses with any courses in curriculumTerms
      const courseMap = new Map<string, any>();
      if (prog.courses) {
        for (const c of prog.courses) {
          courseMap.set(c.id, c);
        }
      }
      if (curriculum?.curriculumTerms) {
        for (const term of curriculum.curriculumTerms) {
          if (term.curriculumCourses) {
            for (const cc of term.curriculumCourses) {
              if (cc.course && !courseMap.has(cc.course.id)) {
                // If the course belongs to this program or no other program has it
                if (cc.course.departmentId === prog.departmentId || rawPrograms.length === 1) {
                  courseMap.set(cc.course.id, cc.course);
                }
              }
            }
          }
        }
      }
      const progCourses = Array.from(courseMap.values());

      let programCredits = 0;
      let programCompletedCourses = 0;

      const courses = progCourses.map((c: any) => {
        const enr = enrollmentByCourseId.get(c.id);
        const mark = marksByCourseId.get(c.id);
        const credit = c.creditValue || 1;

        totalCurriculumCredits += credit;
        programCredits += credit;
        totalCoursesCount++;

        let status = 'NOT_ENROLLED';
        if (enr) {
          status = enr.status; // 'COMPLETED', 'ACTIVE', etc.
        } else if (mark) {
          status = 'COMPLETED';
        }

        const isCompleted = status === 'COMPLETED' || (mark && mark.resultStatus === 'PASS');
        if (isCompleted) {
          completedCoursesCount++;
          programCompletedCourses++;
          totalCreditsEarned += credit;
          if (mark?.gradePoint !== undefined && mark?.gradePoint !== null) {
            totalGradePoints += mark.gradePoint * credit;
            gradedCreditsCount += credit;
          }
        } else if (status === 'ACTIVE' || status === 'ENROLLED') {
          inProgressCoursesCount++;
        }

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          creditValue: credit,
          status: isCompleted ? 'COMPLETED' : status,
          grade: mark?.grade || null,
          gradePoint: mark?.gradePoint ?? null,
          marksObtained: mark?.marksObtained ?? null,
          percentage: mark?.percentage ?? null,
          resultStatus: mark?.resultStatus ?? null,
          completedAt: enr?.completedAt || null,
        };
      });

      return {
        id: prog.id,
        name: prog.name,
        code: prog.code,
        level: prog.level,
        isCurrent,
        totalCredits: programCredits,
        totalCourses: courses.length,
        completedCourses: programCompletedCourses,
        courses,
      };
    });

    const gpa =
      gradedCreditsCount > 0 ? Number((totalGradePoints / gradedCreditsCount).toFixed(2)) : null;

    return {
      curriculum: curriculum
        ? {
            id: curriculum.id,
            name: curriculum.name,
            versionNumber: curriculum.versionNumber,
            status: curriculum.status,
          }
        : null,
      summary: {
        currentProgram: student.program
          ? {
              id: student.program.id,
              name: student.program.name,
              code: student.program.code,
            }
          : null,
        totalCreditsRequired: totalCurriculumCredits,
        totalCreditsEarned,
        completionPercentage:
          totalCurriculumCredits > 0
            ? Math.round((totalCreditsEarned / totalCurriculumCredits) * 100)
            : 0,
        totalCourses: totalCoursesCount,
        completedCourses: completedCoursesCount,
        inProgressCourses: inProgressCoursesCount,
        cgpa: gpa,
      },
      programs,
    };
  }
}
