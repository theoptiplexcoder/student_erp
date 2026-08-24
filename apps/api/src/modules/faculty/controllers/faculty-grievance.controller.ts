import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FacultyGrievanceService } from '../services/faculty-grievance.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/grievances')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyGrievanceController {
  constructor(private readonly grievanceService: FacultyGrievanceService) {}

  @Get()
  async getGrievances(@CurrentUser() user: any) {
    return this.grievanceService.getGrievances(user.id, user.institutionId);
  }

  @Post()
  async createGrievance(@CurrentUser() user: any, @Body() data: any) {
    return this.grievanceService.createGrievance(user.id, user.institutionId, data);
  }
}
