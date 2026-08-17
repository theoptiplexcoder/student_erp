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
}
