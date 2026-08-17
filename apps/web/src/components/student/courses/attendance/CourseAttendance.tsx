'use client';

import React, { useState } from 'react';
import { AttendanceSummary } from './AttendanceSummary';
import { AttendanceFilters, FilterStatus } from './AttendanceFilters';
import { AttendanceSessionList } from './AttendanceSessionList';
import { Skeleton } from '@student-erp/ui';
import { useStudentCourseAttendance } from '@student-erp/hooks';

interface CourseAttendanceProps {
  courseId: string;
}

export function CourseAttendance({ courseId }: CourseAttendanceProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const { data, isPending: isLoading, isError: error } = useStudentCourseAttendance(courseId);

  if (error) {
    return (
      <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
        <p className="text-destructive mb-4">Unable to load attendance records.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="space-y-4 rounded-xl border p-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const records = data.records || [];

  // Map Prisma attendance format to frontend format
  const sessions = records.map((record: any) => ({
    id: record.attendanceSession.id,
    date: record.attendanceSession.date,
    startTime: record.attendanceSession.startTime,
    endTime: record.attendanceSession.endTime,
    status: record.status,
    facultyName: record.attendanceSession.faculty?.user
      ? `${record.attendanceSession.faculty.user.firstName} ${record.attendanceSession.faculty.user.lastName}`
      : 'TBA',
    topic: record.attendanceSession.topic || '',
    remarks: record.remarks || '',
  }));

  const totalSessions = sessions.length;
  const present = sessions.filter((s: any) => s.status === 'PRESENT').length;
  const absent = sessions.filter((s: any) => s.status === 'ABSENT').length;
  const late = sessions.filter((s: any) => s.status === 'LATE').length;
  const excused = sessions.filter((s: any) => s.status === 'EXCUSED').length;

  const percentage = totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6">
      <AttendanceSummary
        percentage={percentage}
        totalSessions={totalSessions}
        present={present}
        absent={absent}
        late={late}
        excused={excused}
        threshold={data.requiredPercentage || 75}
      />

      <div className="mt-8">
        <AttendanceFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <AttendanceSessionList sessions={sessions} activeFilter={activeFilter} />
      </div>
    </div>
  );
}
