'use client';

import React, { use } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@student-erp/ui';
import { useFacultyCourseDetails } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Users, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function FacultyCourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const { data: assignment, isLoading, error } = useFacultyCourseDetails(courseId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load course details or unauthorized.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const { course, section, term } = assignment;
  const enrollments = section.enrollments || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground">
            {course.code} • {section.name} • {term?.name || 'Current Term'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students ({enrollments.length})</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground">
                    {course.description || 'No description provided.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Credits</p>
                    <p>{course.creditValue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Course Type</p>
                    <p>{course.courseType || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Max Marks</p>
                    <p>{course.maxMarks || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Passing Marks</p>
                    <p>{course.passingMarks || 'N/A'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="students" className="mt-6">
                <div className="space-y-4">
                  {enrollments.length === 0 ? (
                    <p className="text-muted-foreground">No students enrolled.</p>
                  ) : (
                    enrollments.map((e: any) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">
                            {e.student.user.firstName} {e.student.user.lastName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {e.student.rollNumber || e.student.admissionNumber}
                          </p>
                        </div>
                        <Badge variant="outline">{e.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <p className="text-muted-foreground">Resources module coming soon.</p>
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <p className="text-muted-foreground">Assignments module coming soon.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link
                  href={`/faculty/timetable/session?courseId=${course.id}&sectionId=${section.id}&date=${format(new Date(), 'yyyy-MM-dd')}`}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Open Workspace
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={`/faculty/examinations`}>
                  <FileText className="mr-2 h-4 w-4" /> Manage Marks
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
