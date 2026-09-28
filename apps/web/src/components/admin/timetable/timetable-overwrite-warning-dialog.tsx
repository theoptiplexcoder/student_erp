'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
} from '@student-erp/ui';
import { AlertTriangle, History } from 'lucide-react';

interface TimetableOverwriteWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYearName?: string;
  termName?: string;
  affectedSectionsCount: number;
  affectedSessionsCount: number;
  onConfirm: () => void;
  isGenerating?: boolean;
}

export function TimetableOverwriteWarningDialog({
  open,
  onOpenChange,
  academicYearName,
  termName,
  affectedSectionsCount,
  affectedSessionsCount,
  onConfirm,
  isGenerating,
}: TimetableOverwriteWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-base font-bold">
                Generate new timetable?
              </DialogTitle>
              <DialogDescription className="text-xs">
                A timetable already exists for the selected scope.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="text-foreground space-y-3.5 py-2 text-sm">
          <p className="text-muted-foreground text-xs">
            A timetable already exists for the selected sections. Generating a new timetable will
            replace the current timetable for these sections.
          </p>

          <div className="rounded-lg border border-amber-200/60 bg-amber-50/60 p-3.5 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
            <h4 className="font-semibold text-amber-900 dark:text-amber-300">
              Exact Replacement Scope:
            </h4>
            <ul className="mt-2 space-y-1.5 text-amber-800 dark:text-amber-300/90">
              {academicYearName && (
                <li>
                  &bull; <span className="font-medium">Academic Year:</span> {academicYearName}
                </li>
              )}
              {termName && (
                <li>
                  &bull; <span className="font-medium">Term:</span> {termName}
                </li>
              )}
              <li>
                &bull; <span className="font-medium">Sections affected:</span>{' '}
                <span className="font-bold">{affectedSectionsCount}</span> section
                {affectedSectionsCount !== 1 ? 's' : ''}
              </li>
              <li>
                &bull; <span className="font-medium">Existing sessions affected:</span>{' '}
                <span className="font-bold">{affectedSessionsCount}</span> session
                {affectedSessionsCount !== 1 ? 's' : ''}
              </li>
            </ul>
          </div>

          <div className="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-md p-2.5 text-[11px]">
            <History className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              The previous timetable will be automatically archived in history rather than
              permanently lost.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate & Replace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
