import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';

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

  @Post()
  async createFaculty(@CurrentUser() user: any, @Body() data: CreateFacultyDto) {
    return this.facultyService.createFaculty(user.institutionId, data);
  }

  @Patch(':id')
  async updateFaculty(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: UpdateFacultyDto,
  ) {
    return this.facultyService.updateFaculty(user.institutionId, id, data);
  }

  @Delete(':id')
  async deleteFaculty(@CurrentUser() user: any, @Param('id') id: string) {
    return this.facultyService.deleteFaculty(user.institutionId, id);
  }

  @Get(':id/assignments')
  async getFacultyAssignments(@CurrentUser() user: any, @Param('id') id: string) {
    return this.facultyService.getFacultyAssignments(user.institutionId, id);
  }

  @Post(':id/assignments')
  async assignFacultyClass(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: CreateCourseAssignmentDto,
  ) {
    return this.facultyService.assignFacultyClass(user.institutionId, id, data);
  }
}
