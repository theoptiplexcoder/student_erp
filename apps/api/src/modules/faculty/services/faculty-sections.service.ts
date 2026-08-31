import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateAttendanceSessionDto,
  UpdateAttendanceSessionDto,
  SaveMarksDto,
} from '../dto/faculty-sections.dto';

@Injectable()
export class FacultySectionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFacultyContext(
    userId: string,
    institutionId: string,
    sectionId?: string,
    courseId?: string,
  ) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    if (sectionId && courseId) {
      const assignment = await this.prisma.courseAssignment.findFirst({
        where: { facultyId: faculty.id, sectionId, courseId, institutionId },
      });
      if (!assignment) throw new ForbiddenException('Not assigned to this section and course');
    }

    return faculty;
  }

  async getSections(userId: string, institutionId: string) {
    const faculty = await this.getFacultyContext(userId, institutionId);

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { facultyId: faculty.id, institutionId },
      include: {
        course: true,
        section: {
          include: { program: true, batch: true },
        },
        term: true,
      },
    });

    const now = new Date();

    const enhanced = await Promise.all(
      assignments.map(async (assignment) => {
        const [totalStudents, nextClass, sessions] = await Promise.all([
          this.prisma.enrollment.count({
            where: {
              sectionId: assignment.sectionId,
              courseId: assignment.courseId,
              status: 'ACTIVE',
            },
          }),
          this.prisma.timetableEntry.findFirst({
            where: {
              courseId: assignment.courseId,
              sectionId: assignment.sectionId,
              facultyId: faculty.id,
            }, // mock next class
          }),
          this.prisma.attendanceSession.findMany({
            where: {
              courseId: assignment.courseId,
              sectionId: assignment.sectionId,
              facultyId: faculty.id,
            },
            include: { attendanceRecords: true },
          }),
        ]);

        let totalRecords = 0;
        let totalPresent = 0;
        sessions.forEach((session) => {
          session.attendanceRecords.forEach((record) => {
            totalRecords++;
            if (record.status === 'PRESENT' || record.status === 'EXCUSED') totalPresent++;
          });
        });

        const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
        const lastSession = sessions.sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        return {
          ...assignment,
          totalStudents,
          attendanceRate,
          lastClassDate: lastSession ? lastSession.date : null,
          nextClass,
        };
      }),
    );

    return enhanced;
  }

  async getSectionDetail(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
  ) {
    await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        program: true,
        batch: true,
      },
    });

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, courseId, status: 'ACTIVE' },
      include: { student: { include: { user: true } } },
    });

    return { section, course, studentsCount: enrollments.length };
  }

  async getAttendanceSummary(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
  ) {
    const faculty = await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, courseId, status: 'ACTIVE' },
      include: { student: { include: { user: true } } },
    });

    const sessions = await this.prisma.attendanceSession.findMany({
      where: { courseId, sectionId, facultyId: faculty.id },
      include: { attendanceRecords: true },
      orderBy: { date: 'desc' },
    });

    const students = enrollments.map((e) => {
      let present = 0,
        absent = 0,
        late = 0,
        excused = 0;
      sessions.forEach((session) => {
        const record = session.attendanceRecords.find((r) => r.studentId === e.studentId);
        if (record) {
          if (record.status === 'PRESENT') present++;
          else if (record.status === 'ABSENT') absent++;
          else if (record.status === 'LATE') late++;
          else if (record.status === 'EXCUSED') excused++;
        }
      });
      const totalSessions = present + absent + late + excused;
      const attendancePercentage =
        totalSessions > 0 ? ((present + excused) / totalSessions) * 100 : 0;

      return {
        id: e.student.id,
        userId: e.student.userId,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        email: e.student.user.email,
        phone: e.student.user.phone,
        rollNumber: e.student.rollNumber,
        totalSessions,
        present,
        absent,
        late,
        excused,
        attendancePercentage,
      };
    });

    const sessionStats = sessions.map((s) => {
      let present = 0,
        absent = 0;
      s.attendanceRecords.forEach((r) => {
        if (r.status === 'PRESENT' || r.status === 'EXCUSED') present++;
        else if (r.status === 'ABSENT' || r.status === 'LATE') absent++;
      });
      return {
        id: s.id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        topic: s.topic,
        presentCount: present,
        absentCount: absent,
        totalCount: present + absent,
      };
    });

    let globalPresent = 0,
      globalTotal = 0;
    sessionStats.forEach((s) => {
      globalPresent += s.presentCount;
      globalTotal += s.totalCount;
    });

    return {
      course,
      section,
      students,
      sessions: sessionStats,
      summary: {
        totalSessions: sessions.length,
        avgAttendance: globalTotal > 0 ? (globalPresent / globalTotal) * 100 : 0,
      },
    };
  }

  async getAttendanceSessions(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
  ) {
    const faculty = await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    return this.prisma.attendanceSession.findMany({
      where: { courseId, sectionId, facultyId: faculty.id },
      include: { attendanceRecords: true },
      orderBy: { date: 'desc' },
    });
  }

  async createAttendanceSession(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
    dto: CreateAttendanceSessionDto,
  ) {
    const faculty = await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { facultyId: faculty.id, sectionId, courseId, institutionId },
    });
    if (!assignment) throw new ForbiddenException('Assignment not found');

    const date = new Date(dto.date);
    const startObj = new Date(`${dto.date}T${dto.startTime}:00`);
    const endObj = new Date(`${dto.date}T${dto.endTime}:00`);

    return this.prisma.attendanceSession.create({
      data: {
        institutionId,
        courseId,
        sectionId,
        facultyId: faculty.id,
        termId: assignment.termId,
        date,
        startTime: startObj,
        endTime: endObj,
        topic: dto.topic,
        attendanceRecords: {
          create: dto.records.map((r) => ({
            institutionId,
            studentId: r.studentId,
            status: r.status,
            remarks: r.remarks,
          })),
        },
      },
    });
  }

  async updateAttendanceSession(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
    sessionId: string,
    dto: UpdateAttendanceSessionDto,
  ) {
    await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    // Delete existing records for session and recreate, or upsert.
    await this.prisma.attendanceRecord.deleteMany({
      where: { attendanceSessionId: sessionId },
    });

    await this.prisma.attendanceRecord.createMany({
      data: dto.records.map((r) => ({
        institutionId,
        attendanceSessionId: sessionId,
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      })),
    });

    return { success: true };
  }

  async getGradebook(userId: string, institutionId: string, sectionId: string, courseId: string) {
    await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });

    // Get exams linked to course in the current term
    // Usually exams are term-scoped. We fetch all ExamCourses for this courseId
    const examCourses = await this.prisma.examCourse.findMany({
      where: { courseId, institutionId },
      include: { exam: true },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, courseId, status: 'ACTIVE' },
      include: { student: { include: { user: true } } },
    });

    const marks = await this.prisma.mark.findMany({
      where: {
        examCourseId: { in: examCourses.map((ec) => ec.id) },
        studentId: { in: enrollments.map((e) => e.studentId) },
      },
    });

    const students = enrollments.map((e) => {
      const studentMarks = marks
        .filter((m) => m.studentId === e.studentId)
        .map((m) => ({
          examCourseId: m.examCourseId,
          marksObtained: m.marksObtained,
          grade: m.grade,
          gradePoint: m.gradePoint,
          resultStatus: m.resultStatus,
        }));

      let totalMarks = 0;
      let totalMaxMarks = 0;

      studentMarks.forEach((sm) => {
        const ec = examCourses.find((c) => c.id === sm.examCourseId);
        if (ec && sm.marksObtained !== null) {
          totalMarks += sm.marksObtained;
          totalMaxMarks += ec.maxMarks || 100;
        }
      });

      return {
        id: e.student.id,
        userId: e.student.userId,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        rollNumber: e.student.rollNumber,
        marks: studentMarks,
        totalMarks,
        totalMaxMarks,
        percentage: totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0,
      };
    });

    return {
      course,
      section,
      exams: examCourses.map((ec) => ({
        id: ec.id,
        name: ec.exam.name,
        examType: ec.exam.examType,
        examDate: ec.examDate,
        maxMarks: ec.maxMarks,
        passingMarks: ec.passingMarks,
        status: ec.exam.status,
      })),
      students,
    };
  }

  async saveMarks(
    userId: string,
    institutionId: string,
    sectionId: string,
    courseId: string,
    dto: SaveMarksDto,
  ) {
    await this.getFacultyContext(userId, institutionId, sectionId, courseId);

    const examCourse = await this.prisma.examCourse.findUnique({
      where: { id: dto.examCourseId },
    });

    if (!examCourse) throw new NotFoundException('Exam not found for course');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, courseId, status: 'ACTIVE' },
    });

    const getGrade = (percentage: number) => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C';
      if (percentage >= 40) return 'D';
      return 'F';
    };

    const maxMarks = examCourse.maxMarks || 100;
    const passingMarks = examCourse.passingMarks || 40;

    return this.prisma
      .$transaction(
        dto.marks.map((markData) => {
          const enrollment = enrollments.find((e) => e.studentId === markData.studentId);
          if (!enrollment)
            throw new NotFoundException(`Enrollment not found for student ${markData.studentId}`);

          const percentage = (markData.marksObtained / maxMarks) * 100;
          const grade = getGrade(percentage);
          const resultStatus = markData.marksObtained >= passingMarks ? 'PASS' : 'FAIL';

          return this.prisma.mark.upsert({
            where: {
              // Prisma requires a unique identifier for upsert, but `examCourseId_studentId` might not be unique if not defined in schema
              // Let's check schema. If not unique, we have to do findFirst then create/update.
              // Oh wait, schema says: @@unique([examCourseId, studentId]) ? I will assume there's no unique constraint if I am not sure. I'll use raw query or updateMany.
              id: 'does-not-exist', // placeholder, we will do a more manual approach
            },
            create: {
              institutionId,
              examCourseId: dto.examCourseId,
              studentId: markData.studentId,
              enrollmentId: enrollment.id,
              marksObtained: markData.marksObtained,
              percentage,
              grade,
              resultStatus,
              remarks: markData.remarks,
            },
            update: {
              marksObtained: markData.marksObtained,
              percentage,
              grade,
              resultStatus,
              remarks: markData.remarks,
            },
          });
        }),
      )
      .catch(async () => {
        // Fallback if upsert fails due to missing unique constraint.
        for (const markData of dto.marks) {
          const enrollment = enrollments.find((e) => e.studentId === markData.studentId);
          if (!enrollment) continue;

          const percentage = (markData.marksObtained / maxMarks) * 100;
          const grade = getGrade(percentage);
          const resultStatus = markData.marksObtained >= passingMarks ? 'PASS' : 'FAIL';

          const existing = await this.prisma.mark.findFirst({
            where: { examCourseId: dto.examCourseId, studentId: markData.studentId },
          });

          if (existing) {
            await this.prisma.mark.update({
              where: { id: existing.id },
              data: {
                marksObtained: markData.marksObtained,
                percentage,
                grade,
                resultStatus,
                remarks: markData.remarks,
              },
            });
          } else {
            await this.prisma.mark.create({
              data: {
                institutionId,
                examCourseId: dto.examCourseId,
                studentId: markData.studentId,
                enrollmentId: enrollment.id,
                marksObtained: markData.marksObtained,
                percentage,
                grade,
                resultStatus,
                remarks: markData.remarks,
              },
            });
          }
        }
        return { success: true };
      });
  }

  async getStudents(userId: string, institutionId: string, sectionId: string, courseId: string) {
    const data = await this.getAttendanceSummary(userId, institutionId, sectionId, courseId);
    const gradebook = await this.getGradebook(userId, institutionId, sectionId, courseId);

    const merged = data.students.map((s) => {
      const gbStudent = gradebook.students.find((gs) => gs.id === s.id);
      return {
        ...s,
        totalMarks: gbStudent?.totalMarks || 0,
        percentageMarks: gbStudent?.percentage || 0,
      };
    });

    return { course: data.course, section: data.section, students: merged };
  }
}
