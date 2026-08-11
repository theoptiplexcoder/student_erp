import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service';

@Controller('academic/course-offerings/:id/enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Param('id') courseOfferingId: string, @Body() createEnrollmentDto: any) {
    return this.enrollmentsService.enrollStudent(courseOfferingId, createEnrollmentDto);
  }

  @Delete(':studentId')
  remove(@Param('id') courseOfferingId: string, @Param('studentId') studentId: string) {
    return this.enrollmentsService.removeEnrollment(courseOfferingId, studentId);
  }
}
