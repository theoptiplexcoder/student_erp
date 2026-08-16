import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@student-erp/ui';
import { enrolledCourses, upcomingDeadlines } from '@/lib/mock/student/data';
import { ArrowLeft, BookOpen, Clock, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { CourseAttendance } from '@/components/student/courses/attendance/CourseAttendance';

export default async function CourseWorkspace({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = enrolledCourses.find((c) => c.id === courseId) || enrolledCourses[0];

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
            <span>•</span>
            <span className="flex items-center">
              <User className="mr-1 h-3.5 w-3.5" /> {course.faculty}
            </span>
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
            value="resources"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Resources
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
          <TabsTrigger
            value="grades"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Grades
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
                    This course introduces fundamental concepts and applications. By the end of this
                    course, students will be able to apply these concepts in real-world scenarios.
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
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium">{course.attendance}%</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className={`h-2 rounded-full ${course.attendance < 75 ? 'bg-destructive' : 'bg-green-500'}`}
                        style={{ width: `${course.attendance}%` }}
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
              {upcomingDeadlines.filter((d) => d.course === course.code).length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines
                    .filter((d) => d.course === course.code)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h4 className="font-medium">{assignment.title}</h4>
                          <div className="text-muted-foreground mt-1 flex items-center text-xs">
                            <Clock className="mr-1 h-3 w-3" /> Due: {assignment.dueDate}
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

        {/* Other tabs would follow similar patterns */}
      </Tabs>
    </div>
  );
}
