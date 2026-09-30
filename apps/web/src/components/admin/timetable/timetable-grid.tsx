'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Checkbox,
  Badge,
} from '@student-erp/ui';
import { MapPin, User, AlertTriangle, Plus, GripVertical } from 'lucide-react';
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
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

function formatTime(timeString: string | Date) {
  return formatTimeSlot(timeString);
}

const noop = () => {
  // no-op for drag overlay preview
};

const colors = [
  'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
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
  onMoveEntry?: (
    entryId: string,
    targetDay: string,
    targetStartTime: string,
    targetEndTime: string,
  ) => void;
  onSwapEntries?: (entryIdA: string, entryIdB: string) => void;
  onSelectEntryForInspector?: (entry: any) => void;
  workingHours?: { start: string; end: string };
  breakPeriods?: { start: string; end: string }[];
}

interface DraggableEntryCardProps {
  entry: any;
  courseColor: string;
  isConflicting: boolean;
  conflictReasons?: string[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEntryClick: (entry: any) => void;
}

function DraggableEntryCard({
  entry,
  courseColor,
  isConflicting,
  conflictReasons = [],
  selectedIds,
  onToggleSelect,
  onEntryClick,
}: DraggableEntryCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: entry.id,
    data: { entry },
  });

  const roomLabel = entry.room?.name || entry.room?.number || entry.roomId;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onEntryClick(entry);
      }}
      className={`group relative flex cursor-grab flex-col justify-between rounded-md border p-2 transition-all hover:shadow-xs active:cursor-grabbing ${
        isDragging ? 'ring-primary opacity-40 ring-2 ring-offset-1' : ''
      } ${
        isConflicting
          ? 'border-red-500 bg-red-50 ring-1 ring-red-400 dark:border-red-700 dark:bg-red-950/40'
          : courseColor
      }`}
    >
      <div
        className="absolute top-1.5 right-1.5 flex items-center gap-1"
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

      <div className="pr-8">
        <div className="flex items-center gap-1">
          <GripVertical className="text-muted-foreground/60 h-3 w-3 shrink-0" />
          <span className="truncate text-xs font-bold tracking-tight">
            {entry.course?.code || entry.course?.name || 'Class'}
          </span>
        </div>
        <div
          className="mt-0.5 line-clamp-1 text-[11px] leading-tight font-medium opacity-90"
          title={entry.course?.name}
        >
          {entry.course?.name}
        </div>
        <div className="mt-0.5 text-[10px] font-medium opacity-80">
          Sec {entry.section?.name || entry.sectionId}
        </div>
      </div>

      <div className="mt-2 space-y-0.5 border-t border-current/10 pt-1 text-[10px]">
        <div className="flex items-center gap-1 opacity-90">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {entry.faculty?.user
              ? `${entry.faculty.user.firstName} ${entry.faculty.user.lastName}`
              : entry.faculty?.teacherCode || 'TBA'}
          </span>
        </div>
        {roomLabel && (
          <div className="flex items-center gap-1 opacity-80">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{roomLabel}</span>
          </div>
        )}
      </div>

      {isConflicting && conflictReasons.length > 0 && (
        <div className="mt-1 rounded bg-red-200/80 px-1 py-0.5 text-[9px] font-medium text-red-900 dark:bg-red-900/60 dark:text-red-200">
          {conflictReasons[0]}
        </div>
      )}
    </div>
  );
}

interface DroppableGridCellProps {
  cellId: string;
  day: string;
  slotStart: string;
  slotEnd: string;
  dayEntries: any[];
  conflictingIds: Set<string>;
  conflictReasonsMap: Record<string, string[]>;
  courseColors: Record<string, string>;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEntryClick: (entry: any) => void;
  onEmptySlotClick?: (day: string, startTime: string) => void;
  dragOverCellId: string | null;
}

function DroppableGridCell({
  cellId,
  day,
  slotStart,
  slotEnd,
  dayEntries,
  conflictingIds,
  conflictReasonsMap,
  courseColors,
  selectedIds,
  onToggleSelect,
  onEntryClick,
  onEmptySlotClick,
  dragOverCellId,
}: DroppableGridCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    data: { day, slotStart, slotEnd },
  });

  const isHighlighted = isOver || dragOverCellId === cellId;

  return (
    <td
      ref={setNodeRef}
      id={cellId}
      onClick={() => {
        if (dayEntries.length === 0 && onEmptySlotClick) {
          onEmptySlotClick(day, slotStart);
        }
      }}
      className={`border-border group/cell relative h-28 min-w-[155px] border p-1.5 align-top transition-colors ${
        isHighlighted ? 'bg-primary/10 ring-primary ring-2 ring-inset' : ''
      } ${dayEntries.length === 0 ? 'hover:bg-muted/40 cursor-pointer' : ''}`}
    >
      <div className="flex h-full flex-col gap-1.5">
        {dayEntries.map((entry: any) => {
          const cId = entry.courseId || entry.course?.id;
          const isConflicting = conflictingIds.has(entry.id);
          const reasons = conflictReasonsMap[entry.id] || [];

          return (
            <DraggableEntryCard
              key={entry.id}
              entry={entry}
              courseColor={courseColors[cId] || colors[0]}
              isConflicting={isConflicting}
              conflictReasons={reasons}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onEntryClick={onEntryClick}
            />
          );
        })}

        {dayEntries.length === 0 && (
          <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover/cell:opacity-100">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
              <Plus className="h-3 w-3" /> Add Session
            </span>
          </div>
        )}
      </div>
    </td>
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
  onMoveEntry,
  onSwapEntries,
  onSelectEntryForInspector,
  workingHours = { start: '08:00', end: '17:00' },
  breakPeriods = [],
}: AdminTimetableGridProps) {
  const displayDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Global conflicts evaluation
  const allConflicts = useMemo<TimetableConflict[]>(() => {
    return findTimetableConflicts(entries);
  }, [entries]);

  const conflictingIds = useMemo<Set<string>>(() => {
    return getConflictingEntryIds(allConflicts);
  }, [allConflicts]);

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

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };
  const timeSlotsSet = new Set<string>();
  const dayStart = timeToMinutes(workingHours.start);
  const dayEnd = timeToMinutes(workingHours.end);
  const breakRanges = breakPeriods
    .map((period) => ({ start: timeToMinutes(period.start), end: timeToMinutes(period.end) }))
    .filter((period) => period.end > period.start);
  // Use 60-minute grid columns within the configured daily range; include
  // partial first/last hours so the grid covers the exact selected hours.
  for (let start = dayStart; start < dayEnd; start += 60) {
    const end = Math.min(start + 60, dayEnd);
    const overlapsBreak = breakRanges.some((period) => start < period.end && end > period.start);
    if (!overlapsBreak) {
      const toTime = (minutes: number) =>
        `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      timeSlotsSet.add(`${toTime(start)}-${toTime(end)}`);
    }
  }
  entries.forEach((entry: any) => {
    const s = formatTime(entry.startTime);
    const e = formatTime(entry.endTime);
    if (s && e) {
      timeSlotsSet.add(`${s}-${e}`);
    }
  });

  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => a.localeCompare(b));
  const breakColumns = breakRanges.map((period) => {
    const toTime = (minutes: number) =>
      `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return { slot: `${toTime(period.start)}-${toTime(period.end)}`, breakPeriod: period };
  });
  const displayColumns = [
    ...timeSlots.map((slot) => ({
      slot,
      breakPeriod: null as (typeof breakRanges)[number] | null,
    })),
    ...breakColumns,
  ].sort((a, b) => a.slot.localeCompare(b.slot));
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
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCellId, setOverCellId] = useState<string | null>(null);
  const [dragLiveConflict, setDragLiveConflict] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const entryId = String(active.id);
    setActiveId(entryId);
    const entry = entries.find((e) => e.id === entryId);
    if (entry && onSelectEntryForInspector) {
      onSelectEntryForInspector(entry);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      setOverCellId(null);
      setDragLiveConflict(null);
      return;
    }

    const cellId = String(over.id);
    setOverCellId(cellId);

    // Live validation during hover
    const activeEntry = entries.find((e) => e.id === active.id);
    if (activeEntry && cellId.includes('-')) {
      const parts = cellId.split('-');
      const targetDay = parts[0];
      const targetTimeSpan = parts.slice(1).join('-');
      const [slotStart, slotEnd] = targetTimeSpan.split('-');

      // Check conflict against other entries in target slot
      if (slotStart && slotEnd) {
        const potentialCollisions = entries.filter((e) => {
          if (e.id === activeEntry.id) return false;
          if (e.dayOfWeek !== targetDay) return false;
          return isTimeOverlapping(e.startTime, e.endTime, slotStart, slotEnd);
        });

        // Faculty clash
        const facultyClash = potentialCollisions.find(
          (e) => e.facultyId && e.facultyId === activeEntry.facultyId,
        );
        if (facultyClash) {
          const facName = activeEntry.faculty?.user
            ? `${activeEntry.faculty.user.firstName} ${activeEntry.faculty.user.lastName}`
            : 'Faculty';
          setDragLiveConflict(
            `Conflict: ${facName} is already teaching ${facultyClash.course?.code || 'another class'} (${facultyClash.section?.name || 'Sec'}) at ${slotStart}`,
          );
          return;
        }

        // Section clash
        const sectionClash = potentialCollisions.find(
          (e) => e.sectionId && e.sectionId === activeEntry.sectionId,
        );
        if (sectionClash) {
          setDragLiveConflict(
            `Conflict: Section ${activeEntry.section?.name || ''} already has ${sectionClash.course?.name || 'a session'} at ${slotStart}`,
          );
          return;
        }

        // Room clash
        if (activeEntry.roomId) {
          const roomClash = potentialCollisions.find(
            (e) => e.roomId && e.roomId === activeEntry.roomId,
          );
          if (roomClash) {
            setDragLiveConflict(
              `Conflict: Room ${activeEntry.room?.number || ''} is booked by ${roomClash.section?.name || 'another section'} at ${slotStart}`,
            );
            return;
          }
        }
      }
    }

    setDragLiveConflict(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverCellId(null);
    setDragLiveConflict(null);

    if (!over) return;

    const entryId = String(active.id);
    const targetCellId = String(over.id);

    // If dropped onto another entry directly, handle swap
    if (!targetCellId.includes('-')) {
      if (active.id !== over.id && onSwapEntries) {
        onSwapEntries(entryId, targetCellId);
      }
      return;
    }

    // Dropped onto a grid cell `DAY-START-END`
    const parts = targetCellId.split('-');
    const targetDay = parts[0];
    const targetTimeSpan = parts.slice(1).join('-');
    const [targetStartTime, targetEndTime] = targetTimeSpan.split('-');

    if (targetDay && targetStartTime && targetEndTime && onMoveEntry) {
      onMoveEntry(entryId, targetDay, targetStartTime, targetEndTime);
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
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Weekly Timetable Grid
            </CardTitle>
            {status !== 'NO_TIMETABLE' && <TimetableStatusBadge status={status} />}
            {allConflicts.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-300">
                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                {allConflicts.length} Conflict{allConflicts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>
              Drag session cards to adjust slots &bull; Click card to inspect details &bull; Click
              empty slot to schedule
            </span>
          </div>
        </CardHeader>

        {/* Live Drag Conflict Alert Banner */}
        {dragLiveConflict && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce text-red-600" />
            <span>{dragLiveConflict}</span>
          </div>
        )}

        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <table className="border-border w-full border-collapse border text-sm">
                <thead>
                  <tr>
                    <th className="bg-muted border-border text-muted-foreground w-28 border p-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Day / Time
                    </th>
                    {displayColumns.map(({ slot, breakPeriod }) => {
                      const [slotStart, slotEnd] = slot.split('-');
                      return breakPeriod ? (
                        <th
                          key={`break-${slot}`}
                          className="border-border border bg-amber-100 p-3 text-center text-xs font-semibold tracking-wider text-amber-900 uppercase dark:bg-amber-950/40 dark:text-amber-200"
                        >
                          <span className="inline-block [text-orientation:mixed] [writing-mode:vertical-rl]">
                            {breakPeriod === breakRanges[0] ? 'LUNCH BREAK' : 'BREAK'}
                          </span>
                        </th>
                      ) : (
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
                        {displayColumns.map(({ slot, breakPeriod }) => {
                          const [slotStart, slotEnd] = slot.split('-');
                          if (breakPeriod) {
                            return (
                              <td
                                key={`break-${slot}`}
                                className="border-border border bg-amber-50 p-2 text-center align-middle dark:bg-amber-950/20"
                              />
                            );
                          }
                          const dayEntries = entries.filter((e: any) => {
                            if (e.dayOfWeek !== day) return false;
                            const eSlot = `${formatTime(e.startTime)}-${formatTime(e.endTime)}`;
                            if (eSlot === slot) return true;
                            return isTimeOverlapping(e.startTime, e.endTime, slotStart, slotEnd);
                          });

                          const cellId = `${day}-${slot}`;

                          return (
                            <DroppableGridCell
                              key={cellId}
                              cellId={cellId}
                              day={day}
                              slotStart={slotStart}
                              slotEnd={slotEnd}
                              dayEntries={dayEntries}
                              conflictingIds={conflictingIds}
                              conflictReasonsMap={conflictReasonsMap}
                              courseColors={courseColors}
                              selectedIds={selectedIds}
                              onToggleSelect={onToggleSelect}
                              onEntryClick={onEntryClick}
                              onEmptySlotClick={onEmptySlotClick}
                              dragOverCellId={overCellId}
                            />
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
              <div className="w-[180px] shadow-lg">
                <DraggableEntryCard
                  entry={entry}
                  courseColor={courseColors[cId] || colors[0]}
                  isConflicting={isConflicting}
                  conflictReasons={reasons}
                  selectedIds={[]}
                  onToggleSelect={noop}
                  onEntryClick={noop}
                />
              </div>
            );
          })()}
      </DragOverlay>
    </DndContext>
  );
}
