'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@student-erp/ui';
import {
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { formatTimeSlot } from './timetable-conflict-utils';

interface TimetableContextConflictPanelProps {
  selectedEntry: any | null;
  onClearSelection: () => void;
  allEntries: any[];
  allConflicts: any[];
  onSelectEntry?: (entry: any) => void;
}

export function TimetableContextConflictPanel({
  selectedEntry,
  onClearSelection,
  allEntries = [],
  allConflicts = [],
  onSelectEntry,
}: TimetableContextConflictPanelProps) {
  // If no entry is clicked, show a helpful summary of active conflicts across the schedule
  const entryConflicts = useMemo(() => {
    if (!selectedEntry) return [];
    return allConflicts.filter(
      (c) => c.entryAId === selectedEntry.id || c.entryBId === selectedEntry.id,
    );
  }, [selectedEntry, allConflicts]);

  // Compute simultaneous faculty sessions (same faculty, same day, overlapping or adjacent time)
  const facultySimultaneousSessions = useMemo(() => {
    if (!selectedEntry || !selectedEntry.facultyId) return [];
    return allEntries.filter((e) => {
      if (e.id === selectedEntry.id) return false;
      if (e.facultyId !== selectedEntry.facultyId) return false;
      if (e.dayOfWeek !== selectedEntry.dayOfWeek) return false;
      return true;
    });
  }, [selectedEntry, allEntries]);

  // Compute simultaneous section sessions (same section, same day, other sessions)
  const sectionSimultaneousSessions = useMemo(() => {
    if (!selectedEntry || !selectedEntry.sectionId) return [];
    return allEntries.filter((e) => {
      if (e.id === selectedEntry.id) return false;
      if (e.sectionId !== selectedEntry.sectionId) return false;
      if (e.dayOfWeek !== selectedEntry.dayOfWeek) return false;
      return true;
    });
  }, [selectedEntry, allEntries]);

  // Compute room simultaneous usage
  const roomSimultaneousSessions = useMemo(() => {
    if (!selectedEntry || !selectedEntry.roomId) return [];
    return allEntries.filter((e) => {
      if (e.id === selectedEntry.id) return false;
      if (e.roomId !== selectedEntry.roomId) return false;
      if (e.dayOfWeek !== selectedEntry.dayOfWeek) return false;
      return true;
    });
  }, [selectedEntry, allEntries]);

  const facultyName = selectedEntry?.faculty?.user
    ? `${selectedEntry.faculty.user.firstName} ${selectedEntry.faculty.user.lastName}`
    : selectedEntry?.faculty?.teacherCode || 'TBA';

  const sectionName = selectedEntry?.section?.name || selectedEntry?.sectionId || 'Section';
  const courseName = selectedEntry?.course?.name || selectedEntry?.courseId || 'Course';
  const courseCode = selectedEntry?.course?.code || '';
  const roomName =
    selectedEntry?.room?.name || selectedEntry?.room?.number || selectedEntry?.roomId;

  if (!selectedEntry) {
    return (
      <Card className="border-border shadow-xs">
        <CardHeader className="border-b p-3.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="text-primary h-4 w-4" />
              Schedule & Conflict Inspector
            </CardTitle>
            <Badge
              variant={allConflicts.length > 0 ? 'destructive' : 'secondary'}
              className="text-[10px]"
            >
              {allConflicts.length} Conflict{allConflicts.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="bg-muted/40 text-muted-foreground rounded-md p-3 text-xs">
            <p className="text-foreground font-medium">Click any timetable slot</p>
            <p className="mt-1">
              Select any session card or drag it to inspect live faculty schedule, section clashes,
              and classroom double-booking in real-time.
            </p>
          </div>

          {allConflicts.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Action Items ({allConflicts.length})
              </h5>
              <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {allConflicts.map((c, i) => (
                  <div
                    key={i}
                    className="rounded border border-red-200 bg-red-50/70 p-2 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                      <span>{c.type} Conflict</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-red-800 dark:text-red-300">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>No scheduling conflicts detected in this view.</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 ring-primary/20 shadow-sm ring-1">
      <CardHeader className="border-b p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-primary flex h-2 w-2 rounded-full" />
            <CardTitle className="text-sm font-bold">Selected Session Inspector</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 text-xs">
        {/* Current Selected Session Card */}
        <div className="bg-card rounded-lg border p-3 shadow-xs">
          <div className="flex items-start justify-between gap-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-sm font-bold">{courseCode}</span>
                <span className="text-muted-foreground text-xs">&bull; {courseName}</span>
              </div>
              <div className="text-primary mt-0.5 text-xs font-semibold">
                Section: {sectionName}
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {selectedEntry.dayOfWeek}
            </Badge>
          </div>

          <div className="text-muted-foreground mt-2.5 grid grid-cols-2 gap-2 border-t pt-2 text-[11px]">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {formatTimeSlot(selectedEntry.startTime)} &ndash;{' '}
                {formatTimeSlot(selectedEntry.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{facultyName}</span>
            </div>
            {roomName && (
              <div className="col-span-2 flex items-center gap-1 text-[11px]">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>Room: {roomName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation / Conflict Alerts for this session */}
        {entryConflicts.length > 0 && (
          <div className="space-y-1.5 rounded-lg border border-red-300 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-950/40">
            <div className="flex items-center gap-1.5 font-bold text-red-900 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{entryConflicts.length} Conflict Warning</span>
            </div>
            <ul className="list-disc space-y-1 pl-4 text-[11px] text-red-800 dark:text-red-300">
              {entryConflicts.map((c, i) => (
                <li key={i}>{c.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Simultaneous Faculty Schedule */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-foreground flex items-center gap-1 font-semibold">
              <User className="text-muted-foreground h-3 w-3" />
              {facultyName}'s Schedule ({selectedEntry.dayOfWeek})
            </span>
            <span className="text-muted-foreground text-[10px]">
              {facultySimultaneousSessions.length} other class
              {facultySimultaneousSessions.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {facultySimultaneousSessions.length === 0 ? (
            <p className="text-muted-foreground text-[11px] italic">
              No other classes scheduled for {facultyName} on {selectedEntry.dayOfWeek}.
            </p>
          ) : (
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {facultySimultaneousSessions.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelectEntry?.(e)}
                  className="hover:bg-muted/60 flex cursor-pointer items-center justify-between rounded border p-1.5 text-[11px]"
                >
                  <div>
                    <span className="font-semibold">
                      {e.course?.code || e.course?.name || 'Class'}
                    </span>{' '}
                    <span className="text-muted-foreground">({e.section?.name || 'Sec'})</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {formatTimeSlot(e.startTime)} - {formatTimeSlot(e.endTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section's Schedule for the Day */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-foreground flex items-center gap-1 font-semibold">
              <Layers className="text-muted-foreground h-3 w-3" />
              Section {sectionName}'s Schedule ({selectedEntry.dayOfWeek})
            </span>
            <span className="text-muted-foreground text-[10px]">
              {sectionSimultaneousSessions.length} other session
              {sectionSimultaneousSessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sectionSimultaneousSessions.length === 0 ? (
            <p className="text-muted-foreground text-[11px] italic">
              No other classes scheduled for {sectionName} on {selectedEntry.dayOfWeek}.
            </p>
          ) : (
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {sectionSimultaneousSessions.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelectEntry?.(e)}
                  className="hover:bg-muted/60 flex cursor-pointer items-center justify-between rounded border p-1.5 text-[11px]"
                >
                  <div className="truncate">
                    <span className="font-semibold">{e.course?.code || e.course?.name}</span>
                    <span className="text-muted-foreground ml-1">
                      &bull;{' '}
                      {e.faculty?.user
                        ? `${e.faculty.user.firstName} ${e.faculty.user.lastName}`
                        : 'TBA'}
                    </span>
                  </div>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    {formatTimeSlot(e.startTime)} - {formatTimeSlot(e.endTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Schedule if assigned */}
        {roomName && (
          <div className="space-y-1.5 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1 font-semibold">
                <MapPin className="text-muted-foreground h-3 w-3" />
                Room {roomName} Usage ({selectedEntry.dayOfWeek})
              </span>
            </div>
            {roomSimultaneousSessions.length === 0 ? (
              <p className="text-muted-foreground text-[11px] italic">
                Room {roomName} is free for other hours on {selectedEntry.dayOfWeek}.
              </p>
            ) : (
              <div className="max-h-24 space-y-1 overflow-y-auto">
                {roomSimultaneousSessions.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded border p-1 text-[10px]"
                  >
                    <span>
                      {e.section?.name} &bull; {e.course?.code}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {formatTimeSlot(e.startTime)} - {formatTimeSlot(e.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
