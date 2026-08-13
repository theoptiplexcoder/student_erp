import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { UpdateInstitutionSettingsDto } from './dto/update-institution-settings.dto';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/academic-year.dto';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/institution')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.institutionService.getProfile(user.institutionId);
  }

  @Put('profile')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateInstitutionDto) {
    return this.institutionService.updateProfile(user.institutionId, dto);
  }

  @Get('settings')
  getSettings(@CurrentUser() user: any) {
    return this.institutionService.getSettings(user.institutionId);
  }

  @Put('settings')
  updateSettings(@CurrentUser() user: any, @Body() dto: UpdateInstitutionSettingsDto) {
    return this.institutionService.updateSettings(user.institutionId, dto);
  }

  // Academic Year Endpoints
  @Get('academic-years')
  getAcademicYears(@CurrentUser() user: any) {
    return this.institutionService.getAcademicYears(user.institutionId);
  }

  @Get('academic-years/:id')
  getAcademicYear(@CurrentUser() user: any, @Param('id') id: string) {
    return this.institutionService.getAcademicYear(user.institutionId, id);
  }

  @Post('academic-years')
  createAcademicYear(@CurrentUser() user: any, @Body() dto: CreateAcademicYearDto) {
    return this.institutionService.createAcademicYear(user.institutionId, dto);
  }

  @Put('academic-years/:id')
  updateAcademicYear(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.institutionService.updateAcademicYear(user.institutionId, id, dto);
  }

  @Delete('academic-years/:id')
  deleteAcademicYear(@CurrentUser() user: any, @Param('id') id: string) {
    return this.institutionService.deleteAcademicYear(user.institutionId, id);
  }

  // Calendar Event Endpoints
  @Get('calendar-events')
  getCalendarEvents(@CurrentUser() user: any) {
    return this.institutionService.getCalendarEvents(user.institutionId);
  }

  @Get('calendar-events/:id')
  getCalendarEvent(@CurrentUser() user: any, @Param('id') id: string) {
    return this.institutionService.getCalendarEvent(user.institutionId, id);
  }

  @Post('calendar-events')
  createCalendarEvent(@CurrentUser() user: any, @Body() dto: CreateCalendarEventDto) {
    return this.institutionService.createCalendarEvent(user.institutionId, dto);
  }

  @Put('calendar-events/:id')
  updateCalendarEvent(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.institutionService.updateCalendarEvent(user.institutionId, id, dto);
  }

  @Delete('calendar-events/:id')
  deleteCalendarEvent(@CurrentUser() user: any, @Param('id') id: string) {
    return this.institutionService.deleteCalendarEvent(user.institutionId, id);
  }
}
