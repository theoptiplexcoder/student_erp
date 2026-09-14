import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { FacultyProfileService } from '../services/faculty-profile.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { UpdateFacultyProfileDto } from '../dto/update-faculty-profile.dto';

@Controller('faculty/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyProfileController {
  constructor(private readonly profileService: FacultyProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id, user.institutionId);
  }

  @Patch()
  updateProfile(@CurrentUser() user: any, @Body() data: UpdateFacultyProfileDto) {
    return this.profileService.updateProfile(user.id, user.institutionId, data);
  }
}
