'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@student-erp/ui';
import { useFacultyDashboard } from '@student-erp/hooks';
import {
  Loader2,
  Calendar,
  BookOpen,
  AlertCircle,
  Users,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { TodaysScheduleCalendar } from '@/components/faculty/dashboard/todays-schedule-calendar';

export default function FacultyDashboardPage() {
  const { data, isLoading, error } = useFacultyDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <AlertCircle className="text-destructive h-8 w-8" />
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const { faculty, courseAssignments, todaysClasses, announcements } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {faculty.name}</h1>
        <p className="text-muted-foreground">{faculty.department} Department</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysClasses.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <TodaysScheduleCalendar classes={todaysClasses} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Classes & Sections</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/faculty/courses">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courseAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No courses assigned.</p>
            ) : (
              <div className="space-y-3">
                {courseAssignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                        <BookOpen className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{assignment.course.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {assignment.course.code} · Section {assignment.section.name}
                          {assignment.term && ` · ${assignment.term.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.section.enrollments?.length ?? 0}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/faculty/courses/${assignment.courseId}?tab=students`}>
                          Roster
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/faculty/timetable/session?courseId=${assignment.courseId}&sectionId=${assignment.sectionId}&date=${format(new Date(), 'yyyy-MM-dd')}`}
                        >
                          <ClipboardCheck className="mr-1 h-3 w-3" />
                          Attendance
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.atRiskStudents || data.atRiskStudents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No at-risk students currently.</p>
            ) : (
              <div className="space-y-4">
                {data.atRiskStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-muted-foreground text-sm">{student.courseCode}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="destructive">{student.attendance}%</Badge>
                      <Button size="sm" variant="outline">
                        Alert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent announcements.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="font-medium">{ann.title}</p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{ann.content}</p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {format(new Date(ann.publishedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
