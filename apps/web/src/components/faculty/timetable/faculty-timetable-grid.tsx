'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Badge,
  Button,
  Input,
} from '@student-erp/ui';
import {
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  ExternalLink,
  Search,
  BookOpen,
  Filter,
  Building2,
  CalendarDays,
} from 'lucide-react';

export interface FacultyTimetableGridProps {
  entries: any[];
  isLoading: boolean;
}

function getDayIndex(day: any): number {
  if (typeof day === 'number') {
    if (day === 7) return 0;
    return day;
  }
  const dayStr = String(day).toUpperCase();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const idx = days.indexOf(dayStr);
  return idx >= 0 ? idx : -1;
}

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
  if (isNaN(date.getTime())) {
    const s = String(timeString);
    const timeOnly = s.includes('T') ? s.substring(11, 16) : s.substring(0, 5);
    const [h, m] = timeOnly.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const period = h >= 12 ? 'PM' : 'AM';
      const hours12 = h % 12 || 12;
      return `${hours12}:${String(m).padStart(2, '0')} ${period}`;
    }
    return String(timeString);
  }
  return format(date, 'hh:mm a');
}

const DAYS = [
  { index: 1, name: 'Monday', short: 'Mon' },
  { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' },
  { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' },
  { index: 6, name: 'Saturday', short: 'Sat' },
];

const colors = [
  'bg-blue-50/80 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800',
  'bg-emerald-50/80 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
  'bg-violet-50/80 text-violet-900 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-800',
  'bg-amber-50/80 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
  'bg-rose-50/80 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800',
  'bg-cyan-50/80 text-cyan-900 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-800',
  'bg-indigo-50/80 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800',
];

export function FacultyTimetableGrid({ entries = [], isLoading }: FacultyTimetableGridProps) {
  const todayDayIndex = new Date().getDay();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry: any) => {
      // Day filter
      if (selectedDayFilter !== 'all') {
        const dayIdx = getDayIndex(entry.dayOfWeek);
        if (dayIdx !== selectedDayFilter) return false;
      }

      // Search query filter (course code, name, section, room)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = (entry.course?.code || '').toLowerCase();
        const name = (entry.course?.name || '').toLowerCase();
        const section = (entry.section?.name || '').toLowerCase();
        const room = (entry.room?.number || entry.room?.name || '').toLowerCase();
        const building = (entry.building?.name || '').toLowerCase();

        return (
          code.includes(q) ||
          name.includes(q) ||
          section.includes(q) ||
          room.includes(q) ||
          building.includes(q)
        );
      }

      return true;
    });
  }, [entries, selectedDayFilter, searchQuery]);

  // Unique time slots across all available entries
  const timeSlots = useMemo(() => {
    const timeSlotsSet = new Set<string>();
    entries.forEach((entry: any) => {
      if (entry.startTime && entry.endTime) {
        timeSlotsSet.add(`${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`);
      }
    });

    return Array.from(timeSlotsSet).sort((a, b) => {
      const aTime = a.split('-')[0];
      const bTime = b.split('-')[0];
      return aTime.localeCompare(bTime);
    });
  }, [entries]);

  // Assign distinct color per courseId + sectionId combo
  const comboColors: Record<string, string> = useMemo(() => {
    const mapping: Record<string, string> = {};
    let colorIndex = 0;
    entries.forEach((entry: any) => {
      const comboKey = `${entry.courseId || entry.course?.id}-${entry.sectionId || entry.section?.id}`;
      if (!mapping[comboKey]) {
        mapping[comboKey] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });
    return mapping;
  }, [entries]);

  const getTargetDate = (dayOfWeek: any) => {
    const targetDayIndex = getDayIndex(dayOfWeek);
    const todayDate = new Date();
    const currentDay = todayDate.getDay();
    const dayOffset = (targetDayIndex >= 0 ? targetDayIndex : 0) - currentDay;
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + dayOffset);
    return format(targetDate, 'yyyy-MM-dd');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  // Count today's upcoming sessions
  const todaysSessions = entries.filter((e) => getDayIndex(e.dayOfWeek) === todayDayIndex);

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <CalendarIcon className="text-primary h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {entries.length} scheduled {entries.length === 1 ? 'session' : 'sessions'} this week
              {todaysSessions.length > 0 ? ` • ${todaysSessions.length} today` : ''}
            </p>
          </div>

          {/* Search bar & Today shortcut */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Filter course, section, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>
            {todayDayIndex >= 1 && todayDayIndex <= 6 && (
              <Button
                variant={selectedDayFilter === todayDayIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSelectedDayFilter(selectedDayFilter === todayDayIndex ? 'all' : todayDayIndex)
                }
                className="h-9 gap-1.5 text-xs font-medium"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Today's Sessions
              </Button>
            )}
          </div>
        </div>

        {/* Day Pills Bar */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-muted-foreground mr-1 flex items-center gap-1 text-xs font-medium">
            <Filter className="h-3 w-3" /> Day:
          </span>
          <Button
            variant={selectedDayFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedDayFilter('all')}
            className="h-7 px-2.5 text-xs font-medium"
          >
            All Days
          </Button>
          {DAYS.map((day) => {
            const isToday = day.index === todayDayIndex;
            const count = entries.filter((e) => getDayIndex(e.dayOfWeek) === day.index).length;
            return (
              <Button
                key={day.index}
                variant={selectedDayFilter === day.index ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedDayFilter(day.index)}
                className={`h-7 gap-1 px-2 text-xs font-medium ${
                  isToday && selectedDayFilter !== day.index ? 'border-primary/40 border' : ''
                }`}
              >
                <span>{day.short}</span>
                {count > 0 && (
                  <span className="bg-muted text-muted-foreground py-0.2 ml-0.5 rounded-full px-1.5 text-[10px] font-semibold">
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0 md:p-6">
        {entries.length === 0 ? (
          <div className="text-muted-foreground flex h-60 flex-col items-center justify-center p-8 text-center">
            <CalendarIcon className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-foreground text-base font-semibold">
              No timetable entries scheduled
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              There are currently no classes assigned to your schedule for this academic term.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center p-8 text-center">
            <Search className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-foreground text-sm font-semibold">No matching sessions found</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Try adjusting your filter or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedDayFilter('all');
              }}
              className="mt-3 h-7 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[800px]">
                <table className="border-border w-full border-collapse border text-sm">
                  <thead>
                    <tr>
                      <th className="bg-muted/80 border-border w-32 border p-3 text-left font-semibold">
                        Time Slot
                      </th>
                      {DAYS.filter(
                        (day) => selectedDayFilter === 'all' || selectedDayFilter === day.index,
                      ).map((day) => {
                        const isToday = day.index === todayDayIndex;
                        return (
                          <th
                            key={day.index}
                            className={`border-border border p-3 text-center font-semibold ${
                              isToday ? 'bg-primary/10 text-primary' : 'bg-muted/80'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{day.name}</span>
                              {isToday && (
                                <span className="bg-primary text-primary-foreground inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
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
                      const activeDays = DAYS.filter(
                        (day) => selectedDayFilter === 'all' || selectedDayFilter === day.index,
                      );

                      return (
                        <tr key={slot} className="hover:bg-muted/20 transition-colors">
                          <td className="border-border text-muted-foreground border p-3 align-top font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="text-primary/70 h-3.5 w-3.5" />
                              <span className="font-mono text-xs">
                                {start} - {end}
                              </span>
                            </div>
                          </td>
                          {activeDays.map((day) => {
                            const isToday = day.index === todayDayIndex;
                            const dayEntries = filteredEntries.filter(
                              (e: any) =>
                                getDayIndex(e.dayOfWeek) === day.index &&
                                `${formatTime(e.startTime)}-${formatTime(e.endTime)}` === slot,
                            );

                            return (
                              <td
                                key={`${day.index}-${slot}`}
                                className={`border-border h-28 min-w-[150px] border p-2 align-top ${
                                  isToday ? 'bg-primary/[0.03]' : ''
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
                                      className={`flex h-full flex-col justify-between rounded-lg border p-2.5 shadow-xs transition-all hover:shadow-md ${colorClass}`}
                                    >
                                      <div>
                                        <div className="mb-1 flex items-start justify-between gap-1">
                                          <span className="flex items-center gap-1 text-xs font-bold tracking-tight">
                                            <BookOpen className="h-3 w-3 shrink-0 opacity-70" />
                                            {entry.course?.code}
                                          </span>
                                          {entry.section?.name && (
                                            <Badge
                                              variant="outline"
                                              className="bg-background/50 border-current/30 px-1.5 py-0 text-[10px] font-semibold"
                                            >
                                              Sec {entry.section.name}
                                            </Badge>
                                          )}
                                        </div>
                                        <div
                                          className="line-clamp-2 text-xs leading-snug font-medium"
                                          title={entry.course?.name}
                                        >
                                          {entry.course?.name || 'Class Session'}
                                        </div>
                                      </div>

                                      <div className="mt-2.5 space-y-2">
                                        <div className="flex flex-col gap-0.5 text-[11px] opacity-90">
                                          {entry.room?.number && (
                                            <div className="flex items-center gap-1">
                                              <MapPin className="h-3 w-3 shrink-0" />
                                              <span className="truncate font-medium">
                                                Room {entry.room.number}
                                              </span>
                                            </div>
                                          )}
                                          {entry.building?.name && (
                                            <div className="flex items-center gap-1 text-[10px] opacity-75">
                                              <Building2 className="h-2.5 w-2.5 shrink-0" />
                                              <span className="truncate">
                                                {entry.building.name}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <Button
                                          asChild
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-full text-[11px] font-semibold shadow-xs"
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
                {DAYS.filter(
                  (day) => selectedDayFilter === 'all' || selectedDayFilter === day.index,
                ).map((day) => {
                  const dayEntries = filteredEntries
                    .filter((e: any) => getDayIndex(e.dayOfWeek) === day.index)
                    .sort((a: any, b: any) =>
                      formatTime(a.startTime).localeCompare(formatTime(b.startTime)),
                    );

                  if (dayEntries.length === 0) return null;

                  const isToday = day.index === todayDayIndex;

                  return (
                    <div key={day.index} className={`p-4 ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">{day.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
                          </Badge>
                        </div>
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
                              className={`flex flex-col rounded-lg border p-3.5 shadow-xs ${colorClass}`}
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
                                    Sec {entry.section.name}
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
                                    <span>
                                      Room {entry.room.number}
                                      {entry.building?.name ? ` (${entry.building.name})` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="mt-3 h-8 w-full text-xs font-semibold"
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
