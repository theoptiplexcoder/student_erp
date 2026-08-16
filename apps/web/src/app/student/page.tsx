import React from 'react';
import { StudentWelcomeHeader } from '../../components/student/dashboard/student-welcome-header';
import { TodayScheduleCard } from '../../components/student/dashboard/today-schedule-card';
import { AttendanceOverviewCard } from '../../components/student/dashboard/attendance-overview-card';
import { UpcomingDeadlinesCard } from '../../components/student/dashboard/upcoming-deadlines-card';
import { UpcomingEventsCard } from '../../components/student/dashboard/upcoming-events-card';
import { RecentAnnouncements } from '../../components/student/dashboard/recent-announcements';

export default function StudentDashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <StudentWelcomeHeader />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayScheduleCard />
        </div>
        <div>
          <AttendanceOverviewCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <UpcomingDeadlinesCard />
        </div>
        <div>
          <UpcomingEventsCard />
        </div>
        <div>
          <RecentAnnouncements />
        </div>
      </div>
    </div>
  );
}
