'use client';

import React from 'react';
import { useFacultyTimetable } from '@student-erp/hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { FacultyTimetableGrid } from '@/components/faculty/timetable/faculty-timetable-grid';
import { FacultyLoadSummary } from '@/components/faculty/timetable/faculty-load-summary';

export default function FacultyTimetablePage() {
  const { data: timetable, isLoading, error } = useFacultyTimetable();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="text-destructive h-8 w-8" />
        <p className="text-destructive font-medium">Failed to load timetable</p>
        <p className="text-muted-foreground text-sm">
          Please refresh the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">Manage your weekly schedule and track workload</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <FacultyTimetableGrid entries={timetable} isLoading={isLoading} />
        </div>
        <div className="min-w-0">
          <FacultyLoadSummary entries={timetable} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
