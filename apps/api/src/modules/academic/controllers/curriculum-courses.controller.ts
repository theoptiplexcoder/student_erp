import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CurriculumCoursesService } from '../services/curriculum-courses.service';

@Controller('academic/curriculum-courses')
export class CurriculumCoursesController {
  constructor(private readonly curriculumCoursesService: CurriculumCoursesService) {}

  @Post()
  create(@Request() req: any, @Body() createCurriculumCourseDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumCoursesService.create(institutionId, createCurriculumCourseDto);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateCurriculumCourseDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumCoursesService.update(institutionId, id, updateCurriculumCourseDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumCoursesService.remove(institutionId, id);
  }
}
