import React from "react";
import { MockAttendanceSession } from "@/lib/mock/student/data";
import { AttendanceSessionItem } from "./AttendanceSessionItem";
import { FilterStatus } from "./AttendanceFilters";
import { Card, CardContent } from "@student-erp/ui";

interface AttendanceSessionListProps {
  sessions: MockAttendanceSession[];
  activeFilter: FilterStatus;
}

export function AttendanceSessionList({ sessions, activeFilter }: AttendanceSessionListProps) {
  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === "ALL") return true;
    return session.status === activeFilter;
  });

  // Sort sessions: newest first, then by start time
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    
    // Simple string comparison for time works here assuming format "HH:MM AM/PM"
    // However, it's safer to convert to a comparable format or use Date objects
    const getTimeVal = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    
    return getTimeVal(b.startTime) - getTimeVal(a.startTime);
  });

  if (sortedSessions.length === 0) {
    return (
      <Card className="bg-card mt-6">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg font-medium text-foreground mb-2">No attendance records yet</p>
          <p className="text-muted-foreground">
            Attendance for this subject will appear here once your faculty records the first class attendance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card mt-6">
      <CardContent className="p-0 sm:p-6">
        <div className="flex flex-col divide-y divide-muted/60 px-4 sm:px-0">
          {sortedSessions.map((session) => (
            <AttendanceSessionItem key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
