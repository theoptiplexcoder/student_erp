import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FacultyAnnouncementsService } from '../services/faculty-announcements.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/announcements')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyAnnouncementsController {
  constructor(private readonly announcementsService: FacultyAnnouncementsService) {}

  @Get()
  getAnnouncements(@CurrentUser() user: any) {
    return this.announcementsService.getAnnouncements(user.id, user.institutionId);
  }

  @Post()
  createAnnouncement(@CurrentUser() user: any, @Body() data: any) {
    return this.announcementsService.createAnnouncement(user.id, user.institutionId, data);
  }
}
