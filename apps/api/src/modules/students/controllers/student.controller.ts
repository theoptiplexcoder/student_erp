import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student')
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getStudentProfile(authUserId, institutionId);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getDashboardData(authUserId, institutionId);
  }

  @Get('timetable')
  async getTimetable(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getTimetable(authUserId, institutionId);
  }

  @Get('assignments')
  async getAssignments(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getAssignments(authUserId, institutionId);
  }

  @Get('examinations')
  async getExaminations(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getExaminations(authUserId, institutionId);
  }

  @Get('notifications')
  async getNotifications(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getNotifications(authUserId, institutionId);
  }

  @Get('calendar')
  async getCalendar(@Request() req: any) {
    const { institutionId } = req.user;
    return this.studentService.getCalendar(institutionId);
  }

  @Get('feedback')
  async getFeedback(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getFeedback(authUserId, institutionId);
  }

  @Get('clubs')
  async getClubs(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.studentService.getClubs(authUserId, institutionId);
  }
}
