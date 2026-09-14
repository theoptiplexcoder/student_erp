'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Checkbox } from '@student-erp/ui';
import { MapPin, User, ChevronLeft, ChevronRight, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { TimetableConflictBadge } from './timetable-conflict-badge';
import { TimetableStatusBadge } from './timetable-status-badge';
import {
  findTimetableConflicts,
  getConflictingEntryIds,
  formatTimeSlot,
  isTimeOverlapping,
  TimetableConflict,
} from './timetable-conflict-utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
} from '@dnd-kit/core';

function formatTime(timeString: string | Date) {
  return formatTimeSlot(timeString);
}

const noop = () => {
  // no-op for drag overlay preview
};

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
  onSwapEntries?: (entryIdA: string, entryIdB: string) => void;
}

interface EntryCardProps {
  entry: any;
  courseColor: string;
  isConflicting: boolean;
  conflictReasons?: string[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEntryClick: (entry: any) => void;
  onDragStart?: () => void;
}

function EntryCard({
  entry,
  courseColor,
  isConflicting,
  conflictReasons = [],
  selectedIds,
  onToggleSelect,
  onEntryClick,
  onDragStart,
}: EntryCardProps) {
  const roomLabel = entry.room?.name || entry.room?.number || entry.roomId;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onEntryClick(entry);
      }}
      className={`group relative flex cursor-grab flex-col justify-between rounded border p-2.5 transition-all hover:shadow-sm active:cursor-grabbing ${
        isConflicting
          ? 'border-red-500 bg-red-50 ring-1 ring-red-400 dark:border-red-700 dark:bg-red-950/40'
          : courseColor
      }`}
      onMouseDown={onDragStart}
    >
      <div
        className="absolute top-2 right-2 flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {isConflicting && (
          <span title={conflictReasons.join(' | ') || 'Scheduling conflict detected'}>
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-600 dark:text-red-400" />
          </span>
        )}
        <Checkbox
          checked={selectedIds.includes(entry.id)}
          onCheckedChange={() => onToggleSelect(entry.id)}
          className="h-3.5 w-3.5"
        />
      </div>

      <div className="pr-10">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            className="line-clamp-2 text-xs font-semibold"
            title={entry.course?.name || entry.courseId}
          >
            {entry.course?.name || entry.courseId || 'Course'}
          </div>
          {entry.course?.courseType && entry.course?.courseType !== 'STANDARD' && (
            <span className="bg-primary/20 py-0.2 text-primary rounded px-1.5 text-[9px] font-bold tracking-wider uppercase">
              {entry.course.courseType}
            </span>
          )}
        </div>
        {entry.course?.code && (
          <div className="font-mono text-[10px] opacity-75">{entry.course.code}</div>
        )}
        <div className="mt-0.5 text-[10px] font-medium opacity-90">
          {entry.section?.name || entry.sectionId}
        </div>
      </div>

      <div className="mt-2 space-y-0.5 border-t border-current/10 pt-1.5">
        <div className="flex items-center gap-1 text-[10px] opacity-90">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {entry.faculty?.user
              ? `${entry.faculty.user.firstName} ${entry.faculty.user.lastName}`
              : entry.faculty?.teacherCode || 'TBA'}
          </span>
        </div>
        {roomLabel && (
          <div className="flex items-center gap-1 text-[10px] opacity-80">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{roomLabel}</span>
          </div>
        )}
      </div>

      {isConflicting && conflictReasons.length > 0 && (
        <div className="mt-1.5 rounded bg-red-100/90 px-1 py-0.5 text-[9px] font-medium text-red-800 dark:bg-red-900/60 dark:text-red-200">
          {conflictReasons[0]}
        </div>
      )}
    </div>
  );
}

export function TimetableGrid({
  selectedIds,
  onToggleSelect,
  onEntryClick,
  onEmptySlotClick,
  entries,
  isPending,
  status,
  onSwapEntries,
}: AdminTimetableGridProps) {
  const displayDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Global conflicts evaluation
  const allConflicts = useMemo<TimetableConflict[]>(() => {
    return findTimetableConflicts(entries);
  }, [entries]);

  const conflictingIds = useMemo<Set<string>>(() => {
    return getConflictingEntryIds(allConflicts);
  }, [allConflicts]);

  // Map entry ID to human conflict descriptions
  const conflictReasonsMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const c of allConflicts) {
      if (c.entryAId) {
        if (!map[c.entryAId]) map[c.entryAId] = [];
        map[c.entryAId].push(c.message);
      }
      if (c.entryBId) {
        if (!map[c.entryBId]) map[c.entryBId] = [];
        map[c.entryBId].push(c.message);
      }
    }
    return map;
  }, [allConflicts]);

  const timeSlotsSet = new Set<string>();
  entries.forEach((entry: any) => {
    const s = formatTime(entry.startTime);
    const e = formatTime(entry.endTime);
    if (s && e) {
      timeSlotsSet.add(`${s}-${e}`);
    }
  });

  if (timeSlotsSet.size === 0) {
    timeSlotsSet.add('08:00-09:00');
    timeSlotsSet.add('09:00-10:00');
    timeSlotsSet.add('10:00-11:00');
    timeSlotsSet.add('11:00-12:00');
    timeSlotsSet.add('12:00-13:00');
    timeSlotsSet.add('14:00-15:00');
  }

  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => a.localeCompare(b));
  const courseColors: Record<string, string> = {};
  let colorIndex = 0;

  entries.forEach((entry: any) => {
    const cId = entry.courseId || entry.course?.id;
    if (cId && !courseColors[cId]) {
      courseColors[cId] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id && onSwapEntries) {
      onSwapEntries(active.id as string, over.id as string);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold sm:text-lg">Weekly Timetable</CardTitle>
            {status !== 'NO_TIMETABLE' && <TimetableStatusBadge status={status} />}
            {allConflicts.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-300">
                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                {allConflicts.length} Conflict{allConflicts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <span>
              Click any slot to edit or resolve clashes &bull; Click empty slot to schedule
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <table className="border-border w-full border-collapse border text-sm">
                <thead>
                  <tr>
                    <th className="bg-muted border-border text-muted-foreground w-32 border p-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Day / Time
                    </th>
                    {timeSlots.map((slot) => {
                      const [slotStart, slotEnd] = slot.split('-');
                      return (
                        <th
                          key={slot}
                          className="bg-muted border-border text-muted-foreground border p-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap uppercase"
                        >
                          {slotStart} - {slotEnd}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {displayDays.map((day) => {
                    return (
                      <tr key={day} className="border-border border-b">
                        <td className="border-border bg-muted/20 text-muted-foreground border p-3 align-middle text-xs font-semibold whitespace-nowrap uppercase">
                          {day}
                        </td>
                        {timeSlots.map((slot) => {
                          const [slotStart, slotEnd] = slot.split('-');
                          const dayEntries = entries.filter((e: any) => {
                            if (e.dayOfWeek !== day) return false;
                            const eSlot = `${formatTime(e.startTime)}-${formatTime(e.endTime)}`;
                            if (eSlot === slot) return true;
                            // Also catch overlapping entries in this slot
                            return isTimeOverlapping(e.startTime, e.endTime, slotStart, slotEnd);
                          });

                          const cellId = `${day}-${slot}`;

                          return (
                            <td
                              key={cellId}
                              id={cellId}
                              onClick={() => {
                                if (dayEntries.length === 0 && onEmptySlotClick) {
                                  onEmptySlotClick(day, slotStart);
                                }
                              }}
                              className={`border-border group/cell relative h-28 min-w-[160px] border p-1.5 align-top transition-colors ${
                                overId === cellId ? 'bg-primary/10 ring-primary ring-2' : ''
                              } ${dayEntries.length === 0 ? 'hover:bg-muted/40 cursor-pointer' : ''}`}
                            >
                              <div
                                className="flex h-full flex-col gap-1.5"
                                data-dnd-droppable-id={cellId}
                              >
                                {dayEntries.map((entry: any) => {
                                  const cId = entry.courseId || entry.course?.id;
                                  const isConflicting = conflictingIds.has(entry.id);
                                  const reasons = conflictReasonsMap[entry.id] || [];

                                  return (
                                    <div
                                      key={entry.id}
                                      id={entry.id}
                                      data-dnd-draggable-id={entry.id}
                                    >
                                      <EntryCard
                                        entry={entry}
                                        courseColor={courseColors[cId] || colors[0]}
                                        isConflicting={isConflicting}
                                        conflictReasons={reasons}
                                        selectedIds={selectedIds}
                                        onToggleSelect={onToggleSelect}
                                        onEntryClick={onEntryClick}
                                      />
                                    </div>
                                  );
                                })}

                                {dayEntries.length === 0 && (
                                  <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover/cell:opacity-100">
                                    <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                                      <Plus className="h-3 w-3" /> Add
                                    </span>
                                  </div>
                                )}
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
      <DragOverlay>
        {activeId &&
          (() => {
            const entry = entries.find((e: any) => e.id === activeId);
            if (!entry) return null;
            const cId = entry.courseId || entry.course?.id;
            const isConflicting = conflictingIds.has(entry.id);
            const reasons = conflictReasonsMap[entry.id] || [];

            return (
              <EntryCard
                entry={entry}
                courseColor={courseColors[cId] || colors[0]}
                isConflicting={isConflicting}
                conflictReasons={reasons}
                selectedIds={[]}
                onToggleSelect={noop}
                onEntryClick={noop}
              />
            );
          })()}
      </DragOverlay>
    </DndContext>
  );
}
