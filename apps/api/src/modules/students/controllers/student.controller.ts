import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';

@Controller('student')
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.studentService.getStudentProfile(userId, institutionId);
  }

  @Patch('me')
  async updateProfile(@Request() req: any, @Body() updateDto: UpdateStudentProfileDto) {
    const { id: userId, institutionId } = req.user;

    // Explicit userId-to-token subject validation
    const payloadUserId = (updateDto as any).userId;
    if (payloadUserId && payloadUserId !== userId) {
      throw new ForbiddenException('Cannot update profile for a different user');
    }

    return this.studentService.updateStudentProfile(userId, institutionId, updateDto);
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
