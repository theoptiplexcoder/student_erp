import React from 'react';
import { Button } from '@student-erp/ui';
import { Trash, Move, UserCheck, GitMerge } from 'lucide-react';

interface TimetableBulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onReassign: () => void;
  onMerge?: () => void;
}

export function TimetableBulkActions({
  selectedIds,
  onClear,
  onDelete,
  onMove,
  onReassign,
  onMerge,
}: TimetableBulkActionsProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-popover text-popover-foreground fixed bottom-6 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-full border px-4 py-2.5 shadow-lg sm:gap-4 sm:px-6 sm:py-3">
      <span className="mr-1 shrink-0 text-xs font-semibold sm:mr-2 sm:text-sm">
        {selectedIds.length} selected
      </span>
      {selectedIds.length === 2 && onMerge && (
        <Button variant="outline" size="sm" onClick={onMerge} className="shrink-0 gap-1.5">
          <GitMerge className="text-primary h-4 w-4" />
          <span>Merge Slots</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReassign}
        className="hidden shrink-0 gap-1.5 sm:inline-flex"
      >
        <UserCheck className="h-4 w-4" /> Reassign Faculty
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onMove}
        className="hidden shrink-0 gap-1.5 sm:inline-flex"
      >
        <Move className="h-4 w-4" /> Move
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete} className="shrink-0 gap-1.5">
        <Trash className="h-4 w-4" /> Delete
      </Button>
      <div className="bg-border mx-1 h-5 w-px shrink-0"></div>
      <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0 text-xs sm:text-sm">
        Clear
      </Button>
    </div>
  );
}
