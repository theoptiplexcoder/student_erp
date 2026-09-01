import React from 'react';
import { Button } from '@student-erp/ui';
import { Trash, Move, UserCheck } from 'lucide-react';

interface TimetableBulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onReassign: () => void;
}

export function TimetableBulkActions({
  selectedIds,
  onClear,
  onDelete,
  onMove,
  onReassign,
}: TimetableBulkActionsProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
      <span className="font-semibold text-sm mr-2">{selectedIds.length} selected</span>
      <Button variant="ghost" size="sm" onClick={onReassign} className="gap-2">
        <UserCheck className="w-4 h-4" /> Reassign Faculty
      </Button>
      <Button variant="ghost" size="sm" onClick={onMove} className="gap-2">
        <Move className="w-4 h-4" /> Move
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
        <Trash className="w-4 h-4" /> Delete
      </Button>
      <div className="w-px h-6 bg-border mx-2"></div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
