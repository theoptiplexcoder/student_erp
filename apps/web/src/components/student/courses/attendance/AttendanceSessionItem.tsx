import React from "react";
import { Badge } from "@student-erp/ui";
import { MockAttendanceSession } from "@/lib/mock/student/data";

interface AttendanceSessionItemProps {
  session: MockAttendanceSession;
}

export function AttendanceSessionItem({ session }: AttendanceSessionItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="default" className="w-8 h-8 flex items-center justify-center rounded-md bg-green-500 hover:bg-green-600 font-medium" aria-label="Present">P</Badge>;
      case "ABSENT":
        return <Badge variant="destructive" className="w-8 h-8 flex items-center justify-center rounded-md font-medium" aria-label="Absent">A</Badge>;
      case "LATE":
        return <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-md border-orange-500 text-orange-500 font-medium" aria-label="Late">L</Badge>;
      case "EXCUSED":
        return <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium" aria-label="Excused">E</Badge>;
      default:
        return null;
    }
  };

  const formattedDate = new Date(session.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0 border-muted/60">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-foreground text-lg">{formattedDate}</span>
        <span className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</span>
      </div>
      <div>
        {getStatusBadge(session.status)}
      </div>
    </div>
  );
}
