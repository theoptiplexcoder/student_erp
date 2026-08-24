import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacultyProfileService } from '../services/faculty-profile.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyProfileController {
  constructor(private readonly profileService: FacultyProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id, user.institutionId);
  }
}
