'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@student-erp/ui';
import { BarChart3, Clock, BookOpen, Layers } from 'lucide-react';

export interface FacultyLoadSummaryProps {
  entries: any[];
  isLoading: boolean;
}

function getDayIndex(day: any): number {
  if (typeof day === 'number') {
    // 0 is Sunday, 7 is also Sunday in some conventions
    if (day === 7) return 0;
    return day;
  }
  const dayStr = String(day).toUpperCase();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const idx = days.indexOf(dayStr);
  return idx >= 0 ? idx : -1;
}

const DAYS = [
  { index: 1, name: 'Mon', fullName: 'Monday' },
  { index: 2, name: 'Tue', fullName: 'Tuesday' },
  { index: 3, name: 'Wed', fullName: 'Wednesday' },
  { index: 4, name: 'Thu', fullName: 'Thursday' },
  { index: 5, name: 'Fri', fullName: 'Friday' },
  { index: 6, name: 'Sat', fullName: 'Saturday' },
];

function getDurationInHours(startTime: string | Date, endTime: string | Date): number {
  if (!startTime || !endTime) return 1; // default fallback 1 hour
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    // If times are "HH:mm" strings or ISO strings without full date
    const sStr = String(startTime).includes('T')
      ? String(startTime).substring(11, 16)
      : String(startTime);
    const eStr = String(endTime).includes('T')
      ? String(endTime).substring(11, 16)
      : String(endTime);
    const [sh, sm] = sStr.split(':').map(Number);
    const [eh, em] = eStr.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(eh)) {
      const diffMinutes = eh * 60 + (em || 0) - (sh * 60 + (sm || 0));
      return diffMinutes > 0 ? diffMinutes / 60 : 1;
    }
    return 1;
  }
  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return hours > 0 ? hours : 1;
}

export function FacultyLoadSummary({ entries = [], isLoading }: FacultyLoadSummaryProps) {
  const loadStats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalSessions: 0,
        totalHours: 0,
        sectionCount: 0,
        dayLoad: DAYS.map((d) => ({ ...d, hours: 0, count: 0 })),
        courseLoad: [],
      };
    }

    let totalMinutes = 0;
    const distinctSections = new Set<string>();
    const courseMap = new Map<
      string,
      { id: string; code: string; name: string; hours: number; sessions: number }
    >();

    const dayHoursMap: Record<number, { hours: number; count: number }> = {
      1: { hours: 0, count: 0 },
      2: { hours: 0, count: 0 },
      3: { hours: 0, count: 0 },
      4: { hours: 0, count: 0 },
      5: { hours: 0, count: 0 },
      6: { hours: 0, count: 0 },
    };

    entries.forEach((entry: any) => {
      const durationHours = getDurationInHours(entry.startTime, entry.endTime);
      totalMinutes += durationHours * 60;

      // Track sections
      if (entry.sectionId || entry.section?.id) {
        distinctSections.add(entry.sectionId || entry.section?.id);
      }

      // Track by Day
      const dayIdx = getDayIndex(entry.dayOfWeek);
      if (dayHoursMap[dayIdx]) {
        dayHoursMap[dayIdx].hours += durationHours;
        dayHoursMap[dayIdx].count += 1;
      }

      // Track by Course
      const courseId = entry.courseId || entry.course?.id || 'unknown';
      const courseCode = entry.course?.code || 'Unknown';
      const courseName = entry.course?.name || '';
      const existing = courseMap.get(courseId) || {
        id: courseId,
        code: courseCode,
        name: courseName,
        hours: 0,
        sessions: 0,
      };
      existing.hours += durationHours;
      existing.sessions += 1;
      courseMap.set(courseId, existing);
    });

    const dayLoad = DAYS.map((d) => ({
      ...d,
      hours: Math.round(dayHoursMap[d.index].hours * 10) / 10,
      count: dayHoursMap[d.index].count,
    }));

    const courseLoad = Array.from(courseMap.values()).map((c) => ({
      ...c,
      hours: Math.round(c.hours * 10) / 10,
    }));

    return {
      totalSessions: entries.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      sectionCount: distinctSections.size,
      dayLoad,
      courseLoad,
    };
  }, [entries]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  const maxDayHours = Math.max(...loadStats.dayLoad.map((d) => d.hours), 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="text-primary h-4 w-4" />
            Weekly Load Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>Hours</span>
              </div>
              <p className="mt-1 text-lg font-bold">{loadStats.totalHours}h</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <BookOpen className="h-3 w-3" />
                <span>Sessions</span>
              </div>
              <p className="mt-1 text-lg font-bold">{loadStats.totalSessions}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Layers className="h-3 w-3" />
                <span>Sections</span>
              </div>
              <p className="mt-1 text-lg font-bold">{loadStats.sectionCount}</p>
            </div>
          </div>

          {/* Daily Distribution */}
          <div className="space-y-2 border-t pt-3">
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Daily Distribution
            </h4>
            <div className="space-y-2">
              {loadStats.dayLoad.map((day) => {
                const percentage = Math.round((day.hours / maxDayHours) * 100);
                return (
                  <div key={day.index} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-8 font-medium">{day.name}</span>
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${day.hours > 0 ? Math.max(percentage, 5) : 0}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-medium">
                      {day.hours > 0 ? `${day.hours}h` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Distribution */}
          {loadStats.courseLoad.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Courses
              </h4>
              <div className="space-y-2">
                {loadStats.courseLoad.map((course) => (
                  <div
                    key={course.id}
                    className="bg-muted/30 flex items-center justify-between rounded p-2 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-foreground truncate font-semibold">{course.code}</div>
                      {course.name && (
                        <div className="text-muted-foreground truncate text-[11px]">
                          {course.name}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant="secondary" className="text-[10px]">
                        {course.hours}h ({course.sessions})
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
