import React from "react";
import { Card, CardContent } from "@student-erp/ui";

interface AttendanceSummaryProps {
  percentage: number;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  threshold?: number;
}

export function AttendanceSummary({
  percentage,
  totalSessions,
  present,
  absent,
  late,
  excused,
  threshold = 75,
}: AttendanceSummaryProps) {
  const isBelowThreshold = percentage < threshold;

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Attendance</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold tracking-tight ${isBelowThreshold ? 'text-destructive' : 'text-foreground'}`}>
                {percentage}%
              </span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Threshold: {threshold}% • </span>
              <span className={`font-medium ${isBelowThreshold ? 'text-destructive' : 'text-green-600'}`}>
                Status: {isBelowThreshold ? "Below Required Attendance" : "Good"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl font-semibold text-green-600">{present}</span>
              <span className="text-xs text-muted-foreground uppercase font-medium">Present</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl font-semibold text-destructive">{absent}</span>
              <span className="text-xs text-muted-foreground uppercase font-medium">Absent</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl font-semibold text-orange-500">{late}</span>
              <span className="text-xs text-muted-foreground uppercase font-medium">Late</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl font-semibold">{totalSessions}</span>
              <span className="text-xs text-muted-foreground uppercase font-medium">Total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
