import React from "react";
import { TimetableGrid } from "../../../components/student/timetable/timetable-grid";

export default function StudentTimetablePage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground mt-1">Manage your weekly schedule and classes.</p>
      </div>
      
      <TimetableGrid />
    </div>
  );
}
