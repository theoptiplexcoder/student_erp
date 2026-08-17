'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Skeleton } from '@student-erp/ui';
import { useStudentCourses, useStudentAttendanceSummary } from '@student-erp/hooks';
import { BookOpen, User, ArrowRight } from 'lucide-react';
import { Button } from '@student-erp/ui';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { data: courses, isPending: isCoursesPending } = useStudentCourses();
  const { data: attendanceSummary, isPending: isAttendancePending } = useStudentAttendanceSummary();

  const isPending = isCoursesPending || isAttendancePending;

  if (isPending) {
    return (
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">Overview of all your enrolled courses.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Overview of all your enrolled courses.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses?.length ? (
          courses.map((course: any, idx: number) => {
            const attendance = attendanceSummary?.find((a: any) => a.course?.id === course.id);
            const attendancePercent = attendance ? Math.round(attendance.percentage) : 0;
            const colors = [
              'bg-blue-500',
              'bg-green-500',
              'bg-purple-500',
              'bg-orange-500',
              'bg-pink-500',
            ];

            return (
              <Card
                key={course.id}
                className="flex flex-col overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className={`h-2 ${colors[idx % colors.length]}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-lg leading-tight">
                      {course.name}
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs font-semibold">{course.code}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4 text-sm">
                    <div className="text-muted-foreground flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {course.creditValue} Credits
                    </div>

                    <div className="pt-2">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-medium">{attendancePercent}%</span>
                      </div>
                      <div className="bg-muted h-1.5 w-full rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${attendancePercent < 75 ? 'bg-destructive' : 'bg-green-500'}`}
                          style={{ width: `${attendancePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 pt-0 pt-4 pb-4">
                  <Button variant="ghost" className="w-full justify-between" asChild>
                    <Link href={`/student/courses/${course.id}`}>
                      Open Course <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
            You are not enrolled in any courses.
          </div>
        )}
      </div>
    </div>
  );
}
