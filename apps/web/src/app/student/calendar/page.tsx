import React from "react";
import { CalendarView } from "../../../components/student/calendar/calendar-view";

export default function StudentCalendarPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Academic events, exams, and important deadlines.</p>
      </div>
      
      <CalendarView />
    </div>
  );
}
