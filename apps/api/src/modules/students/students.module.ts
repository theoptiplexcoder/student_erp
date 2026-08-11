import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentAcademicController } from './controllers/student-academic.controller';
import { StudentAcademicService } from './services/student-academic.service';
import { StudentAttendanceController } from './controllers/student-attendance.controller';
import { StudentAttendanceService } from './services/student-attendance.service';
import { StudentExaminationController } from './controllers/student-examination.controller';
import { StudentExaminationService } from './services/student-examination.service';
import { StudentProfileController } from './controllers/student-profile.controller';
import { StudentProfileService } from './services/student-profile.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    StudentController,
    StudentAcademicController,
    StudentAttendanceController,
    StudentExaminationController,
    StudentProfileController,
  ],
  providers: [
    StudentService,
    StudentAcademicService,
    StudentAttendanceService,
    StudentExaminationService,
    StudentProfileService,
  ],
  exports: [StudentService],
})
export class StudentsModule {}
