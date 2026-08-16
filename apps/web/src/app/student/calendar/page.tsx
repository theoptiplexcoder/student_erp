import React from 'react';
import { CalendarView } from '../../../components/student/calendar/calendar-view';

export default function StudentCalendarPage() {
  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Academic events, exams, and important deadlines.
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
