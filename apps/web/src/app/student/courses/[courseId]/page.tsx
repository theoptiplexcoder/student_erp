'use client';

import React, { use } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Skeleton } from '@student-erp/ui';
import { ArrowLeft, BookOpen, Clock, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { CourseAttendance } from '@/components/student/courses/attendance/CourseAttendance';
import { useStudentCourse, useStudentCourseAttendance } from '@student-erp/hooks';

export default function CourseWorkspace({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course, isPending, isError } = useStudentCourse(courseId);
  const { data: attendanceData } = useStudentCourseAttendance(courseId);

  if (isPending) {
    return (
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return <div className="p-4 text-center text-red-500">Course not found.</div>;
  }

  // Calculate attendance if available
  let attendancePercent = 0;
  if (attendanceData?.records?.length > 0) {
    const present = attendanceData.records.filter(
      (r: any) => r.status === 'PRESENT' || r.status === 'LATE',
    ).length;
    attendancePercent = Math.round((present / attendanceData.records.length) * 100);
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div className="mb-2 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/student/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-3">
            <span>{course.code}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="py-6 focus-visible:ring-0 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {course.description ||
                      'This course introduces fundamental concepts and applications. By the end of this course, students will be able to apply these concepts in real-world scenarios.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  No recent announcements for this course.
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium">{attendancePercent}%</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className={`h-2 rounded-full ${attendancePercent < 75 ? 'bg-destructive' : 'bg-green-500'}`}
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="assignments"
          className="py-6 focus-visible:ring-0 focus-visible:outline-none"
        >
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {course.assignments?.length > 0 ? (
                <div className="space-y-4">
                  {course.assignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <div className="text-muted-foreground mt-1 flex items-center text-xs">
                          <Clock className="mr-1 h-3 w-3" /> Due:{' '}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={assignment.status === 'SUBMITTED' ? 'outline' : 'default'}
                      >
                        {assignment.status === 'SUBMITTED' ? 'View Submission' : 'Submit'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No assignments posted for this course yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="attendance"
          className="py-6 focus-visible:ring-0 focus-visible:outline-none"
        >
          <CourseAttendance courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
