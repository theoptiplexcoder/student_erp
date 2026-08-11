import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CourseOfferingsService } from '../services/course-offerings.service';

@Controller('academic/course-offerings')
export class CourseOfferingsController {
  constructor(private readonly courseOfferingsService: CourseOfferingsService) {}

  @Post()
  create(@Body() createCourseOfferingDto: any) {
    return this.courseOfferingsService.create(createCourseOfferingDto);
  }

  @Get()
  findAll(@Query('courseId') courseId?: string, @Query('termId') termId?: string) {
    return this.courseOfferingsService.findAll(courseId, termId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseOfferingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseOfferingDto: any) {
    return this.courseOfferingsService.update(id, updateCourseOfferingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseOfferingsService.remove(id);
  }
}
