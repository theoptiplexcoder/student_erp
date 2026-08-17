import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StudentAcademicService } from '../services/student-academic.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student/academic')
@Roles(UserRole.STUDENT)
export class StudentAcademicController {
  constructor(private readonly academicService: StudentAcademicService) {}

  @Get('courses')
  async getCourses(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.academicService.getCourses(userId, institutionId);
  }

  @Get('courses/:courseId')
  async getCourseDetails(@Request() req: any, @Param('courseId') courseId: string) {
    const { id: userId, institutionId } = req.user;
    return this.academicService.getCourseDetails(userId, institutionId, courseId);
  }
}
