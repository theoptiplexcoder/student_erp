'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@student-erp/ui';
import { useFacultyCourses } from '@student-erp/hooks';
import { Loader2, BookOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FacultyCoursesPage() {
  const { data: assignments, isLoading, error } = useFacultyCourses();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assignments) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load courses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Courses and sections assigned to you</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment: any) => (
          <Card key={assignment.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2">{assignment.course.name}</CardTitle>
                <Badge variant="outline">{assignment.section.name}</Badge>
              </div>
              <p className="text-primary mt-1 text-sm font-medium">{assignment.course.code}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="text-muted-foreground mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{assignment.course.creditValue} Credits</span>
                </div>
                {assignment.course.department && (
                  <p>Department: {assignment.course.department.name}</p>
                )}
                {assignment.term && <p>Term: {assignment.term.name}</p>}
              </div>
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/faculty/courses/${assignment.courseId}`}>
                  View Course <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {assignments.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
            No courses are currently assigned to you.
          </div>
        )}
      </div>
    </div>
  );
}
