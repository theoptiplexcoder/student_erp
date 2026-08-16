import React from 'react';
import { TimetableGrid } from '../../../components/student/timetable/timetable-grid';

export default function StudentTimetablePage() {
  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground mt-1">Manage your weekly schedule and classes.</p>
      </div>

      <TimetableGrid />
    </div>
  );
}
