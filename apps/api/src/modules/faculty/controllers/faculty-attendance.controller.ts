import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FacultyAttendanceService } from '../services/faculty-attendance.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/attendance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyAttendanceController {
  constructor(private readonly attendanceService: FacultyAttendanceService) {}

  @Get('eligible-students')
  getEligibleStudents(
    @CurrentUser() user: any,
    @Query('courseId') courseId: string,
    @Query('sectionId') sectionId: string,
  ) {
    return this.attendanceService.getEligibleStudents(
      user.id,
      user.institutionId,
      courseId,
      sectionId,
    );
  }

  @Post()
  saveAttendance(@CurrentUser() user: any, @Body() data: any) {
    return this.attendanceService.saveAttendance(user.id, user.institutionId, data);
  }
}
