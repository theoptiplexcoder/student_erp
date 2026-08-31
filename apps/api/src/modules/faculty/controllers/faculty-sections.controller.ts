import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FacultySectionsService } from '../services/faculty-sections.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CreateAttendanceSessionDto,
  UpdateAttendanceSessionDto,
  SaveMarksDto,
} from '../dto/faculty-sections.dto';

@Controller('faculty/sections')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultySectionsController {
  constructor(private readonly sectionsService: FacultySectionsService) {}

  @Get()
  getSections(@CurrentUser() user: any) {
    return this.sectionsService.getSections(user.id, user.institutionId);
  }

  @Get(':sectionId/course/:courseId')
  getSectionDetail(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.sectionsService.getSectionDetail(user.id, user.institutionId, sectionId, courseId);
  }

  @Get(':sectionId/course/:courseId/attendance')
  getAttendanceSummary(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.sectionsService.getAttendanceSummary(
      user.id,
      user.institutionId,
      sectionId,
      courseId,
    );
  }

  @Get(':sectionId/course/:courseId/attendance/sessions')
  getAttendanceSessions(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.sectionsService.getAttendanceSessions(
      user.id,
      user.institutionId,
      sectionId,
      courseId,
    );
  }

  @Post(':sectionId/course/:courseId/attendance/sessions')
  createAttendanceSession(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateAttendanceSessionDto,
  ) {
    return this.sectionsService.createAttendanceSession(
      user.id,
      user.institutionId,
      sectionId,
      courseId,
      dto,
    );
  }

  @Patch(':sectionId/course/:courseId/attendance/sessions/:sessionId')
  updateAttendanceSession(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateAttendanceSessionDto,
  ) {
    return this.sectionsService.updateAttendanceSession(
      user.id,
      user.institutionId,
      sectionId,
      courseId,
      sessionId,
      dto,
    );
  }

  @Get(':sectionId/course/:courseId/gradebook')
  getGradebook(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.sectionsService.getGradebook(user.id, user.institutionId, sectionId, courseId);
  }

  @Post(':sectionId/course/:courseId/gradebook/marks')
  saveMarks(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
    @Body() dto: SaveMarksDto,
  ) {
    return this.sectionsService.saveMarks(user.id, user.institutionId, sectionId, courseId, dto);
  }

  @Get(':sectionId/course/:courseId/students')
  getStudents(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.sectionsService.getStudents(user.id, user.institutionId, sectionId, courseId);
  }
}
