import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentAcademicController } from './controllers/student-academic.controller';
import { StudentAcademicService } from './services/student-academic.service';
import { StudentAttendanceController } from './controllers/student-attendance.controller';
import { StudentAttendanceService } from './services/student-attendance.service';
import { StudentCertificateController } from './controllers/student-certificate.controller';
import { StudentCertificateService } from './services/student-certificate.service';
import { StudentDocumentController } from './controllers/student-document.controller';
import { StudentDocumentService } from './services/student-document.service';
import { PolicyFactory } from '../../common/policies/policy.factory';

@Module({
  imports: [DatabaseModule],
  controllers: [
    StudentController,
    StudentAcademicController,
    StudentAttendanceController,
    StudentCertificateController,
    StudentDocumentController,
  ],
  providers: [
    StudentService,
    StudentAcademicService,
    StudentAttendanceService,
    StudentCertificateService,
    StudentDocumentService,
    PolicyFactory,
  ],
  exports: [StudentService],
})
export class StudentsModule {}
