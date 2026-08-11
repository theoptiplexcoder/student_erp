import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@student-erp/ui";
import { currentStudent, enrolledCourses } from "@/lib/mock/student/data";
import { Button } from "@student-erp/ui";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AttendanceOverviewCard() {
  const isWarning = currentStudent.attendancePercentage < 75;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Attendance
          <span className={`text-2xl font-bold ${isWarning ? "text-destructive" : "text-primary"}`}>
            {currentStudent.attendancePercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className={`h-3 rounded-full ${isWarning ? "bg-destructive" : "bg-primary"}`} 
            style={{ width: `${currentStudent.attendancePercentage}%` }}
          />
        </div>
        
        <div className="space-y-3 mt-2">
          {enrolledCourses.slice(0, 3).map(course => (
            <div key={course.id} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2 text-muted-foreground">{course.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-medium ${course.attendance < 75 ? "text-destructive" : ""}`}>
                  {course.attendance}%
                </span>
                {course.attendance < 75 ? (
                  <AlertTriangle className="h-3 w-3 text-destructive" />
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
