import React from 'react';
import { Badge } from '@student-erp/ui';
import { AlertCircle } from 'lucide-react';

export function TimetableConflictBadge({ conflictsCount }: { conflictsCount: number }) {
  if (conflictsCount === 0) return null;
  return (
    <Badge variant="destructive" className="flex items-center gap-1 bg-red-500 text-white">
      <AlertCircle className="w-3 h-3" />
      {conflictsCount} Conflict{conflictsCount > 1 ? 's' : ''}
    </Badge>
  );
}
