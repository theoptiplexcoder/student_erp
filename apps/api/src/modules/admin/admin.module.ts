import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { InstitutionModule } from './institution/institution.module';
import { StudentsModule } from './students/students.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { FacultyModule } from './faculty/faculty.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProgramsModule } from './programs/programs.module';
import { CoursesModule } from './courses/courses.module';
import { BatchesModule } from './batches/batches.module';
import { SectionsModule } from './sections/sections.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TimetableModule } from './timetable/timetable.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CertificatesModule } from './certificates/certificates.module';
import { AlumniModule } from './alumni/alumni.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { DemoModule } from './demo/demo.module';
import { GrievancesModule } from './grievances/grievances.module';
import { BuildingsModule } from './buildings/buildings.module';
import { RoomsModule } from './rooms/rooms.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    DashboardModule,
    InstitutionModule,
    StudentsModule,
    AdmissionsModule,
    FacultyModule,
    DepartmentsModule,
    ProgramsModule,
    CoursesModule,
    BatchesModule,
    SectionsModule,
    SubjectsModule,
    TimetableModule,
    AttendanceModule,
    ExaminationsModule,
    PromotionsModule,
    CertificatesModule,
    AlumniModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AnnouncementsModule,
    ReportsModule,
    SettingsModule,
    DemoModule,
    GrievancesModule,
    BuildingsModule,
    RoomsModule,
    FinanceModule,
  ],
  exports: [FinanceModule],
})
export class AdminModule {}
