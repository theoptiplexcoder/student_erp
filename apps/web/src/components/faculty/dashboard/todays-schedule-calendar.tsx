'use client';

import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

export interface ClassEntry {
  id: string;
  courseId: string;
  course: { code: string; name: string };
  sectionId: string;
  section: { name: string; code: string };
  dayOfWeek: string;
  startTime: string | Date;
  endTime: string | Date;
  room: string | null;
  building: string | null;
}

interface TodaysScheduleCalendarProps {
  classes: ClassEntry[];
}

export function TodaysScheduleCalendar({ classes }: TodaysScheduleCalendarProps) {
  if (!classes || classes.length === 0) {
    return <p className="text-muted-foreground text-sm">No classes scheduled for today.</p>;
  }

  // 1. Determine time range
  let minHour = 24;
  let maxHour = 0;

  classes.forEach((cls) => {
    const start = new Date(cls.startTime);
    const end = new Date(cls.endTime);

    if (start.getHours() < minHour) minHour = start.getHours();

    let endHour = end.getHours();
    if (end.getMinutes() > 0) endHour += 1;
    if (endHour > maxHour) maxHour = endHour;
  });

  if (minHour > maxHour) {
    minHour = 8;
    maxHour = 16;
  }

  // padding
  minHour = Math.max(0, minHour - 1);
  maxHour = Math.min(24, maxHour + 1);

  const timeSlots = [];
  for (let h = minHour; h < maxHour; h++) {
    timeSlots.push(h);
  }

  const numColumns = timeSlots.length;

  const bgColors = [
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50',
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50',
    'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50',
  ];

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <div
        className="min-w-[600px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${numColumns}, 1fr)`,
        }}
      >
        {/* Header Row */}
        <div className="bg-muted/30 text-muted-foreground flex items-center justify-center border-r border-b p-2 text-center text-xs font-medium">
          Session
        </div>
        {timeSlots.map((slot) => (
          <div
            key={slot}
            className="bg-muted/30 text-muted-foreground relative border-r border-b p-2 text-left text-xs font-medium last:border-r-0"
          >
            {slot.toString().padStart(2, '0')}:00
          </div>
        ))}

        {/* Rows */}
        {classes.map((cls, idx) => {
          const start = new Date(cls.startTime);
          const end = new Date(cls.endTime);

          const startHour = start.getHours();
          const startMin = start.getMinutes();
          const startFraction = startHour + startMin / 60;

          const endHour = end.getHours();
          const endMin = end.getMinutes();
          const endFraction = endHour + endMin / 60;

          const offset = startFraction - minHour;
          const duration = endFraction - startFraction;

          const colorClass = bgColors[idx % bgColors.length];

          return (
            <React.Fragment key={cls.id}>
              {/* Session Label */}
              <div className="bg-muted/10 text-muted-foreground flex items-center justify-center border-r border-b p-2 text-xs font-medium last:border-b-0">
                {idx + 1}
              </div>

              {/* Time Slots Area */}
              <div
                className="relative border-b last:border-b-0"
                style={{ gridColumn: `2 / span ${numColumns}` }}
              >
                {/* Grid lines */}
                <div className="pointer-events-none absolute inset-0 flex">
                  {timeSlots.map((_, i) => (
                    <div key={i} className="border-border/40 flex-1 border-r last:border-r-0" />
                  ))}
                </div>

                {/* Class Block */}
                <div
                  className={`hover:ring-primary/50 absolute top-1.5 bottom-1.5 flex cursor-pointer flex-col justify-center overflow-hidden rounded border p-1.5 shadow-sm transition-all hover:ring-2 ${colorClass}`}
                  style={{
                    left: `${(offset / numColumns) * 100}%`,
                    width: `${(duration / numColumns) * 100}%`,
                  }}
                  title={`${cls.course.code} - ${cls.course.name}\n${format(start, 'hh:mm a')} - ${format(end, 'hh:mm a')}\nRoom ${cls.room || 'TBA'}`}
                >
                  <Link
                    href={`/faculty/timetable/session?courseId=${cls.courseId}&sectionId=${cls.sectionId}&date=${format(new Date(), 'yyyy-MM-dd')}`}
                    className="absolute inset-0 z-10"
                  />
                  <div className="truncate text-xs leading-tight font-bold">{cls.course.code}</div>
                  <div className="mt-0.5 truncate text-[10px] opacity-90">{cls.section.name}</div>
                  {cls.room && (
                    <div className="mt-0.5 truncate text-[10px] opacity-80">Room {cls.room}</div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
