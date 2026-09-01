'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@student-erp/ui';
import { useStudentTimetable } from '@student-erp/hooks';
import { Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@student-erp/ui';

function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString).substring(11, 16);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getDayIndex(dayName: string) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days.indexOf(dayName.toUpperCase());
}

const colors = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
  'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
];

export function TimetableGrid() {
  const { data: timetable, isPending, isError } = useStudentTimetable();
  const displayDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !timetable) {
    return <div className="p-4 text-center text-red-500">Failed to load timetable.</div>;
  }

  // Generate unique time slots
  const timeSlotsSet = new Set<string>();
  timetable.forEach((entry: any) => {
    timeSlotsSet.add(`${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`);
  });

  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => {
    const aTime = a.split('-')[0];
    const bTime = b.split('-')[0];
    return aTime.localeCompare(bTime);
  });

  // Assign colors to courses
  const courseColors: Record<string, string> = {};
  let colorIndex = 0;

  // Extract subjects for the bottom section
  const subjectsMap = new Map();

  timetable.forEach((entry: any) => {
    if (entry.course && !courseColors[entry.course.id]) {
      courseColors[entry.course.id] = colors[colorIndex % colors.length];
      colorIndex++;

      subjectsMap.set(entry.course.id, {
        name: entry.course.name,
        code: entry.course.code,
        credits: entry.course.credits,
        faculty: entry.faculty
          ? `${entry.faculty.user?.firstName} ${entry.faculty.user?.lastName}`
          : 'TBA',
      });
    }
  });

  const subjects = Array.from(subjectsMap.values());

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Weekly Timetable</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <span className="text-sm font-medium">Current Week</span>
            <Button variant="outline" size="sm" className="h-8">
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Desktop View */}
          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[800px]">
              <table className="border-border w-full border-collapse border text-sm">
                <thead>
                  <tr>
                    <th className="bg-muted border-border w-32 border p-3 text-left font-medium">
                      Time
                    </th>
                    {displayDays.map((day) => (
                      <th
                        key={day}
                        className="bg-muted border-border border p-3 text-center font-medium capitalize"
                      >
                        {day.toLowerCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.length > 0 ? (
                    timeSlots.map((slot) => {
                      const [start, end] = slot.split('-');
                      return (
                        <tr key={slot}>
                          <td className="border-border text-muted-foreground border p-3 align-top font-medium whitespace-nowrap">
                            {start} - {end}
                          </td>
                          {displayDays.map((day) => {
                            const entry = timetable.find(
                              (e: any) =>
                                e.dayOfWeek === day &&
                                `${formatTime(e.startTime)}-${formatTime(e.endTime)}` === slot,
                            );

                            return (
                              <td
                                key={`${day}-${slot}`}
                                className="border-border h-24 min-w-[140px] border p-2 align-top"
                              >
                                {entry ? (
                                  <div
                                    className={`flex h-full flex-col justify-between rounded border p-2 ${courseColors[entry.courseId]}`}
                                  >
                                    <div>
                                      <div
                                        className="mb-1 line-clamp-2 text-xs font-semibold"
                                        title={entry.course?.name}
                                      >
                                        {entry.course?.name || 'Unknown'}
                                      </div>
                                      <div className="text-[10px] font-medium opacity-80">
                                        {entry.course?.code}
                                      </div>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center gap-1 text-[10px] opacity-90">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">
                                          {entry.faculty?.user?.lastName || 'TBA'}
                                        </span>
                                      </div>
                                      {entry.room && (
                                        <div className="flex items-center gap-1 text-[10px] opacity-90">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">{entry.room}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-muted-foreground border-border border p-8 text-center"
                      >
                        No timetable entries found for this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {timeSlots.length > 0 ? (
              <div className="divide-y border-t">
                {displayDays.map((day) => {
                  const dayEntries = timetable.filter((e: any) => e.dayOfWeek === day);
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={day} className="p-4">
                      <h3 className="mb-3 text-lg font-semibold capitalize">{day.toLowerCase()}</h3>
                      <div className="space-y-3">
                        {dayEntries
                          .sort((a: any, b: any) =>
                            formatTime(a.startTime).localeCompare(formatTime(b.startTime)),
                          )
                          .map((entry: any, idx: number) => (
                            <div
                              key={idx}
                              className={`flex flex-col rounded-lg border p-3 ${courseColors[entry.courseId]}`}
                            >
                              <div className="mb-2 flex items-start justify-between">
                                <div>
                                  <div className="text-sm font-semibold">
                                    {entry.course?.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs opacity-80">{entry.course?.code}</div>
                                </div>
                                <div className="bg-background/50 rounded px-2 py-1 text-xs font-medium">
                                  {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                </div>
                              </div>
                              <div className="mt-2 flex items-end justify-between text-xs opacity-90">
                                <div className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  <span>{entry.faculty?.user?.lastName || 'TBA'}</span>
                                </div>
                                {entry.room && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{entry.room}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                No timetable entries found for this week.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects & Faculty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Subject</th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Code</th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Faculty</th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Credits</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subject, idx) => (
                    <tr
                      key={idx}
                      className="border-border hover:bg-muted/50 border-b transition-colors last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{subject.name}</td>
                      <td className="px-4 py-3">{subject.code || '-'}</td>
                      <td className="px-4 py-3">{subject.faculty}</td>
                      <td className="px-4 py-3">{subject.credits || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-muted-foreground py-6 text-center">
                      No subjects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
