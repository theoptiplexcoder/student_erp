'use client';

import React from 'react';
import { useStudentProfile } from '@student-erp/hooks';
import { Button } from '@student-erp/ui';
import { CalendarDays, BookOpen, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@student-erp/ui'; // Assuming Skeleton exists

export function StudentWelcomeHeader() {
  const { data: student, isPending, isError } = useStudentProfile();

  if (isPending) {
    return (
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Skeleton className="mb-2 h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return null;
  }

  const firstName = student.user?.firstName || 'Student';
  const programName = student.program?.name || 'Program';
  const semester = student.section?.semester || '-';
  const section = student.section?.name || '-';

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {programName} • Semester {semester} • Section {section}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/timetable">
            <CalendarDays className="mr-2 h-4 w-4" /> Timetable
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/courses">
            <BookOpen className="mr-2 h-4 w-4" /> My Courses
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/courses?tab=attendance">
            <Clock className="mr-2 h-4 w-4" /> Attendance
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/certificates">
            <FileText className="mr-2 h-4 w-4" /> Certificates
          </Link>
        </Button>
      </div>
    </div>
  );
}
