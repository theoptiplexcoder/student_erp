import React from 'react';
import { Card, CardContent } from '@student-erp/ui';

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
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Attendance
            </h3>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-bold tracking-tight ${isBelowThreshold ? 'text-destructive' : 'text-foreground'}`}
              >
                {percentage}%
              </span>
            </div>
            <div className="mt-1 text-sm">
              <span className="text-muted-foreground">Threshold: {threshold}% • </span>
              <span
                className={`font-medium ${isBelowThreshold ? 'text-destructive' : 'text-green-600'}`}
              >
                Status: {isBelowThreshold ? 'Below Required Attendance' : 'Good'}
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 md:w-auto md:grid-cols-4">
            <div className="bg-muted/50 flex flex-col items-center rounded-lg p-3">
              <span className="text-2xl font-semibold text-green-600">{present}</span>
              <span className="text-muted-foreground text-xs font-medium uppercase">Present</span>
            </div>
            <div className="bg-muted/50 flex flex-col items-center rounded-lg p-3">
              <span className="text-destructive text-2xl font-semibold">{absent}</span>
              <span className="text-muted-foreground text-xs font-medium uppercase">Absent</span>
            </div>
            <div className="bg-muted/50 flex flex-col items-center rounded-lg p-3">
              <span className="text-2xl font-semibold text-orange-500">{late}</span>
              <span className="text-muted-foreground text-xs font-medium uppercase">Late</span>
            </div>
            <div className="bg-muted/50 flex flex-col items-center rounded-lg p-3">
              <span className="text-2xl font-semibold">{totalSessions}</span>
              <span className="text-muted-foreground text-xs font-medium uppercase">Total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
