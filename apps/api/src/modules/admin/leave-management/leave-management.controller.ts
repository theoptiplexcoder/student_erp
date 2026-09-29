import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeaveManagementService } from './leave-management.service';
import { ReviewLeaveDto } from './dto/review-leave.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/leave-management')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN', 'TENANT_ADMIN')
export class LeaveManagementController {
  constructor(private readonly service: LeaveManagementService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('leaveType') leaveType?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(
      user.institutionId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
      leaveType,
      search,
    );
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.institutionId);
  }

  @Get('substitutes')
  getAvailableSubstitutes(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('excludeFacultyId') excludeFacultyId?: string,
  ) {
    return this.service.getAvailableSubstitutes(
      user.institutionId,
      startDate,
      endDate,
      excludeFacultyId,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(user.institutionId, id);
  }

  @Get(':id/affected-sessions')
  getAffectedSessions(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('facultyId') facultyId: string,
  ) {
    return this.service.getAffectedSessions(user.institutionId, facultyId, startDate, endDate);
  }

  @Patch(':id/review')
  review(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewLeaveDto,
  ) {
    return this.service.review(user.institutionId, id, user.id, dto);
  }
}
