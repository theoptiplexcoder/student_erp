import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@student-erp/ui';
import { currentStudent, enrolledCourses } from '@/lib/mock/student/data';
import { Button } from '@student-erp/ui';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AttendanceOverviewCard() {
  const isWarning = currentStudent.attendancePercentage < 75;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Attendance
          <span className={`text-2xl font-bold ${isWarning ? 'text-destructive' : 'text-primary'}`}>
            {currentStudent.attendancePercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="bg-muted mb-4 h-3 w-full overflow-hidden rounded-full">
          <div
            className={`h-3 rounded-full ${isWarning ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${currentStudent.attendancePercentage}%` }}
          />
        </div>

        <div className="mt-2 space-y-3">
          {enrolledCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">{course.name}</span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className={`font-medium ${course.attendance < 75 ? 'text-destructive' : ''}`}>
                  {course.attendance}%
                </span>
                {course.attendance < 75 ? (
                  <AlertTriangle className="text-destructive h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </div>
            </div>
          ))}
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
