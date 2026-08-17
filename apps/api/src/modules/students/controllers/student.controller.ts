import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student')
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getStudentProfile(userId, institutionId);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getDashboardData(userId, institutionId);
  }

  @Get('timetable')
  async getTimetable(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getTimetable(userId, institutionId);
  }

  @Get('assignments')
  async getAssignments(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getAssignments(userId, institutionId);
  }

  @Get('examinations')
  async getExaminations(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getExaminations(userId, institutionId);
  }

  @Get('notifications')
  async getNotifications(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getNotifications(userId, institutionId);
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Request() req: any, @Param('id') id: string) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.markNotificationAsRead(id, userId, institutionId);
  }

  @Patch('notifications/read-all')
  async markAllNotificationsAsRead(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.markAllNotificationsAsRead(userId, institutionId);
  }

  @Get('calendar')
  async getCalendar(@Request() req: any) {
    const { institutionId } = req.user;
    return this.studentService.getCalendar(institutionId);
  }

  @Get('feedback')
  async getFeedback(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getFeedback(userId, institutionId);
  }

  @Get('clubs')
  async getClubs(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getClubs(userId, institutionId);
  }
}
