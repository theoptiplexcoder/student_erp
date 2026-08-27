import { Controller, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('academic/course-offerings/:id/enrollments')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Param('id') courseOfferingId: string,
    @Body() createEnrollmentDto: any,
  ) {
    createEnrollmentDto.institutionId = user.institutionId;
    return this.enrollmentsService.enrollStudent(
      user.institutionId,
      courseOfferingId,
      createEnrollmentDto,
    );
  }

  @Delete(':studentId')
  remove(
    @CurrentUser() user: any,
    @Param('id') courseOfferingId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.enrollmentsService.removeEnrollment(
      user.institutionId,
      courseOfferingId,
      studentId,
    );
  }
}
