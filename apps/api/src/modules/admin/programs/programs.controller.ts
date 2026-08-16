import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/programs')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async getPrograms(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.programsService.getPrograms(user.institutionId, pageNum, sizeNum, search);
  }
}
