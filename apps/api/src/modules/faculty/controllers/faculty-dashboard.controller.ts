import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacultyDashboardService } from '../services/faculty-dashboard.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/dashboard')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyDashboardController {
  constructor(private readonly dashboardService: FacultyDashboardService) {}

  @Get()
  getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getDashboard(user.id, user.institutionId);
  }
}
