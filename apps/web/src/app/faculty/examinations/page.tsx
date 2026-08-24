'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@student-erp/ui';
import { useFacultyExaminations } from '@student-erp/hooks';
import { Loader2, FileText, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FacultyExaminationsPage() {
  const { data: examinations, isLoading, error } = useFacultyExaminations();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !examinations) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load examinations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
        <p className="text-muted-foreground">Manage marks for your assigned courses</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {examinations.map((examCourse: any) => (
          <Card key={examCourse.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2">{examCourse.course.name}</CardTitle>
                <Badge variant={examCourse.exam.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {examCourse.exam.status}
                </Badge>
              </div>
              <p className="text-primary mt-1 text-sm font-medium">{examCourse.course.code}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="text-muted-foreground mb-6 space-y-3 text-sm">
                <div>
                  <p className="text-foreground font-medium">{examCourse.exam.name}</p>
                  <p>{examCourse.exam.examType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(examCourse.examDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-2">
                  <div>
                    <span className="text-xs">Max Marks:</span> {examCourse.maxMarks || '-'}
                  </div>
                  <div>
                    <span className="text-xs">Passing:</span> {examCourse.passingMarks || '-'}
                  </div>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/faculty/examinations/${examCourse.id}`}>
                  Enter Marks <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {examinations.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
            No upcoming examinations found for your courses.
          </div>
        )}
      </div>
    </div>
  );
}
