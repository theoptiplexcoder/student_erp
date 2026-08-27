'use client';

import React, { use, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Input, Badge } from '@student-erp/ui';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  User,
  Download,
  Upload,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { CourseAttendance } from '@/components/student/courses/attendance/CourseAttendance';
import {
  useStudentCourse,
  useStudentCourseAttendance,
  useSubmitStudentAssignment,
} from '@student-erp/hooks';

export default function CourseWorkspace({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course, isPending, isError } = useStudentCourse(courseId);
  const { data: attendanceData } = useStudentCourseAttendance(courseId);
  const submitAssignment = useSubmitStudentAssignment(courseId);
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});

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
            value="resources"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Resources
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="marks"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent"
          >
            Marks
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
          value="resources"
          className="py-6 focus-visible:ring-0 focus-visible:outline-none"
        >
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {course.courseResources?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {course.courseResources.map((resource: any) => (
                    <Card key={resource.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4 className="text-base font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-muted-foreground mt-1 text-sm">
                              {resource.description}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={resource.externalUrl || resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" /> Open
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No resources uploaded for this course yet.
                </p>
              )}
            </CardContent>
          </Card>
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
                  {course.assignments.map((assignment: any) => {
                    const submission = assignment.assignmentSubmissions?.[0];
                    const isGraded = submission?.status === 'GRADED';
                    const isSubmitting =
                      submitAssignment.variables?.assignmentId === assignment.id &&
                      submitAssignment.isPending;

                    return (
                      <div
                        key={assignment.id}
                        className="flex flex-col gap-4 rounded-lg border p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium">{assignment.title}</h4>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {assignment.description}
                            </p>
                            <div className="text-muted-foreground mt-2 flex items-center text-xs">
                              <Clock className="mr-1 h-3 w-3" /> Due:{' '}
                              {new Date(assignment.dueDate).toLocaleString()}
                            </div>
                          </div>
                          {submission ? (
                            <Badge variant={isGraded ? 'default' : 'secondary'}>
                              {isGraded
                                ? `Graded: ${submission.marks}/${assignment.maxMarks}`
                                : 'Submitted'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>

                        {!isGraded && (
                          <div className="flex items-center gap-2 border-t pt-4">
                            <Input
                              placeholder="Paste submission URL (e.g., Google Drive, GitHub)..."
                              value={
                                submissionUrls[assignment.id] || submission?.submissionUrl || ''
                              }
                              onChange={(e) =>
                                setSubmissionUrls((prev) => ({
                                  ...prev,
                                  [assignment.id]: e.target.value,
                                }))
                              }
                              className="h-9 flex-1"
                            />
                            <Button
                              size="sm"
                              disabled={isSubmitting || !submissionUrls[assignment.id]}
                              onClick={async () => {
                                try {
                                  await submitAssignment.mutateAsync({
                                    assignmentId: assignment.id,
                                    data: { submissionUrl: submissionUrls[assignment.id] },
                                  });
                                } catch (e: any) {
                                  alert(e.response?.data?.message || 'Failed to submit assignment');
                                }
                              }}
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-4 w-4" />
                              )}
                              {submission ? 'Update Submission' : 'Submit'}
                            </Button>
                          </div>
                        )}

                        {isGraded && submission.feedback && (
                          <div className="bg-muted/50 border-primary mt-2 rounded-md border-l-2 p-3 text-sm">
                            <p className="mb-1 font-medium">Feedback:</p>
                            {submission.feedback}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

        <TabsContent value="marks" className="py-6 focus-visible:ring-0 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Course Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground py-8 text-center text-sm">
                Marks module coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
