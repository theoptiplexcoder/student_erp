'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@student-erp/ui';
import { useFacultyTimetable } from '@student-erp/hooks';
import { Loader2, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyTimetablePage() {
  const { data: timetable, isLoading, error } = useFacultyTimetable();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load timetable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">Manage your weekly schedule</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((dayName, index) => {
          const dayEntries = timetable.filter((t: any) => t.dayOfWeek === index);
          if (dayEntries.length === 0) return null;

          return (
            <Card key={index}>
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5" />
                  {dayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {dayEntries.map((entry: any) => {
                    const todayDate = new Date();
                    const dayOffset = index - todayDate.getDay();
                    const targetDate = new Date(todayDate);
                    targetDate.setDate(todayDate.getDate() + dayOffset);

                    return (
                      <div key={entry.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="mb-2 flex items-start justify-between">
                          <p className="text-primary font-semibold">{entry.course.code}</p>
                          <Badge variant="outline">{entry.section.name}</Badge>
                        </div>
                        <p className="line-clamp-1 text-sm font-medium">{entry.course.name}</p>
                        <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(new Date(entry.startTime), 'hh:mm a')} -{' '}
                              {format(new Date(entry.endTime), 'hh:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Room {entry.room.number}</span>
                          </div>
                        </div>
                        <Button asChild size="sm" className="mt-3 w-full" variant="secondary">
                          <Link
                            href={`/faculty/timetable/session?courseId=${entry.courseId}&sectionId=${entry.sectionId}&date=${format(targetDate, 'yyyy-MM-dd')}`}
                          >
                            Session Workspace
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
