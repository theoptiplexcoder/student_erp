'use client';

import React, { use, useState } from 'react';
import { Badge, Button, Input, Textarea } from '@student-erp/ui';
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
  CalendarCheck,
  FolderOpen,
  History,
  ClipboardList,
  NotebookPen,
  ArrowUpRight,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  CalendarDays,
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
  const [formError, setFormError] = useState('');

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await createResource.mutateAsync(resourceForm);
      setResourceForm({ title: '', externalUrl: '', resourceType: 'LINK' });
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Could not share this resource.');
    }
  };
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await createAssignment.mutateAsync(assignmentForm);
      setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Could not create this assignment.');
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-7 w-7 animate-spin" aria-label="Loading course" />
      </div>
    );
  if (error || !assignment)
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-destructive">Unable to load course details.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );

  const { course, section, term } = assignment;
  const actions = [
    {
      title: 'Take attendance',
      detail: 'Record attendance for a class session',
      icon: CalendarCheck,
      href: `/faculty/timetable/session?courseId=${course.id}&sectionId=${section.id}&date=${format(new Date(), 'yyyy-MM-dd')}&tab=attendance`,
    },
    {
      title: 'Share resources',
      detail: 'Add course links and learning materials',
      icon: FolderOpen,
      href: '#resources',
    },
    {
      title: 'Previous sessions',
      detail: 'Review completed class logs',
      icon: History,
      href: `/faculty/timetable/session?courseId=${course.id}&sectionId=${section.id}&date=${format(new Date(), 'yyyy-MM-dd')}&tab=previous`,
    },
    {
      title: 'Enter Marks',
      detail: 'Open marks entry for this course',
      icon: ClipboardList,
      href: `/faculty/timetable/session?courseId=${course.id}&sectionId=${section.id}&date=${format(new Date(), 'yyyy-MM-dd')}&tab=marks`,
    },
    {
      title: 'Assignments',
      detail: 'Create work and review submissions',
      icon: ClipboardList,
      href: '#assignments',
    },
    {
      title: 'Lesson plan',
      detail: 'Plan upcoming lessons and view progress',
      icon: NotebookPen,
      href: `/faculty/courses/${courseId}/lesson-plan`,
    },
  ];
  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-3" asChild>
          <Link href="/faculty/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All courses
          </Link>
        </Button>
        <header className="flex flex-col gap-5 border-b pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary mb-2 text-sm font-medium">COURSE WORKSPACE</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{course.name}</h1>
            <p className="text-muted-foreground mt-2">
              {course.code} <span aria-hidden="true">·</span> {section.name}{' '}
              <span aria-hidden="true">·</span> {term?.name || 'Current term'}
            </p>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {section.enrollments?.length ?? assignment.totalStudents ?? 0} students
            </span>
            <Badge variant="outline">{course.courseType || 'Course'}</Badge>
          </div>
        </header>
      </div>
      <section aria-labelledby="actions-heading">
        <div className="mb-4">
          <h2 id="actions-heading" className="text-xl font-semibold">
            What do you need to do?
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Your course tools, in one place.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {actions.map(({ title, detail, icon: Icon, href }) => (
            <a
              key={title}
              href={href}
              className="group bg-card hover:border-primary/50 hover:bg-muted/40 focus-visible:ring-ring flex min-h-36 flex-col rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="bg-primary/10 text-primary mb-5 flex h-10 w-10 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex items-center justify-between font-medium">
                {title}
                <ArrowUpRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-muted-foreground mt-1 text-xs leading-relaxed">{detail}</span>
            </a>
          ))}
        </div>
      </section>
      {course.description && (
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">{course.description}</p>
      )}
      {formError && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm"
        >
          {formError}
        </p>
      )}
      <div className="grid gap-10 lg:grid-cols-2">
        <section id="resources" className="scroll-mt-6 space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">Course resources</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Share materials with your students.
              </p>
            </div>
            <Badge variant="secondary">{resources?.length || 0}</Badge>
          </div>
          <form
            onSubmit={handleCreateResource}
            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1.4fr_auto]"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="resource-title">
                Title
              </label>
              <Input
                id="resource-title"
                required
                value={resourceForm.title}
                onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Lecture slides"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="resource-url">
                Resource link
              </label>
              <Input
                id="resource-url"
                required
                type="url"
                value={resourceForm.externalUrl}
                onChange={(e) => setResourceForm((p) => ({ ...p, externalUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" disabled={createResource.isPending} className="self-end">
              {createResource.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Share
            </Button>
          </form>
          {loadingResources ? (
            <p className="text-muted-foreground text-sm">Loading resources…</p>
          ) : resources?.length ? (
            <div className="divide-y rounded-xl border">
              {resources.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <a
                      className="text-primary text-sm hover:underline"
                      href={r.externalUrl || r.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open resource
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${r.title}`}
                    className="text-destructive"
                    disabled={deleteResource.isPending}
                    onClick={() => deleteResource.mutate(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
              No resources shared yet.
            </p>
          )}
        </section>
        <section id="assignments" className="scroll-mt-6 space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">Assignments</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Set work and follow student submissions.
              </p>
            </div>
            <Badge variant="secondary">{assignments?.length || 0}</Badge>
          </div>
          <form onSubmit={handleCreateAssignment} className="space-y-3 rounded-xl border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="assignment-title">
                  Title
                </label>
                <Input
                  id="assignment-title"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Assignment title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="assignment-due">
                  Due date
                </label>
                <Input
                  id="assignment-due"
                  required
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="assignment-description">
                Instructions
              </label>
              <Textarea
                id="assignment-description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What should students complete?"
              />
            </div>
            <Button type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create assignment
            </Button>
          </form>
          {loadingAssignments ? (
            <p className="text-muted-foreground text-sm">Loading assignments…</p>
          ) : assignments?.length ? (
            <div className="divide-y rounded-xl border">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Due {new Date(a.dueDate).toLocaleDateString()} ·{' '}
                      {a._count?.assignmentSubmissions || 0} submissions
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/faculty/courses/${courseId}/assignments/${a.id}`}>
                      Review work
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
              No assignments created yet.
            </p>
          )}
        </section>
      </div>
      <section className="grid gap-3 border-t pt-6 sm:grid-cols-2">
        <Link
          className="hover:bg-muted flex items-center justify-between rounded-lg p-3"
          href={`/faculty/courses/${courseId}/lesson-plan`}
        >
          <span className="flex items-center gap-3">
            <BookOpen className="text-primary h-5 w-5" />
            <span>
              <strong className="block text-sm">Lesson plan</strong>
              <span className="text-muted-foreground text-xs">Open course teaching plan</span>
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          className="hover:bg-muted flex items-center justify-between rounded-lg p-3"
          href={`/faculty/timetable/session?courseId=${course.id}&sectionId=${section.id}&date=${format(new Date(), 'yyyy-MM-dd')}&tab=previous`}
        >
          <span className="flex items-center gap-3">
            <CalendarDays className="text-primary h-5 w-5" />
            <span>
              <strong className="block text-sm">Previous sessions</strong>
              <span className="text-muted-foreground text-xs">
                Browse timetable and session records
              </span>
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
