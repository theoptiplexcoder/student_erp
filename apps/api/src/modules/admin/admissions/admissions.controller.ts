import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { CreateDirectAdmissionDto } from './dto/create-direct-admission.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/admissions')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.admissionsService.getStats(req.user.institutionId);
  }

  @Get('recent')
  async getRecent(@Request() req: any) {
    return this.admissionsService.getRecentAdmissions(req.user.institutionId);
  }

  @Post('direct-students')
  async createDirectAdmission(@Request() req: any, @Body() data: CreateDirectAdmissionDto) {
    // Make sure we pass authUserId for the audit log
    // and potentially creating the student's auth account if integration requires
    return this.admissionsService.createDirectAdmission(req.user.institutionId, req.user.id, data);
  }
}
