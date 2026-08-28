import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { CreateDirectAdmissionDto } from './dto/create-direct-admission.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
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

  @Post('applications')
  async createApplication(@Request() req: any, @Body() data: CreateApplicationDto) {
    return this.admissionsService.createApplication(req.user.institutionId, data);
  }

  @Get('drafts')
  async getDrafts(@Request() req: any) {
    return this.admissionsService.getDrafts(req.user.institutionId, req.user.id);
  }

  @Get('drafts/:id')
  async getDraft(@Request() req: any, @Param('id') id: string) {
    return this.admissionsService.getDraft(req.user.institutionId, req.user.id, id);
  }

  @Put('drafts/:id')
  async upsertDraft(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.admissionsService.upsertDraft(req.user.institutionId, req.user.id, id, data);
  }

  @Delete('drafts/:id')
  async deleteDraft(@Request() req: any, @Param('id') id: string) {
    return this.admissionsService.deleteDraft(req.user.institutionId, req.user.id, id);
  }

  @Get('applications')
  async getApplications(@Request() req: any) {
    return this.admissionsService.getApplications(req.user.institutionId);
  }

  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateApplicationDto,
  ) {
    return this.admissionsService.updateApplicationStatus(req.user.institutionId, id, data);
  }

  @Post('applications/:id/convert')
  async convertApplicantToStudent(@Request() req: any, @Param('id') id: string) {
    return this.admissionsService.convertApplicantToStudent(
      req.user.institutionId,
      req.user.id,
      id,
    );
  }

  @Post('direct-students')
  async createDirectAdmission(@Request() req: any, @Body() data: CreateDirectAdmissionDto) {
    // Make sure we pass authUserId for the audit log
    // and potentially creating the student's auth account if integration requires
    return this.admissionsService.createDirectAdmission(req.user.institutionId, req.user.id, data);
  }
}
