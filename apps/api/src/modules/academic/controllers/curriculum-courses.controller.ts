import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CurriculumCoursesService } from '../services/curriculum-courses.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { CreateCurriculumCourseDto, UpdateCurriculumCourseDto } from '../dto/curriculum-course.dto';

@Controller('academic/curriculum-courses')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CurriculumCoursesController {
  constructor(private readonly curriculumCoursesService: CurriculumCoursesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCurriculumCourseDto) {
    return this.curriculumCoursesService.create(user.institutionId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCurriculumCourseDto,
  ) {
    return this.curriculumCoursesService.update(user.institutionId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.curriculumCoursesService.remove(user.institutionId, id);
  }
}
