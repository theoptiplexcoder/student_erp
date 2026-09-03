'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge, Button } from '@student-erp/ui';
import { Clock, MapPin, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';

export interface FacultyTimetableGridProps {
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

// Format time consistently in 24h format for slot keys (HH:mm)
function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    const s = String(timeString);
    return s.includes('T') ? s.substring(11, 16) : s.substring(0, 5);
  }
  return format(date, 'HH:mm');
}

function formatDisplayTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  return format(date, 'hh:mm a');
}

const DAYS = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
];

const colors = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
  'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
];

export function FacultyTimetableGrid({ entries = [], isLoading }: FacultyTimetableGridProps) {
  const todayDayIndex = new Date().getDay();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  // Generate unique time slots from entries
  const timeSlotsSet = new Set<string>();
  entries.forEach((entry: any) => {
    if (entry.startTime && entry.endTime) {
      timeSlotsSet.add(`${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`);
    }
  });

  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => {
    const aTime = a.split('-')[0];
    const bTime = b.split('-')[0];
    return aTime.localeCompare(bTime);
  });

  // Assign distinct color per courseId + sectionId combo
  const comboColors: Record<string, string> = {};
  let colorIndex = 0;

  entries.forEach((entry: any) => {
    const comboKey = `${entry.courseId || entry.course?.id}-${entry.sectionId || entry.section?.id}`;
    if (!comboColors[comboKey]) {
      comboColors[comboKey] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  const getTargetDate = (dayOfWeek: any) => {
    const targetDayIndex = getDayIndex(dayOfWeek);
    const todayDate = new Date();
    // Normalize current day so Monday is 1 ... Saturday is 6, Sunday is 0 or 7
    const currentDay = todayDate.getDay();
    const dayOffset = (targetDayIndex >= 0 ? targetDayIndex : 0) - currentDay;
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + dayOffset);
    return format(targetDate, 'yyyy-MM-dd');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <CalendarIcon className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
        <span className="text-muted-foreground text-sm font-medium">
          {entries.length} {entries.length === 1 ? 'session' : 'sessions'} this week
        </span>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        {entries.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center p-8 text-center">
            <CalendarIcon className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-base font-medium">No timetable entries scheduled</p>
            <p className="text-sm">There are no classes assigned to your schedule for this week.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[800px]">
                <table className="border-border w-full border-collapse border text-sm">
                  <thead>
                    <tr>
                      <th className="bg-muted border-border w-32 border p-3 text-left font-medium">
                        Time
                      </th>
                      {DAYS.map((day) => {
                        const isToday = day.index === todayDayIndex;
                        return (
                          <th
                            key={day.index}
                            className={`border-border border p-3 text-center font-medium ${
                              isToday ? 'bg-primary/10 font-semibold' : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{day.name}</span>
                              {isToday && (
                                <span className="bg-primary text-primary-foreground inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                  Today
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => {
                      const [start, end] = slot.split('-');
                      return (
                        <tr key={slot}>
                          <td className="border-border text-muted-foreground border p-3 align-top font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {start} - {end}
                              </span>
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const isToday = day.index === todayDayIndex;
                            const dayEntries = entries.filter(
                              (e: any) =>
                                getDayIndex(e.dayOfWeek) === day.index &&
                                `${formatTime(e.startTime)}-${formatTime(e.endTime)}` === slot,
                            );

                            return (
                              <td
                                key={`${day.index}-${slot}`}
                                className={`border-border h-28 min-w-[140px] border p-2 align-top ${
                                  isToday ? 'bg-primary/5' : ''
                                }`}
                              >
                                {dayEntries.map((entry: any) => {
                                  const courseId = entry.courseId || entry.course?.id;
                                  const sectionId = entry.sectionId || entry.section?.id;
                                  const comboKey = `${courseId}-${sectionId}`;
                                  const colorClass = comboColors[comboKey] || colors[0];
                                  const targetDateStr = getTargetDate(entry.dayOfWeek);

                                  return (
                                    <div
                                      key={entry.id || comboKey}
                                      className={`flex h-full flex-col justify-between rounded border p-2.5 shadow-sm transition-all hover:shadow-md ${colorClass}`}
                                    >
                                      <div>
                                        <div className="mb-1 flex items-start justify-between gap-1">
                                          <span className="font-bold tracking-tight">
                                            {entry.course?.code}
                                          </span>
                                          {entry.section?.name && (
                                            <Badge
                                              variant="outline"
                                              className="border-current/30 px-1.5 py-0 text-[10px] font-semibold"
                                            >
                                              {entry.section.name}
                                            </Badge>
                                          )}
                                        </div>
                                        <div
                                          className="line-clamp-2 text-xs font-medium"
                                          title={entry.course?.name}
                                        >
                                          {entry.course?.name || 'Class Session'}
                                        </div>
                                      </div>

                                      <div className="mt-2 space-y-2">
                                        {entry.room?.number && (
                                          <div className="flex items-center gap-1 text-[11px] opacity-90">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                              Room {entry.room.number}
                                            </span>
                                          </div>
                                        )}
                                        <Button
                                          asChild
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-full text-xs font-medium"
                                        >
                                          <Link
                                            href={`/faculty/timetable/session?courseId=${courseId}&sectionId=${sectionId}&date=${targetDateStr}`}
                                          >
                                            <span className="truncate">Session Workspace</span>
                                            <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card-per-Day View */}
            <div className="block md:hidden">
              <div className="divide-border divide-y border-t">
                {DAYS.map((day) => {
                  const dayEntries = entries
                    .filter((e: any) => getDayIndex(e.dayOfWeek) === day.index)
                    .sort((a: any, b: any) =>
                      formatTime(a.startTime).localeCompare(formatTime(b.startTime)),
                    );

                  if (dayEntries.length === 0) return null;

                  const isToday = day.index === todayDayIndex;

                  return (
                    <div key={day.index} className={`p-4 ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-semibold">{day.name}</h3>
                        {isToday && (
                          <Badge variant="default" className="text-[10px]">
                            Today
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-3">
                        {dayEntries.map((entry: any) => {
                          const courseId = entry.courseId || entry.course?.id;
                          const sectionId = entry.sectionId || entry.section?.id;
                          const comboKey = `${courseId}-${sectionId}`;
                          const colorClass = comboColors[comboKey] || colors[0];
                          const targetDateStr = getTargetDate(entry.dayOfWeek);

                          return (
                            <div
                              key={entry.id || comboKey}
                              className={`flex flex-col rounded-lg border p-3.5 shadow-sm ${colorClass}`}
                            >
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-sm font-bold tracking-tight">
                                    {entry.course?.code}
                                  </div>
                                  <div className="text-xs font-medium">
                                    {entry.course?.name || 'Class Session'}
                                  </div>
                                </div>
                                {entry.section?.name && (
                                  <Badge
                                    variant="outline"
                                    className="border-current/30 text-xs font-semibold"
                                  >
                                    {entry.section.name}
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-2 space-y-1 text-xs opacity-90">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {formatDisplayTime(entry.startTime)} -{' '}
                                    {formatDisplayTime(entry.endTime)}
                                  </span>
                                </div>
                                {entry.room?.number && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span>Room {entry.room.number}</span>
                                  </div>
                                )}
                              </div>

                              <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="mt-3 h-8 w-full text-xs font-medium"
                              >
                                <Link
                                  href={`/faculty/timetable/session?courseId=${courseId}&sectionId=${sectionId}&date=${targetDateStr}`}
                                >
                                  <span>Session Workspace</span>
                                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
