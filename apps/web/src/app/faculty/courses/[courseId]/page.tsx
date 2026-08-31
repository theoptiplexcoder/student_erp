'use client';

import React, { use, useState } from 'react';
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
  Input,
  Textarea,
} from '@student-erp/ui';
import {
  useFacultyCourseDetails,
  useFacultyResources,
  useCreateFacultyResource,
  useDeleteFacultyResource,
  useFacultyAssignments,
  useCreateFacultyAssignment,
} from '@student-erp/hooks';
import {
  Loader2,
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  Upload,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';
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
  const { data: resources, isLoading: loadingResources } = useFacultyResources(courseId);
  const { data: assignments, isLoading: loadingAssignments } = useFacultyAssignments(courseId);

  const createResource = useCreateFacultyResource(courseId);
  const deleteResource = useDeleteFacultyResource(courseId);
  const createAssignment = useCreateFacultyAssignment(courseId);

  const [resourceForm, setResourceForm] = useState({
    title: '',
    externalUrl: '',
    resourceType: 'LINK',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResource.mutateAsync(resourceForm);
      setResourceForm({ title: '', externalUrl: '', resourceType: 'LINK' });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to upload resource');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment.mutateAsync(assignmentForm);
      setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create assignment');
    }
  };

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
                <TabsTrigger value="lesson-plan">Lesson Plan</TabsTrigger>
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

              <TabsContent value="resources" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Resource</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleCreateResource}
                      className="grid items-end gap-4 md:grid-cols-4"
                    >
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          required
                          value={resourceForm.title}
                          onChange={(e) =>
                            setResourceForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. Lecture 1 Slides"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">External URL (or File Link)</label>
                        <Input
                          required
                          type="url"
                          value={resourceForm.externalUrl}
                          onChange={(e) =>
                            setResourceForm((prev) => ({ ...prev, externalUrl: e.target.value }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={createResource.isPending}
                        className="bg-primary text-primary-foreground"
                      >
                        {createResource.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}{' '}
                        Upload
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Course Materials</h3>
                  {loadingResources ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : resources?.length === 0 ? (
                    <p className="text-muted-foreground">No resources uploaded yet.</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {resources?.map((r: any) => (
                        <Card key={r.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-medium">{r.title}</p>
                              <a
                                href={r.externalUrl || r.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Material
                              </a>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteResource.mutate(r.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lesson-plan" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Lesson Plans</h3>
                    <p className="text-muted-foreground text-sm">
                      Manage your teaching schedule and materials
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/faculty/courses/${courseId}/lesson-plan/new`}>
                      <Plus className="mr-2 h-4 w-4" /> Create Lesson Plan
                    </Link>
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="bg-muted/20 border-b p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Course Progress</span>
                        <span className="font-medium">10% (Placeholder)</span>
                      </div>
                      <div className="bg-secondary mt-2 h-2 w-full overflow-hidden rounded-full">
                        <div className="bg-primary h-full" style={{ width: `10%` }} />
                      </div>
                    </div>
                    <div className="p-6">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/faculty/courses/${courseId}/lesson-plan`}>
                          View Full Lesson Plan Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            required
                            value={assignmentForm.title}
                            onChange={(e) =>
                              setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Assignment 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Due Date</label>
                          <Input
                            required
                            type="date"
                            value={assignmentForm.dueDate}
                            onChange={(e) =>
                              setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Textarea
                          value={assignmentForm.description}
                          onChange={(e) =>
                            setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Instructions..."
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={createAssignment.isPending}
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                      >
                        {createAssignment.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}{' '}
                        Create Assignment
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Assignments</h3>
                  {loadingAssignments ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : assignments?.length === 0 ? (
                    <p className="text-muted-foreground">No assignments created yet.</p>
                  ) : (
                    <div className="grid gap-4">
                      {assignments?.map((a: any) => (
                        <Card key={a.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="text-lg font-medium">{a.title}</p>
                              <p className="text-muted-foreground text-sm">
                                Due: {new Date(a.dueDate).toLocaleDateString()} | Max Marks:{' '}
                                {a.maxMarks}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {a._count?.assignmentSubmissions || 0} Submissions
                              </Badge>
                            </div>
                            <Button variant="outline" asChild>
                              <Link href={`/faculty/courses/${courseId}/assignments/${a.id}`}>
                                View Submissions
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
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
