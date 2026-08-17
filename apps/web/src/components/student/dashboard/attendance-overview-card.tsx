'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Skeleton,
  Button,
} from '@student-erp/ui';
import { useStudentAttendanceSummary } from '@student-erp/hooks';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AttendanceOverviewCard() {
  const { data: attendanceData, isPending, isError } = useStudentAttendanceSummary();

  if (isPending) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !attendanceData) {
    return null;
  }

  const totalClasses = attendanceData.reduce(
    (acc: number, curr: any) => acc + curr.totalSessions,
    0,
  );
  const totalPresent = attendanceData.reduce(
    (acc: number, curr: any) => acc + curr.presentSessions,
    0,
  );
  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const isWarning = overallPercentage < 75;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Attendance
          <span className={`text-2xl font-bold ${isWarning ? 'text-destructive' : 'text-primary'}`}>
            {overallPercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="bg-muted mb-4 h-3 w-full overflow-hidden rounded-full">
          <div
            className={`h-3 rounded-full ${isWarning ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        <div className="mt-2 space-y-3">
          {attendanceData.slice(0, 3).map((item: any) => {
            const courseAttendance = Math.round(item.percentage);
            const itemIsWarning = courseAttendance < 75;
            return (
              <div key={item.course.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate pr-2">{item.course.name}</span>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className={`font-medium ${itemIsWarning ? 'text-destructive' : ''}`}>
                    {courseAttendance}%
                  </span>
                  {itemIsWarning ? (
                    <AlertTriangle className="text-destructive h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="ghost" className="w-full text-xs" asChild>
          <Link href="/student/courses?tab=attendance">View Detailed Attendance</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
