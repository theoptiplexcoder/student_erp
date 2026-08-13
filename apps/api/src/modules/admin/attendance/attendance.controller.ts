import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/attendance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('sessions')
  async getSessions(
    @Request() req: any,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('courseId') courseId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('facultyId') facultyId?: string,
    @Query('date') date?: string,
  ) {
    const institutionId = req.user.institutionId;
    return this.attendanceService.findAllSessions(
      institutionId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 50,
      { courseId, sectionId, facultyId, date },
    );
  }

  @Get('sessions/:id')
  async getSessionById(@Request() req: any, @Param('id') id: string) {
    return this.attendanceService.getSessionById(req.user.institutionId, id);
  }
}
