'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Button, Input } from '@student-erp/ui';
import { useFacultyCourses } from '@student-erp/hooks';
import { Loader2, Users, Search, ArrowUpRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function FacultyCoursesPage() {
  const { data: assignments, isLoading, error } = useFacultyCourses();
  const [searchTerm, setSearchTerm] = useState('');

  const courses = useMemo(() => {
    const byCourse = new Map<string, any>();
    (assignments || []).forEach((item: any) => {
      const id = item.courseId ?? item.course?.id;
      if (!id || !item.course) return;
      const found = byCourse.get(id);
      if (found) {
        if (item.section && !found.sections.some((section: any) => section.id === item.section.id))
          found.sections.push(item.section);
        found.totalStudents = Math.max(found.totalStudents, item.totalStudents || 0);
        found.lessonPlansCompleted += item.lessonPlansCompleted || 0;
        found.lessonPlansTotal += item.lessonPlansTotal || 0;
        found.nextClass ||= item.nextClass;
      } else
        byCourse.set(id, {
          ...item,
          sections: item.section ? [item.section] : [],
          totalStudents: item.totalStudents || 0,
          lessonPlansCompleted: item.lessonPlansCompleted || 0,
          lessonPlansTotal: item.lessonPlansTotal || 0,
        });
    });
    return Array.from(byCourse.values());
  }, [assignments]);
  const filtered = courses.filter((item: any) =>
    [item.course.name, item.course.code].some((v: string) =>
      v?.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    ),
  );

  if (isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-7 w-7 animate-spin" aria-label="Loading courses" />
      </div>
    );
  if (error || !assignments)
    return (
      <div className="text-destructive p-8">
        Unable to load your courses. Refresh the page to try again.
      </div>
    );

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">
      <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary mb-2 text-sm font-medium">FACULTY WORKSPACE</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your courses</h1>
          <p className="text-muted-foreground mt-2">
            Choose a course to take attendance, share materials, and manage teaching.
          </p>
        </div>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search courses</span>
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or code"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </header>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assigned courses</h2>
        <span className="text-muted-foreground text-sm">
          {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
        </span>
      </div>
      {filtered.length ? (
        <div className="divide-y rounded-xl border">
          {filtered.map((item: any) => {
            const progress = item.lessonPlansTotal
              ? Math.round((item.lessonPlansCompleted / item.lessonPlansTotal) * 100)
              : 0;
            return (
              <article
                key={item.course.id}
                className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{item.course.name}</h3>
                    <Badge variant="outline">{item.course.code}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.course.program?.name || item.section?.program?.name || 'Course'}{' '}
                    <span aria-hidden="true">·</span> {item.term?.name || 'Current term'}
                  </p>
                  <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {item.totalStudents} students
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {item.sections
                        .map((s: any) => s.name)
                        .filter(Boolean)
                        .join(', ') || 'Assigned'}
                    </span>
                  </div>
                  {item.lessonPlansTotal > 0 && (
                    <div className="mt-4 max-w-sm">
                      <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                        <span>Lesson plan progress</span>
                        <span>
                          {item.lessonPlansCompleted}/{item.lessonPlansTotal}
                        </span>
                      </div>
                      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full md:w-auto">
                  <Link href={`/faculty/courses/${item.courseId ?? item.course.id}`}>
                    Open course <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed px-6 py-14 text-center">
          <p className="font-medium">
            {searchTerm ? 'No matching courses' : 'No courses assigned'}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {searchTerm ? 'Try another course name or code.' : 'Assigned courses will appear here.'}
          </p>
        </div>
      )}
    </main>
  );
}
