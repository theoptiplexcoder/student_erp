import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacultyCalendarService } from '../services/faculty-calendar.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/calendar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyCalendarController {
  constructor(private readonly calendarService: FacultyCalendarService) {}

  @Get()
  getEvents(@CurrentUser() user: any) {
    return this.calendarService.getEvents(user.id, user.institutionId);
  }
}
