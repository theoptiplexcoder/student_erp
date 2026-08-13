import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/faculty')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  async getFaculty(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.facultyService.getFaculty(user.institutionId, pageNum, sizeNum, search);
  }

  @Get(':id')
  async getFacultyById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.facultyService.getFacultyById(user.institutionId, id);
  }
}
