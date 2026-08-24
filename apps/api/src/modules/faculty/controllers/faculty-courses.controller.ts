import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FacultyCoursesService } from '../services/faculty-courses.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/courses')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyCoursesController {
  constructor(private readonly coursesService: FacultyCoursesService) {}

  @Get()
  getCourses(@CurrentUser() user: any) {
    return this.coursesService.getCourses(user.id, user.institutionId);
  }

  @Get(':courseId')
  getCourseDetails(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.coursesService.getCourseDetails(user.id, user.institutionId, courseId);
  }
}
