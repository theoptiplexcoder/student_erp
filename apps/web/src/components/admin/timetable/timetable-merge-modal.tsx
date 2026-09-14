'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Input,
} from '@student-erp/ui';
import { GitMerge, AlertCircle, Clock, Calendar, User, MapPin } from 'lucide-react';
import { formatTimeSlot, timeToMinutes } from './timetable-conflict-utils';

interface MergeSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: any[];
  onConfirmMerge: (params: {
    primaryEntryId: string;
    secondaryEntryId: string;
    newStartTime: string;
    newEndTime: string;
    targetCourseId: string;
    targetFacultyId: string;
    targetRoomId?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function TimetableMergeModal({
  open,
  onOpenChange,
  entries,
  onConfirmMerge,
  isSubmitting = false,
}: MergeSlotsModalProps) {
  const [primaryId, setPrimaryId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [entryA, entryB] = entries;

  // Determine which entry starts earlier
  const isAEarlier =
    entryA && entryB ? timeToMinutes(entryA.startTime) <= timeToMinutes(entryB.startTime) : true;
  const earlierEntry = isAEarlier ? entryA : entryB;
  const laterEntry = isAEarlier ? entryB : entryA;

  const earlierStart = earlierEntry ? formatTimeSlot(earlierEntry.startTime) : '';
  const laterEnd = laterEntry ? formatTimeSlot(laterEntry.endTime) : '';

  useEffect(() => {
    if (open && entries.length === 2) {
      setPrimaryId(earlierEntry?.id || entries[0].id);
      setErrorMessage('');
    }
  }, [open, entries, earlierEntry]);

  if (!entryA || !entryB) return null;

  const sameDay = entryA.dayOfWeek === entryB.dayOfWeek;
  const sameSection = entryA.sectionId === entryB.sectionId;

  // Validation warnings
  const validationWarnings: string[] = [];
  if (!sameDay) {
    validationWarnings.push(
      `Selected slots are on different days (${entryA.dayOfWeek} and ${entryB.dayOfWeek}). Merging is only valid for slots on the same day.`,
    );
  }
  if (!sameSection) {
    validationWarnings.push('Selected slots belong to different sections.');
  }

  const primaryEntry = entries.find((e) => e.id === primaryId) || earlierEntry;
  const secondaryEntry = entries.find((e) => e.id !== primaryId) || laterEntry;

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!sameDay) {
      setErrorMessage('Cannot merge sessions scheduled on different days of the week.');
      return;
    }
    if (!sameSection) {
      setErrorMessage('Cannot merge sessions from different sections.');
      return;
    }

    try {
      await onConfirmMerge({
        primaryEntryId: primaryEntry.id,
        secondaryEntryId: secondaryEntry.id,
        newStartTime: earlierStart,
        newEndTime: laterEnd,
        targetCourseId: primaryEntry.courseId || primaryEntry.course?.id,
        targetFacultyId: primaryEntry.facultyId || primaryEntry.faculty?.id,
        targetRoomId: primaryEntry.roomId || primaryEntry.room?.id || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to merge sessions.');
    }
  };

  const getCourseTitle = (e: any) =>
    e?.course?.name ? `${e.course.name} (${e.course.code})` : e?.courseId || 'Course';
  const getFacultyName = (e: any) =>
    e?.faculty?.user
      ? `${e.faculty.user.firstName} ${e.faculty.user.lastName}`
      : e?.faculty?.teacherCode || 'Faculty';
  const getRoomName = (e: any) =>
    e?.room?.name || e?.room?.number || (e?.roomId ? `Room ${e.roomId}` : 'None');

  const totalDurationMinutes = timeToMinutes(laterEnd) - timeToMinutes(earlierStart);
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const durationText = `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <GitMerge className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold sm:text-lg">
                Merge Slots into Extended Session
              </DialogTitle>
              <DialogDescription className="text-xs">
                Combine two course sessions into a single extended session with continuous duration.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleMergeSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>Merge Restriction</span>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {validationWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* New Combined Time & Schedule Info */}
          <div className="bg-muted/40 space-y-2 rounded-lg border p-3.5">
            <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Merged Session Timing
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="text-muted-foreground h-4 w-4" />
                {earlierEntry.dayOfWeek}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="text-muted-foreground h-4 w-4" />
                {earlierStart} – {laterEnd}
                {durationText && (
                  <span className="text-primary bg-primary/10 rounded px-1.5 py-0.5 text-xs font-semibold">
                    {durationText}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Select which course to keep */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Select primary course & faculty to keep for the extended session:
            </Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[entryA, entryB].map((slotEntry) => {
                const isSelected = primaryId === slotEntry.id;
                return (
                  <button
                    key={slotEntry.id}
                    type="button"
                    onClick={() => setPrimaryId(slotEntry.id)}
                    className={`flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-foreground line-clamp-1 text-xs font-semibold">
                        {getCourseTitle(slotEntry)}
                      </span>
                      {isSelected && (
                        <span className="bg-primary text-primary-foreground py-0.2 rounded-full px-1.5 text-[10px] font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatTimeSlot(slotEntry.startTime)} – {formatTimeSlot(slotEntry.endTime)}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{getFacultyName(slotEntry)}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{getRoomName(slotEntry)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-[11px]">
              The primary course, faculty assignment, and classroom will be preserved, spanning the
              full continuous time slot ({earlierStart} to {laterEnd}). The secondary slot will be
              removed.
            </p>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || validationWarnings.length > 0}
              className="gap-1.5"
            >
              <GitMerge className="h-4 w-4" />
              {isSubmitting ? 'Merging Slots...' : 'Confirm & Merge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
