import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StudentAttendanceService } from '../services/student-attendance.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student/attendance')
@Roles(UserRole.STUDENT)
export class StudentAttendanceController {
  constructor(private readonly attendanceService: StudentAttendanceService) {}

  @Get()
  async getAttendanceSummary(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.attendanceService.getAttendanceSummary(userId, institutionId);
  }

  @Get(':courseId')
  async getCourseAttendance(@Request() req: any, @Param('courseId') courseId: string) {
    const { id: userId, institutionId } = req.user;
    return this.attendanceService.getCourseAttendance(userId, institutionId, courseId);
  }
}
