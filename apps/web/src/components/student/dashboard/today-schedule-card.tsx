'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@student-erp/ui';
import { useStudentDashboard } from '@student-erp/hooks';
import { Clock, MapPin, User } from 'lucide-react';

function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
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

  const nowTime = new Date().getTime();

  const scheduleWithStatus = [...todaysSchedule]
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((cls: any) => {
      const start = new Date(cls.startTime).getTime();
      const end = new Date(cls.endTime).getTime();
      let status = 'UPCOMING';
      if (nowTime > end) status = 'PAST';
      else if (nowTime >= start && nowTime <= end) status = 'CURRENT';
      return { ...cls, status };
    });

  const firstUpcomingIndex = scheduleWithStatus.findIndex((cls) => cls.status === 'UPCOMING');

  return (
    <Card className="flex h-full max-h-[400px] flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="text-lg">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {scheduleWithStatus.length > 0 ? (
          <div className="space-y-4">
            {scheduleWithStatus.map((cls: any, idx: number) => (
              <div
                key={cls.id}
                className={`relative border-l-2 py-1 pl-4 transition-opacity ${
                  cls.status === 'CURRENT'
                    ? 'border-primary'
                    : cls.status === 'PAST'
                      ? 'border-muted opacity-50 grayscale'
                      : 'border-muted'
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`font-medium ${
                          cls.status === 'CURRENT' ? 'text-primary font-semibold' : ''
                        }`}
                      >
                        {cls.course?.name || 'Unknown Course'}
                      </h4>
                      {cls.status === 'CURRENT' && (
                        <Badge
                          variant="outline"
                          className="border-primary bg-primary/10 text-primary h-5 px-1.5 text-[10px]"
                        >
                          Now
                        </Badge>
                      )}
                      {idx === firstUpcomingIndex && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground bg-muted shrink-0 rounded-md px-2 py-1 text-xs whitespace-nowrap">
                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  </span>
                </div>

                <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {cls.faculty?.user?.firstName}{' '}
                    {cls.faculty?.user?.lastName}
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />{' '}
                    <span className="truncate">{cls.room || 'TBA'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-2 h-8 w-8 opacity-20" />
            <p>No classes scheduled for today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
