'use client';

import React from 'react';
import { useFacultyTimetable } from '@student-erp/hooks';
import { Loader2, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { FacultyTimetableGrid } from '@/components/faculty/timetable/faculty-timetable-grid';
import { FacultyLoadSummary } from '@/components/faculty/timetable/faculty-load-summary';
import { Button } from '@student-erp/ui';

export default function FacultyTimetablePage() {
  const { data: timetable, isLoading, error, refetch, isRefetching } = useFacultyTimetable();

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading your timetable...</p>
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="text-destructive h-10 w-10" />
        <div>
          <p className="text-destructive text-base font-semibold">Failed to load timetable</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            We couldn't retrieve your schedule. Please verify your connection or try again.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2 gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Timetable</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            View your weekly teaching schedule, locations, and manage session attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
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
