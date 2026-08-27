import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseAssignmentsController } from './course-assignments.controller';
import { CourseAssignmentsService } from './course-assignments.service';

@Module({
  controllers: [CoursesController, CourseAssignmentsController],
  providers: [CoursesService, CourseAssignmentsService],
})
export class CoursesModule {}
