'use client';

import React from 'react';
import { TimetableGrid } from '../../../components/student/timetable/timetable-grid';
import { useStudentProfile } from '@student-erp/hooks';
import { Badge } from '@student-erp/ui';

export default function StudentTimetablePage() {
  const { data: student } = useStudentProfile();

  const programName = student?.program?.name;
  const sectionName = student?.section?.name;
  const semester = student?.section?.semester;

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground mt-1">Manage your weekly schedule and classes.</p>
        </div>
        {sectionName && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              Section {sectionName}
            </Badge>
            {semester && (
              <Badge variant="secondary" className="text-xs font-medium">
                Semester {semester}
              </Badge>
            )}
            {programName && (
              <Badge variant="secondary" className="text-xs font-medium">
                {programName}
              </Badge>
            )}
          </div>
        )}
      </div>

      <TimetableGrid />
    </div>
  );
}
