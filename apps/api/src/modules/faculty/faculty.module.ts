import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FacultyGrievanceController } from './controllers/faculty-grievance.controller';
import { FacultyGrievanceService } from './services/faculty-grievance.service';
import { FacultyDashboardController } from './controllers/faculty-dashboard.controller';
import { FacultyDashboardService } from './services/faculty-dashboard.service';
import { FacultyTimetableController } from './controllers/faculty-timetable.controller';
import { FacultyTimetableService } from './services/faculty-timetable.service';
import { FacultyAttendanceController } from './controllers/faculty-attendance.controller';
import { FacultyAttendanceService } from './services/faculty-attendance.service';
import { FacultyCoursesController } from './controllers/faculty-courses.controller';
import { FacultyCoursesService } from './services/faculty-courses.service';
import { FacultyExaminationsController } from './controllers/faculty-examinations.controller';
import { FacultyExaminationsService } from './services/faculty-examinations.service';
import { FacultyStudentsController } from './controllers/faculty-students.controller';
import { FacultyStudentsService } from './services/faculty-students.service';
import { FacultyProfileController } from './controllers/faculty-profile.controller';
import { FacultyProfileService } from './services/faculty-profile.service';
import { FacultyAnnouncementsController } from './controllers/faculty-announcements.controller';
import { FacultyAnnouncementsService } from './services/faculty-announcements.service';
import { FacultyCalendarController } from './controllers/faculty-calendar.controller';
import { FacultyCalendarService } from './services/faculty-calendar.service';
import { FacultyWorkspaceController } from './controllers/faculty-workspace.controller';
import { FacultyWorkspaceService } from './services/faculty-workspace.service';
import { LessonPlanController } from './controllers/lesson-plan.controller';
import { LessonPlanService } from './services/lesson-plan.service';
import { FacultySectionsController } from './controllers/faculty-sections.controller';
import { FacultySectionsService } from './services/faculty-sections.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    FacultyGrievanceController,
    FacultyDashboardController,
    FacultyTimetableController,
    FacultyAttendanceController,
    FacultyCoursesController,
    FacultyExaminationsController,
    FacultyStudentsController,
    FacultyProfileController,
    FacultyAnnouncementsController,
    FacultyCalendarController,
    FacultyWorkspaceController,
    LessonPlanController,
    FacultySectionsController,
  ],
  providers: [
    FacultyGrievanceService,
    FacultyDashboardService,
    FacultyTimetableService,
    FacultyAttendanceService,
    FacultyCoursesService,
    FacultyExaminationsService,
    FacultyStudentsService,
    FacultyProfileService,
    FacultyAnnouncementsService,
    FacultyCalendarService,
    FacultyWorkspaceService,
    LessonPlanService,
    FacultySectionsService,
  ],
})
export class FacultyModule {}
