'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { useStudentDashboard } from '@student-erp/hooks';
import { Clock, MapPin, User } from 'lucide-react';
import { Skeleton } from '@student-erp/ui'; // Assuming Skeleton exists

function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TodayScheduleCard() {
  const { data, isPending, isError } = useStudentDashboard();

  if (isPending) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return null; // Or show error state
  }

  const todaysSchedule = data.todaySchedule || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {todaysSchedule.length > 0 ? (
          <div className="space-y-4">
            {todaysSchedule.map((cls: any, idx: number) => (
              <div
                key={cls.id}
                className={`relative border-l-2 pl-4 ${idx === 0 ? 'border-primary' : 'border-muted'}`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <h4 className={`font-medium ${idx === 0 ? 'text-primary' : ''}`}>
                    {cls.course?.name || 'Unknown Course'}
                  </h4>
                  <span className="text-muted-foreground bg-muted rounded-md px-2 py-1 text-xs whitespace-nowrap">
                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  </span>
                </div>

                <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {cls.faculty?.user?.firstName}{' '}
                    {cls.faculty?.user?.lastName}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {cls.room || 'TBA'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-2 h-8 w-8 opacity-20" />
            <p>No classes scheduled for today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
