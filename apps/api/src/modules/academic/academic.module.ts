import { Module } from '@nestjs/common';
import { CourseOfferingsController } from './controllers/course-offerings.controller';
import { CourseOfferingsService } from './services/course-offerings.service';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentsService } from './services/enrollments.service';

@Module({
  controllers: [CourseOfferingsController, EnrollmentsController],
  providers: [CourseOfferingsService, EnrollmentsService]
})
export class AcademicModule {}
