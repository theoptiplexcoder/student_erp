'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Checkbox } from '@student-erp/ui';
import { Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { TimetableConflictBadge } from './timetable-conflict-badge';
import { TimetableStatusBadge } from './timetable-status-badge';

function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString).substring(11, 16);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const colors = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
];

interface AdminTimetableGridProps {
  termId?: string;
  sectionId?: string;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEntryClick: (entry: any) => void;
  onEmptySlotClick: (day: string, startTime: string) => void;
  entries: any[];
  isPending: boolean;
  status: string;
}

export function TimetableGrid({ termId, sectionId, selectedIds, onToggleSelect, onEntryClick, onEmptySlotClick, entries, isPending, status }: AdminTimetableGridProps) {
  const displayDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const timeSlotsSet = new Set<string>();
  entries.forEach((entry: any) => {
    timeSlotsSet.add(`${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`);
  });

  if (timeSlotsSet.size === 0) {
    timeSlotsSet.add('08:00-09:00');
    timeSlotsSet.add('09:00-10:00');
    timeSlotsSet.add('10:00-11:00');
  }

  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => a.localeCompare(b));
  const courseColors: Record<string, string> = {};
  let colorIndex = 0;

  entries.forEach((entry: any) => {
    if (entry.courseId && !courseColors[entry.courseId]) {
      courseColors[entry.courseId] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <CardTitle>Timetable View</CardTitle>
          {status !== 'NO_TIMETABLE' && <TimetableStatusBadge status={status} />}
        </div>
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
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="border-border w-full border-collapse border text-sm">
              <thead>
                <tr>
                  <th className="bg-muted border-border w-32 border p-3 text-left font-medium">Time</th>
                  {displayDays.map((day) => (
                    <th key={day} className="bg-muted border-border border p-3 text-center font-medium capitalize">
                      {day.toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => {
                  const [start, end] = slot.split('-');
                  return (
                    <tr key={slot}>
                      <td className="border-border text-muted-foreground border p-3 align-top font-medium whitespace-nowrap">
                        {start} - {end}
                      </td>
                      {displayDays.map((day) => {
                        const dayEntries = entries.filter(
                          (e: any) =>
                            e.dayOfWeek === day &&
                            `${formatTime(e.startTime)}-${formatTime(e.endTime)}` === slot,
                        );

                        return (
                          <td
                            key={`${day}-${slot}`}
                            className="border-border h-24 min-w-[140px] border p-2 align-top hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => {
                              if (dayEntries.length === 0) onEmptySlotClick(day, start);
                            }}
                          >
                            <div className="flex flex-col gap-2 h-full">
                              {dayEntries.map((entry: any) => {
                                const isConflicting = dayEntries.some((other: any) => 
                                  other.id !== entry.id && (
                                    (other.roomId && other.roomId === entry.roomId) ||
                                    (other.facultyId && other.facultyId === entry.facultyId) ||
                                    (other.sectionId && other.sectionId === entry.sectionId)
                                  )
                                );
                                return (
                                <div
                                  key={entry.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEntryClick(entry);
                                  }}
                                  className={`relative flex flex-col justify-between rounded border p-2 ${isConflicting ? 'border-red-500 bg-red-100 ring-2 ring-red-500 dark:bg-red-900/30' : courseColors[entry.courseId]} hover:ring-2 hover:ring-ring transition-all`}
                                >
                                  <div className="absolute top-2 right-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    {isConflicting && <TimetableConflictBadge conflictsCount={1} />}
                                    <Checkbox
                                      checked={selectedIds.includes(entry.id)}
                                      onCheckedChange={() => onToggleSelect(entry.id)}
                                    />
                                  </div>
                                  <div className="pr-6">
                                    <div className="mb-1 line-clamp-2 text-xs font-semibold" title={entry.course?.name}>
                                      {entry.course?.name || entry.courseId || 'Unknown'}
                                    </div>
                                    <div className="text-[10px] font-medium opacity-80">
                                      {entry.section?.name || entry.sectionId}
                                    </div>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-1 text-[10px] opacity-90">
                                      <User className="h-3 w-3" />
                                      <span className="truncate">{entry.faculty?.user?.lastName || entry.facultyId || 'TBA'}</span>
                                    </div>
                                    {entry.roomId && (
                                      <div className="flex items-center gap-1 text-[10px] opacity-90">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{entry.roomId}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                );
                              })}
                            </div>
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
      </CardContent>
    </Card>
  );
}
