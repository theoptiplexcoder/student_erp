import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FacultyTimetableService } from '../services/faculty-timetable.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/timetable')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyTimetableController {
  constructor(private readonly timetableService: FacultyTimetableService) {}

  @Get()
  getTimetable(@CurrentUser() user: any) {
    return this.timetableService.getTimetable(user.id, user.institutionId);
  }

  @Get('session')
  getSession(
    @CurrentUser() user: any,
    @Query('courseId') courseId: string,
    @Query('sectionId') sectionId: string,
    @Query('date') date: string,
  ) {
    return this.timetableService.getSession(user.id, user.institutionId, courseId, sectionId, date);
  }
}
