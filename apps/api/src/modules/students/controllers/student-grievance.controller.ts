import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { StudentGrievanceService } from '../services/student-grievance.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student/grievances')
@Roles(UserRole.STUDENT)
export class StudentGrievanceController {
  constructor(private readonly grievanceService: StudentGrievanceService) {}

  @Get()
  async getGrievances(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.grievanceService.getGrievances(userId, institutionId);
  }

  @Post()
  async createGrievance(@Request() req: any, @Body() data: any) {
    const { id: userId, institutionId } = req.user;
    return this.grievanceService.createGrievance(userId, institutionId, data);
  }
}
