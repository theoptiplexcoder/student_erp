'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
  Badge,
} from '@student-erp/ui';
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Calendar,
  Users,
  Building,
} from 'lucide-react';

interface TimetablePublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYearName?: string;
  termName?: string;
  sectionsCount: number;
  totalSessions: number;
  conflicts: any[];
  onConfirmPublish: () => void;
  isPublishing?: boolean;
}

export function TimetablePublishModal({
  open,
  onOpenChange,
  academicYearName,
  termName,
  sectionsCount,
  totalSessions,
  conflicts = [],
  onConfirmPublish,
  isPublishing,
}: TimetablePublishModalProps) {
  // Categorize conflicts
  const stats = useMemo(() => {
    let faculty = 0;
    let room = 0;
    let section = 0;
    let unassigned = 0;

    for (const c of conflicts) {
      if (c.type === 'FACULTY') faculty++;
      else if (c.type === 'ROOM') room++;
      else if (c.type === 'SECTION') section++;
      else if (c.type === 'UNSCHEDULED') unassigned++;
    }

    return {
      faculty,
      room,
      section,
      unassigned,
      blockingCount: faculty + room + section,
    };
  }, [conflicts]);

  const hasBlockingConflicts = stats.blockingCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                hasBlockingConflicts
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {hasBlockingConflicts ? <Lock className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {hasBlockingConflicts ? 'Cannot Publish Timetable' : 'Publish Timetable to Campus'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Workflow State:{' '}
                <span className="font-semibold">Draft &rarr; Validated &rarr; Published</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Pre-flight Audit Summary */}
          <div className="bg-muted/30 space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Scope</span>
              <span className="text-foreground font-medium">
                {termName || 'Selected Term'} {academicYearName ? `(${academicYearName})` : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Total Sections
                </span>
                <span className="text-foreground text-sm font-bold">{sectionsCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Total Sessions
                </span>
                <span className="text-foreground text-sm font-bold">{totalSessions}</span>
              </div>
            </div>
          </div>

          {/* Validation Breakdown */}
          <div className="space-y-2">
            <h5 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Pre-Publish Validation Checklist
            </h5>

            <div className="space-y-1.5">
              <div
                className={`flex items-center justify-between rounded border p-2 ${
                  stats.faculty > 0
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Faculty Overlaps</span>
                </div>
                <Badge
                  variant={stats.faculty > 0 ? 'destructive' : 'secondary'}
                  className="text-[10px]"
                >
                  {stats.faculty} {stats.faculty === 1 ? 'conflict' : 'conflicts'}
                </Badge>
              </div>

              <div
                className={`flex items-center justify-between rounded border p-2 ${
                  stats.section > 0
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Section Class Clashes</span>
                </div>
                <Badge
                  variant={stats.section > 0 ? 'destructive' : 'secondary'}
                  className="text-[10px]"
                >
                  {stats.section} {stats.section === 1 ? 'conflict' : 'conflicts'}
                </Badge>
              </div>

              <div
                className={`flex items-center justify-between rounded border p-2 ${
                  stats.room > 0
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Classroom Double-Bookings</span>
                </div>
                <Badge
                  variant={stats.room > 0 ? 'destructive' : 'secondary'}
                  className="text-[10px]"
                >
                  {stats.room} {stats.room === 1 ? 'conflict' : 'conflicts'}
                </Badge>
              </div>

              {stats.unassigned > 0 && (
                <div className="flex items-center justify-between rounded border border-amber-200 bg-amber-50 p-2 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Unscheduled Course Credits</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-amber-800">
                    {stats.unassigned} sessions
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Blocking Warning Banner or Clear to Publish Notification */}
          {hasBlockingConflicts ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <span className="font-bold">Publishing is locked.</span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  You have {stats.blockingCount} unresolved schedule conflict(s). Please adjust or
                  move the conflicting sessions before publishing to students and teachers.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold">Ready to Publish.</span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Upon publishing, these timetable entries become instantly visible on student and
                  faculty portals, and attendance sessions will sync with the academic calendar.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            {hasBlockingConflicts ? 'Close & Review' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={onConfirmPublish}
            disabled={hasBlockingConflicts || isPublishing || totalSessions === 0}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {isPublishing ? 'Publishing...' : 'Publish Timetable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
