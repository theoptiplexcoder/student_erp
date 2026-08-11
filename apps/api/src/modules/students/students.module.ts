import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentAcademicController } from './controllers/student-academic.controller';
import { StudentAcademicService } from './services/student-academic.service';
import { StudentAttendanceController } from './controllers/student-attendance.controller';
import { StudentAttendanceService } from './services/student-attendance.service';
import { PolicyFactory } from '../../common/policies/policy.factory';

@Module({
  imports: [DatabaseModule],
  controllers: [
    StudentController,
    StudentAcademicController,
    StudentAttendanceController,
  ],
  providers: [
    StudentService,
    StudentAcademicService,
    StudentAttendanceService,
    PolicyFactory,
  ],
  exports: [StudentService],
})
export class StudentsModule {}
