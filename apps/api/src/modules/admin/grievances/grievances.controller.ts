import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminGrievancesService } from './grievances.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/grievances')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN', 'TENANT_ADMIN')
export class AdminGrievancesController {
  constructor(private readonly grievancesService: AdminGrievancesService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('source') source?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.grievancesService.findAll(
      user.institutionId,
      pageNum,
      sizeNum,
      source,
      category,
      status,
      search,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.grievancesService.findOne(user.institutionId, id);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body('status') status: string) {
    return this.grievancesService.updateStatus(user.institutionId, id, status);
  }
}
