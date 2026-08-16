import { Module } from '@nestjs/common';
import { CourseOfferingsController } from './controllers/course-offerings.controller';
import { CourseOfferingsService } from './services/course-offerings.service';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentsService } from './services/enrollments.service';
import { ProgramsController } from './controllers/programs.controller';
import { ProgramsService } from './services/programs.service';
import { CurriculumsController } from './controllers/curriculums.controller';
import { CurriculumsService } from './services/curriculums.service';
import { CurriculumTermsController } from './controllers/curriculum-terms.controller';
import { CurriculumTermsService } from './services/curriculum-terms.service';
import { CurriculumCoursesController } from './controllers/curriculum-courses.controller';
import { CurriculumCoursesService } from './services/curriculum-courses.service';

@Module({
  controllers: [
    CourseOfferingsController,
    EnrollmentsController,
    ProgramsController,
    CurriculumsController,
    CurriculumTermsController,
    CurriculumCoursesController,
  ],
  providers: [
    CourseOfferingsService,
    EnrollmentsService,
    ProgramsService,
    CurriculumsService,
    CurriculumTermsService,
    CurriculumCoursesService,
  ],
})
export class AcademicModule {}
